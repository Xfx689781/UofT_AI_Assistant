'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getOnboardingData, type OnboardingData } from '@/components/Onboarding'
import Chat from '@/components/Chat'
import ProfessorCard from '@/components/ProfessorCard'
import { PROFESSORS } from '@/lib/data'

function getDisplayProgram(profile: OnboardingData): string {
  if (profile.yearType === 'first') {
    return profile.admissionCategory || 'First year'
  }
  if (profile.programOfStudy && profile.programOfStudy !== '__other__') {
    return profile.programType ? `${profile.programOfStudy} (${profile.programType})` : profile.programOfStudy
  }
  return profile.programOther || 'Second year+'
}

export default function DashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<OnboardingData | null>(null)
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null)
  const [welcomeLoading, setWelcomeLoading] = useState(true)
  const [welcomeError, setWelcomeError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const data = getOnboardingData()
    if (!data?.name) { router.replace('/'); return }
    if (!data.learningStyle) { router.replace('/'); return }
    setProfile(data)
  }, [router])

  useEffect(() => {
    if (!profile?.name) return
    setWelcomeLoading(true)
    setWelcomeError(null)
    fetch('/api/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.message) setWelcomeMessage(json.message)
        else setWelcomeError(json.error || 'Could not load welcome message')
      })
      .catch(() => setWelcomeError('Failed to load welcome message'))
      .finally(() => setWelcomeLoading(false))
  }, [profile?.name])

  function handleLogout() {
    localStorage.clear()
    router.replace('/')
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="animate-pulse text-[#8b9aad]">Loading...</div>
      </div>
    )
  }

  const displayProgram = profile ? getDisplayProgram(profile) : ''

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      {/* Header */}
      <header className="border-b border-[#1e2a3a] bg-[#121922]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-lg font-bold text-white">
            UofT AI Assistant
          </Link>

          {/* Profile menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1e2a3a] hover:bg-[#243040] transition-all text-sm text-white"
            >
              <div className="w-7 h-7 rounded-full bg-[#0066CC] flex items-center justify-center text-white font-bold text-xs">
                {profile?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <span>{profile?.name ?? 'Student'}</span>
              <span className="text-[#8b9aad]">▾</span>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <>
                {/* Backdrop to close menu */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-[#1a2332] border border-[#1e2a3a] rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#1e2a3a]">
                    <p className="text-white font-semibold">{profile?.name}</p>
                    <p className="text-[#8b9aad] text-xs mt-0.5">{displayProgram}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
                  >
                    🚪 Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
              <h1 className="text-2xl font-bold text-white mb-2">
                Welcome back, {profile?.name ?? 'Student'}!
              </h1>
              {welcomeLoading && (
                <p className="text-[#8b9aad] animate-pulse">Generating your personalized message...</p>
              )}
              {welcomeError && !welcomeMessage && (
                <p className="text-[#8b9aad]">
                  Here&apos;s your dashboard. Use the assistant on the right for course and professor help.
                </p>
              )}
              {welcomeMessage && (
                <p className="text-[#c8d4e0] leading-relaxed">{welcomeMessage}</p>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Quick actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  href="/dashboard?action=recommend"
                  className="flex items-center gap-3 p-4 bg-[#121922] border border-[#1e2a3a] rounded-xl hover:border-[#0066CC]/60 hover:bg-[#002A5C]/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0066CC]/20 flex items-center justify-center text-[#0066CC] group-hover:bg-[#0066CC]/30">
                    <span className="text-xl">📚</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Recommend courses</p>
                    <p className="text-sm text-[#8b9aad]">Get personalized suggestions</p>
                  </div>
                </Link>
                <Link
                  href="/dashboard?action=analyze"
                  className="flex items-center gap-3 p-4 bg-[#121922] border border-[#1e2a3a] rounded-xl hover:border-[#0066CC]/60 hover:bg-[#002A5C]/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#FFD700]/20 flex items-center justify-center text-[#FFD700] group-hover:bg-[#FFD700]/30">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Analyze a professor</p>
                    <p className="text-sm text-[#8b9aad]">See ratings & insights</p>
                  </div>
                </Link>
                <Link
                  href="/dashboard?action=progress"
                  className="flex items-center gap-3 p-4 bg-[#121922] border border-[#1e2a3a] rounded-xl hover:border-[#0066CC]/60 hover:bg-[#002A5C]/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0066CC]/20 flex items-center justify-center text-[#0066CC] group-hover:bg-[#0066CC]/30">
                    <span className="text-xl">📋</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Check degree progress</p>
                    <p className="text-sm text-[#8b9aad]">Track your requirements</p>
                  </div>
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Featured professors</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROFESSORS.slice(0, 4).map((p) => (
                  <ProfessorCard key={p.id} professor={p} />
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 h-[calc(100vh-8rem)] min-h-[500px]">
              <Chat />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
