// Question types supported by the AI
export type QuestionType = 'single_choice' | 'multi_choice' | 'text' | 'toggle' | 'options'

// A single follow-up question from the AI
export interface Question {
  id: string
  question: string
  type: QuestionType
  options?: string[]
}

// Scoring element status: true/'full' = completely present (1.0), 'partial' = vague/implied (~0.5), false/'missing' = absent (0)
export type ElementScoreStatus = boolean | 'full' | 'partial' | 'missing'

// Scoring breakdown across 6 prompt elements
export interface ScoreBreakdown {
  goal: ElementScoreStatus
  context: ElementScoreStatus
  audience: ElementScoreStatus
  specificity: ElementScoreStatus
  outputFormat: ElementScoreStatus
  constraints: ElementScoreStatus
}

// Response from POST /api/analyze
export interface AnalyzeResponse {
  status?: 'valid' | 'needs_clarification'
  needsQuestions: boolean
  scoreBefore: number
  scoreBreakdown: ScoreBreakdown
  questions: Question[]
}

// A single explanation item for the "What Changed & Why" panel
export interface ExplanationItem {
  label: string
  detail: string
}

// Response from POST /api/improve
export interface ImproveResponse {
  improvedPrompt: string
  scoreAfter: number
  scoreBreakdown: ScoreBreakdown
  explanation: ExplanationItem[]
}

// Collected answers from the user keyed by question id
export type QuestionAnswers = Record<string, string | string[]>

// Workflow step state machine
export type WorkflowStep =
  | 'input'
  | 'analyzing'
  | 'clarification'
  | 'questions'
  | 'improving'
  | 'results'
