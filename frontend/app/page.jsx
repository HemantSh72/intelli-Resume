"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { AuthForm } from "@/components/auth-form"
import { ProfileForm } from "@/components/profile-form"
import { PasswordForm } from "@/components/password-form"
import { ResumeUpload } from "@/components/resume-upload"
import { AnalysisForm } from "@/components/analysis-form"
import { AnalysisResult } from "@/components/analysis-result"
import { logoutUser } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { CheckCircle, BrainCircuit, FileText, Zap } from "lucide-react"

export default function Page() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [result, setResult] = useState(null)

  async function handleLogout() {
    try {
      await logoutUser()
    } catch {
      // ignore
    } finally {
      setLoggedIn(false)
      setResult(null)
      setShowAuth(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header loggedIn={loggedIn} onLogout={handleLogout} />

      {!loggedIn ? (
        <>
          {/* HERO SECTION */}
          {!showAuth ? (
            <div className="flex flex-col items-center">
              <section className="px-4 pt-20 pb-16 text-center md:pt-32 md:pb-24">
                <div className="mx-auto max-w-3xl">
                  <h1 className="mb-6 text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
                    Land your dream job with <span className="text-primary">AI-Powered</span> Resume Analysis
                  </h1>
                  <p className="mb-10 text-pretty text-lg text-muted-foreground sm:text-xl">
                    Upload your resume and get instant feedback, match scores, and keyword suggestions 
                    tailored to any job description.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button size="lg" className="h-12 px-8" onClick={() => setShowAuth(true)}>
                      Get Started for Free
                    </Button>
                    <Button variant="outline" size="lg" className="h-12 px-8">
                      View Sample Analysis
                    </Button>
                  </div>
                </div>
              </section>

              {/* FEATURES GRID */}
              <section className="mx-auto max-w-5xl px-4 py-16">
                <div className="grid gap-8 md:grid-cols-3">
                  <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <BrainCircuit className="mb-4 h-10 w-10 text-primary" />
                    <h3 className="mb-2 font-bold">Smart Match Score</h3>
                    <p className="text-sm text-muted-foreground">
                      Our Zephyr-7B AI calculates a precise compatibility percentage based on your skills.
                    </p>
                  </div>
                  <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <FileText className="mb-4 h-10 w-10 text-primary" />
                    <h3 className="mb-2 font-bold">Keyword Extraction</h3>
                    <p className="text-sm text-muted-foreground">
                      Identify missing keywords from job descriptions to beat the ATS (Applicant Tracking Systems).
                    </p>
                  </div>
                  <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <Zap className="mb-4 h-10 w-10 text-primary" />
                    <h3 className="mb-2 font-bold">Instant Feedback</h3>
                    <p className="text-sm text-muted-foreground">
                      Get actionable suggested improvements to refine your professional summary and bullet points.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            /* AUTH SECTION */
            <section className="mx-auto flex min-h-[calc(100vh-56px)] max-w-lg items-center justify-center px-4">
              <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Button variant="ghost" className="mb-4" onClick={() => setShowAuth(false)}>
                  ← Back to Home
                </Button>
                <AuthForm onAuthenticated={() => setLoggedIn(true)} />
              </div>
            </section>
          )}
        </>
      ) : (
        /* LOGGED IN DASHBOARD */
        <section className="mx-auto max-w-5xl px-4 py-8">
          <header className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Your Dashboard</h2>
            <p className="text-muted-foreground">Configure your profile and optimize your professional path.</p>
          </header>

          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <ProfileForm />
              <PasswordForm />
            </div>

            <div className="rounded-xl border bg-card p-1 shadow-sm">
              <div className="grid gap-6 md:grid-cols-2 p-6">
                <ResumeUpload />
                <AnalysisForm
                  onResult={(r) => setResult(r)}
                  onUnauthorized={() => {
                    setLoggedIn(false)
                    setResult(null)
                  }}
                />
              </div>
            </div>

            {result && (
              <div className="animate-in fade-in zoom-in duration-500">
                <AnalysisResult result={result} />
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  )
}