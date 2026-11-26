import React from 'react';
import { StudentProfile, UserStats } from '../types';
import { Mic, BookOpen, Sparkles, TrendingUp, Users, User } from 'lucide-react';

export type AppTab = 'dialogues' | 'studio' | 'guide' | 'twisters' | 'profile' | 'admin';

interface HeaderProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenFreePractice: () => void;
  stats: UserStats;
  profile: StudentProfile | null;
  isAdmin: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenFreePractice,
  stats,
  profile,
  isAdmin,
}) => {
  return (
    <header className="border-b border-[#EAE6DF] bg-[#FAF8F5]/95 backdrop-blur-md sticky top-0 z-30">
      {/* 3-Zone Top Bar Contract */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            type="button"
            onClick={() => onSelectTab('dialogues')}
            className="text-left font-extrabold text-xl sm:text-2xl tracking-tight text-[#1E1B4B] whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
          >
            Türkçe <span className="text-[#059669]">Diksiyon</span>
          </button>

          {/* Zone 2: 5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <button
              type="button"
              onClick={() => onSelectTab('dialogues')}
              className={`hover:text-[#1E1B4B] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                currentTab === 'dialogues'
                  ? 'border-[#059669] text-[#1E1B4B] font-semibold'
                  : 'border-transparent'
              }`}
            >
              Diyaloglar
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('studio')}
              className={`hover:text-[#1E1B4B] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                currentTab === 'studio'
                  ? 'border-[#059669] text-[#1E1B4B] font-semibold'
                  : 'border-transparent'
              }`}
            >
              Ses Analizi
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('guide')}
              className={`hover:text-[#1E1B4B] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                currentTab === 'guide'
                  ? 'border-[#059669] text-[#1E1B4B] font-semibold'
                  : 'border-transparent'
              }`}
            >
              Diksiyon
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('twisters')}
              className={`hover:text-[#1E1B4B] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                currentTab === 'twisters'
                  ? 'border-[#059669] text-[#1E1B4B] font-semibold'
                  : 'border-transparent'
              }`}
            >
              Tekerlemeler
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('profile')}
              className={`hover:text-[#1E1B4B] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                currentTab === 'profile'
                  ? 'border-[#059669] text-[#1E1B4B] font-semibold'
                  : 'border-transparent'
              }`}
            >
              Profilim
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
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
      <div className="md:hidden flex items-center justify-around border-t border-[#EAE6DF] px-2 py-2 bg-[#F5F2EC] overflow-x-auto gap-1">
        {(
          [
            { id: 'dialogues', label: 'Diyaloglar' },
            { id: 'studio', label: 'Ses Analizi' },
            { id: 'guide', label: 'Diksiyon' },
            { id: 'twisters', label: 'Tekerleme' },
            { id: 'profile', label: 'Profilim' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
              currentTab === item.id ? 'bg-[#059669] text-white' : 'text-stone-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Unboxed Student Progress & Account Strip */}
      <div className="border-t border-[#EAE6DF]/70 bg-[#F5F2EB] py-2 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs text-stone-600">
          <div className="flex items-center gap-2 sm:gap-3.5 flex-wrap">
            {profile && (
              <>
                <button
                  type="button"
                  onClick={() => onSelectTab('profile')}
                  className="flex items-center gap-1.5 font-semibold text-[#1E1B4B] hover:text-[#059669] transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#059669]" />
                  <span>{profile.displayName}</span>
                  <span className="font-mono text-stone-400 font-normal">@{profile.username}</span>
                </button>
                <span aria-hidden="true" className="text-stone-400">
                  ·
                </span>
              </>
            )}
            <span className="flex items-center gap-1 font-medium text-stone-800">
              <BookOpen className="w-3.5 h-3.5 text-[#059669]" />
              <span className="font-mono tabular-nums font-semibold">
                {stats.completedSentencesCount}
              </span>{' '}
              Etkinlik
            </span>
            <span aria-hidden="true" className="text-stone-400">
              ·
            </span>
            <span className="flex items-center gap-1 font-medium text-stone-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Ort. Başarı:{' '}
              <span className="font-mono tabular-nums font-semibold text-[#059669]">
                %{stats.averageAccuracy}
              </span>
            </span>
            <span aria-hidden="true" className="text-stone-400">
              ·
            </span>
            <span className="flex items-center gap-1 font-medium text-stone-800">
              <TrendingUp className="w-3.5 h-3.5 text-[#4338CA]" />
              Gelişim:{' '}
              <span
                className={`font-mono tabular-nums font-semibold ${
                  stats.growthDelta >= 0 ? 'text-[#059669]' : 'text-amber-700'
                }`}
              >
                {stats.completedSentencesCount > 0
                  ? stats.growthDelta >= 0
                    ? `+${stats.growthDelta} puan`
                    : `${stats.growthDelta} puan`
                  : '—'}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                type="button"
                onClick={() => onSelectTab('admin')}
                className={`flex items-center gap-1.5 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  currentTab === 'admin'
                    ? 'text-[#059669] underline'
                    : 'text-[#1E1B4B] hover:text-[#059669]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Öğrenci Takibi (Yönetici)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
