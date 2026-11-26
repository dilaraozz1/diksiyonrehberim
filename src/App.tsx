import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  ActivityType,
  DialogueLevel,
  PracticeHistoryItem,
  PronunciationEvaluation,
  StudentActivityRecord,
  StudentProfile,
  UserStats,
  WordAnalysis,
} from './types';
import {
  auth,
  ensureStudentProfile,
  isAdminUser,
  logoutStudent,
  recordStudentActivity,
  subscribeAllStudentsForAdmin,
  subscribeStudentActivities,
  subscribeStudentProfile,
  updateStudentSettings,
} from './firebase';
import { AppTab, Header } from './components/Header';
import { AuthGate } from './components/AuthGate';
import { DialogueViewer } from './components/DialogueViewer';
import { DictionGuide } from './components/DictionGuide';
import { TekerlemelerView } from './components/TekerlemelerView';
import { FreePracticeStudio } from './components/FreePracticeStudio';
import { WordAnalysisModal } from './components/WordAnalysisModal';
import { PronunciationStudioModal } from './components/PronunciationStudioModal';
import { StudentProgressProfile } from './components/StudentProgressProfile';
import { AdminStudentsDashboard } from './components/AdminStudentsDashboard';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [studentActivities, setStudentActivities] = useState<StudentActivityRecord[]>([]);
  const [allStudents, setAllStudents] = useState<StudentProfile[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState<boolean>(false);

  const [currentTab, setCurrentTab] = useState<AppTab>('dialogues');

  // Word Analysis Modal state
  const [activeWordAnalysis, setActiveWordAnalysis] = useState<WordAnalysis | null>(null);

  // Pronunciation Studio Modal state (for Diction Guide, Tongue Twisters, Word Practice)
  const [activePracticeSession, setActivePracticeSession] = useState<{
    sentence: string;
    contextTitle: string;
    activityType: ActivityType;
  } | null>(null);

  // Local session audio URLs for immediate replay in studio history
  const [sessionHistory, setSessionHistory] = useState<PracticeHistoryItem[]>([]);

  const isAdmin = isAdminUser(authUser);

  // 1. Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        try {
          const ensured = await ensureStudentProfile(user);
          setStudentProfile(ensured);
        } catch (err) {
          console.error('Profil hazırlanırken hata:', err);
        }
      } else {
        setStudentProfile(null);
        setStudentActivities([]);
        setAllStudents([]);
        setSessionHistory([]);
        setCurrentTab('dialogues');
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore subscriptions (ONLY when authenticated)
  useEffect(() => {
    if (!authReady || !authUser) return;

    setIsLoadingActivities(true);
    const unsubProfile = subscribeStudentProfile(authUser.uid, (prof) => {
      if (prof) setStudentProfile(prof);
    });

    const unsubActivities = subscribeStudentActivities(authUser.uid, (acts) => {
      setStudentActivities(acts);
      setIsLoadingActivities(false);
    });

    let unsubAdmin: (() => void) | undefined;
    if (isAdminUser(authUser)) {
      unsubAdmin = subscribeAllStudentsForAdmin((studentsList) => {
        setAllStudents(studentsList);
      });
    }

    return () => {
      unsubProfile();
      unsubActivities();
      if (unsubAdmin) unsubAdmin();
    };
  }, [authReady, authUser]);

  const handleSaveActivity = async ({
    evaluation,
    historyItem,
    activityType,
    contextTitle,
  }: {
    evaluation: PronunciationEvaluation;
    historyItem: PracticeHistoryItem;
    activityType: ActivityType;
    contextTitle: string;
  }) => {
    setSessionHistory((prev) => [historyItem, ...prev].slice(0, 15));

    if (!authUser || !studentProfile) return;

    try {
      await recordStudentActivity({
        uid: authUser.uid,
        profile: studentProfile,
        activityType,
        contextTitle,
        evaluation,
      });
    } catch (err) {
      console.error('Etkinlik kaydedilemedi:', err);
    }
  };

  const handleOpenPractice = (
    sentence: string,
    contextTitle: string,
    activityType: ActivityType
  ) => {
    setActivePracticeSession({ sentence, contextTitle, activityType });
  };

  const handleUpdateProfile = async (displayName: string, targetLevel: DialogueLevel) => {
    if (!authUser) return;
    await updateStudentSettings(authUser.uid, displayName, targetLevel);
  };

  const handleLogout = async () => {
    await logoutStudent();
  };

  // Loading state while Firebase Auth initializes
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-[#1E1B4B]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#059669]" />
          <span>Oturum kontrol ediliyor...</span>
        </div>
      </div>
    );
  }

  // Gate app behind Student Login / Registration when signed out
  if (!authUser) {
    return <AuthGate />;
  }

  const stats: UserStats = {
    completedSentencesCount: studentProfile?.totalAttempts ?? 0,
    averageAccuracy: studentProfile?.averageAccuracy ?? 0,
    totalAttempts: studentProfile?.totalAttempts ?? 0,
    perfectWordsCount: studentProfile?.perfectWordsCount ?? 0,
    growthDelta: studentProfile?.growthDelta ?? 0,
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* 3-Zone Header + Unboxed Student Progress Strip */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenFreePractice={() => setCurrentTab('studio')}
        stats={stats}
        profile={studentProfile}
        isAdmin={isAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dialogues' && (
          <DialogueViewer
            onOpenWordAnalysis={setActiveWordAnalysis}
            onSaveResult={handleSaveActivity}
          />
        )}

        {currentTab === 'studio' && (
          <FreePracticeStudio
            history={sessionHistory}
            onSaveResult={handleSaveActivity}
          />
        )}

        {currentTab === 'guide' && (
          <DictionGuide
            onPracticeSentence={(sentence, title) =>
              handleOpenPractice(sentence, title, 'diction')
            }
          />
        )}

        {currentTab === 'twisters' && (
          <TekerlemelerView
            onPracticeSentence={(sentence, title) =>
              handleOpenPractice(sentence, title, 'twister')
            }
          />
        )}

        {currentTab === 'profile' && studentProfile && (
          <StudentProgressProfile
            profile={studentProfile}
            activities={studentActivities}
            isOwnProfile={true}
            isLoadingActivities={isLoadingActivities}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
            onStartPractice={() => setCurrentTab('studio')}
          />
        )}

        {currentTab === 'admin' && isAdmin && (
          <AdminStudentsDashboard students={allStudents} />
        )}
      </main>

      {/* Word Morphology & Breakdown Modal */}
      {activeWordAnalysis && (
        <WordAnalysisModal
          wordData={activeWordAnalysis}
          onClose={() => setActiveWordAnalysis(null)}
          onPracticeWord={(word) => {
            handleOpenPractice(word, `Kelime Pratiği: ${word}`, 'word');
          }}
        />
      )}

      {/* Real-time Pronunciation & Audio Waveform Studio Modal */}
      {activePracticeSession && (
        <PronunciationStudioModal
          isOpen={!!activePracticeSession}
          onClose={() => setActivePracticeSession(null)}
          targetSentence={activePracticeSession.sentence}
          contextTitle={activePracticeSession.contextTitle}
          onSaveResult={(res) =>
            handleSaveActivity({
              ...res,
              activityType: activePracticeSession.activityType,
              contextTitle: activePracticeSession.contextTitle,
            })
          }
        />
      )}

      {/* Clean Subtle Footer */}
      <footer className="border-t border-[#EAE6DF] bg-[#F5F2EB] py-6 px-4 sm:px-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-stone-700">
            Türkçe Telaffuz, Diksiyon ve Diyalog Asistanı
          </p>
          <div className="flex items-center gap-3 text-stone-500">
            <span>Web Speech API (tr-TR)</span>
            <span aria-hidden="true">·</span>
            <span>Web Audio API Akustik Analiz</span>
            <span aria-hidden="true">·</span>
            <span>A1–B2 Gelişim Takibi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
