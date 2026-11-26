import React, { useState, useMemo } from 'react';
import {
  ActivityType,
  DialogueLevel,
  StudentActivityRecord,
  StudentProfile,
} from '../types';
import { DICTION_CURRICULUM } from '../data/dictionCurriculum';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  Activity,
  CheckCircle2,
  Mic,
  Edit3,
  Save,
  X,
  LogOut,
  ArrowUpDown,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface StudentProgressProfileProps {
  profile: StudentProfile;
  activities: StudentActivityRecord[];
  isOwnProfile: boolean;
  isLoadingActivities?: boolean;
  onUpdateProfile?: (displayName: string, targetLevel: DialogueLevel) => Promise<void>;
  onLogout?: () => void;
  onStartPractice?: () => void;
}

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  dialogue: 'Diyalog Pratiği',
  studio: 'Ses Analiz Stüdyosu',
  diction: 'Diksiyon Kuralı',
  twister: 'Tekerleme',
  word: 'Kelime Çalışması',
};

function formatDateTime(ms?: number, isoFallback?: string): string {
  const date = ms ? new Date(ms) : isoFallback ? new Date(isoFallback) : null;
  if (!date || Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDurationMinutes(totalSeconds: number): string {
  if (totalSeconds < 60) return `${Math.round(totalSeconds)} sn`;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.round(totalSeconds % 60);
  return `${mins} dk ${secs} sn`;
}

export const StudentProgressProfile: React.FC<StudentProgressProfileProps> = ({
  profile,
  activities,
  isOwnProfile,
  isLoadingActivities = false,
  onUpdateProfile,
  onLogout,
  onStartPractice,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.displayName);
  const [editLevel, setEditLevel] = useState<DialogueLevel>(profile.targetLevel);
  const [isSaving, setIsSaving] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  // Activities sorted chronologically (#1 -> latest)
  const chronological = useMemo(() => {
    return [...activities].sort(
      (a, b) => a.attemptNumber - b.attemptNumber || (a.createdAtMs || 0) - (b.createdAtMs || 0)
    );
  }, [activities]);

  const displayedTimeline = useMemo(() => {
    return sortOrder === 'asc' ? chronological : [...chronological].reverse();
  }, [chronological, sortOrder]);

  // First vs Latest & Relative Growth Percentage
  const firstActivity = chronological[0] || null;
  const latestActivity = chronological[chronological.length - 1] || null;
  const firstScore = firstActivity ? firstActivity.accuracyScore : profile.firstScore;
  const latestScore = latestActivity ? latestActivity.accuracyScore : profile.latestScore;
  const pointDelta = chronological.length > 0 ? latestScore - firstScore : profile.growthDelta;
  const relativeGrowthPercent =
    firstScore > 0
      ? Math.round(((latestScore - firstScore) / firstScore) * 100)
      : latestScore > 0
      ? 100
      : 0;

  // Fluency growth
  const firstFluency = firstActivity ? firstActivity.fluencyScore : 0;
  const latestFluency = latestActivity ? latestActivity.fluencyScore : 0;
  const fluencyDelta = chronological.length > 0 ? latestFluency - firstFluency : 0;

  // Category Breakdown
  const categoryStats = useMemo(() => {
    const map = new Map<ActivityType, { count: number; totalAcc: number; firstAcc: number; lastAcc: number }>();
    for (const act of chronological) {
      const existing = map.get(act.activityType);
      if (!existing) {
        map.set(act.activityType, {
          count: 1,
          totalAcc: act.accuracyScore,
          firstAcc: act.accuracyScore,
          lastAcc: act.accuracyScore,
        });
      } else {
        existing.count += 1;
        existing.totalAcc += act.accuracyScore;
        existing.lastAcc = act.accuracyScore;
      }
    }
    return Array.from(map.entries()).map(([type, data]) => ({
      type,
      label: ACTIVITY_TYPE_LABELS[type],
      count: data.count,
      avgAccuracy: Math.round(data.totalAcc / data.count),
      delta: data.lastAcc - data.firstAcc,
    }));
  }, [chronological]);

  // Phoneme focus summary
  const phonemeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const act of chronological) {
      for (const p of act.problemPhonemes || []) {
        counts[p] = (counts[p] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [chronological]);

  // SVG Chart Geometry
  const chartWidth = 680;
  const chartHeight = 220;
  const padLeft = 36;
  const padRight = 20;
  const padTop = 18;
  const padBottom = 30;
  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const chartPoints = useMemo(() => {
    if (chronological.length === 0) return [];
    return chronological.map((act, idx) => {
      const x =
        chronological.length === 1
          ? padLeft + innerW / 2
          : padLeft + (idx / (chronological.length - 1)) * innerW;
      const yAcc = padTop + innerH - (Math.max(0, Math.min(100, act.accuracyScore)) / 100) * innerH;
      const yFlu = padTop + innerH - (Math.max(0, Math.min(100, act.fluencyScore)) / 100) * innerH;
      return { act, x, yAcc, yFlu };
    });
  }, [chronological, innerH, innerW]);

  const accPolyline = chartPoints.map((p) => `${p.x},${p.yAcc}`).join(' ');
  const fluPolyline = chartPoints.map((p) => `${p.x},${p.yFlu}`).join(' ');
  const accAreaPath =
    chartPoints.length > 1
      ? `M ${chartPoints[0].x},${padTop + innerH} L ${chartPoints
          .map((p) => `${p.x},${p.yAcc}`)
          .join(' L ')} L ${chartPoints[chartPoints.length - 1].x},${padTop + innerH} Z`
      : '';

  const selectedPoint =
    chartPoints.find((p) => p.act.activityId === selectedActivityId) ||
    chartPoints[chartPoints.length - 1] ||
    null;

  const handleSaveEdit = async () => {
    if (!onUpdateProfile || !editName.trim()) return;
    setIsSaving(true);
    try {
      await onUpdateProfile(editName.trim(), editLevel);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Profile Header Card */}
      <div className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1E1B4B] text-white font-extrabold text-xl flex items-center justify-center shrink-0">
            {(profile.displayName || profile.username).charAt(0).toUpperCase()}
          </div>

          {!isEditing ? (
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span className="font-mono font-semibold text-[#059669]">@{profile.username}</span>
                <span aria-hidden="true">·</span>
                <span>Hedef Seviye: {profile.targetLevel}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono font-semibold text-[#1E1B4B]">
                  Diksiyon Seviyesi: {profile.completedLevelIds?.length ?? 0}/{DICTION_CURRICULUM.length}
                </span>
                {profile.firstActivityAt && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>İlk Etkinlik: {formatDateTime(undefined, profile.firstActivityAt)}</span>
                  </>
                )}
              </div>
              <h2 className="text-2xl font-extrabold text-[#1E1B4B] tracking-tight">
                {profile.displayName}
              </h2>
              <p className="text-xs text-stone-600">
                İlk etkinlikten itibaren tüm telaffuz, akıcılık ve diksiyon gelişim profili
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 flex-1">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  maxLength={80}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg text-sm font-semibold text-[#1E1B4B] focus:outline-none focus:border-[#059669]"
                  placeholder="Ad Soyad"
                />
                <select
                  value={editLevel}
                  onChange={(e) => setEditLevel(e.target.value as DialogueLevel)}
                  className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg text-sm font-semibold text-[#1E1B4B] focus:outline-none focus:border-[#059669]"
                >
                  <option value="A1">Seviye A1</option>
                  <option value="A2">Seviye A2</option>
                  <option value="B1">Seviye B1</option>
                  <option value="B2">Seviye B2</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSaving || !editName.trim()}
                  className="px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditName(profile.displayName);
                    setEditLevel(profile.targetLevel);
                    setIsEditing(false);
                  }}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>İptal</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {isOwnProfile && !isEditing && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setEditName(profile.displayName);
                setEditLevel(profile.targetLevel);
                setIsEditing(true);
              }}
              className="px-3.5 py-2 bg-[#FAF8F5] border border-[#E2DDD5] hover:border-stone-400 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Profili Düzenle</span>
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-3.5 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Çıkış Yap</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4 Growth KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: First to Latest Growth */}
        <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>İlk Etkinlikten Gelişim</span>
            {pointDelta >= 0 ? (
              <TrendingUp className="w-4 h-4 text-[#059669]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-[#1E1B4B]">
            {chronological.length > 0 ? (
              <span className={pointDelta >= 0 ? 'text-[#059669]' : 'text-amber-700'}>
                {pointDelta >= 0 ? `+${pointDelta}` : pointDelta} puan
              </span>
            ) : (
              '—'
            )}
          </div>
          <p className="text-xs text-stone-600 font-mono tabular-nums">
            {chronological.length > 0
              ? `İlk %${firstScore} → Son %${latestScore} (${
                  relativeGrowthPercent >= 0 ? `+${relativeGrowthPercent}%` : `${relativeGrowthPercent}%`
                })`
              : 'Henüz etkinlik yapılmadı'}
          </p>
        </div>

        {/* KPI 2: Average & Best Accuracy */}
        <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Ortalama Telaffuz</span>
            <Award className="w-4 h-4 text-[#4338CA]" />
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-[#1E1B4B]">
            %{profile.averageAccuracy}
          </div>
          <p className="text-xs text-stone-600 font-mono tabular-nums">
            En Yüksek Skor: %{profile.bestScore}
          </p>
        </div>

        {/* KPI 3: Average Fluency */}
        <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Ortalama Akıcılık</span>
            <Activity className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-[#1E1B4B]">
            %{profile.averageFluency}
          </div>
          <p className="text-xs text-stone-600 font-mono tabular-nums">
            {chronological.length > 1
              ? `Akıcılık Değişimi: ${fluencyDelta >= 0 ? `+${fluencyDelta}` : fluencyDelta} puan`
              : `Toplam Süre: ${formatDurationMinutes(profile.totalPracticeSeconds)}`}
          </p>
        </div>

        {/* KPI 4: Total Activities & Perfect Words */}
        <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Tamamlanan Etkinlik</span>
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-[#1E1B4B]">
            {profile.totalAttempts}
          </div>
          <p className="text-xs text-stone-600 font-mono tabular-nums">
            {profile.perfectWordsCount} tam doğru kelime
          </p>
        </div>
      </div>

      {/* Empty State if no activities yet */}
      {!isLoadingActivities && chronological.length === 0 ? (
        <div className="bg-white border border-[#E2DDD5] rounded-2xl p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto">
            <Mic className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-[#1E1B4B]">
              İlk Etkinliğinizi Tamamlayın
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {isOwnProfile
                ? 'Herhangi bir diksiyon seviyesi değerlendirmesi, tekerleme veya ses analizi tamamladığınızda ilk etkinliğinizden itibaren gelişim grafiğiniz burada otomatik olarak oluşacaktır.'
                : 'Bu öğrenci henüz sesli bir etkinlik tamamlamamış.'}
            </p>
          </div>
          {isOwnProfile && onStartPractice && (
            <button
              type="button"
              onClick={onStartPractice}
              className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-semibold rounded-xl text-sm inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Mic className="w-4 h-4" />
              <span>Diksiyon Seviyelerine Başla</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Interactive First-to-Latest SVG Progress Chart */}
          <div className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-[#1E1B4B]">
                  İlk Etkinlikten Bugüne Gelişim Grafiği
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Etkinlik #1 başlangıç çizgisiyle kıyaslayarak telaffuz ve akıcılık artışınızı inceleyin
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-stone-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-0.5 bg-[#059669] inline-block" /> Telaffuz Doğruluğu
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-0.5 bg-[#4338CA] inline-block" /> Akıcılık
                </span>
              </div>
            </div>

            {isLoadingActivities ? (
              <div className="h-56 flex items-center justify-center text-xs text-stone-500">
                Gelişim verileri yükleniyor...
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full min-w-[460px] h-56"
                  role="img"
                  aria-label="İlk etkinlikten son etkinliğe telaffuz ve akıcılık gelişim grafiği"
                >
                  <defs>
                    <linearGradient id="emeraldGrowthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid Lines (0, 25, 50, 75, 100) */}
                  {[0, 25, 50, 75, 100].map((val) => {
                    const y = padTop + innerH - (val / 100) * innerH;
                    return (
                      <g key={val}>
                        <line
                          x1={padLeft}
                          y1={y}
                          x2={chartWidth - padRight}
                          y2={y}
                          stroke="#E8E4DC"
                          strokeWidth="1"
                        />
                        <text
                          x={padLeft - 8}
                          y={y + 4}
                          textAnchor="end"
                          className="fill-stone-400 text-[10px] font-mono"
                        >
                          {val}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Attempt #1 Baseline Reference Line */}
                  {chartPoints.length > 0 && (
                    <line
                      x1={padLeft}
                      y1={chartPoints[0].yAcc}
                      x2={chartWidth - padRight}
                      y2={chartPoints[0].yAcc}
                      stroke="#D97706"
                      strokeDasharray="4 4"
                      strokeWidth="1.2"
                      opacity="0.7"
                    />
                  )}

                  {/* Accuracy Area Fill */}
                  {accAreaPath && <path d={accAreaPath} fill="url(#emeraldGrowthFill)" />}

                  {/* Fluency Polyline */}
                  {chartPoints.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#4338CA"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={fluPolyline}
                    />
                  )}

                  {/* Accuracy Polyline */}
                  {chartPoints.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2.75"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={accPolyline}
                    />
                  )}

                  {/* Interactive Data Nodes */}
                  {chartPoints.map((pt, idx) => {
                    const isSelected = selectedPoint?.act.activityId === pt.act.activityId;
                    const showXLabel =
                      idx === 0 ||
                      idx === chartPoints.length - 1 ||
                      chartPoints.length <= 10 ||
                      idx % Math.ceil(chartPoints.length / 8) === 0;

                    return (
                      <g
                        key={pt.act.activityId}
                        onClick={() => setSelectedActivityId(pt.act.activityId)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.yFlu}
                          r={isSelected ? 4.5 : 3}
                          fill="#4338CA"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx={pt.x}
                          cy={pt.yAcc}
                          r={isSelected ? 6 : 4}
                          fill={idx === 0 ? '#D97706' : '#059669'}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        {showXLabel && (
                          <text
                            x={pt.x}
                            y={chartHeight - 8}
                            textAnchor="middle"
                            className="fill-stone-500 text-[10px] font-mono"
                          >
                            #{pt.act.attemptNumber}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}

            {/* Selected Activity Inspector Strip */}
            {selectedPoint && (
              <div className="p-4 bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-stone-500">
                    <span className="font-mono font-bold text-[#1E1B4B]">
                      Etkinlik #{selectedPoint.act.attemptNumber}
                      {selectedPoint.act.attemptNumber === 1 ? ' (İlk Etkinlik)' : ''}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{ACTIVITY_TYPE_LABELS[selectedPoint.act.activityType]}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDateTime(selectedPoint.act.createdAtMs)}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#1E1B4B] truncate">
                    "{selectedPoint.act.targetSentence}"
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono tabular-nums">
                  <div>
                    <span className="block text-[10px] text-stone-400">Doğruluk</span>
                    <span className="text-sm font-bold text-[#059669]">
                      %{selectedPoint.act.accuracyScore}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400">Akıcılık</span>
                    <span className="text-sm font-bold text-[#4338CA]">
                      %{selectedPoint.act.fluencyScore}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400">Hız</span>
                    <span className="text-sm font-bold text-stone-700">
                      {selectedPoint.act.wordsPerMinute} kel/dk
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category Performance + Problem Phonemes Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Activity Category Breakdown */}
            <div className="lg:col-span-7 bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1E1B4B]">
                <BookOpen className="w-4 h-4 text-[#059669]" />
                <span>Etkinlik Türüne Göre Gelişim Dağılımı</span>
              </div>

              <div className="space-y-3.5">
                {categoryStats.map((cat) => (
                  <div key={cat.type} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1E1B4B]">
                        {cat.label}{' '}
                        <span className="text-stone-400 font-normal font-mono">
                          ({cat.count} etkinlik)
                        </span>
                      </span>
                      <span className="font-mono tabular-nums font-semibold text-stone-700">
                        Ort. %{cat.avgAccuracy}
                        {cat.count > 1 && (
                          <span
                            className={`ml-2 ${
                              cat.delta >= 0 ? 'text-[#059669]' : 'text-amber-700'
                            }`}
                          >
                            ({cat.delta >= 0 ? `+${cat.delta}` : cat.delta} puan)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F0ECE4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#059669] rounded-full transition-all"
                        style={{ width: `${cat.avgAccuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phonemes Needing Focus */}
            <div className="lg:col-span-5 bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1E1B4B]">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Öncelikli Diksiyon Sesleri</span>
              </div>

              {phonemeCounts.length === 0 ? (
                <p className="text-xs text-stone-600 leading-relaxed bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EAE6DF]">
                  Harika! Kaydedilen etkinliklerde tekrarlayan belirgin bir Türkçe harf/ses hatası tespit edilmedi.
                </p>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs text-stone-500">
                    Tüm etkinliklerde en sık diksiyon uyarısı verilen Türkçe sesler:
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {phonemeCounts.map(([phoneme, count]) => (
                      <div
                        key={phoneme}
                        className="p-3 bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl flex items-center justify-between"
                      >
                        <span className="text-base font-extrabold font-mono text-[#1E1B4B]">
                          {phoneme.toLocaleUpperCase('tr-TR')} / {phoneme}
                        </span>
                        <span className="text-xs font-mono tabular-nums text-amber-800 font-semibold">
                          {count} kez
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full Chronological Activity History from Attempt #1 */}
          <div className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-[#1E1B4B]">
                  İlk Etkinlikten İtibaren Tüm Etkinlik Kayıtları
                </h3>
                <p className="text-xs text-stone-500">
                  Her denemenin başlangıç (#1) performansına göre gelişim farkı gösterilir
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E2DDD5] hover:border-stone-400 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto whitespace-nowrap"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>
                  {sortOrder === 'asc' ? 'İlk Etkinlikten Yeniye' : 'En Yeniden İlk Etkinliğe'}
                </span>
              </button>
            </div>

            <div className="divide-y divide-[#EAE6DF]">
              {displayedTimeline.map((act) => {
                const deltaVsFirst = act.accuracyScore - firstScore;
                const isFirst = act.attemptNumber === 1;

                return (
                  <div
                    key={act.activityId}
                    className="py-4 first:pt-1 last:pb-0 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                        <span className="font-mono font-bold text-[#1E1B4B]">
                          #{act.attemptNumber}
                        </span>
                        {isFirst && (
                          <span className="font-semibold text-amber-700">İlk Etkinlik</span>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-[#059669]">
                          {ACTIVITY_TYPE_LABELS[act.activityType]}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-[220px]">{act.contextTitle}</span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1 font-mono tabular-nums">
                          <Clock className="w-3 h-3" /> {formatDateTime(act.createdAtMs)}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-[#1E1B4B] leading-snug">
                        "{act.targetSentence}"
                      </p>

                      {act.spokenSentence && (
                        <p className="text-xs text-stone-500">
                          Algılanan: <span className="italic">"{act.spokenSentence}"</span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums shrink-0">
                      <div>
                        <span className="text-stone-400 block text-[10px] font-sans">Doğruluk</span>
                        <span className="font-bold text-[#1E1B4B]">%{act.accuracyScore}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px] font-sans">Akıcılık</span>
                        <span className="font-bold text-[#4338CA]">%{act.fluencyScore}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px] font-sans">İlk Denemeye Göre</span>
                        <span
                          className={`font-bold ${
                            isFirst
                              ? 'text-stone-500'
                              : deltaVsFirst > 0
                              ? 'text-[#059669]'
                              : deltaVsFirst < 0
                              ? 'text-rose-600'
                              : 'text-stone-600'
                          }`}
                        >
                          {isFirst
                            ? 'Başlangıç'
                            : deltaVsFirst > 0
                            ? `+${deltaVsFirst} puan`
                            : `${deltaVsFirst} puan`}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px] font-sans">Tonlama</span>
                        <span className="font-sans font-medium text-stone-700">
                          {act.intonationLabel || '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
