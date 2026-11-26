import React from 'react';
import { PracticeHistoryItem, PronunciationEvaluation } from '../types';
import { stopTurkishSpeech } from '../utils/speech';
import { VoiceAnalysisPanel } from './VoiceAnalysisPanel';
import { X, Mic } from 'lucide-react';

interface PronunciationStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSentence: string;
  contextTitle?: string;
  onSaveResult?: (result: {
    evaluation: PronunciationEvaluation;
    historyItem: PracticeHistoryItem;
  }) => void;
}

export const PronunciationStudioModal: React.FC<PronunciationStudioModalProps> = ({
  isOpen,
  onClose,
  targetSentence,
  contextTitle = 'Hedef Cümle Pratiği',
  onSaveResult,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    stopTurkishSpeech();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/50 backdrop-blur-xs">
      <div
        className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-dialog-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#F2EFE9] border-b border-[#E2DDD5] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-[#059669]" />
            <h2 id="studio-dialog-title" className="text-sm font-bold text-[#1E1B4B]">
              Öğrenci Ses Kayıt & Telaffuz Analiz Stüdyosu
            </h2>
            <span className="text-xs text-stone-400" aria-hidden="true">
              ·
            </span>
            <span className="text-xs text-stone-600 hidden sm:inline truncate max-w-[260px]">
              {contextTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Embedded Voice Analysis Panel */}
        <div className="p-5 sm:p-6 flex-1">
          <VoiceAnalysisPanel
            targetSentence={targetSentence}
            contextTitle={contextTitle}
            onSaveResult={onSaveResult}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F2EFE9] border-t border-[#E2DDD5] flex items-center justify-end sticky bottom-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-[#1E1B4B] hover:bg-[#312E81] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
