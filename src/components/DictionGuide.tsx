import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DICTION_CURRICULUM, DictionLevelModule } from '../data/dictionCurriculum';
import {
  ActivityType,
  PracticeHistoryItem,
  PronunciationEvaluation,
  StudentProfile,
} from '../types';
import { speakTurkishText } from '../utils/speech';
import { VoiceAnalysisPanel } from './VoiceAnalysisPanel';
import {
  Volume2,
  Lock,
  KeyRound,
  CheckCircle2,
  XCircle,
  BookOpen,
  HelpCircle,
  Mic,
  ArrowRight,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Award,
} from 'lucide-react';

interface DictionGuideProps {
  profile: StudentProfile | null;
  onSaveResult: (result: {
    evaluation: PronunciationEvaluation;
    historyItem: PracticeHistoryItem;
    activityType: ActivityType;
    contextTitle: string;
  }) => void;
  onCompleteLevel: (levelId: string, levelOrder: number) => Promise<void>;
}

type LessonStep = 'info' | 'quiz' | 'voice';

export const DictionGuide: React.FC<DictionGuideProps> = ({
  profile,
  onSaveResult,
  onCompleteLevel,
}) => {
  const unlockedLevelOrder = Math.max(1, profile?.unlockedLevelOrder ?? 1);
  const completedLevelIds = useMemo(
    () => profile?.completedLevelIds ?? [],
    [profile?.completedLevelIds]
  );

  // Default selected level: current unlocked frontier level (or Level 1)
  const [selectedLevelId, setSelectedLevelId] = useState<string>(() => {
    const frontier =
      DICTION_CURRICULUM.find((lvl) => lvl.order === unlockedLevelOrder) ||
      DICTION_CURRICULUM[0];
    return frontier.id;
  });

  const [activeStep, setActiveStep] = useState<LessonStep>('info');

  // Quiz state for the currently selected level
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Voice evaluation state for the currently selected level
  const [voiceAttemptEval, setVoiceAttemptEval] = useState<PronunciationEvaluation | null>(null);
  const [voicePassed, setVoicePassed] = useState<boolean>(false);

  // Completion / unlock UI feedback
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
  const [justUnlockedOrder, setJustUnlockedOrder] = useState<number | null>(null);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  // Guard to avoid duplicate completeDictionLevel calls for the same level in a single pass
  const completedTriggerRef = useRef<string | null>(null);

  const currentLevel: DictionLevelModule = useMemo(() => {
    return (
      DICTION_CURRICULUM.find((lvl) => lvl.id === selectedLevelId) || DICTION_CURRICULUM[0]
    );
  }, [selectedLevelId]);

  const isCurrentLevelCompleted = completedLevelIds.includes(currentLevel.id);

  // Reset per-level local evaluation state when switching levels
  const handleSelectLevel = (level: DictionLevelModule) => {
    const isUnlocked =
      level.order <= unlockedLevelOrder || completedLevelIds.includes(level.id);
    if (!isUnlocked) {
      const prevLevel = DICTION_CURRICULUM.find((l) => l.order === level.order - 1);
      setLockedNotice(
        `${level.title} kilitli. Bu anahtarı açmak için önce "${
          prevLevel?.title || 'önceki seviye'
        }" bölümündeki soru ve ses değerlendirmesini tamamlayın.`
      );
      return;
    }

    setLockedNotice(null);
    setSelectedLevelId(level.id);
    setActiveStep('info');
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setVoiceAttemptEval(null);
    setVoicePassed(false);
    setJustUnlockedOrder(null);
    completedTriggerRef.current = null;
  };

  // Quiz accuracy calculations
  const allQuizAnswered = currentLevel.quiz.every(
    (q) => typeof selectedAnswers[q.id] === 'number'
  );
  const correctQuizCount = currentLevel.quiz.filter(
    (q) => selectedAnswers[q.id] === q.correctIndex
  ).length;
  const quizPassed = quizSubmitted && correctQuizCount === currentLevel.quiz.length;

  // Trigger Firestore unlock when BOTH quiz and voice evaluation are passed
  useEffect(() => {
    if (!quizPassed || !voicePassed) return;
    if (completedTriggerRef.current === currentLevel.id) return;

    completedTriggerRef.current = currentLevel.id;
    const wasAlreadyUnlockedNext =
      unlockedLevelOrder > currentLevel.order || currentLevel.order >= DICTION_CURRICULUM.length;

    const persistCompletion = async () => {
      setIsUnlocking(true);
      try {
        await onCompleteLevel(currentLevel.id, currentLevel.order);
        if (!wasAlreadyUnlockedNext) {
          setJustUnlockedOrder(currentLevel.order + 1);
        }
      } catch (err) {
        console.error('Seviye tamamlama kaydedilemedi:', err);
        completedTriggerRef.current = null;
      } finally {
        setIsUnlocking(false);
      }
    };

    persistCompletion();
  }, [quizPassed, voicePassed, currentLevel.id, currentLevel.order, unlockedLevelOrder, onCompleteLevel]);

  const handleVoiceEvaluationResult = ({
    evaluation,
    historyItem,
  }: {
    evaluation: PronunciationEvaluation;
    historyItem: PracticeHistoryItem;
  }) => {
    setVoiceAttemptEval(evaluation);

    // Save to Firestore activity timeline for profile growth tracking
    onSaveResult({
      evaluation,
      historyItem,
      activityType: 'diction',
      contextTitle: `${currentLevel.title} · Ses Değerlendirmesi`,
    });

    // Pass threshold: meet target accuracy OR valid acoustic capture fallback when browser lacks SpeechRecognition
    const meetsAccuracy = evaluation.accuracyScore >= currentLevel.voiceEvaluation.minAccuracy;
    const acousticFallbackPass =
      evaluation.spokenSentence.trim() === '' &&
      (evaluation.acousticMetrics?.speechActivityRatio ?? 0) >= 20 &&
      evaluation.durationSeconds >= 1.2;

    if (meetsAccuracy || acousticFallbackPass) {
      setVoicePassed(true);
    }
  };

  const handleRepeatCurrentLevel = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setVoiceAttemptEval(null);
    setVoicePassed(false);
    setJustUnlockedOrder(null);
    completedTriggerRef.current = null;
    setActiveStep('info');
  };

  const nextLevel = useMemo(() => {
    return DICTION_CURRICULUM.find((l) => l.order === currentLevel.order + 1) || null;
  }, [currentLevel.order]);

  const isNextLevelUnlocked = nextLevel
    ? nextLevel.order <= unlockedLevelOrder ||
      completedLevelIds.includes(nextLevel.id) ||
      (quizPassed && voicePassed)
    : false;

  const unit1Levels = useMemo(
    () => DICTION_CURRICULUM.filter((l) => l.unitNumber === 1),
    []
  );
  const unit2Levels = useMemo(
    () => DICTION_CURRICULUM.filter((l) => l.unitNumber === 2),
    []
  );

  const completedCount = completedLevelIds.length;
  const totalLevels = DICTION_CURRICULUM.length;
  const progressPercent = Math.round((completedCount / totalLevels) * 100);

  return (
    <div className="space-y-6">
      {/* Top Curriculum Header & Progress Banner */}
      <div className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-medium">
              <span className="font-semibold text-[#059669]">Aşamalı Diksiyon Yolculuğu</span>
              <span aria-hidden="true">·</span>
              <span>Ünlülerle Başlayan Seviye Sistemi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] tracking-tight">
              Diksiyon Bilgileri
            </h1>
            <p className="text-sm text-stone-600 max-w-2xl">
              A ünlüsünden başlayarak her seviyenin kuralını öğrenin, sonundaki mini soru ve ses
              analizi değerlendirmesini geçip bir sonraki seviyenin anahtarını açın. Anahtarı
              açılan tüm bilgilere dilediğiniz zaman dönüp tekrar edebilirsiniz.
            </p>
          </div>

          <div className="shrink-0 bg-[#FAF8F5] border border-[#E2DDD5] rounded-xl px-4 py-3 min-w-[210px] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-stone-600">
              <span>İlerleme Durumu</span>
              <span className="font-mono tabular-nums font-bold text-[#059669]">
                {completedCount} / {totalLevels} Seviye
              </span>
            </div>
            <div className="w-full h-2 bg-[#E8E4DC] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#059669] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 font-mono tabular-nums">
              Açık Anahtar: Seviye {Math.min(unlockedLevelOrder, totalLevels)} · %{progressPercent} tamamlandı
            </p>
          </div>
        </div>

        {lockedNotice && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{lockedNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setLockedNotice(null)}
              className="text-amber-700 hover:text-amber-950 font-semibold shrink-0 cursor-pointer"
            >
              Kapat
            </button>
          </div>
        )}
      </div>

      {/* Main 12-Col Layout: Duolingo-style Path (Left 4 cols) + Active Level Workspace (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Progressive Level Path */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-28">
          {[
            { unitTitle: 'Ünite 1 · Ünlü Harfler (A–Ü)', levels: unit1Levels },
            { unitTitle: 'Ünite 2 · Ünsüzler ve Akıcılık', levels: unit2Levels },
          ].map((unit) => (
            <div
              key={unit.unitTitle}
              className="bg-white border border-[#E2DDD5] rounded-2xl p-4 shadow-2xs space-y-3"
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
                {unit.unitTitle}
              </h2>

              <div className="relative space-y-2">
                {/* Subtle vertical connector line */}
                <div
                  aria-hidden="true"
                  className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-[#EAE6DF] pointer-events-none"
                />

                {unit.levels.map((level) => {
                  const isCompleted = completedLevelIds.includes(level.id);
                  const isUnlocked = level.order <= unlockedLevelOrder || isCompleted;
                  const isSelected = level.id === currentLevel.id;

                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => handleSelectLevel(level)}
                      className={`relative z-10 w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-[#1E1B4B] text-white border-[#1E1B4B] shadow-xs'
                          : isCompleted
                          ? 'bg-emerald-50/60 hover:bg-emerald-50 text-stone-900 border-emerald-200'
                          : isUnlocked
                          ? 'bg-[#FAF8F5] hover:bg-white text-stone-900 border-[#D5CFE8]'
                          : 'bg-stone-50/80 text-stone-400 border-[#EAE6DF] opacity-80 hover:opacity-100'
                      }`}
                    >
                      {/* Emblem Circle */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 border ${
                          isSelected
                            ? 'bg-[#059669] text-white border-[#059669]'
                            : isCompleted
                            ? 'bg-[#059669] text-white border-[#059669]'
                            : isUnlocked
                            ? 'bg-white text-[#1E1B4B] border-[#1E1B4B]/25'
                            : 'bg-stone-100 text-stone-400 border-stone-200'
                        }`}
                      >
                        {isUnlocked ? (
                          <span className="tracking-tight">{level.symbol}</span>
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-xs font-bold truncate ${
                              isSelected
                                ? 'text-white'
                                : isUnlocked
                                ? 'text-[#1E1B4B]'
                                : 'text-stone-500'
                            }`}
                          >
                            {level.title}
                          </span>
                          {isCompleted ? (
                            <CheckCircle2
                              className={`w-4 h-4 shrink-0 ${
                                isSelected ? 'text-[#34D399]' : 'text-[#059669]'
                              }`}
                            />
                          ) : isUnlocked ? (
                            <KeyRound
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isSelected ? 'text-amber-300' : 'text-amber-600'
                              }`}
                            />
                          ) : (
                            <Lock className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                          )}
                        </div>
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected
                              ? 'text-indigo-200'
                              : isCompleted
                              ? 'text-emerald-800'
                              : isUnlocked
                              ? 'text-stone-500'
                              : 'text-stone-400'
                          }`}
                        >
                          {isCompleted
                            ? 'Anahtar Açık · Tekrar Edilebilir'
                            : isUnlocked
                            ? level.subtitle
                            : 'Önceki seviyeyi tamamlayın'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* RIGHT COLUMN: Active Level Workspace */}
        <section className="lg:col-span-8 space-y-5">
          {/* Level Header + Step Switcher */}
          <div className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#1E1B4B] text-white font-extrabold text-2xl flex items-center justify-center shrink-0">
                  {currentLevel.symbol}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-medium">
                    <span className="font-mono font-semibold text-[#059669]">
                      Seviye {currentLevel.order} / {totalLevels}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{currentLevel.phoneticClassification}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] tracking-tight">
                    {currentLevel.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600">{currentLevel.subtitle}</p>
                </div>
              </div>

              {isCurrentLevelCompleted && (
                <button
                  type="button"
                  onClick={handleRepeatCurrentLevel}
                  className="px-3.5 py-2 bg-[#FAF8F5] border border-[#E2DDD5] hover:border-[#059669] text-stone-700 hover:text-[#1E1B4B] rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start whitespace-nowrap transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Seviyeyi Baştan Tekrar Et</span>
                </button>
              )}
            </div>

            {isCurrentLevelCompleted && (
              <div className="px-4 py-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium">
                  <KeyRound className="w-4 h-4 text-[#059669]" />
                  Bu seviyenin anahtarı açık. Dilediğiniz zaman kuralı okuyabilir, soruları ve ses
                  analizini tekrar edebilirsiniz.
                </span>
                {nextLevel && (
                  <button
                    type="button"
                    onClick={() => handleSelectLevel(nextLevel)}
                    className="font-semibold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Sonraki: {nextLevel.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* 3-Step Segmented Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#F4F0E8] rounded-xl">
              <button
                type="button"
                onClick={() => setActiveStep('info')}
                className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeStep === 'info'
                    ? 'bg-white text-[#1E1B4B] shadow-2xs'
                    : 'text-stone-600 hover:text-[#1E1B4B]'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#059669]" />
                <span>1. Bilgi & Örnek</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep('quiz')}
                className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeStep === 'quiz'
                    ? 'bg-white text-[#1E1B4B] shadow-2xs'
                    : 'text-stone-600 hover:text-[#1E1B4B]'
                }`}
              >
                {quizPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-[#4338CA]" />
                )}
                <span>2. Sorular</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep('voice')}
                className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeStep === 'voice'
                    ? 'bg-white text-[#1E1B4B] shadow-2xs'
                    : 'text-stone-600 hover:text-[#1E1B4B]'
                }`}
              >
                {voicePassed ? (
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                ) : (
                  <Mic className="w-4 h-4 text-amber-600" />
                )}
                <span>3. Ses Analizi</span>
              </button>
            </div>
          </div>

          {/* STEP 1: DICTION THEORY & CLICKABLE EXAMPLES */}
          {activeStep === 'info' && (
            <div className="space-y-5">
              <div className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-2xs space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#059669]">
                      Ağız, Dudak ve Dil Duruşu
                    </h3>
                    <p className="text-sm text-stone-700 leading-relaxed">
                      {currentLevel.mouthPosture}
                    </p>
                  </div>

                  <div className="p-4 bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#4338CA]">
                      Temel Diksiyon Kuralı
                    </h3>
                    <p className="text-sm text-stone-700 leading-relaxed">
                      {currentLevel.keyRule}
                    </p>
                  </div>
                </div>

                {/* Common Mistakes */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Sık Yapılan Hatalar</span>
                  </h3>
                  <ul className="space-y-2">
                    {currentLevel.commonMistakes.map((mistake, idx) => (
                      <li
                        key={idx}
                        className="text-xs sm:text-sm text-stone-700 bg-amber-50/60 border border-amber-200/70 rounded-xl px-3.5 py-2.5 leading-relaxed"
                      >
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Clickable Audio Examples */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B4B]">
                      Sesli Örnek Sözcükler (Dinlemek için tıklayın)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentLevel.examples.map((ex, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => speakTurkishText(ex.written.split('/')[0].trim(), { rate: 0.85 })}
                        className="p-3.5 bg-[#FAF8F5] hover:bg-indigo-50/50 border border-[#E2DDD5] hover:border-[#4338CA] rounded-xl text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-base font-bold text-[#1E1B4B] group-hover:text-[#4338CA]">
                            {ex.written}
                          </span>
                          <Volume2 className="w-4 h-4 text-stone-400 group-hover:text-[#4338CA] shrink-0" />
                        </div>
                        <p className="text-xs font-mono font-semibold text-[#059669] mt-1">
                          Okunuş: {ex.pronounced}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5">{ex.note}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EAE6DF] flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveStep('quiz')}
                    className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-semibold text-sm rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Değerlendirmeye Başla (Sorular)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MINI QUIZ EVALUATION */}
          {activeStep === 'quiz' && (
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-2xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-[#1E1B4B]">
                    Mini Soru Değerlendirmesi ({currentLevel.symbol})
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Sonraki seviyenin anahtarını açmak için soruları doğru yanıtlayın ve ses
                    analizini tamamlayın.
                  </p>
                </div>
                {quizSubmitted && (
                  <span
                    className={`text-xs font-mono tabular-nums font-bold flex items-center gap-1 ${
                      quizPassed ? 'text-[#059669]' : 'text-amber-700'
                    }`}
                  >
                    {quizPassed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {correctQuizCount} / {currentLevel.quiz.length} Doğru
                  </span>
                )}
              </div>

              <div className="space-y-5">
                {currentLevel.quiz.map((q, qIdx) => {
                  const chosen = selectedAnswers[q.id];
                  const isCorrect = chosen === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-4 bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl space-y-3"
                    >
                      <p className="text-sm font-bold text-[#1E1B4B] leading-snug">
                        {qIdx + 1}. {q.question}
                      </p>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isPicked = chosen === optIdx;
                          let optionStyle =
                            'bg-white border-[#E2DDD5] text-stone-800 hover:border-[#4338CA]';

                          if (quizSubmitted) {
                            if (optIdx === q.correctIndex) {
                              optionStyle =
                                'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold';
                            } else if (isPicked && optIdx !== q.correctIndex) {
                              optionStyle = 'bg-rose-50 border-rose-300 text-rose-900';
                            } else {
                              optionStyle = 'bg-white/70 border-[#EAE6DF] text-stone-500';
                            }
                          } else if (isPicked) {
                            optionStyle =
                              'bg-indigo-50 border-[#4338CA] text-[#1E1B4B] font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => {
                                setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                                if (quizSubmitted) setQuizSubmitted(false);
                              }}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-colors flex items-center justify-between gap-2 cursor-pointer ${optionStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && optIdx === q.correctIndex && (
                                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                              )}
                              {quizSubmitted && isPicked && optIdx !== q.correctIndex && (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div
                          className={`p-3 rounded-lg text-xs leading-relaxed ${
                            isCorrect
                              ? 'bg-emerald-50/80 text-emerald-900 border border-emerald-200'
                              : 'bg-rose-50/80 text-rose-900 border border-rose-200'
                          }`}
                        >
                          <strong className="font-semibold">
                            {isCorrect ? 'Doğru: ' : 'Açıklama: '}
                          </strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#EAE6DF] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep('info')}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-[#1E1B4B] cursor-pointer"
                >
                  &larr; Bilgi Kartına Dön
                </button>

                <div className="flex flex-wrap items-center gap-2.5">
                  {!quizPassed ? (
                    <button
                      type="button"
                      disabled={!allQuizAnswered}
                      onClick={() => setQuizSubmitted(true)}
                      className="px-5 py-2.5 bg-[#1E1B4B] hover:bg-[#312E81] disabled:bg-stone-300 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                    >
                      Cevapları Kontrol Et
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveStep('voice')}
                      className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-semibold text-sm rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>Ses Analizi Değerlendirmesine Geç</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {quizSubmitted && !quizPassed && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="px-4 py-2.5 bg-[#FAF8F5] border border-[#E2DDD5] text-stone-700 hover:border-stone-400 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Yeniden Dene</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: VOICE ANALYSIS EVALUATION */}
          {activeStep === 'voice' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-2xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#1E1B4B]">
                    <Mic className="w-4 h-4 text-[#059669]" />
                    <span>Seviye Sonu Ses Analizi Değerlendirmesi</span>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-stone-500">
                    Geçme Hedefi: %{currentLevel.voiceEvaluation.minAccuracy}+ doğruluk
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600">
                  {currentLevel.voiceEvaluation.instruction}
                </p>

                {/* Status checklist for unlocking the next level */}
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs border-t border-[#EAE6DF]">
                  <span
                    className={`flex items-center gap-1.5 font-semibold ${
                      quizPassed ? 'text-[#059669]' : 'text-stone-500'
                    }`}
                  >
                    {quizPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    Sorular:{' '}
                    {quizPassed ? 'Tamamlandı' : 'Henüz tamamlanmadı (2. Adıma dönün)'}
                  </span>

                  <span aria-hidden="true" className="text-stone-300">
                    ·
                  </span>

                  <span
                    className={`flex items-center gap-1.5 font-semibold ${
                      voicePassed ? 'text-[#059669]' : 'text-stone-500'
                    }`}
                  >
                    {voicePassed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                    ) : (
                      <Mic className="w-4 h-4 text-[#4338CA]" />
                    )}
                    Ses Analizi:{' '}
                    {voicePassed
                      ? 'Geçti'
                      : voiceAttemptEval
                      ? `%${voiceAttemptEval.accuracyScore} (Tekrar deneyin)`
                      : 'Kayıt bekleniyor'}
                  </span>
                </div>
              </div>

              {/* Embedded Voice Analysis Panel */}
              <VoiceAnalysisPanel
                key={currentLevel.id}
                targetSentence={currentLevel.voiceEvaluation.targetSentence}
                contextTitle={`${currentLevel.title} · Ses Değerlendirmesi`}
                onSaveResult={handleVoiceEvaluationResult}
              />

              {/* Remind to complete quiz if voice passed first */}
              {voicePassed && !quizPassed && (
                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-[#1E1B4B]">
                    <Sparkles className="w-5 h-5 text-[#4338CA] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Ses analizi başarıyla geçti!</p>
                      <p className="text-stone-600 text-xs mt-0.5">
                        Bir sonraki seviyenin anahtarını açmak için şimdi 2. adımdaki mini soruları
                        tamamlayın.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveStep('quiz')}
                    className="px-4 py-2 bg-[#4338CA] hover:bg-[#3730A3] text-white text-xs font-semibold rounded-xl whitespace-nowrap cursor-pointer"
                  >
                    Sorulara Git
                  </button>
                </div>
              )}

              {/* Level Completed & Key Unlocked Celebration Banner */}
              {quizPassed && voicePassed && (
                <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#059669] text-white flex items-center justify-center shrink-0">
                      {nextLevel ? <KeyRound className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-base font-extrabold text-emerald-950">
                        {nextLevel
                          ? justUnlockedOrder
                            ? `Tebrikler! Seviye ${justUnlockedOrder} Anahtarı Açıldı!`
                            : `${currentLevel.title} Başarıyla Tamamlandı!`
                          : 'Tebrikler! Tüm Diksiyon Seviyelerini Tamamladınız!'}
                      </h4>
                      <p className="text-xs text-emerald-900">
                        {isUnlocking
                          ? 'İlerlemeniz profilinize kaydediliyor...'
                          : nextLevel
                          ? 'Hem soru hem ses analizi değerlendirmesini geçtiniz. Bu seviyeye istediğiniz zaman geri dönüp tekrar yapabilirsiniz.'
                          : 'Tüm ünlü, ünsüz ve akıcılık seviyelerinin anahtarları açık; dilediğiniz seviyeyi tekrar edebilirsiniz.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleRepeatCurrentLevel}
                      className="px-3.5 py-2 bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap"
                    >
                      Tekrar Et
                    </button>
                    {nextLevel && isNextLevelUnlocked && (
                      <button
                        type="button"
                        onClick={() => handleSelectLevel(nextLevel)}
                        className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <span>Sonraki: {nextLevel.symbol}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
