export type Category = 'God' | 'Others' | 'Disciples' | 'Sin';

export type Stage = 'Seeking' | 'Beginning' | 'Growing' | 'Multiplying';

export interface Answer {
  text: string;
  score: number;
}

export interface Question {
  id: number;
  text: string;
  category: Category;
  answers: Answer[];
}

export interface QuestionResponse {
  questionId: number;
  answerText: string;
  score: number;
}

export interface Assessment {
  id: string;
  email: string;
  created_at: string;
  total_score: number;
  stage: Stage;
  god_score: number;
  others_score: number;
  disciples_score: number;
  sin_score: number;
  is_seeker_override: boolean;
}

export interface AssessmentDetail extends Assessment {
  responses: ResponseRecord[];
  attributes: AttributeRecord[];
  recommendations: RecommendationRecord | null;
}

export interface ResponseRecord {
  id: string;
  question_id: number;
  question_text: string;
  answer_text: string;
  answer_score: number;
  category: string;
}

export interface AttributeRecord {
  id: string;
  attribute_type: 'experience' | 'skill';
  attribute_value: string;
}

export interface RecommendationRecord {
  id: string;
  stage_summary: string;
  recommendations_json: Recommendation[];
}

export type RecommendationCategory = 'Community' | 'Resources' | 'Serving' | 'Practices' | 'Support';

export interface Recommendation {
  category: RecommendationCategory;
  title: string;
  description: string;
  link: string;
  priority: number;
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  link: string;
  category: string;
  tags?: string[];
}

export interface SubmitAssessmentRequest {
  email: string;
  responses: QuestionResponse[];
  experiences: string[];
  skills: string[];
}

export interface SubmitAssessmentResponse {
  assessmentId: string;
  stage: Stage;
  stageSummary: string;
  recommendations: Recommendation[];
}
