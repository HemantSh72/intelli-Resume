"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { uploadResume } from "@/lib/api"

export function ResumeUpload() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    if (!file) {
      toast({ title: "Please choose a file", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      await uploadResume(file)
      toast({ title: "Resume uploaded" })
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resume</CardTitle>
        <CardDescription>Upload your latest resume (PDF).</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="resume">Choose file</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload resume"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
