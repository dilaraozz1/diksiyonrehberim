import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Beklenmeyen bir hata oluştu.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('Uygulama hata sınırı yakaladı:', error);
  }

  render() {
    if (this.state.hasError) {
      let friendly = 'Veri bağlantısı veya yetkilendirme sırasında bir sorun oluştu.';
      if (this.state.message.includes('Quota exceeded')) {
        friendly = 'Günlük ücretsiz veritabanı okuma kotasına ulaşıldı. Kota ertesi gün yenilenir.';
      } else if (this.state.message.includes('permission')) {
        friendly = 'Bu işlem için yetki doğrulaması gerekiyor. Lütfen çıkış yapıp tekrar giriş yapın.';
      }

      return (
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2DDD5] rounded-2xl p-6 max-w-md w-full shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Bir Sorun Oluştu</span>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">{friendly}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#1E1B4B] hover:bg-[#312E81] text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sayfayı Yenile</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
