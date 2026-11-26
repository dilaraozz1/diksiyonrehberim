import { AcousticMetrics, PronunciationEvaluation, WordComparisonResult } from '../types';

/**
 * Normalizes Turkish text for accurate phonetic comparison:
 * - Converts to lowercase using Turkish locale rules ('tr-TR')
 * - Joins apostrophe suffixes cleanly (e.g., "Galata Kulesi'ne" -> "galata kulesine")
 * - Strips punctuation marks while preserving Turkish letters (ç, ğ, ı, ö, ş, ü)
 * - Normalizes multiple spaces
 */
export function normalizeTurkishText(text: string): string {
  if (!text) return '';
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/['’]/g, '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"“”«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates Levenshtein Distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix: number[][] = [];
  for (let i = 0; i <= an; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bn; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[an][bn];
}

/**
 * Computes string similarity between 0 and 1
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeTurkishText(str1);
  const s2 = normalizeTurkishText(str2);
  if (s1 === s2) return 1;
  if (!s1 || !s2) return 0;

  const maxLen = Math.max(s1.length, s2.length);
  const distance = levenshteinDistance(s1, s2);
  return Math.max(0, (maxLen - distance) / maxLen);
}

/**
 * Detects specific Turkish phonemes present in a word
 */
export function extractTurkishPhonemes(word: string): string[] {
  const lower = word.toLocaleLowerCase('tr-TR');
  const phonemes: string[] = [];
  if (lower.includes('ğ')) phonemes.push('ğ');
  if (lower.includes('ş')) phonemes.push('ş');
  if (lower.includes('ç')) phonemes.push('ç');
  if (lower.includes('ı')) phonemes.push('ı');
  if (lower.includes('ö')) phonemes.push('ö');
  if (lower.includes('ü')) phonemes.push('ü');
  if (lower.endsWith('r') || lower.includes('r')) phonemes.push('r');
  return phonemes;
}

/**
 * Specific Diction Guidance for troublesome Turkish sounds
 */
export const PHONEME_DICTION_ADVICE: Record<string, { title: string; advice: string }> = {
  'ğ': {
    title: 'Yumuşak G (Ğ) Telaffuz Kuralı',
    advice: 'Yumuşak g (ğ) harfini okumadan, kendinden önceki ünlüyü bir ses uzatarak okuyun (örn: "dağ" -> "daa", "öğrenci" -> "öörenci"). Kesinlikle gırtlaktan sert bir g sesi çıkarmayın.'
  },
  'ş': {
    title: 'Ş Harfi ve Diş-Dudak Uyumu',
    advice: 'Ş harfinde dil damağa hafifçe yaklaşır, dudaklar hafif öne uzatılır ve nefes düzgünce boşaltılır. Islık tonuna kaçmamaya dikkat edin.'
  },
  'ç': {
    title: 'Ç Harfinde Patlamalı Nefes',
    advice: 'Ç harfinde dil ucu üst ön dişlerin arkasındaki damağa önce basar, ardından hafif bir hava patlamasıyla serbest bırakılır.'
  },
  'ı': {
    title: 'Noktasız I Harfi Boğaz Tınısı',
    advice: 'Noktasız I harfinde dil geriye çekilir, dudaklar kesinlikle büzülmez, düz ve yayvan tutulur. İngilizce "i" veya "e"ye dönüştürmeyin.'
  },
  'ö': {
    title: 'Ön Yuvarlak Ünlü (Ö)',
    advice: 'Ö sesinde dudaklarınızı öne doğru yuvarlayarak daraltın. Ağzınızı yayvan bırakırsanız ses "O" veya "E"ye kayar.'
  },
  'ü': {
    title: 'Dar Yuvarlak Ünlü (Ü)',
    advice: 'Ü sesinde dudaklar sanki ıslık çalacakmış gibi büzülür ve ses dilin ön kısmından ince bir tonda çıkar.'
  },
  'r': {
    title: 'Kelime Sonu R Yumuşatması',
    advice: 'Türkçede kelime sonundaki R harfi hafifçe fısıltılı biter; İtalyanca veya İspanyolcadaki gibi çok sert ve defalarca titretilmez.'
  }
};

/**
 * Compare spoken transcript against target Turkish sentence and integrate acoustic metrics
 */
export function evaluatePronunciation(
  targetSentence: string,
  spokenSentence: string,
  durationSeconds: number = 3,
  acousticMetrics?: AcousticMetrics
): PronunciationEvaluation {
  const normTarget = normalizeTurkishText(targetSentence);
  const normSpoken = normalizeTurkishText(spokenSentence);

  const targetWords = normTarget ? normTarget.split(/\s+/) : [];
  const spokenWords = normSpoken ? normSpoken.split(/\s+/) : [];

  const wordResults: WordComparisonResult[] = [];
  const matchedSpokenIndices = new Set<number>();
  const detectedProblemPhonemes = new Set<string>();

  let totalSimScore = 0;

  for (let i = 0; i < targetWords.length; i++) {
    const tWord = targetWords[i];
    let bestSim = 0;
    let bestSpokenIdx = -1;

    // Search in a sliding window around the current index
    const searchStart = Math.max(0, i - 2);
    const searchEnd = Math.min(spokenWords.length, i + 3);

    for (let j = searchStart; j < searchEnd; j++) {
      if (matchedSpokenIndices.has(j)) continue;
      const sim = calculateSimilarity(tWord, spokenWords[j]);
      if (sim > bestSim) {
        bestSim = sim;
        bestSpokenIdx = j;
      }
    }

    // If no good match in window, search entire spoken sentence
    if (bestSim < 0.5) {
      for (let j = 0; j < spokenWords.length; j++) {
        if (matchedSpokenIndices.has(j)) continue;
        const sim = calculateSimilarity(tWord, spokenWords[j]);
        if (sim > bestSim) {
          bestSim = sim;
          bestSpokenIdx = j;
        }
      }
    }

    let status: 'correct' | 'near' | 'incorrect' = 'incorrect';
    if (bestSim >= 0.85) {
      status = 'correct';
      if (bestSpokenIdx !== -1) matchedSpokenIndices.add(bestSpokenIdx);
    } else if (bestSim >= 0.50) {
      status = 'near';
      if (bestSpokenIdx !== -1) matchedSpokenIndices.add(bestSpokenIdx);
    } else {
      status = 'incorrect';
    }

    const phonemes = extractTurkishPhonemes(tWord);
    if (status !== 'correct') {
      phonemes.forEach((p) => detectedProblemPhonemes.add(p));
    }

    totalSimScore += bestSim;

    wordResults.push({
      targetWord: tWord,
      spokenWord: bestSpokenIdx !== -1 ? spokenWords[bestSpokenIdx] : null,
      similarity: bestSim,
      status,
      phonemesInvolved: phonemes
    });
  }

  // Calculate overall accuracy (0 - 100%)
  const accuracyScore = targetWords.length > 0
    ? Math.round((totalSimScore / targetWords.length) * 100)
    : 0;

  // Words per minute calculation
  const safeDuration = Math.max(0.8, durationSeconds);
  const measuredWordCount = spokenWords.length > 0 ? spokenWords.length : targetWords.length;
  const wordsPerMinute = Math.round((measuredWordCount / safeDuration) * 60);

  let tempoLabel: PronunciationEvaluation['tempoLabel'] = 'İdeal Tempo';
  if (wordsPerMinute < 75) {
    tempoLabel = 'Çok Yavaş';
  } else if (wordsPerMinute <= 155) {
    tempoLabel = 'İdeal Tempo';
  } else if (wordsPerMinute <= 190) {
    tempoLabel = 'Biraz Hızlı';
  } else {
    tempoLabel = 'Çok Hızlı';
  }

  // Fluency calculation combining tempo, speech activity ratio, and word coverage
  const idealDuration = Math.max(1.5, targetWords.length * 0.52);
  const ratio = safeDuration / idealDuration;
  let tempoMultiplier = 1;
  if (ratio > 2.4) {
    tempoMultiplier = Math.max(0.6, 1 - (ratio - 2.4) * 0.15);
  } else if (ratio < 0.4 && targetWords.length > 2) {
    tempoMultiplier = 0.75;
  }

  const coverageRatio = targetWords.length > 0
    ? wordResults.filter(w => w.status !== 'incorrect').length / targetWords.length
    : 0;

  const acousticBonus = acousticMetrics && acousticMetrics.speechActivityRatio >= 45 ? 5 : 0;
  const fluencyScore = spokenWords.length > 0
    ? Math.min(100, Math.round(accuracyScore * 0.58 + coverageRatio * 37 * tempoMultiplier + acousticBonus))
    : acousticMetrics
    ? Math.min(100, Math.round(acousticMetrics.speechActivityRatio * 0.7 + (acousticMetrics.averageVolumePercent > 15 ? 25 : 5)))
    : 0;

  // Assemble detected diction tips
  const detectedDictionTips: PronunciationEvaluation['detectedDictionTips'] = [];
  detectedProblemPhonemes.forEach((phoneme) => {
    const adviceObj = PHONEME_DICTION_ADVICE[phoneme];
    if (adviceObj) {
      const exampleWords = wordResults
        .filter(w => w.status !== 'correct' && w.phonemesInvolved.includes(phoneme))
        .map(w => w.targetWord);

      detectedDictionTips.push({
        phoneme,
        title: adviceObj.title,
        advice: adviceObj.advice,
        exampleWords: Array.from(new Set(exampleWords)).slice(0, 3)
      });
    }
  });

  // Acoustic voice feedback
  const acousticAdvice: string[] = [];
  if (acousticMetrics) {
    if (acousticMetrics.averageVolumePercent < 18) {
      acousticAdvice.push('Ses seviyeniz biraz düşük algılandı. Mikrofona biraz daha yaklaşarak ve diyaframdan nefes alarak daha güçlü bir çıkış sağlayabilirsiniz.');
    } else if (acousticMetrics.peakVolumePercent >= 96) {
      acousticAdvice.push('Ses pik seviyeniz çok yüksek (patlama riski). Mikrofondan 10-15 cm uzaklaşmak daha berrak bir kayıt sağlar.');
    } else {
      acousticAdvice.push('Ses şiddetiniz ve mikrofon dengeniz oldukça ideal, kelimeler net duyuluyor.');
    }

    if (acousticMetrics.intonationLabel === 'Durağan / Monoton') {
      acousticAdvice.push('Tonlama aralığınız dar (monoton). Türkçe cümlelerde soru, duygu ve yüklem vurgularında ses perdesini hafifçe yükseltip alçaltmayı deneyin.');
    } else if (acousticMetrics.intonationLabel === 'Doğal Tonlama' || acousticMetrics.intonationLabel === 'Canlı & Vurgulu') {
      acousticAdvice.push(`Ses tonlamanız melodik ve doğal (${acousticMetrics.pitchRangeHz} Hz tonlama aralığı).`);
    }

    if (acousticMetrics.speechActivityRatio < 35) {
      acousticAdvice.push('Kayıt içinde uzun sessizlikler/duraklamalar tespit edildi. Cümleyi tek nefeste ve kelimeleri birbirine bağlayarak (ulama) okumaya çalışın.');
    }
  }

  if (spokenWords.length > 0) {
    if (tempoLabel === 'Çok Hızlı') {
      acousticAdvice.push(`Konuşma hızınız yüksek (${wordsPerMinute} kelime/dk). Heceleri yutmamak için biraz daha sakin bir tempoda okuyun.`);
    } else if (tempoLabel === 'Çok Yavaş') {
      acousticAdvice.push(`Konuşma hızınız yavaş (${wordsPerMinute} kelime/dk). Cümleye alıştıktan sonra doğal akış temposuna (100-140 kelime/dk) çıkmayı hedefleyin.`);
    }
  }

  return {
    accuracyScore,
    fluencyScore,
    wordsPerMinute,
    tempoLabel,
    targetSentence,
    spokenSentence,
    words: wordResults,
    detectedDictionTips,
    acousticMetrics,
    acousticAdvice,
    durationSeconds: safeDuration
  };
}

/**
 * Native Text-To-Speech (TTS) for Turkish
 */
export function speakTurkishText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: unknown) => void;
  }
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return null;
  }

  // Cancel any active speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'tr-TR';
  utterance.rate = options?.rate ?? 1.0;
  utterance.pitch = options?.pitch ?? 1.0;

  // Attempt to select an authentic Turkish voice if available
  const voices = window.speechSynthesis.getVoices();
  const trVoice = voices.find((v) => v.lang.startsWith('tr') || v.lang === 'tr-TR');
  if (trVoice) {
    utterance.voice = trVoice;
  }

  if (options?.onStart) utterance.onstart = options.onStart;
  if (options?.onEnd) utterance.onend = options.onEnd;
  if (options?.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopTurkishSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
