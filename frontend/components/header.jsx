"use client"

import { Button } from "@/components/ui/button"

export function Header({ loggedIn, onLogout }) {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-primary" aria-hidden />
          <h1 className="text-pretty text-sm font-medium sm:text-base">Intelli-Resume</h1>
        </div>
        <div className="flex items-center gap-2">
          {loggedIn ? (
            <Button variant="outline" size="sm" onClick={onLogout}>
              Log out
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">Please log in</span>
          )}
        </div>
      </div>
    </header>
  )
}
