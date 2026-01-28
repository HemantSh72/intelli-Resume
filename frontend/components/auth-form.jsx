"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { loginUser, registerUser } from "@/lib/api"

export function AuthForm({ onAuthenticated }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [login, setLogin] = useState({ emailOrUsername: "", password: "" })
  const [reg, setReg] = useState({ fullName: "", username: "", email: "", password: "" })

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = login.emailOrUsername.includes("@")
        ? { email: login.emailOrUsername, password: login.password }
        : { username: login.emailOrUsername, password: login.password }
      await loginUser(payload)
      toast({ title: "Logged in" })
      onAuthenticated?.()
    } catch (err) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await registerUser(reg)
      toast({ title: "Registered successfully" })
      // Optionally auto-login: call loginUser here if desired
      onAuthenticated?.()
    } catch (err) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Welcome</CardTitle>
        <CardDescription>Log in or create an account to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername">Email or Username</Label>
                <Input
                  id="emailOrUsername"
                  required
                  value={login.emailOrUsername}
                  onChange={(e) => setLogin({ ...login, emailOrUsername: e.target.value })}
                  placeholder="you@example.com or username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={login.password}
                  onChange={(e) => setLogin({ ...login, password: e.target.value })}
                  placeholder="********"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Please wait..." : "Log in"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    required
                    value={reg.fullName}
                    onChange={(e) => setReg({ ...reg, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    required
                    value={reg.username}
                    onChange={(e) => setReg({ ...reg, username: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={reg.email}
                  onChange={(e) => setReg({ ...reg, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  required
                  value={reg.password}
                  onChange={(e) => setReg({ ...reg, password: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Please wait..." : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
