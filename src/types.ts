export type UtilityType = 'chat' | 'dictionary' | 'news';

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface NewsItem {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

export interface LanguageExercise {
  phrase: string;
  translation: string;
  pronunciation?: string;
  explanation: string;
}
