import React, { useState, useEffect } from 'react';
import {
  PracticeHistoryItem,
  PronunciationEvaluation,
  UserStats,
  WordAnalysis,
} from './types';
import { Header } from './components/Header';
import { DialogueViewer } from './components/DialogueViewer';
import { DictionGuide } from './components/DictionGuide';
import { TekerlemelerView } from './components/TekerlemelerView';
import { FreePracticeStudio } from './components/FreePracticeStudio';
import { WordAnalysisModal } from './components/WordAnalysisModal';
import { PronunciationStudioModal } from './components/PronunciationStudioModal';

const STATS_STORAGE_KEY = 'turkce_diksiyon_stats_v1';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dialogues' | 'studio' | 'guide' | 'twisters'>('dialogues');

  // Word Analysis Modal state
  const [activeWordAnalysis, setActiveWordAnalysis] = useState<WordAnalysis | null>(null);

  // Pronunciation Studio Modal state (for Diction Guide, Tongue Twisters, Word Practice)
  const [activePracticeSession, setActivePracticeSession] = useState<{
    sentence: string;
    contextTitle: string;
  } | null>(null);

  // Session recording & analysis history
  const [practiceHistory, setPracticeHistory] = useState<PracticeHistoryItem[]>([]);

  // User Stats state
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      completedSentencesCount: 0,
      averageAccuracy: 0,
      totalAttempts: 0,
      perfectWordsCount: 0,
      practiceStreakDays: 1,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  const handleSaveResult = ({
    evaluation,
    historyItem,
  }: {
    evaluation: PronunciationEvaluation;
    historyItem: PracticeHistoryItem;
  }) => {
    setPracticeHistory((prev) => [historyItem, ...prev].slice(0, 15));

    const perfectCount = evaluation.words.filter((w) => w.status === 'correct').length;

    setStats((prev) => {
      const newTotal = prev.totalAttempts + 1;
      const newAverage =
        evaluation.accuracyScore > 0 || prev.totalAttempts === 0
          ? Math.round(
              (prev.averageAccuracy * prev.totalAttempts + evaluation.accuracyScore) / newTotal
            )
          : prev.averageAccuracy;

      return {
        ...prev,
        totalAttempts: newTotal,
        averageAccuracy: newAverage,
        completedSentencesCount: prev.completedSentencesCount + 1,
        perfectWordsCount: prev.perfectWordsCount + perfectCount,
      };
    });
  };

  const handleOpenPractice = (sentence: string, contextTitle: string) => {
    setActivePracticeSession({ sentence, contextTitle });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* 3-Zone Header + Unboxed Stats Strip */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenFreePractice={() => setCurrentTab('studio')}
        stats={stats}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dialogues' && (
          <DialogueViewer
            onOpenWordAnalysis={setActiveWordAnalysis}
            onSaveResult={handleSaveResult}
          />
        )}

        {currentTab === 'studio' && (
          <FreePracticeStudio
            history={practiceHistory}
            onSaveResult={handleSaveResult}
          />
        )}

        {currentTab === 'guide' && (
          <DictionGuide onPracticeSentence={handleOpenPractice} />
        )}

        {currentTab === 'twisters' && (
          <TekerlemelerView onPracticeSentence={handleOpenPractice} />
        )}
      </main>

      {/* Word Morphology & Breakdown Modal */}
      {activeWordAnalysis && (
        <WordAnalysisModal
          wordData={activeWordAnalysis}
          onClose={() => setActiveWordAnalysis(null)}
          onPracticeWord={(word) => {
            handleOpenPractice(word, `Kelime Pratiği: ${word}`);
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
          onSaveResult={handleSaveResult}
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
            <span>A1–B2 Müfredatı</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
