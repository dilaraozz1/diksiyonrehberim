import React, { useState, useEffect, useRef } from 'react';
import { AcousticMetrics, PracticeHistoryItem, PronunciationEvaluation } from '../types';
import { evaluatePronunciation, speakTurkishText, stopTurkishSpeech } from '../utils/speech';
import {
  AudioRecorderVisualizer,
  LiveAudioTelemetry,
  analyzeUploadedAudioFile,
} from '../utils/audioRecorder';
import {
  Mic,
  Square,
  Volume2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Upload,
  AudioWaveform,
  Clock,
  SlidersHorizontal,
  Edit3,
} from 'lucide-react';

interface VoiceAnalysisPanelProps {
  targetSentence: string;
  contextTitle?: string;
  compact?: boolean;
  onSaveResult?: (result: {
    evaluation: PronunciationEvaluation;
    historyItem: PracticeHistoryItem;
  }) => void;
}

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const VoiceAnalysisPanel: React.FC<VoiceAnalysisPanelProps> = ({
  targetSentence,
  contextTitle,
  compact = false,
  onSaveResult,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveTelemetry, setLiveTelemetry] = useState<LiveAudioTelemetry>({
    volumePercent: 0,
    currentPitchHz: null,
    isSpeaking: false,
  });

  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [manualTranscriptInput, setManualTranscriptInput] = useState('');
  const [showManualEdit, setShowManualEdit] = useState(false);

  const [evaluation, setEvaluation] = useState<PronunciationEvaluation | null>(null);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState<number>(0.9);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recorderRef = useRef<AudioRecorderVisualizer | null>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Refs to prevent stale closures during async recording callbacks
  const isRecordingRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);
  const finalTranscriptRef = useRef<string>('');
  const interimTranscriptRef = useRef<string>('');
  const lastAcousticRef = useRef<AcousticMetrics | undefined>(undefined);
  const lastDurationRef = useRef<number>(3);

  // Initialize Audio Visualizer once
  useEffect(() => {
    recorderRef.current = new AudioRecorderVisualizer();
    return () => {
      isRecordingRef.current = false;
      if (recorderRef.current) {
        recorderRef.current.stopRecording();
        recorderRef.current.cleanUpRecordedUrl();
      }
      stopTurkishSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Recording elapsed timer
  useEffect(() => {
    if (!isRecording) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((Date.now() - startTimeRef.current) / 1000);
    }, 200);
    return () => window.clearInterval(interval);
  }, [isRecording]);

  // Reset results when target sentence changes
  useEffect(() => {
    if (isRecordingRef.current) {
      stopRecordingSession();
    }
    setSpokenTranscript('');
    setInterimTranscript('');
    setManualTranscriptInput('');
    setShowManualEdit(false);
    setEvaluation(null);
    setSpeechError(null);
    setSpeechNotice(null);
    setElapsedSeconds(0);
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    lastAcousticRef.current = undefined;
    if (recorderRef.current) {
      recorderRef.current.cleanUpRecordedUrl();
    }
    setUserAudioUrl(null);
    setIsPlayingUserAudio(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSentence]);

  const handlePlayOriginal = () => {
    if (isPlayingOriginal) {
      stopTurkishSpeech();
      setIsPlayingOriginal(false);
      return;
    }
    setIsPlayingOriginal(true);
    speakTurkishText(targetSentence, {
      rate: ttsSpeed,
      onEnd: () => setIsPlayingOriginal(false),
      onError: () => setIsPlayingOriginal(false),
    });
  };

  const handleToggleUserAudio = () => {
    const player = audioPlayerRef.current;
    if (!player || !userAudioUrl) return;

    if (isPlayingUserAudio) {
      player.pause();
      setIsPlayingUserAudio(false);
    } else {
      stopTurkishSpeech();
      setIsPlayingOriginal(false);
      player.currentTime = 0;
      player
        .play()
        .then(() => setIsPlayingUserAudio(true))
        .catch(() => setIsPlayingUserAudio(false));
    }
  };

  const startRecordingSession = async () => {
    stopTurkishSpeech();
    setIsPlayingOriginal(false);
    setSpeechError(null);
    setSpeechNotice(null);
    setSpokenTranscript('');
    setInterimTranscript('');
    setManualTranscriptInput('');
    setShowManualEdit(false);
    setEvaluation(null);
    setElapsedSeconds(0);
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingUserAudio(false);
    }

    const micStarted = await recorderRef.current?.startRecording(canvasRef.current, {
      onError: (err) => {
        setSpeechError(
          `Mikrofon başlatılamadı: ${err.message}. Lütfen tarayıcı ayarlarından mikrofon izni verin veya "Ses Dosyası Yükle" seçeneğini kullanın.`
        );
      },
      onLiveTelemetry: (telemetry) => {
        setLiveTelemetry(telemetry);
      },
    });

    if (!micStarted) {
      return;
    }

    startTimeRef.current = Date.now();
    isRecordingRef.current = true;
    setIsRecording(true);

    // Setup Web Speech API (tr-TR)
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.lang = 'tr-TR';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          let newFinal = finalTranscriptRef.current;
          let currentInterim = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptPiece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              newFinal = (newFinal ? `${newFinal} ` : '') + transcriptPiece.trim();
            } else {
              currentInterim += transcriptPiece;
            }
          }

          finalTranscriptRef.current = newFinal;
          interimTranscriptRef.current = currentInterim.trim();
          setSpokenTranscript(newFinal);
          setInterimTranscript(currentInterim.trim());
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setSpeechNotice(
              'Tarayıcı konuşma-metin servisi kısıtlı. Sesiniz yine de kaydedilip akustik olarak analiz edilecek.'
            );
          } else if (event.error === 'network') {
            setSpeechNotice(
              'Canlı metin dönüştürme için ağ bağlantısı alınamadı. Akustik ses analizi devam ediyor.'
            );
          }
        };

        recognition.onend = () => {
          if (isRecordingRef.current) {
            try {
              recognition.start();
            } catch {
              // ignore restart error
            }
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch {
        setSpeechNotice(
          'Canlı konuşma tanıma başlatılamadı; sesiniz kaydedilip akustik olarak analiz edilecek.'
        );
      }
    } else {
      setSpeechNotice(
        'Bu tarayıcıda canlı Türkçe metin dönüştürme (Web Speech API) desteklenmiyor (Chrome/Edge önerilir). Sesiniz kaydedilip akustik olarak analiz edilecektir.'
      );
    }
  };

  const finalizeEvaluation = (
    spokenText: string,
    durationSec: number,
    acousticMetrics: AcousticMetrics | undefined,
    audioUrl: string | null
  ) => {
    const result = evaluatePronunciation(targetSentence, spokenText, durationSec, acousticMetrics);
    setEvaluation(result);
    setManualTranscriptInput(spokenText);

    if (!spokenText.trim()) {
      setShowManualEdit(true);
    }

    if (onSaveResult) {
      const historyItem: PracticeHistoryItem = {
        id: `rec-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        targetSentence,
        spokenSentence: spokenText,
        accuracyScore: result.accuracyScore,
        fluencyScore: result.fluencyScore,
        durationSeconds: durationSec,
        audioUrl,
        intonationLabel: acousticMetrics?.intonationLabel,
      };
      onSaveResult({ evaluation: result, historyItem });
    }
  };

  const stopRecordingSession = async () => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    setIsRecording(false);
    setIsAnalyzing(true);

    const durationSec = Math.max(0.8, (Date.now() - startTimeRef.current) / 1000);
    lastDurationRef.current = durationSec;

    // Stop Web Speech first and allow a brief flush for final words
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    // Stop Audio Recorder and capture acoustic metrics + audio URL
    let capturedUrl: string | null = null;
    let acousticMetrics: AcousticMetrics | undefined;

    if (recorderRef.current) {
      const stopped = await recorderRef.current.stopRecording();
      capturedUrl = stopped.audioUrl;
      acousticMetrics = stopped.acousticMetrics;
      lastAcousticRef.current = acousticMetrics;
      if (capturedUrl) {
        setUserAudioUrl(capturedUrl);
      }
    }

    // Short delay so Web Speech API delivers any trailing final transcript
    await new Promise((resolve) => setTimeout(resolve, 320));

    const combinedSpoken = [finalTranscriptRef.current, interimTranscriptRef.current]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    setSpokenTranscript(combinedSpoken);
    setInterimTranscript('');
    setIsAnalyzing(false);

    finalizeEvaluation(combinedSpoken, durationSec, acousticMetrics, capturedUrl);
  };

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSpeechError(null);
    setSpeechNotice(null);
    setIsAnalyzing(true);

    try {
      const analyzed = await analyzeUploadedAudioFile(file);
      setUserAudioUrl(analyzed.audioUrl);
      lastAcousticRef.current = analyzed.acousticMetrics;
      lastDurationRef.current = analyzed.durationSeconds;

      setSpeechNotice(
        `"${file.name}" ses dosyası akustik olarak analiz edildi. Kelime bazlı telaffuz karşılaştırması için aşağıya okuduğunuz metni yazıp güncelleyebilirsiniz.`
      );
      setShowManualEdit(true);
      finalizeEvaluation(
        manualTranscriptInput.trim(),
        analyzed.durationSeconds,
        analyzed.acousticMetrics,
        analyzed.audioUrl
      );
    } catch {
      setSpeechError(
        'Yüklenen ses dosyası çözümlenemedi. Lütfen geçerli bir WAV, MP3, WebM veya M4A dosyası seçin.'
      );
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualReevaluate = () => {
    const text = manualTranscriptInput.trim();
    setSpokenTranscript(text);
    finalizeEvaluation(text, lastDurationRef.current, lastAcousticRef.current, userAudioUrl);
    setShowManualEdit(false);
  };

  return (
    <div className="space-y-5">
      {/* Target Sentence & Model Playback Header */}
      {!compact && (
        <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
              <span className="font-semibold text-[#059669]">Hedef Cümle</span>
              {contextTitle && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{contextTitle}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <span>Dinleme Hızı:</span>
              {[0.75, 0.9, 1.0].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setTtsSpeed(rate)}
                  className={`px-2 py-0.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                    ttsSpeed === rate
                      ? 'bg-[#1E1B4B] text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          <p className="text-xl sm:text-2xl font-bold text-[#1E1B4B] leading-relaxed tracking-tight">
            {targetSentence}
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handlePlayOriginal}
              className="px-3.5 py-2 bg-[#FAF8F5] border border-[#D5CFE8] hover:border-[#4338CA] text-[#4338CA] hover:bg-indigo-50/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingOriginal ? 'Seslendirmeyi Durdur' : 'Örnek Telaffuzu Dinle'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Voice Capture & Live Waveform Recorder Card */}
      <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AudioWaveform className="w-4 h-4 text-[#059669]" />
            <h3 className="text-sm font-bold text-[#1E1B4B]">
              Öğrenci Ses Kayıt ve Canlı Akustik Analiz
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-stone-600">
            {isRecording && (
              <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                Kayıt Alınıyor
              </span>
            )}
            <span className="flex items-center gap-1 text-stone-500">
              <Clock className="w-3.5 h-3.5" />
              {formatTimer(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Live Waveform Canvas or Recorded Static Waveform */}
        <div className="relative w-full h-28 bg-[#FAF8F5] border border-[#E2DDD5] rounded-xl overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={720}
            height={112}
            className={`w-full h-full block ${!isRecording && evaluation?.acousticMetrics ? 'hidden' : ''}`}
          />

          {/* Static Recorded Waveform Envelope after recording */}
          {!isRecording && evaluation?.acousticMetrics && (
            <div className="w-full h-full px-4 py-3 flex items-center justify-between gap-[3px]">
              {evaluation.acousticMetrics.waveformSnapshot.map((bar, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-all"
                  style={{
                    height: `${Math.max(12, Math.round(bar * 88))}%`,
                    backgroundColor: bar > 0.65 ? '#4338CA' : bar > 0.25 ? '#059669' : '#CBD5E1',
                  }}
                />
              ))}
            </div>
          )}

          {!isRecording && !evaluation && !isAnalyzing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
              <p className="text-xs sm:text-sm font-medium text-stone-500">
                Mikrofon butonuna basıp cümleyi sesli okuyun
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Ses dalganız, tonlamanız ve telaffuz doğruluğunuz canlı analiz edilir
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="absolute inset-0 bg-[#FAF8F5]/85 flex items-center justify-center gap-2 text-xs font-semibold text-[#1E1B4B]">
              <RefreshCw className="w-4 h-4 animate-spin text-[#059669]" />
              <span>Sesiniz ve telaffuzunuz analiz ediliyor...</span>
            </div>
          )}
        </div>

        {/* Live Acoustic Telemetry Meter during recording */}
        {isRecording && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl p-3 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-stone-600">
                <span>Canlı Ses Şiddeti</span>
                <span className="font-mono tabular-nums font-semibold text-[#1E1B4B]">
                  %{liveTelemetry.volumePercent}
                </span>
              </div>
              <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-75 ${
                    liveTelemetry.volumePercent > 85
                      ? 'bg-amber-500'
                      : liveTelemetry.volumePercent > 15
                      ? 'bg-[#059669]'
                      : 'bg-stone-400'
                  }`}
                  style={{ width: `${liveTelemetry.volumePercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 text-stone-600">
              <div>
                <span className="text-stone-400 block text-[11px]">Ses Perdesi (Tonlama)</span>
                <span className="font-mono tabular-nums font-semibold text-[#4338CA]">
                  {liveTelemetry.currentPitchHz ? `${liveTelemetry.currentPitchHz} Hz` : 'Dinleniyor...'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Konuşma Algısı</span>
                <span
                  className={`font-semibold ${
                    liveTelemetry.isSpeaking ? 'text-[#059669]' : 'text-stone-400'
                  }`}
                >
                  {liveTelemetry.isSpeaking ? 'Ses Alınıyor' : 'Sessiz'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Live Speech-to-Text Preview */}
        {(isRecording || spokenTranscript || interimTranscript) && (
          <div className="p-3.5 bg-[#FAF8F5] border border-[#E2DDD5] rounded-xl text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-stone-500">
                Mikrofondan Algılanan Konuşmanız:
              </span>
              {!isRecording && evaluation && (
                <button
                  type="button"
                  onClick={() => setShowManualEdit(!showManualEdit)}
                  className="text-xs text-[#4338CA] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Metni Düzenle</span>
                </button>
              )}
            </div>
            <p className="text-[#1E1B4B] font-medium leading-relaxed">
              {spokenTranscript}
              {interimTranscript && (
                <span className="text-stone-400 italic">
                  {spokenTranscript ? ' ' : ''}
                  {interimTranscript}
                </span>
              )}
              {!spokenTranscript && !interimTranscript && (
                <span className="text-stone-400 font-normal">
                  {isRecording
                    ? 'Şimdi cümleyi net bir sesle okuyun...'
                    : 'Metin algılanamadı (aşağıdan manuel doğrulama yapabilirsiniz).'}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Error & Notice Banners */}
        {speechError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{speechError}</span>
          </div>
        )}

        {speechNotice && !speechError && (
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{speechNotice}</span>
          </div>
        )}

        {/* Manual Transcript Correction / Fallback Box (for Firefox/Safari or uploaded files) */}
        {showManualEdit && !isRecording && (
          <div className="p-3.5 bg-indigo-50/50 border border-indigo-200/80 rounded-xl space-y-2.5">
            <label className="block text-xs font-semibold text-[#1E1B4B]">
              Algılanan metin boşsa veya ses dosyası yüklediyseniz, okuduğunuz metni yazıp kelime analizini çalıştırın:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={manualTranscriptInput}
                onChange={(e) => setManualTranscriptInput(e.target.value)}
                placeholder="Söylediğiniz cümleyi yazın..."
                className="flex-1 px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:border-[#4338CA]"
              />
              <button
                type="button"
                onClick={handleManualReevaluate}
                disabled={!manualTranscriptInput.trim()}
                className="px-4 py-2 bg-[#4338CA] hover:bg-[#3730A3] disabled:bg-stone-300 text-white rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                Kelimeleri Yeniden Analiz Et
              </button>
            </div>
          </div>
        )}

        {/* Primary Recording + Playback + Upload Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <div className="flex flex-wrap items-center gap-2.5">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecordingSession}
                disabled={isAnalyzing}
                className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] active:bg-[#065F46] disabled:bg-stone-300 text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Mic className="w-4 h-4" />
                <span>{evaluation ? 'Tekrar Kaydet ve Analiz Et' : 'Sesimi Kaydet ve Analiz Et'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecordingSession}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Kaydı Bitir ve Analiz Et</span>
              </button>
            )}

            {/* Upload voice file option */}
            {!isRecording && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E2DDD5] hover:border-stone-400 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Upload className="w-4 h-4 text-stone-500" />
                  <span>Ses Dosyası Yükle</span>
                </button>
              </>
            )}
          </div>

          {/* Own Voice Playback Controls */}
          {userAudioUrl && !isRecording && (
            <div className="flex items-center gap-2">
              <audio
                ref={audioPlayerRef}
                src={userAudioUrl}
                onEnded={() => setIsPlayingUserAudio(false)}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleToggleUserAudio}
                className="px-3.5 py-2 bg-[#1E1B4B] hover:bg-[#312E81] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                {isPlayingUserAudio ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-white" />
                    <span>Duraklat</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Kendi Sesimi Dinle</span>
                  </>
                )}
              </button>

              {compact && (
                <button
                  type="button"
                  onClick={handlePlayOriginal}
                  className="px-3 py-2 bg-[#FAF8F5] border border-[#D5CFE8] hover:border-[#4338CA] text-[#4338CA] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Örnek Ses</span>
                </button>
              )}

              <button
                type="button"
                onClick={startRecordingSession}
                title="Yeni Kayıt Al"
                className="p-2 border border-[#E2DDD5] text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Analysis Report */}
      {evaluation && (
        <div className="space-y-4">
          {/* 4-Column Pronunciation + Acoustic Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Pronunciation Accuracy */}
            <div className="p-4 bg-white border border-[#E2DDD5] rounded-2xl shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>Telaffuz Doğruluğu</span>
                {evaluation.accuracyScore >= 85 ? (
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                ) : evaluation.accuracyScore >= 55 ? (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <div className="text-2xl font-extrabold text-[#1E1B4B] font-mono tabular-nums">
                %{evaluation.accuracyScore}
              </div>
              <p className="text-xs text-stone-600">
                {evaluation.accuracyScore >= 85
                  ? 'Başarılı telaffuz'
                  : evaluation.accuracyScore >= 55
                  ? 'Gelişmeye açık'
                  : evaluation.spokenSentence
                  ? 'Tekrar pratik önerilir'
                  : 'Metin algılanmadı'}
              </p>
            </div>

            {/* 2. Fluency & WPM Tempo */}
            <div className="p-4 bg-white border border-[#E2DDD5] rounded-2xl shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>Akıcılık & Tempo</span>
                <Activity className="w-4 h-4 text-[#4338CA]" />
              </div>
              <div className="text-2xl font-extrabold text-[#1E1B4B] font-mono tabular-nums">
                %{evaluation.fluencyScore}
              </div>
              <p className="text-xs text-stone-600 font-mono tabular-nums">
                {evaluation.wordsPerMinute} kel/dk · {evaluation.tempoLabel}
              </p>
            </div>

            {/* 3. Voice Volume & Speech Ratio */}
            <div className="p-4 bg-white border border-[#E2DDD5] rounded-2xl shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>Ses Şiddeti & Netlik</span>
                <Volume2 className="w-4 h-4 text-[#059669]" />
              </div>
              <div className="text-2xl font-extrabold text-[#1E1B4B] font-mono tabular-nums">
                {evaluation.acousticMetrics
                  ? `%${evaluation.acousticMetrics.averageVolumePercent}`
                  : '—'}
              </div>
              <p className="text-xs text-stone-600 font-mono tabular-nums">
                {evaluation.acousticMetrics
                  ? `${evaluation.acousticMetrics.averageDb} dB · Aktif %${evaluation.acousticMetrics.speechActivityRatio}`
                  : 'Mikrofon ölçümü yok'}
              </p>
            </div>

            {/* 4. Intonation & Pitch */}
            <div className="p-4 bg-white border border-[#E2DDD5] rounded-2xl shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>Tonlama & Perde</span>
                <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-[#1E1B4B] font-mono tabular-nums">
                {evaluation.acousticMetrics?.averagePitchHz
                  ? `${evaluation.acousticMetrics.averagePitchHz} Hz`
                  : '—'}
              </div>
              <p className="text-xs text-stone-600">
                {evaluation.acousticMetrics?.intonationLabel || 'Ölçülemedi'}
              </p>
            </div>
          </div>

          {/* Word-by-Word Pronunciation Breakdown */}
          <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#1E1B4B]">
                Kelime Bazlı Karşılaştırma (Dinlemek için kelimeye tıklayın)
              </span>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Doğru
                </span>
                <span className="flex items-center gap-1 text-amber-700 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> Yakın
                </span>
                <span className="flex items-center gap-1 text-rose-700 font-medium">
                  <XCircle className="w-3.5 h-3.5" /> Eksik / Yanlış
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE6DF] flex flex-wrap gap-2 items-center">
              {evaluation.words.map((item, idx) => {
                let styleClass = '';
                if (item.status === 'correct') {
                  styleClass =
                    'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100';
                } else if (item.status === 'near') {
                  styleClass = 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100';
                } else {
                  styleClass = 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => speakTurkishText(item.targetWord, { rate: 0.8 })}
                    className={`px-3 py-1.5 rounded-xl border text-sm sm:text-base font-semibold transition-colors cursor-pointer text-left ${styleClass}`}
                    title={`Doğrusunu dinlemek için tıklayın · Uyum: %${Math.round(
                      item.similarity * 100
                    )}`}
                  >
                    <span className="flex items-center gap-1.5">
                      {item.status === 'correct' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      {item.status === 'near' && (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                      {item.status === 'incorrect' && (
                        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      <span>{item.targetWord}</span>
                    </span>
                    {item.spokenWord && item.spokenWord !== item.targetWord && (
                      <span className="block text-[11px] font-normal opacity-80 mt-0.5">
                        Algılanan: {item.spokenWord}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Acoustic Feedback + Phoneme Diction Tips */}
          {(evaluation.acousticAdvice.length > 0 || evaluation.detectedDictionTips.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Acoustic Voice Observations */}
              {evaluation.acousticAdvice.length > 0 && (
                <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#1E1B4B]">
                    <Activity className="w-4 h-4 text-[#4338CA]" />
                    <span>Ses ve Tonlama Değerlendirmesi</span>
                  </div>
                  <ul className="space-y-2 text-xs text-stone-700 leading-relaxed">
                    {evaluation.acousticAdvice.map((tip, i) => (
                      <li key={i} className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EAE6DF]">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Phoneme-Specific Turkish Diction Tips */}
              {evaluation.detectedDictionTips.length > 0 && (
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Türkçe Diksiyon İpuçları</span>
                  </div>
                  <div className="space-y-2.5">
                    {evaluation.detectedDictionTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white/90 rounded-xl border border-amber-200/70 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-amber-950">
                          <span>{tip.title}</span>
                          <span className="font-mono text-amber-800">Harf: {tip.phoneme}</span>
                        </div>
                        <p className="text-stone-700 leading-relaxed">{tip.advice}</p>
                        {tip.exampleWords.length > 0 && (
                          <p className="text-[11px] text-amber-900">
                            Odak kelimeler:{' '}
                            <strong className="font-semibold">
                              {tip.exampleWords.join(', ')}
                            </strong>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
