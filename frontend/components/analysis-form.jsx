"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { analyzeResume } from "@/lib/api"

export function AnalysisForm({ onResult, onUnauthorized }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [jobDescription, setJobDescription] = useState("")

  async function onSubmit(e) {
    e.preventDefault()
    if (!jobDescription.trim()) {
      toast({ title: "Please paste a job description", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const data = await analyzeResume(jobDescription)
      onResult?.(data)
      toast({ title: "Analysis complete" })
    } catch (err) {
      if (err?.unauthorized) {
        onUnauthorized?.()
        toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" })
      } else {
        toast({ title: "Analysis failed", description: err.message, variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Analyze</CardTitle>
        <CardDescription>Paste a job description to get an AI analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="jd">Job description</Label>
            <Textarea
              id="jd"
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="We are looking for a skilled Senior Backend Engineer..."
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Run analysis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
