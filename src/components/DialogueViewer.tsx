import React, { useState, useEffect, useRef } from 'react';
import {
  DialogueLevel,
  PracticeHistoryItem,
  PronunciationEvaluation,
  SentenceItem,
  WordAnalysis,
} from '../types';
import { DIALOGUES, WORD_DICTIONARY } from '../data/dialogues';
import { speakTurkishText, stopTurkishSpeech } from '../utils/speech';
import { VoiceAnalysisPanel } from './VoiceAnalysisPanel';
import {
  Volume2,
  Mic,
  Play,
  Square,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';

interface DialogueViewerProps {
  onOpenWordAnalysis: (wordData: WordAnalysis) => void;
  onSaveResult: (result: {
    evaluation: PronunciationEvaluation;
    historyItem: PracticeHistoryItem;
    activityType: 'dialogue';
    contextTitle: string;
  }) => void;
}

export const DialogueViewer: React.FC<DialogueViewerProps> = ({
  onOpenWordAnalysis,
  onSaveResult,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<DialogueLevel | 'ALL'>('ALL');
  const [activeDialogueId, setActiveDialogueId] = useState<string>(DIALOGUES[0].id);
  const [showTranslations, setShowTranslations] = useState<boolean>(true);
  const [ttsSpeed, setTtsSpeed] = useState<number>(1.0);

  // Inline voice recording & analysis panel per sentence
  const [practicingSentenceId, setPracticingSentenceId] = useState<string | null>(
    DIALOGUES[0].sentences[0].id
  );
  const [sentenceScores, setSentenceScores] = useState<Record<string, number>>({});

  // Sequential Playback state
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);

  const sequentialIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

  const currentDialogue =
    DIALOGUES.find((d) => d.id === activeDialogueId) || DIALOGUES[0];

  const filteredDialogues =
    selectedLevel === 'ALL'
      ? DIALOGUES
      : DIALOGUES.filter((d) => d.level === selectedLevel);

  // Stop TTS and reset active practice panel when dialogue changes
  useEffect(() => {
    stopTurkishSpeech();
    setIsPlayingAll(false);
    setActiveSentenceId(null);
    isPlayingRef.current = false;
    const dlg = DIALOGUES.find((d) => d.id === activeDialogueId) || DIALOGUES[0];
    setPracticingSentenceId(dlg.sentences[0]?.id ?? null);
  }, [activeDialogueId]);

  // Clean word helper to look up in dictionary or fallback dynamically
  const getWordAnalysis = (rawWord: string): WordAnalysis => {
    const clean = rawWord
      .toLocaleLowerCase('tr-TR')
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’“”«»]/g, '')
      .trim();

    if (WORD_DICTIONARY[clean]) {
      return WORD_DICTIONARY[clean];
    }

    // Dynamic fallback for any word in dialogue
    const syllablesEstimate =
      clean.match(/[^aeıioöuü]*[aeıioöuü]+(?:[^aeıioöuü]+(?![aeıioöuü]))?/gi)?.join('-') || clean;

    return {
      word: rawWord,
      cleanWord: clean,
      root: clean.length > 5 ? clean.slice(0, 4) : clean,
      rootType: 'İsim',
      suffixes: clean.length > 5 ? ['Çekim / Yapım eki'] : [],
      englishMeaning: `Turkish term: "${clean}"`,
      turkishMeaning: `Diyalog içerisinde geçen Türkçe sözcük.`,
      syllables: syllablesEstimate,
      phoneticTip: 'Kelimenin seslerini net ve heceleri dengeli telaffuz edin.',
      stressTip: 'Vurgu genellikle son hecededir.',
      phonemeAlerts: [],
    };
  };

  // Play individual sentence
  const handlePlaySentence = (sentence: SentenceItem) => {
    stopTurkishSpeech();
    setIsPlayingAll(false);
    isPlayingRef.current = false;
    setActiveSentenceId(sentence.id);

    speakTurkishText(sentence.turkishText, {
      rate: ttsSpeed,
      onEnd: () => {
        setActiveSentenceId(null);
      },
      onError: () => {
        setActiveSentenceId(null);
      },
    });
  };

  // Sequential Playback of all sentences in dialogue
  const playNextInSequence = () => {
    if (!isPlayingRef.current) return;

    const sentences = currentDialogue.sentences;
    if (sequentialIndexRef.current >= sentences.length) {
      setIsPlayingAll(false);
      isPlayingRef.current = false;
      setActiveSentenceId(null);
      return;
    }

    const currentSentence = sentences[sequentialIndexRef.current];
    setActiveSentenceId(currentSentence.id);

    speakTurkishText(currentSentence.turkishText, {
      rate: ttsSpeed,
      onEnd: () => {
        if (!isPlayingRef.current) return;
        sequentialIndexRef.current += 1;
        setTimeout(() => {
          if (isPlayingRef.current) {
            playNextInSequence();
          }
        }, 600);
      },
      onError: () => {
        setIsPlayingAll(false);
        isPlayingRef.current = false;
        setActiveSentenceId(null);
      },
    });
  };

  const handleTogglePlayAll = () => {
    if (isPlayingAll) {
      stopTurkishSpeech();
      setIsPlayingAll(false);
      isPlayingRef.current = false;
      setActiveSentenceId(null);
    } else {
      stopTurkishSpeech();
      setIsPlayingAll(true);
      isPlayingRef.current = true;
      sequentialIndexRef.current = 0;
      playNextInSequence();
    }
  };

  return (
    <div className="space-y-6">
      {/* Level Filters & Dialogue Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE6DF]">
        <div className="flex items-center gap-1.5 p-1 bg-[#F0ECE4] rounded-xl self-start">
          {(['ALL', 'A1', 'A2', 'B1', 'B2'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedLevel === level
                  ? 'bg-white text-[#1E1B4B] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {level === 'ALL' ? 'Tüm Seviyeler' : level}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {filteredDialogues.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setActiveDialogueId(d.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap border ${
                activeDialogueId === d.id
                  ? 'bg-[#1E1B4B] text-white border-[#1E1B4B]'
                  : 'bg-white text-stone-700 border-[#E2DDD5] hover:bg-[#FAF8F5]'
              }`}
            >
              <span className="text-[#059669] font-bold mr-1.5">[{d.level}]</span>
              <span>{d.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Dialogue Header Card */}
      <div className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
              <span className="text-[#059669] font-bold">{currentDialogue.levelTitle}</span>
              <span aria-hidden="true">·</span>
              <span>{currentDialogue.sentences.length} Cümle</span>
              <span aria-hidden="true">·</span>
              <span>{currentDialogue.speakers.map((s) => s.name).join(' & ')}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#1E1B4B] mt-1 tracking-tight">
              {currentDialogue.title}
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              {currentDialogue.description}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleTogglePlayAll}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                isPlayingAll
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-[#059669] text-white hover:bg-[#047857]'
              }`}
            >
              {isPlayingAll ? (
                <>
                  <Square className="w-4 h-4 fill-white" />
                  <span>Durdur</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Diyaloğu Sırayla Dinle</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowTranslations(!showTranslations)}
              className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-stone-700 bg-[#FAF8F5] border border-[#E2DDD5] hover:bg-stone-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              title={showTranslations ? 'Çevirileri Gizle' : 'Çevirileri Göster'}
            >
              {showTranslations ? (
                <>
                  <EyeOff className="w-4 h-4 text-stone-500" />
                  <span className="hidden sm:inline">Çevirileri Gizle</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-[#059669]" />
                  <span className="hidden sm:inline">Çevirileri Göster</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-1 bg-[#FAF8F5] border border-[#E2DDD5] p-1 rounded-xl text-xs font-semibold">
              <span className="px-1.5 text-stone-400 text-[11px]">Hız:</span>
              {[0.75, 1.0, 1.25].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => setTtsSpeed(speed)}
                  className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                    ttsSpeed === speed
                      ? 'bg-[#1E1B4B] text-white'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scenario & Cultural Tip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-stone-200/80 text-stone-700">
            <span className="font-semibold text-stone-900 block mb-1">Sahne ve Bağlam</span>
            <span>{currentDialogue.scenario}</span>
          </div>

          {currentDialogue.culturalNote && (
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/70 text-emerald-900">
              <span className="font-semibold text-emerald-950 flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#059669]" /> Kültür ve Nezaket Kuralı
              </span>
              <span>{currentDialogue.culturalNote}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sentence Conversation Stream with Inline Voice Analysis */}
      <div className="space-y-4">
        {currentDialogue.sentences.map((sentence) => {
          const isSentenceActive = activeSentenceId === sentence.id;
          const isPracticing = practicingSentenceId === sentence.id;
          const lastScore = sentenceScores[sentence.id];
          const speaker = currentDialogue.speakers.find((s) => s.id === sentence.speakerId);

          return (
            <div
              key={sentence.id}
              className={`p-5 rounded-2xl transition-all border ${
                isSentenceActive || isPracticing
                  ? 'bg-white border-[#059669] shadow-sm ring-1 ring-[#059669]/20'
                  : 'bg-white border-[#E2DDD5] hover:border-stone-300 shadow-2xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Speaker info */}
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-2xs shrink-0"
                    style={{ backgroundColor: speaker?.color || '#1E1B4B' }}
                  >
                    {sentence.speakerName.charAt(0)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-sm font-bold text-[#1E1B4B]">
                      {sentence.speakerName}
                    </span>
                    {speaker?.role && (
                      <span className="text-xs text-stone-500 font-normal">
                        · {speaker.role}
                      </span>
                    )}
                    {typeof lastScore === 'number' && (
                      <span className="text-xs font-mono tabular-nums font-semibold text-[#059669] flex items-center gap-1">
                        <span aria-hidden="true" className="text-stone-300">
                          ·
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Son Skor: %{lastScore}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sentence Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handlePlaySentence(sentence)}
                    className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E2DDD5] hover:border-[#059669] text-[#059669] hover:bg-emerald-50/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    title="Bu cümleyi seslendir"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isSentenceActive ? 'animate-pulse' : ''}`} />
                    <span>Dinle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPracticingSentenceId(isPracticing ? null : sentence.id)
                    }
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs whitespace-nowrap ${
                      isPracticing
                        ? 'bg-[#059669] hover:bg-[#047857] text-white'
                        : 'bg-[#1E1B4B] hover:bg-[#312E81] text-white'
                    }`}
                    title="Bu cümleyi mikrofona oku ve sesini analiz et"
                  >
                    {isPracticing ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Ses Analizini Gizle</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>Sesini Kaydet & Analiz Et</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Turkish Sentence with Clickable Words */}
              <div className="mt-3.5">
                <div className="text-lg sm:text-xl font-semibold text-[#1E1B4B] leading-relaxed flex flex-wrap gap-x-1.5 gap-y-1">
                  {sentence.turkishText.split(' ').map((rawWord, wIdx) => {
                    return (
                      <span
                        key={wIdx}
                        onClick={() => {
                          const analysis = getWordAnalysis(rawWord);
                          onOpenWordAnalysis(analysis);
                        }}
                        className="cursor-pointer hover:text-[#059669] hover:bg-emerald-50/80 px-1 py-0.5 rounded transition-colors"
                        title="Kelime ve ek-kök analizini açmak için tıklayın"
                      >
                        {rawWord}
                      </span>
                    );
                  })}
                </div>

                {/* Phonetic Syllables Guidance */}
                {sentence.phoneticSpelling && (
                  <p className="text-xs font-mono text-stone-500 mt-1">
                    Heceleme: <span className="text-[#059669]">{sentence.phoneticSpelling}</span>
                  </p>
                )}

                {/* English Translation */}
                {showTranslations && (
                  <p className="text-sm text-stone-600 mt-2 font-normal italic border-t border-stone-100 pt-2">
                    {sentence.englishText}
                  </p>
                )}

                {/* Grammar Note */}
                {sentence.grammarNote && (
                  <div className="mt-2 text-xs text-stone-500 bg-[#FAF8F5] p-2.5 rounded-lg border border-stone-200/60 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span>{sentence.grammarNote}</span>
                  </div>
                )}
              </div>

              {/* Inline Student Voice Capture & Analysis Panel */}
              {isPracticing && (
                <div className="mt-5 pt-5 border-t border-[#EAE6DF]">
                  <VoiceAnalysisPanel
                    targetSentence={sentence.turkishText}
                    contextTitle={`${sentence.speakerName} · ${currentDialogue.title}`}
                    compact={true}
                    onSaveResult={(res) => {
                      setSentenceScores((prev) => ({
                        ...prev,
                        [sentence.id]: res.evaluation.accuracyScore,
                      }));
                      onSaveResult({
                        ...res,
                        activityType: 'dialogue',
                        contextTitle: `${sentence.speakerName} · ${currentDialogue.title}`,
                      });
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
