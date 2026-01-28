export type AiResponse = {
  matchScore: number
  summary: string
  missingKeywords: string[]
  suggestedImprovements: string
}

export type Analysis = {
  owner?: string
  jobDescription: string
  resumeUrl?: string
  aiResponse: AiResponse
}

export type ApiError = {
  status?: number
  message: string
  details?: unknown
}
