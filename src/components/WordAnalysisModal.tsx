import React from 'react';
import { WordAnalysis } from '../types';
import { speakTurkishText } from '../utils/speech';
import { X, Volume2, Mic, Sparkles, BookOpen, Layers } from 'lucide-react';

interface WordAnalysisModalProps {
  wordData: WordAnalysis | null;
  onClose: () => void;
  onPracticeWord: (word: string) => void;
}

export const WordAnalysisModal: React.FC<WordAnalysisModalProps> = ({
  wordData,
  onClose,
  onPracticeWord,
}) => {
  if (!wordData) return null;

  const handleListen = () => {
    speakTurkishText(wordData.cleanWord, { rate: 0.85 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-2xl shadow-xl max-w-md w-full overflow-hidden transition-all transform scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="word-analysis-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#F2EFE9] border-b border-[#E2DDD5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#059669]">
              Kelime & Morfoloji Analizi
            </span>
            <span className="text-xs text-stone-400">·</span>
            <span className="text-xs text-stone-600 font-medium">Ek-Kök Ayrımı</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word Display Section */}
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 id="word-analysis-title" className="text-2xl font-bold text-[#1E1B4B]">
                {wordData.word}
              </h3>
              <p className="text-sm font-mono text-stone-500 mt-0.5">
                Heceleme: <span className="text-[#059669] font-medium">{wordData.syllables}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleListen}
                title="Kelimeyi Dinle (0.85x Yavaş)"
                className="p-2.5 bg-white border border-[#E2DDD5] hover:border-[#059669] text-[#059669] hover:bg-emerald-50/50 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
              >
                <Volume2 className="w-4 h-4" />
                <span>Dinle</span>
              </button>
            </div>
          </div>

          {/* Morphological Breakdown Table / Card */}
          <div className="bg-white border border-[#E8E4DC] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
              <span className="text-xs font-medium text-stone-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#059669]" /> Kök ve Sözcük Türü:
              </span>
              <span className="text-sm font-semibold text-[#1E1B4B]">
                {wordData.root} <span className="text-xs font-normal text-stone-500">({wordData.rootType})</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-stone-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" /> Ekler & İşlevleri:
              </span>
              {wordData.suffixes && wordData.suffixes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {wordData.suffixes.map((suffix, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-xs font-medium bg-[#F3F4F6] text-stone-800 rounded-md border border-stone-200"
                    >
                      {suffix}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500 italic">Yalın halde (ek almamış kök sözcük).</p>
              )}
            </div>
          </div>

          {/* Definitions */}
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-xs font-medium text-stone-500 block">Türkçe Anlamı:</span>
              <p className="text-stone-800 font-medium">{wordData.turkishMeaning}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-stone-500 block">İngilizce Karşılığı:</span>
              <p className="text-stone-600 italic">{wordData.englishMeaning}</p>
            </div>
          </div>

          {/* Diction & Stress Note */}
          {(wordData.phoneticTip || wordData.stressTip) && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Diksiyon & Vurgu İpucu</span>
              </div>
              {wordData.phoneticTip && (
                <p className="text-amber-800">{wordData.phoneticTip}</p>
              )}
              {wordData.stressTip && (
                <p className="text-amber-900 font-medium">📍 {wordData.stressTip}</p>
              )}
            </div>
          )}

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={() => {
                onPracticeWord(wordData.cleanWord);
                onClose();
              }}
              className="w-full py-2.5 px-4 bg-[#1E1B4B] hover:bg-[#312E81] text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Mic className="w-4 h-4 text-[#10B981]" />
              <span>Bu Kelimeyi Stüdyoda Telaffuz Et</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
