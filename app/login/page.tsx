'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getOnboardingData } from '@/components/Onboarding'

export default function LoginPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const existing = getOnboardingData()
    if (existing?.name && existing.name.trim().toLowerCase() === trimmed.toLowerCase()) {
      router.push('/dashboard')
    } else {
      router.push('/signup')
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="animate-pulse text-[#8b9aad]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#0066CC33,_transparent_60%),radial-gradient(circle_at_bottom,_#002A5C55,_transparent_55%)] pointer-events-none" />
      <div className="relative z-10 w-full max-w-md bg-[#050811]/80 border border-[#1e2a3a] rounded-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.7)]">
        <h1 className="text-2xl font-bold text-white mb-2">Log in</h1>
        <p className="text-sm text-[#c8d4e0] mb-6">
          Enter the name you used when you first set up UofT AI Assistant.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8b9aad] mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full px-4 py-2.5 rounded-lg bg-[#0a0e14] border border-[#1e2a3a] text-white placeholder-[#6b7a8d] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full px-4 py-2.5 rounded-lg bg-[#0066CC] text-white font-medium hover:bg-[#0080e6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        </form>
        <p className="mt-4 text-xs text-[#6b7a8d]">
          If we can&apos;t find a profile with that name in this browser, you&apos;ll be redirected to sign up.
        </p>
      </div>
    </div>
  )
}

