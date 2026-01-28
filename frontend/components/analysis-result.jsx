"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AnalysisResult({ result }) {
  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Results</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No analysis yet. Submit a job description to see results here.
        </CardContent>
      </Card>
    )
  }

  const ai = result?.aiResponse || result

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {typeof ai?.matchScore !== "undefined" && (
          <div className="text-sm">
            <span className="font-medium">Match score:</span> <span>{ai.matchScore}</span>
          </div>
        )}

        {ai?.summary && (
          <div>
            <div className="mb-1 text-sm font-medium">Summary</div>
            <p className="text-sm text-muted-foreground">{ai.summary}</p>
          </div>
        )}

        {Array.isArray(ai?.missingKeywords) && ai.missingKeywords.length > 0 && (
          <div>
            <div className="mb-1 text-sm font-medium">Missing keywords</div>
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              {ai.missingKeywords.map((kw, i) => (
                <li key={i}>{kw}</li>
              ))}
            </ul>
          </div>
        )}

        {ai?.suggestedImprovements && (
          <div>
            <div className="mb-1 text-sm font-medium">Suggested improvements</div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ai.suggestedImprovements}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
