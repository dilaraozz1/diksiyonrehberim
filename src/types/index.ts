export type DialogueLevel = 'A1' | 'A2' | 'B1' | 'B2';

export type ActivityType = 'dialogue' | 'studio' | 'diction' | 'twister' | 'word';

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

export interface StudentProfile {
  uid: string;
  username: string;
  displayName: string;
  targetLevel: DialogueLevel;
  role: 'student' | 'admin';
  totalAttempts: number;
  firstScore: number;
  latestScore: number;
  bestScore: number;
  averageAccuracy: number;
  averageFluency: number;
  growthDelta: number;
  totalPracticeSeconds: number;
  perfectWordsCount: number;
  firstActivityAt: string;
  lastActivityAt: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface StudentActivityRecord {
  activityId: string;
  studentId: string;
  attemptNumber: number;
  activityType: ActivityType;
  contextTitle: string;
  targetSentence: string;
  spokenSentence: string;
  accuracyScore: number;
  fluencyScore: number;
  wordsPerMinute: number;
  durationSeconds: number;
  perfectWords: number;
  totalWords: number;
  averageVolumePercent: number;
  intonationLabel: string;
  problemPhonemes: string[];
  createdAt?: unknown;
  createdAtMs?: number;
}

export interface UserStats {
  completedSentencesCount: number;
  averageAccuracy: number;
  totalAttempts: number;
  perfectWordsCount: number;
  growthDelta: number;
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
