export type QuestionCategoryId =
  | 'general'
  | 'science'
  | 'history'
  | 'arabic'
  | 'logic'
  | 'custom';

export type QuestionFormat = 'qa' | 'quiz';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface QuestionCategory {
  id: QuestionCategoryId;
  label: string;
  description: string;
}

export interface QAItem {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  choices: string[];
  correctChoiceIndex: number;
  appliedTag?: string;
}

export interface AppliedNote {
  id: string;
  text: string;
  appliedAt: string;
  active: boolean;
  summary?: string;
}

export interface GenerateQuestionsPayload {
  category: QuestionCategoryId;
  customTopic?: string;
  difficulty: DifficultyLevel;
  count: number;
  notes?: string[];
  previousQuestions?: QAItem[];
  mode: 'generate' | 'apply-notes';
}

export interface GenerateQuestionsResponse {
  questions: QAItem[];
  appliedSummary?: string;
}
