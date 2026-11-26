import React, { useState } from 'react';
import { DialogueLevel } from '../types';
import {
  FIREBASE_PROJECT_ID,
  isValidUsername,
  loginStudentWithUsername,
  loginWithGoogle,
  normalizeUsername,
  registerStudentWithUsername,
} from '../firebase';
import {
  Mic,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  TrendingUp,
  AudioWaveform,
  BookOpen,
} from 'lucide-react';

interface AuthGateProps {
  onAuthSuccess?: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [targetLevel, setTargetLevel] = useState<DialogueLevel>('A1');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [providerDisabledNotice, setProviderDisabledNotice] = useState(false);

  const mapAuthError = (err: unknown): string => {
    const code = (err as { code?: string })?.code || '';
    const msg = err instanceof Error ? err.message : String(err);

    if (code === 'auth/operation-not-allowed') {
      setProviderDisabledNotice(true);
      return 'Kullanıcı adı / şifre girişi için Firebase Konsolunda "E-posta/Şifre" oturum açma sağlayıcısının etkinleştirilmesi gerekiyor.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'Bu kullanıcı adı zaten kayıtlı. Lütfen farklı bir kullanıcı adı seçin veya giriş yapın.';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Kullanıcı adı veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.';
    }
    if (code === 'auth/weak-password') {
      return 'Şifreniz en az 6 karakter uzunluğunda olmalıdır.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Çok fazla başarısız deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google giriş penceresi kapatıldı.';
    }
    return msg || 'Giriş sırasında bir hata oluştu.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setProviderDisabledNotice(false);

    const cleanUser = normalizeUsername(username);
    if (!username.includes('@') && !isValidUsername(cleanUser)) {
      setErrorMessage(
        'Kullanıcı adı 3–32 karakter olmalı ve sadece harf, rakam, nokta, tire veya alt çizgi içermelidir.'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        if (!displayName.trim()) {
          setErrorMessage('Lütfen adınızı ve soyadınızı girin.');
          setIsSubmitting(false);
          return;
        }
        await registerStudentWithUsername({
          username: cleanUser,
          password,
          displayName: displayName.trim(),
          targetLevel,
        });
      } else {
        await loginStudentWithUsername(username.trim(), password);
      }
      onAuthSuccess?.();
    } catch (err) {
      setErrorMessage(mapAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setProviderDisabledNotice(false);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      onAuthSuccess?.();
    } catch (err) {
      setErrorMessage(mapAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewUsername = normalizeUsername(username);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Brand & Value Column */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-[#1E1B4B] text-white rounded-2xl p-7 sm:p-9 space-y-8">
          <div className="space-y-4">
            <div className="text-xl font-extrabold tracking-tight">
              Türkçe <span className="text-[#34D399]">Diksiyon</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-balance">
              Kişisel Telaffuz ve Gelişim Takibinizle Akıcı Türkçe Konuşun
            </h1>
            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              Kullanıcı adınız ve şifrenizle giriş yapın; ünlülerle başlayan aşamalı diksiyon
              seviyeleri, tekerlemeler ve ses analizleriniz ilk etkinliğinizden itibaren profilinizde
              kayıt altında tutulsun.
            </p>
          </div>

          <div className="space-y-4 border-t border-white/15 pt-6 text-sm">
            <div className="flex items-start gap-3">
              <AudioWaveform className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Canlı Ses & Tonlama Analizi</p>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Mikrofon kaydıyla kelime doğruluğu, konuşma hızı ve ses tonlaması anlık ölçülür.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">İlk Etkinlikten Bugüne Gelişim Grafiği</p>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Profil sayfanızda başlangıç skorunuzdan son denemenize kadar olan ilerleme oranınızı görün.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Ünlülerle Başlayan Seviyeli Diksiyon Yolu</p>
                <p className="text-xs text-indigo-200 mt-0.5">
                  A ünlüsünden başlayarak her seviye sonunda soru ve ses analiziyle yeni anahtarları açın, istediğiniz zaman tekrar edin.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Login / Registration Form Card */}
        <div className="lg:col-span-6 bg-white border border-[#E2DDD5] rounded-2xl p-6 sm:p-8 shadow-2xs flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Segmented Mode Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#F2EFE9] rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setProviderDisabledNotice(false);
                }}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'login'
                    ? 'bg-white text-[#1E1B4B] shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Öğrenci Girişi
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                  setProviderDisabledNotice(false);
                }}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'register'
                    ? 'bg-white text-[#1E1B4B] shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Yeni Öğrenci Kaydı
              </button>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-[#1E1B4B]">
                {mode === 'login' ? 'Hesabınıza Giriş Yapın' : 'Öğrenci Hesabı Oluşturun'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {mode === 'login'
                  ? 'Kullanıcı adınız ve şifrenizle oturum açarak gelişim profilinize ulaşın.'
                  : 'Kendinize bir kullanıcı adı ve şifre belirleyerek telaffuz yolculuğunuza başlayın.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="auth-displayname"
                    className="block text-xs font-semibold text-stone-700 mb-1.5"
                  >
                    Ad Soyad
                  </label>
                  <input
                    id="auth-displayname"
                    type="text"
                    required
                    maxLength={80}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Örn: Zeynep Kaya"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E2DDD5] focus:border-[#059669] focus:bg-white focus:outline-none rounded-xl text-sm text-stone-900"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-username"
                  className="block text-xs font-semibold text-stone-700 mb-1.5"
                >
                  Kullanıcı Adı
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-username"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Örn: zeynep_kaya"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#E2DDD5] focus:border-[#059669] focus:bg-white focus:outline-none rounded-xl text-sm text-stone-900"
                  />
                </div>
                {mode === 'register' && username.trim().length > 0 && (
                  <p className="text-[11px] text-stone-500 mt-1">
                    Giriş kullanıcı adınız:{' '}
                    <span className="font-mono font-semibold text-[#059669]">
                      @{previewUsername || '...'}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-semibold text-stone-700 mb-1.5"
                >
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FAF8F5] border border-[#E2DDD5] focus:border-[#059669] focus:bg-white focus:outline-none rounded-xl text-sm text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Hedef Türkçe Seviyeniz
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['A1', 'A2', 'B1', 'B2'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setTargetLevel(lvl)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          targetLevel === lvl
                            ? 'bg-[#1E1B4B] text-white border-[#1E1B4B]'
                            : 'bg-[#FAF8F5] text-stone-700 border-[#E2DDD5] hover:border-stone-400'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                  {providerDisabledNotice && (
                    <div className="pt-2 border-t border-rose-200/70 text-rose-900 space-y-1">
                      <p className="font-semibold">Nasıl Etkinleştirilir?</p>
                      <p>
                        Firebase Console &rarr; <strong>Authentication</strong> &rarr;{' '}
                        <strong>Sign-in method</strong> &rarr; <strong>Email/Password</strong>{' '}
                        seçeneğini etkinleştirin.
                      </p>
                      <a
                        href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/providers`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block underline font-semibold text-[#1E1B4B]"
                      >
                        Firebase Authentication Ayarlarını Aç
                      </a>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#059669] hover:bg-[#047857] disabled:bg-stone-300 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {mode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{isSubmitting ? 'Giriş Yapılıyor...' : 'Kullanıcı Adı ile Giriş Yap'}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{isSubmitting ? 'Hesap Oluşturuluyor...' : 'Öğrenci Kaydını Tamamla'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#EAE6DF]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2.5 bg-white text-stone-400">veya</span>
              </div>
            </div>

            {/* Google Sign-In (Teacher/Admin & Quick Student Login) */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#FAF8F5] hover:bg-[#F2EFE9] border border-[#E2DDD5] text-[#1E1B4B] font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-[#4338CA]" />
              <span>Google ile Giriş Yap (Öğretmen / Hızlı Giriş)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
