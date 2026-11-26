import { AcousticMetrics } from '../types';

export interface LiveAudioTelemetry {
  volumePercent: number; // 0 - 100
  currentPitchHz: number | null;
  isSpeaking: boolean;
}

/**
 * Simple autocorrelation pitch detector for human voice (75Hz - 420Hz).
 * Returns fundamental frequency in Hz or null if unvoiced/silence.
 */
function detectPitchHz(buffer: Float32Array, sampleRate: number): number | null {
  const size = buffer.length;
  let rms = 0;
  for (let i = 0; i < size; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / size);
  if (rms < 0.015) return null; // Silence threshold

  const minLag = Math.floor(sampleRate / 420); // ~420 Hz max
  const maxLag = Math.min(Math.floor(sampleRate / 75), Math.floor(size / 2)); // ~75 Hz min

  let bestOffset = -1;
  let bestCorrelation = 0;
  let lastCorrelation = 1;
  let foundGoodCorrelation = false;

  for (let offset = minLag; offset <= maxLag; offset++) {
    let correlation = 0;
    let normA = 0;
    let normB = 0;
    const limit = size - offset;

    for (let i = 0; i < limit; i++) {
      const a = buffer[i];
      const b = buffer[i + offset];
      correlation += a * b;
      normA += a * a;
      normB += b * b;
    }

    const denom = Math.sqrt(normA * normB);
    const normalized = denom > 0 ? correlation / denom : 0;

    if (normalized > 0.85 && normalized > lastCorrelation) {
      foundGoodCorrelation = true;
      if (normalized > bestCorrelation) {
        bestCorrelation = normalized;
        bestOffset = offset;
      }
    } else if (foundGoodCorrelation && normalized < 0.7) {
      break;
    }
    lastCorrelation = normalized;
  }

  if (bestCorrelation > 0.78 && bestOffset > 0) {
    const freq = sampleRate / bestOffset;
    if (freq >= 75 && freq <= 420) {
      return Math.round(freq);
    }
  }
  return null;
}

/**
 * Downsample raw amplitude history into fixed number of normalized bars (0..1)
 */
function buildWaveformSnapshot(samples: number[], barCount = 56): number[] {
  if (samples.length === 0) {
    return Array(barCount).fill(0.08);
  }
  const bars: number[] = [];
  const step = samples.length / barCount;
  for (let i = 0; i < barCount; i++) {
    const start = Math.floor(i * step);
    const end = Math.max(start + 1, Math.floor((i + 1) * step));
    let maxVal = 0;
    for (let j = start; j < end && j < samples.length; j++) {
      if (samples[j] > maxVal) maxVal = samples[j];
    }
    bars.push(Math.max(0.08, Math.min(1, maxVal)));
  }
  return bars;
}

function classifyIntonation(pitchSamples: number[]): {
  averagePitchHz: number | null;
  pitchRangeHz: number;
  intonationLabel: AcousticMetrics['intonationLabel'];
} {
  if (pitchSamples.length < 4) {
    return {
      averagePitchHz: null,
      pitchRangeHz: 0,
      intonationLabel: 'Ölçülemedi',
    };
  }

  const sorted = [...pitchSamples].sort((a, b) => a - b);
  // Trim top/bottom 10% outliers
  const trim = Math.floor(sorted.length * 0.1);
  const trimmed = sorted.slice(trim, Math.max(trim + 1, sorted.length - trim));

  const sum = trimmed.reduce((acc, v) => acc + v, 0);
  const avg = Math.round(sum / trimmed.length);
  const range = Math.round(trimmed[trimmed.length - 1] - trimmed[0]);

  let intonationLabel: AcousticMetrics['intonationLabel'] = 'Doğal Tonlama';
  if (range < 22) {
    intonationLabel = 'Durağan / Monoton';
  } else if (range <= 75) {
    intonationLabel = 'Doğal Tonlama';
  } else {
    intonationLabel = 'Canlı & Vurgulu';
  }

  return {
    averagePitchHz: avg,
    pitchRangeHz: range,
    intonationLabel,
  };
}

/**
 * Web Audio API & MediaRecorder Controller for real-time waveform visualization,
 * acoustic voice analysis, and speech audio playback.
 */
export class AudioRecorderVisualizer {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private animationFrameId: number | null = null;
  private canvas: HTMLCanvasElement | null = null;

  private recordedBlob: Blob | null = null;
  private recordedAudioUrl: string | null = null;

  // Acoustic telemetry accumulators
  private volumeSamples: number[] = [];
  private pitchSamples: number[] = [];
  private totalFrames = 0;
  private activeSpeechFrames = 0;
  private peakRms = 0;
  private onLiveTelemetry?: (telemetry: LiveAudioTelemetry) => void;
  private lastTelemetryTime = 0;

  public async startRecording(
    canvas: HTMLCanvasElement | null,
    options?: {
      onError?: (error: Error) => void;
      onLiveTelemetry?: (telemetry: LiveAudioTelemetry) => void;
    }
  ): Promise<boolean> {
    this.canvas = canvas;
    this.onLiveTelemetry = options?.onLiveTelemetry;
    this.audioChunks = [];
    this.volumeSamples = [];
    this.pitchSamples = [];
    this.totalFrames = 0;
    this.activeSpeechFrames = 0;
    this.peakRms = 0;
    this.lastTelemetryTime = 0;
    this.cleanUpRecordedUrl();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      options?.onError?.(
        new Error('Tarayıcınız mikrofon kaydını desteklemiyor veya güvenli bağlantı (HTTPS) gerekiyor.')
      );
      return false;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.78;
      source.connect(this.analyserNode);

      // Start MediaRecorder
      const mimeType =
        typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

      this.mediaRecorder = mimeType
        ? new MediaRecorder(this.mediaStream, { mimeType })
        : new MediaRecorder(this.mediaStream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
      this.drawAndAnalyzeLoop();
      return true;
    } catch (err) {
      console.error('Microphone access or AudioContext error:', err);
      if (options?.onError) {
        options.onError(err instanceof Error ? err : new Error(String(err)));
      }
      await this.stopRecording();
      return false;
    }
  }

  private drawAndAnalyzeLoop = () => {
    if (!this.analyserNode || !this.audioContext) return;

    const timeDomainFloat = new Float32Array(this.analyserNode.fftSize);
    this.analyserNode.getFloatTimeDomainData(timeDomainFloat);

    // Compute RMS loudness
    let sumSq = 0;
    for (let i = 0; i < timeDomainFloat.length; i++) {
      sumSq += timeDomainFloat[i] * timeDomainFloat[i];
    }
    const rms = Math.sqrt(sumSq / timeDomainFloat.length);
    if (rms > this.peakRms) this.peakRms = rms;

    // Normalize RMS for visual/percent scale (typical voice RMS ~ 0.02 - 0.25)
    const normalizedVol = Math.min(1, rms * 5.2);
    const volumePercent = Math.round(normalizedVol * 100);
    const isSpeaking = rms > 0.014;

    this.totalFrames++;
    this.volumeSamples.push(normalizedVol);
    if (isSpeaking) {
      this.activeSpeechFrames++;
    }

    // Detect pitch every 3rd frame to keep CPU light
    let currentPitchHz: number | null = null;
    if (isSpeaking && this.totalFrames % 3 === 0) {
      currentPitchHz = detectPitchHz(timeDomainFloat, this.audioContext.sampleRate);
      if (currentPitchHz !== null) {
        this.pitchSamples.push(currentPitchHz);
      }
    }

    // Throttle React state updates to ~15fps
    const now = performance.now();
    if (this.onLiveTelemetry && now - this.lastTelemetryTime > 65) {
      this.lastTelemetryTime = now;
      this.onLiveTelemetry({
        volumePercent,
        currentPitchHz,
        isSpeaking,
      });
    }

    // Draw Waveform + Spectrum on Canvas
    if (this.canvas) {
      const ctx = this.canvas.getContext('2d');
      if (ctx) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        ctx.clearRect(0, 0, width, height);

        // Soft warm canvas background
        const bgGrad = ctx.createLinearGradient(0, 0, width, 0);
        bgGrad.addColorStop(0, 'rgba(240, 253, 244, 0.45)');
        bgGrad.addColorStop(0.5, 'rgba(238, 242, 255, 0.55)');
        bgGrad.addColorStop(1, 'rgba(240, 253, 244, 0.45)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Subtle frequency bars behind waveform
        const freqData = new Uint8Array(this.analyserNode.frequencyBinCount);
        this.analyserNode.getByteFrequencyData(freqData);
        const barCount = 48;
        const barWidth = width / barCount;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
        for (let i = 0; i < barCount; i++) {
          const val = freqData[i * 3] / 255;
          const barH = val * height * 0.85;
          ctx.fillRect(i * barWidth + 1, height - barH, Math.max(2, barWidth - 3), barH);
        }

        // Center guide line
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Crisp live time-domain waveform
        ctx.lineWidth = 2.5;
        const lineGrad = ctx.createLinearGradient(0, 0, width, 0);
        lineGrad.addColorStop(0, '#059669');
        lineGrad.addColorStop(0.5, '#4338CA');
        lineGrad.addColorStop(1, '#059669');
        ctx.strokeStyle = lineGrad;
        ctx.beginPath();

        const step = Math.max(1, Math.floor(timeDomainFloat.length / 220));
        const sliceWidth = width / (timeDomainFloat.length / step);
        let x = 0;

        for (let i = 0; i < timeDomainFloat.length; i += step) {
          const y = height / 2 + timeDomainFloat[i] * (height * 0.95);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
      }
    }

    this.animationFrameId = requestAnimationFrame(this.drawAndAnalyzeLoop);
  };

  private computeAcousticMetrics(): AcousticMetrics {
    const activeVols = this.volumeSamples.filter((v) => v > 0.06);
    const avgNorm =
      activeVols.length > 0
        ? activeVols.reduce((a, b) => a + b, 0) / activeVols.length
        : this.volumeSamples.length > 0
        ? this.volumeSamples.reduce((a, b) => a + b, 0) / this.volumeSamples.length
        : 0;

    const averageVolumePercent = Math.round(Math.min(100, avgNorm * 100));
    const peakVolumePercent = Math.round(Math.min(100, this.peakRms * 5.2 * 100));
    const avgRms = avgNorm / 5.2;
    const averageDb = avgRms > 0.0001 ? Math.max(-60, Math.round(20 * Math.log10(avgRms))) : -60;

    const speechActivityRatio =
      this.totalFrames > 0 ? Math.round((this.activeSpeechFrames / this.totalFrames) * 100) : 0;

    const { averagePitchHz, pitchRangeHz, intonationLabel } = classifyIntonation(this.pitchSamples);
    const waveformSnapshot = buildWaveformSnapshot(this.volumeSamples, 56);

    return {
      averageVolumePercent,
      peakVolumePercent,
      averageDb,
      averagePitchHz,
      pitchRangeHz,
      intonationLabel,
      speechActivityRatio,
      waveformSnapshot,
    };
  }

  public async stopRecording(): Promise<{
    blob: Blob | null;
    audioUrl: string | null;
    acousticMetrics: AcousticMetrics;
  }> {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const acousticMetrics = this.computeAcousticMetrics();

    return new Promise((resolve) => {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          const mime = this.mediaRecorder?.mimeType || 'audio/webm';
          this.recordedBlob = new Blob(this.audioChunks, { type: mime });
          this.recordedAudioUrl = URL.createObjectURL(this.recordedBlob);
          this.cleanupTracks();
          resolve({
            blob: this.recordedBlob,
            audioUrl: this.recordedAudioUrl,
            acousticMetrics,
          });
        };
        this.mediaRecorder.stop();
      } else {
        this.cleanupTracks();
        resolve({
          blob: this.recordedBlob,
          audioUrl: this.recordedAudioUrl,
          acousticMetrics,
        });
      }
    });
  }

  private cleanupTracks() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyserNode = null;
  }

  public cleanUpRecordedUrl() {
    if (this.recordedAudioUrl) {
      URL.revokeObjectURL(this.recordedAudioUrl);
      this.recordedAudioUrl = null;
    }
    this.recordedBlob = null;
  }
}

/**
 * Analyze an uploaded audio file (WAV, MP3, WebM, M4A) using Web Audio API decodeAudioData
 */
export async function analyzeUploadedAudioFile(file: File): Promise<{
  audioUrl: string;
  durationSeconds: number;
  acousticMetrics: AcousticMetrics;
}> {
  const audioUrl = URL.createObjectURL(file);
  const arrayBuffer = await file.arrayBuffer();

  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioContextClass();

  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const durationSeconds = Math.max(0.5, audioBuffer.duration);

    const frameSize = 2048;
    const volumeSamples: number[] = [];
    const pitchSamples: number[] = [];
    let activeFrames = 0;
    let totalFrames = 0;
    let peakRms = 0;

    for (let offset = 0; offset + frameSize <= channelData.length; offset += frameSize) {
      const slice = channelData.subarray(offset, offset + frameSize);
      let sumSq = 0;
      for (let i = 0; i < frameSize; i++) {
        sumSq += slice[i] * slice[i];
      }
      const rms = Math.sqrt(sumSq / frameSize);
      if (rms > peakRms) peakRms = rms;

      const normVol = Math.min(1, rms * 5.2);
      volumeSamples.push(normVol);
      totalFrames++;

      if (rms > 0.014) {
        activeFrames++;
        if (totalFrames % 2 === 0) {
          const pitch = detectPitchHz(slice, sampleRate);
          if (pitch !== null) pitchSamples.push(pitch);
        }
      }
    }

    const activeVols = volumeSamples.filter((v) => v > 0.06);
    const avgNorm =
      activeVols.length > 0
        ? activeVols.reduce((a, b) => a + b, 0) / activeVols.length
        : 0;
    const avgRms = avgNorm / 5.2;

    const { averagePitchHz, pitchRangeHz, intonationLabel } = classifyIntonation(pitchSamples);

    return {
      audioUrl,
      durationSeconds,
      acousticMetrics: {
        averageVolumePercent: Math.round(Math.min(100, avgNorm * 100)),
        peakVolumePercent: Math.round(Math.min(100, peakRms * 5.2 * 100)),
        averageDb: avgRms > 0.0001 ? Math.max(-60, Math.round(20 * Math.log10(avgRms))) : -60,
        averagePitchHz,
        pitchRangeHz,
        intonationLabel,
        speechActivityRatio: totalFrames > 0 ? Math.round((activeFrames / totalFrames) * 100) : 0,
        waveformSnapshot: buildWaveformSnapshot(volumeSamples, 56),
      },
    };
  } finally {
    ctx.close().catch(() => {});
  }
}
