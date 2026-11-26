import React from 'react';
import { DICTION_RULES } from '../data/dialogues';
import { speakTurkishText } from '../utils/speech';
import { Volume2, Mic, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

interface DictionGuideProps {
  onPracticeSentence: (sentence: string, contextTitle: string) => void;
}

export const DictionGuide: React.FC<DictionGuideProps> = ({ onPracticeSentence }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#059669] uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Türkçe Fonetik & Diksiyon Rehberi</span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#1E1B4B] tracking-tight">
          Doğal ve Akıcı İstanbul Türkçesi Telaffuz Kuralları
        </h2>
        <p className="text-sm text-stone-600 max-w-3xl leading-relaxed">
          Türkçe yazıldığı gibi okunan bir dil olarak bilinse de, özellikle harflerin birbirine bağlanması (ulama),
          yumuşak g (ğ) geçişleri, noktasız ı ve kelime sonu ritmi diksiyonda büyük fark yaratır. Aşağıdaki kartları
          inceleyin, sesleri dinleyin ve doğrudan telaffuz stüdyosunda test edin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {DICTION_RULES.map((rule) => (
          <div
            key={rule.id}
            className="bg-white border border-[#E2DDD5] hover:border-stone-300 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-[#1E1B4B] font-extrabold text-sm flex items-center justify-center font-mono">
                  {rule.letter}
                </span>
                <span className="text-xs text-stone-500 font-medium">Fonetik Kural</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#1E1B4B]">{rule.title}</h3>
                <p className="text-xs text-stone-500 font-medium mt-0.5">{rule.summary}</p>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-stone-200/70">
                {rule.rule}
              </p>

              {/* Examples with TTS */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                  Örnek Telaffuzlar (Dinleyin):
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {rule.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200/60 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#1E1B4B]">{ex.written}</span>
                        <span className="text-stone-400 mx-1.5">→</span>
                        <span className="text-[#059669] font-medium font-mono">{ex.pronounced}</span>
                        <span className="text-stone-500 text-[11px] block sm:inline sm:ml-2">
                          ({ex.note})
                        </span>
                      </div>
                      <button
                        onClick={() => speakTurkishText(ex.written, { rate: 0.85 })}
                        title="Bu örneği dinle"
                        className="p-1 text-stone-500 hover:text-[#059669] hover:bg-stone-200/50 rounded transition-colors cursor-pointer shrink-0"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Exercise sentence button */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
              <div className="text-xs text-stone-600 truncate flex-1">
                <span className="font-semibold text-stone-800">Egzersiz:</span> "{rule.exerciseText}"
              </div>
              <button
                onClick={() => onPracticeSentence(rule.exerciseText, `Diksiyon Kuralı: ${rule.title}`)}
                className="px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Pratik Yap</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
