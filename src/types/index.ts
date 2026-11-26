export type DialogueLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface WordAnalysis {
  word: string;
  cleanWord: string; // stripped of punctuation
  root: string;
  rootType: 'İsim' | 'Fiil' | 'Sıfat' | 'Zarf' | 'Zamir' | 'Edat' | 'Bağlaç' | 'Ünlem' | string;
  suffixes: string[];
  englishMeaning: string;
  turkishMeaning: string;
  syllables: string; // e.g. "me-ra-ba"
  phoneticTip?: string;
  stressTip?: string; // e.g. "Vurgu son hecede (-ba)"
  phonemeAlerts?: string[]; // e.g. ['ğ', 'ı']
}

export interface SentenceItem {
  id: string;
  speakerId: string;
  speakerName: string;
  speakerRole?: string;
  turkishText: string;
  englishText: string;
  phoneticSpelling?: string;
  audioKey?: string;
  grammarNote?: string;
}

export interface Dialogue {
  id: string;
  title: string;
  level: DialogueLevel;
  levelTitle: string;
  description: string;
  scenario: string;
  culturalNote?: string;
  speakers: {
    id: string;
    name: string;
    role: string;
    gender: 'female' | 'male';
    color: string;
  }[];
  sentences: SentenceItem[];
}

export interface WordComparisonResult {
  targetWord: string;
  spokenWord: string | null;
  similarity: number; // 0 to 1
  status: 'correct' | 'near' | 'incorrect'; // correct (>= 0.85), near (0.50 - 0.84), incorrect (< 0.50)
  phonemesInvolved: string[];
  tips?: string[];
}

export interface AcousticMetrics {
  averageVolumePercent: number; // 0 - 100
  peakVolumePercent: number; // 0 - 100
  averageDb: number; // approximate dBFS (-60 to 0)
  averagePitchHz: number | null;
  pitchRangeHz: number;
  intonationLabel: 'Durağan / Monoton' | 'Doğal Tonlama' | 'Canlı & Vurgulu' | 'Ölçülemedi';
  speechActivityRatio: number; // 0 - 100 (% of recording with active speech vs silence)
  waveformSnapshot: number[]; // normalized 0-1 amplitude bars
}

export interface PronunciationEvaluation {
  accuracyScore: number; // 0 - 100
  fluencyScore: number; // 0 - 100
  wordsPerMinute: number;
  tempoLabel: 'Çok Yavaş' | 'İdeal Tempo' | 'Biraz Hızlı' | 'Çok Hızlı';
  targetSentence: string;
  spokenSentence: string;
  words: WordComparisonResult[];
  detectedDictionTips: {
    phoneme: string;
    title: string;
    advice: string;
    exampleWords: string[];
  }[];
  acousticMetrics?: AcousticMetrics;
  acousticAdvice: string[];
  durationSeconds: number;
}

export interface PracticeHistoryItem {
  id: string;
  timestamp: string;
  targetSentence: string;
  spokenSentence: string;
  accuracyScore: number;
  fluencyScore: number;
  durationSeconds: number;
  audioUrl: string | null;
  intonationLabel?: string;
}

export interface UserStats {
  completedSentencesCount: number;
  averageAccuracy: number;
  totalAttempts: number;
  perfectWordsCount: number;
  practiceStreakDays: number;
}

export interface TongueTwister {
  id: string;
  title: string;
  targetSound: string;
  soundLabel: string;
  level: string;
  text: string;
  dictionFocus: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
}
