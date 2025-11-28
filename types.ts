export interface TriviaCard {
  category: string;
  question: string;
  real_answer: string;
}

export interface GenerationState {
  loading: boolean;
  error: string | null;
  data: TriviaCard | null;
}