import React, { useState } from 'react';
import { TONGUE_TWISTERS } from '../data/dialogues';
import { speakTurkishText } from '../utils/speech';
import { Volume2, Mic, Sparkles, Flame, Target } from 'lucide-react';

interface TekerlemelerViewProps {
  onPracticeSentence: (sentence: string, contextTitle: string) => void;
}

export const TekerlemelerView: React.FC<TekerlemelerViewProps> = ({ onPracticeSentence }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlayTwister = (id: string, text: string) => {
    setPlayingId(id);
    speakTurkishText(text, {
      rate: 0.9,
      onEnd: () => setPlayingId(null),
      onError: () => setPlayingId(null),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#059669] uppercase tracking-wider">
          <Target className="w-4 h-4" />
          <span>Diksiyon & Artikülasyon Antrenmanı</span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#1E1B4B] tracking-tight">
          Geleneksel Türkçe Diksiyon Tekerlemeleri
        </h2>
        <p className="text-sm text-stone-600 max-w-3xl leading-relaxed">
          Tekerlemeler, konuşma kaslarını (dil, dudak, damak ve çene) esneterek kekeleme, hece yutma
          ve monoton konuşmayı engeller. Önce yavaş sesle dinleyin, ardından mikrofona okuyarak telaffuz
          puanınızı yükseltin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {TONGUE_TWISTERS.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[#E2DDD5] hover:border-stone-300 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Hedef Ses: {item.targetSound}
                </span>
                <span className="text-stone-500 font-medium">
                  Zorluk: <strong className="text-stone-800">{item.difficulty}</strong>
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#1E1B4B]">{item.title}</h3>
                <p className="text-xs text-stone-500">{item.soundLabel}</p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-stone-200 text-stone-900 font-medium text-base sm:text-lg leading-relaxed">
                "{item.text}"
              </div>

              <p className="text-xs text-stone-600">
                <strong className="text-stone-800 font-semibold">Odak:</strong> {item.dictionFocus}
              </p>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
              <button
                onClick={() => handlePlayTwister(item.id, item.text)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Volume2 className={`w-3.5 h-3.5 ${playingId === item.id ? 'animate-pulse text-[#059669]' : ''}`} />
                <span>{playingId === item.id ? 'Seslendiriliyor...' : 'Dinle'}</span>
              </button>

              <button
                onClick={() => onPracticeSentence(item.text, `Tekerleme: ${item.title}`)}
                className="px-3.5 py-1.5 bg-[#1E1B4B] hover:bg-[#312E81] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Mic className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Telaffuz Et & Puan Al</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
