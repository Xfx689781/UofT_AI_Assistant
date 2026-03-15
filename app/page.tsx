'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Onboarding, { getOnboardingData } from '@/components/Onboarding'

export default function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    setMounted(true)
    const existing = getOnboardingData()
    if (existing?.name && existing?.learningStyle) {
      setHasProfile(true)
      setName(existing.name)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="animate-pulse text-[#8b9aad]">Loading...</div>
      </div>
    )
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => router.push('/dashboard')} />
  }

  return (
    <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#0066CC33,_transparent_60%),radial-gradient(circle_at_bottom,_#002A5C55,_transparent_55%)] pointer-events-none" />
      <div className="relative z-10 w-full max-w-3xl flex flex-col md:flex-row items-stretch gap-8 bg-[#050811]/80 border border-[#1e2a3a] rounded-2xl p-8 md:p-10 shadow-[0_0_60px_rgba(0,0,0,0.7)]">
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#002A5C] text-[#e8ecf1] text-xs mb-4 border border-[#0066CC]/50">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e0ff]" />
              Powered by AI · Built for UofT
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              UTbot
            </h1>
            <p className="text-sm md:text-base text-[#c8d4e0] mb-6 max-w-md">
              Your personalized academic advisor for course selection, professor insights, and chatbot at the University of Toronto.
            </p>
          </div>
          <div className="hidden md:block text-xs text-[#6b7a8d]">
            Sign up in under a minute. Your profile is stored securely in your browser only.
          </div>
        </div>

        <div className="w-full md:w-80 flex flex-col justify-center gap-4">
          <div className="bg-[#121922] rounded-xl border border-[#1e2a3a] p-6 shadow-inner">
            <p className="text-sm text-[#8b9aad] mb-4">
              {hasProfile
                ? `Welcome back, ${name}!`
                : 'Get started with a quick profile to unlock personalized guidance.'}
            </p>
            <div className="space-y-3">
              {hasProfile && (
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0066CC] text-white font-medium hover:bg-[#0080e6] transition-colors"
                >
                  Continue as {name}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowOnboarding(true)}
                className={`w-full px-4 py-2.5 rounded-lg border font-medium transition-colors ${
                  hasProfile
                    ? 'border-[#1e2a3a] text-[#e8ecf1] hover:border-[#0066CC]/70 hover:bg-[#002A5C]/30'
                    : 'border-[#0066CC] bg-[#0066CC] text-white hover:bg-[#0080e6]'
                }`}
              >
                {hasProfile ? 'Start over with new profile' : 'Sign Up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
