import React, { useState, useMemo } from 'react';
import { DialogueLevel, StudentActivityRecord, StudentProfile } from '../types';
import { fetchStudentActivitiesForAdmin } from '../firebase';
import { StudentProgressProfile } from './StudentProgressProfile';
import {
  Users,
  Search,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Award,
} from 'lucide-react';

interface AdminStudentsDashboardProps {
  students: StudentProfile[];
}

export const AdminStudentsDashboard: React.FC<AdminStudentsDashboardProps> = ({ students }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<DialogueLevel | 'ALL'>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<StudentActivityRecord[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase('tr-TR');
    return students.filter((s) => {
      if (levelFilter !== 'ALL' && s.targetLevel !== levelFilter) return false;
      if (!q) return true;
      return (
        s.displayName.toLocaleLowerCase('tr-TR').includes(q) ||
        s.username.toLocaleLowerCase('tr-TR').includes(q)
      );
    });
  }, [students, searchQuery, levelFilter]);

  const classStats = useMemo(() => {
    const activeStudents = students.filter((s) => s.totalAttempts > 0);
    const totalAttempts = students.reduce((acc, s) => acc + (s.totalAttempts || 0), 0);
    const avgAccuracy =
      activeStudents.length > 0
        ? Math.round(
            activeStudents.reduce((acc, s) => acc + s.averageAccuracy, 0) / activeStudents.length
          )
        : 0;
    const avgGrowth =
      activeStudents.length > 0
        ? Math.round(
            activeStudents.reduce((acc, s) => acc + s.growthDelta, 0) / activeStudents.length
          )
        : 0;

    return {
      totalStudents: students.length,
      activeCount: activeStudents.length,
      totalAttempts,
      avgAccuracy,
      avgGrowth,
    };
  }, [students]);

  const handleInspectStudent = async (student: StudentProfile) => {
    setSelectedStudent(student);
    setSelectedActivities([]);
    setIsLoadingDetail(true);
    try {
      const list = await fetchStudentActivitiesForAdmin(student.uid);
      setSelectedActivities(list);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  if (selectedStudent) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setSelectedStudent(null);
              setSelectedActivities([]);
            }}
            className="px-3.5 py-2 bg-white border border-[#E2DDD5] hover:border-stone-400 text-[#1E1B4B] rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tüm Öğrencilere Dön</span>
          </button>
          <span className="text-xs text-stone-500">
            Öğretmen İnceleme Görünümü · @{selectedStudent.username}
          </span>
        </div>

        <StudentProgressProfile
          profile={selectedStudent}
          activities={selectedActivities}
          isOwnProfile={false}
          isLoadingActivities={isLoadingDetail}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#059669]">
          <Users className="w-4 h-4" />
          <span>Öğretmen & Yönetici Takip Paneli</span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#1E1B4B] tracking-tight">
          Tüm Öğrencilerin İlk Etkinlikten İtibaren Gelişimi
        </h2>
        <p className="text-sm text-stone-600 max-w-3xl leading-relaxed">
          Kayıtlı her öğrencinin ilk yaptığı etkinlikten son çalışmasına kadar olan gelişim
          oranlarını karşılaştırın ve herhangi bir öğrencinin üzerine tıklayarak tüm etkinlik
          geçmişini profil sayfasında inceleyin.
        </p>
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2DDD5] rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-xs text-stone-500 font-medium">Kayıtlı Öğrenci</span>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-[#1E1B4B]">
            {classStats.totalStudents}
          </div>
          <span className="text-xs text-stone-500 font-mono tabular-nums">
            {classStats.activeCount} aktif pratik yapan
          </span>
        </div>

        <div className="bg-white border border-[#E2DDD5] rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-xs text-stone-500 font-medium">Toplam Etkinlik</span>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-[#1E1B4B]">
            {classStats.totalAttempts}
          </div>
          <span className="text-xs text-stone-500">Kaydedilen ses analizi</span>
        </div>

        <div className="bg-white border border-[#E2DDD5] rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-xs text-stone-500 font-medium">Sınıf Ortalama Başarısı</span>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-[#059669]">
            %{classStats.avgAccuracy}
          </div>
          <span className="text-xs text-stone-500">Aktif öğrenciler ortalaması</span>
        </div>

        <div className="bg-white border border-[#E2DDD5] rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-xs text-stone-500 font-medium">Ortalama Gelişim</span>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-[#4338CA]">
            {classStats.avgGrowth >= 0 ? `+${classStats.avgGrowth}` : classStats.avgGrowth} puan
          </div>
          <span className="text-xs text-stone-500">İlk etkinlikten son denemeye</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Öğrenci adı veya kullanıcı adı ara..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E2DDD5] focus:border-[#059669] focus:outline-none rounded-xl text-sm text-stone-900"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#F0ECE4] rounded-xl self-start">
          {(['ALL', 'A1', 'A2', 'B1', 'B2'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                levelFilter === lvl
                  ? 'bg-white text-[#1E1B4B] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {lvl === 'ALL' ? 'Tüm Seviyeler' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Students Table / Cards */}
      <div className="bg-white border border-[#E2DDD5] rounded-2xl shadow-2xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-10 text-center text-sm text-stone-500">
            Aramanızla eşleşen öğrenci kaydı bulunamadı.
          </div>
        ) : (
          <div className="divide-y divide-[#EAE6DF]">
            {filteredStudents.map((student) => {
              const relGrowth =
                student.firstScore > 0
                  ? Math.round(((student.latestScore - student.firstScore) / student.firstScore) * 100)
                  : 0;

              return (
                <div
                  key={student.uid}
                  className="p-4 sm:p-5 hover:bg-[#FAF8F5] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#1E1B4B] text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {(student.displayName || student.username).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1E1B4B] truncate">
                        {student.displayName}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                        <span className="font-mono text-[#059669]">@{student.username}</span>
                        <span aria-hidden="true">·</span>
                        <span>Seviye {student.targetLevel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {student.totalAttempts} etkinlik
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-5 text-xs font-mono tabular-nums">
                    <div>
                      <span className="block text-[10px] text-stone-400 font-sans">
                        İlk → Son Skor
                      </span>
                      <span className="font-bold text-[#1E1B4B]">
                        {student.totalAttempts > 0
                          ? `%${student.firstScore} → %${student.latestScore}`
                          : 'Henüz yok'}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] text-stone-400 font-sans">
                        Gelişim Oranı
                      </span>
                      {student.totalAttempts > 0 ? (
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            student.growthDelta >= 0 ? 'text-[#059669]' : 'text-amber-700'
                          }`}
                        >
                          {student.growthDelta >= 0 ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                          )}
                          {student.growthDelta >= 0
                            ? `+${student.growthDelta}p`
                            : `${student.growthDelta}p`}
                          {student.firstScore > 0 && ` (${relGrowth >= 0 ? `+${relGrowth}%` : `${relGrowth}%`})`}
                        </span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </div>

                    <div>
                      <span className="block text-[10px] text-stone-400 font-sans">
                        Ort. Doğruluk
                      </span>
                      <span className="font-bold text-[#4338CA] flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />%{student.averageAccuracy}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInspectStudent(student)}
                      className="px-3.5 py-2 bg-[#1E1B4B] hover:bg-[#312E81] text-white font-sans font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                      <span>Profili & Gelişimi Gör</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
