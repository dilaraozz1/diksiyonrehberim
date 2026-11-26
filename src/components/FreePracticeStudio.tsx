import React, { useState, useRef } from 'react';
import { PracticeHistoryItem, PronunciationEvaluation } from '../types';
import { VoiceAnalysisPanel } from './VoiceAnalysisPanel';
import { Mic, Play, Pause, Clock, CheckCircle2, Sparkles } from 'lucide-react';

interface FreePracticeStudioProps {
  history: PracticeHistoryItem[];
  onSaveResult: (result: {
    evaluation: PronunciationEvaluation;
    historyItem: PracticeHistoryItem;
  }) => void;
}

const PRESET_PRACTICE_SENTENCES = [
  {
    id: 'p1',
    category: 'Günlük Nezaket · A1',
    text: 'Gününüz aydın ve bereketli olsun, çok teşekkür ederim.',
  },
  {
    id: 'p2',
    category: 'İstanbul Gezisi · A2',
    text: 'Boğaz kıyısında yürürken taze demlenmiş bir bardak çay içtik.',
  },
  {
    id: 'p3',
    category: 'Yumuşak G Egzersizi · B1',
    text: 'Öğretmenimiz dağdaki doğa yürüyüşünde bağ evine sığındı.',
  },
  {
    id: 'p4',
    category: 'İş ve Toplantı · B1',
    text: 'Yeni projenin kullanıcı deneyimi tasarımını gelecek hafta paylaşacağız.',
  },
  {
    id: 'p5',
    category: 'Restoran ve Lezzet · A2',
    text: 'Afiyet olsun, közde pişmiş ızgara köfte ve yayık ayranı harika görünüyor.',
  },
  {
    id: 'p6',
    category: 'İleri Diksiyon · B2',
    text: 'İstanbul Türkçesinde kelimeler melodik bir ahenkle ve net vurgularla telaffuz edilir.',
  },
];

export const FreePracticeStudio: React.FC<FreePracticeStudioProps> = ({
  history,
  onSaveResult,
}) => {
  const [activeSentence, setActiveSentence] = useState<string>(PRESET_PRACTICE_SENTENCES[0].text);
  const [activeCategory, setActiveCategory] = useState<string>(PRESET_PRACTICE_SENTENCES[0].category);
  const [customDraft, setCustomDraft] = useState<string>('');
  const [playingHistoryId, setPlayingHistoryId] = useState<string | null>(null);
  const historyAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleApplyCustomSentence = () => {
    const trimmed = customDraft.trim();
    if (!trimmed) return;
    setActiveSentence(trimmed);
    setActiveCategory('Özel Öğrenci Cümlesi');
  };

  const handleSelectPreset = (preset: (typeof PRESET_PRACTICE_SENTENCES)[number]) => {
    setActiveSentence(preset.text);
    setActiveCategory(preset.category);
  };

  const handleToggleHistoryAudio = (item: PracticeHistoryItem) => {
    if (!item.audioUrl) return;

    if (playingHistoryId === item.id) {
      historyAudioRef.current?.pause();
      setPlayingHistoryId(null);
      return;
    }

    if (historyAudioRef.current) {
      historyAudioRef.current.pause();
    }
    const audio = new Audio(item.audioUrl);
    historyAudioRef.current = audio;
    audio.onended = () => setPlayingHistoryId(null);
    audio
      .play()
      .then(() => setPlayingHistoryId(item.id))
      .catch(() => setPlayingHistoryId(null));
  };

  return (
    <div className="space-y-6">
      {/* Studio Intro Header */}
      <div className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#059669]">
          <Mic className="w-4 h-4" />
          <span>Canlı Ses Kayıt ve Telaffuz Analiz Stüdyosu</span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#1E1B4B] tracking-tight text-balance">
          Sesinizi Kaydedin, Telaffuz ve Tonlamanızı Anında Analiz Edin
        </h2>
        <p className="text-sm text-stone-600 max-w-3xl leading-relaxed">
          Aşağıdaki stüdyoda hedef cümleyi doğrudan mikrofona okuyun veya kendi cümlenizi yazın.
          Sistem ses dalganızı, konuşma hızınızı, ses şiddetinizi, tonlama aralığınızı ve kelime bazlı
          Türkçe diksiyon doğruluğunuzu gerçek zamanlı analiz eder.
        </p>
      </div>

      {/* Main Two-Zone Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Primary Voice Recording & Analysis Stage (Left 8 cols) */}
        <div className="lg:col-span-8">
          <VoiceAnalysisPanel
            targetSentence={activeSentence}
            contextTitle={activeCategory}
            onSaveResult={onSaveResult}
          />
        </div>

        {/* Right Side Control Deck: Custom Sentence + Presets (Right 4 cols) */}
        <aside className="lg:col-span-4 space-y-5">
          {/* Custom Sentence Card */}
          <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-2xs space-y-3">
            <label
              htmlFor="custom-practice-input"
              className="block text-sm font-bold text-[#1E1B4B]"
            >
              Kendi Cümlenizi Ekleyin
            </label>
            <textarea
              id="custom-practice-input"
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              placeholder="Pratik yapmak istediğiniz Türkçe cümleyi buraya yazın..."
              rows={3}
              className="w-full p-3 bg-[#FAF8F5] border border-[#E2DDD5] focus:border-[#059669] focus:outline-none rounded-xl text-stone-900 text-sm leading-relaxed"
            />
            <button
              type="button"
              onClick={handleApplyCustomSentence}
              disabled={!customDraft.trim()}
              className="w-full py-2.5 px-4 bg-[#1E1B4B] hover:bg-[#312E81] disabled:bg-stone-300 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              Bu Cümleyi Stüdyoya Aktar
            </button>
          </div>

          {/* Preset Practice Sentences List */}
          <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1E1B4B]">Hazır Çalışma Cümleleri</h3>
              <span className="text-xs text-stone-400 font-mono tabular-nums">
                {PRESET_PRACTICE_SENTENCES.length} cümle
              </span>
            </div>
            <div className="space-y-2">
              {PRESET_PRACTICE_SENTENCES.map((preset) => {
                const isSelected = activeSentence === preset.text;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer space-y-1 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-[#059669] text-[#1E1B4B]'
                        : 'bg-[#FAF8F5] border-[#EAE6DF] hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <span className="block text-[11px] font-semibold text-[#059669]">
                      {preset.category}
                    </span>
                    <span className="block text-xs font-medium leading-relaxed">
                      {preset.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Session Recording & Analysis History */}
      {history.length > 0 && (
        <div className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#059669]" />
              <h3 className="text-base font-bold text-[#1E1B4B]">
                Son Ses Kayıtlarım ve Analiz Geçmişi
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-mono tabular-nums">
              {history.length} kayıt
            </span>
          </div>

          <div className="divide-y divide-[#EAE6DF]">
            {history.map((item) => (
              <div
                key={item.id}
                className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1E1B4B] truncate">
                    "{item.targetSentence}"
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-mono tabular-nums">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.timestamp}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#059669] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Doğruluk %{item.accuracyScore}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Akıcılık %{item.fluencyScore}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.durationSeconds.toFixed(1)} sn</span>
                    {item.intonationLabel && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-sans">{item.intonationLabel}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.audioUrl && (
                    <button
                      type="button"
                      onClick={() => handleToggleHistoryAudio(item)}
                      className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E2DDD5] hover:border-[#1E1B4B] text-[#1E1B4B] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                    >
                      {playingHistoryId === item.id ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Durdur</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Kaydı Dinle</span>
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSentence(item.targetSentence);
                      setActiveCategory('Tekrar Çalışması');
                    }}
                    className="px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
                  >
                    Tekrar Dene
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
