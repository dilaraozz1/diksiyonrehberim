import React from 'react';
import { UserStats } from '../types';
import { Mic, BookOpen, Sparkles, Volume2, Flame } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dialogues' | 'studio' | 'guide' | 'twisters';
  onSelectTab: (tab: 'dialogues' | 'studio' | 'guide' | 'twisters') => void;
  onOpenFreePractice: () => void;
  stats: UserStats;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenFreePractice,
  stats,
}) => {
  return (
    <header className="border-b border-[#EAE6DF] bg-[#FAF8F5]/90 backdrop-blur-md sticky top-0 z-30">
      {/* 3-Zone Top Bar Contract */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            onClick={() => onSelectTab('dialogues')}
            className="text-left font-extrabold text-xl sm:text-2xl tracking-tight text-[#1E1B4B] whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            Türkçe <span className="text-[#059669]">Diksiyon</span>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <button
              onClick={() => onSelectTab('dialogues')}
              className={`hover:text-[#1E1B4B] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                currentTab === 'dialogues'
                  ? 'border-[#059669] text-[#1E1B4B] font-semibold'
                  : 'border-transparent'
              }`}
            >
              Diyaloglar
            </button>
            <button
              onClick={() => onSelectTab('studio')}
              className={`hover:text-[#1E1B4B] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                currentTab === 'studio'
                  ? 'border-[#059669] text-[#1E1B4B] font-semibold'
                  : 'border-transparent'
              }`}
            >
              Ses Analiz Stüdyosu
            </button>
            <button
              onClick={() => onSelectTab('guide')}
              className={`hover:text-[#1E1B4B] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                currentTab === 'guide'
                  ? 'border-[#059669] text-[#1E1B4B] font-semibold'
                  : 'border-transparent'
              }`}
            >
              Diksiyon Kuralları
            </button>
            <button
              onClick={() => onSelectTab('twisters')}
              className={`hover:text-[#1E1B4B] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                currentTab === 'twisters'
                  ? 'border-[#059669] text-[#1E1B4B] font-semibold'
                  : 'border-transparent'
              }`}
            >
              Tekerlemeler
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenFreePractice}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#059669] hover:bg-[#047857] active:bg-[#065F46] rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Sesini Analiz Et</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav bar row for touch accessibility */}
      <div className="md:hidden flex items-center justify-around border-t border-[#EAE6DF] px-2 py-2 bg-[#F5F2EC]">
        <button
          onClick={() => onSelectTab('dialogues')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            currentTab === 'dialogues' ? 'bg-[#059669] text-white' : 'text-stone-700'
          }`}
        >
          Diyaloglar
        </button>
        <button
          onClick={() => onSelectTab('studio')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            currentTab === 'studio' ? 'bg-[#059669] text-white' : 'text-stone-700'
          }`}
        >
          Ses Analizi
        </button>
        <button
          onClick={() => onSelectTab('guide')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            currentTab === 'guide' ? 'bg-[#059669] text-white' : 'text-stone-700'
          }`}
        >
          Diksiyon
        </button>
        <button
          onClick={() => onSelectTab('twisters')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            currentTab === 'twisters' ? 'bg-[#059669] text-white' : 'text-stone-700'
          }`}
        >
          Tekerleme
        </button>
      </div>

      {/* Mini Stats Banner (Unboxed metadata with typographic separators) */}
      <div className="border-t border-[#EAE6DF]/70 bg-[#F5F2EB] py-2 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-y-2 text-xs text-stone-600">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-stone-800">
              <BookOpen className="w-3.5 h-3.5 text-[#059669]" />
              <span className="font-mono tabular-nums font-semibold">{stats.completedSentencesCount}</span> Cümle Pratiği
            </span>
            <span aria-hidden="true" className="text-stone-400">·</span>
            <span className="flex items-center gap-1 font-medium text-stone-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Ortalama Başarı: <span className="font-mono tabular-nums font-semibold text-[#059669]">%{stats.averageAccuracy}</span>
            </span>
            <span aria-hidden="true" className="text-stone-400">·</span>
            <span className="flex items-center gap-1 font-medium text-stone-800">
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-mono tabular-nums font-semibold">{stats.perfectWordsCount}</span> Tam Kelime
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Günlük Pratik Serisi:</span>
            <span className="font-mono tabular-nums font-bold text-stone-900">{stats.practiceStreakDays} Gün</span>
          </div>
        </div>
      </div>
    </header>
  );
};
