'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getOnboardingData, type OnboardingData } from '@/components/Onboarding'
import Chat from '@/components/Chat'
import ProfessorCard from '@/components/ProfessorCard'
import { PROFESSORS } from '@/lib/data'

interface CourseRec {
  code: string
  name: string
  reason: string
}

interface SemesterPlan {
  semester: string
  courses: CourseRec[]
}

interface DegreeProgress {
  completedCredits: number
  requiredCredits: number
  completedCourses: string[]
  remainingRequired: string[]
  nextMilestone: string
}

function getDisplayProgram(profile: OnboardingData): string {
  if (profile.yearType === 'first') return profile.admissionCategory || 'First Year'
  if (profile.programOfStudy && profile.programOfStudy !== '__other__') return profile.programOfStudy
  return profile.programOther || 'Second Year+'
}

export default function DashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<OnboardingData | null>(null)
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null)
  const [courseSchedule, setCourseSchedule] = useState<SemesterPlan[]>([])
  const [degreeProgress, setDegreeProgress] = useState<DegreeProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [expandedSemesters, setExpandedSemesters] = useState<Set<number>>(new Set([0]))

  useEffect(() => {
    setMounted(true)
    const data = getOnboardingData()
    if (!data?.name) { router.replace('/'); return }
    if (!data.learningStyle) { router.replace('/'); return }
    setProfile(data)
  }, [router])

  useEffect(() => {
    if (!profile?.name) return
    setLoading(true)
    fetch('/api/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.message) setWelcomeMessage(json.message)
        if (json.courseSchedule) setCourseSchedule(json.courseSchedule)
        if (json.degreeProgress) setDegreeProgress(json.degreeProgress)
      })
      .catch(() => setWelcomeMessage(null))
      .finally(() => setLoading(false))
  }, [profile?.name])

  function handleLogout() {
    localStorage.clear()
    router.replace('/')
  }

  function toggleSemester(i: number) {
    setExpandedSemesters(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="animate-pulse text-[#8b9aad]">Loading...</div>
      </div>
    )
  }

  const displayProgram = profile ? getDisplayProgram(profile) : ''
  const progressPct = degreeProgress
    ? Math.round((degreeProgress.completedCredits / degreeProgress.requiredCredits) * 100)
    : 0

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      {/* Header */}
      <header className="border-b border-[#1e2a3a] bg-[#121922]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-lg font-bold text-white">
            UofT AI Assistant
          </Link>
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
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
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

            {/* Welcome */}
            <section className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
              <h1 className="text-2xl font-bold text-white mb-2">
                Welcome back, {profile?.name ?? 'Student'}!
              </h1>
              {loading && <p className="text-[#8b9aad] animate-pulse">Generating your personalized plan...</p>}
              {!loading && welcomeMessage && <p className="text-[#c8d4e0] leading-relaxed">{welcomeMessage}</p>}
              {!loading && !welcomeMessage && (
                <p className="text-[#8b9aad]">Here&apos;s your dashboard. Use the assistant on the right for help.</p>
              )}
            </section>

            {/* Degree Progress */}
            {degreeProgress && (
              <section className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">📋 Degree Progress</h2>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1 h-3 bg-[#0a0e14] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0066CC] to-[#00aaff] rounded-full transition-all duration-1000"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-white font-bold text-sm whitespace-nowrap">
                    {degreeProgress.completedCredits} / {degreeProgress.requiredCredits} credits
                  </span>
                </div>
                <p className="text-[#8b9aad] text-sm mb-3">🎯 {degreeProgress.nextMilestone}</p>
                {degreeProgress.remainingRequired.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {degreeProgress.remainingRequired.slice(0, 8).map(c => (
                      <span key={c} className="px-2 py-1 rounded-md bg-[#002A5C]/50 border border-[#0066CC]/30 text-[#c8d4e0] text-xs">
                        {c}
                      </span>
                    ))}
                    {degreeProgress.remainingRequired.length > 8 && (
                      <span className="px-2 py-1 text-[#8b9aad] text-xs">
                        +{degreeProgress.remainingRequired.length - 8} more
                      </span>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Course Plan */}
            {courseSchedule.length > 0 && (
              <section className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">📅 Your Recommended Course Plan</h2>
                <p className="text-sm text-[#8b9aad] mb-4">AI-generated based on your program and completed courses. Click a semester to expand.</p>
                <div className="space-y-3">
                  {courseSchedule.map((sem, i) => (
                    <div key={i} className="border border-[#1e2a3a] rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSemester(i)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-[#0a0e14] hover:bg-[#0f1520] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#0066CC] flex items-center justify-center text-white text-xs font-bold">
                            {i + 1}
                          </span>
                          <span className="text-white font-medium">{sem.semester}</span>
                          <span className="text-[#8b9aad] text-xs">{sem.courses.length} courses</span>
                        </div>
                        <span className="text-[#8b9aad] text-sm">{expandedSemesters.has(i) ? '▲' : '▼'}</span>
                      </button>
                      {expandedSemesters.has(i) && (
                        <div className="divide-y divide-[#1e2a3a]">
                          {sem.courses.map((course, j) => (
                            <div key={j} className="px-4 py-3 flex items-start gap-3">
                              <span className="px-2 py-0.5 rounded bg-[#002A5C] text-[#0099ff] text-xs font-mono font-bold whitespace-nowrap mt-0.5">
                                {course.code}
                              </span>
                              <div>
                                <p className="text-white text-sm font-medium">{course.name}</p>
                                <p className="text-[#8b9aad] text-xs mt-0.5">{course.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Loading skeleton for course plan */}
            {loading && (
              <section className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">📅 Your Recommended Course Plan</h2>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-[#0a0e14] rounded-xl animate-pulse" />
                  ))}
                </div>
              </section>
            )}

            {/* Quick actions */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/dashboard?action=recommend"
                  className="flex items-center gap-3 p-4 bg-[#121922] border border-[#1e2a3a] rounded-xl hover:border-[#0066CC]/60 hover:bg-[#002A5C]/20 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-[#0066CC]/20 flex items-center justify-center group-hover:bg-[#0066CC]/30">
                    <span className="text-xl">📚</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Recommend courses</p>
                    <p className="text-sm text-[#8b9aad]">Get personalized suggestions</p>
                  </div>
                </Link>
                <Link href="/dashboard?action=analyze"
                  className="flex items-center gap-3 p-4 bg-[#121922] border border-[#1e2a3a] rounded-xl hover:border-[#0066CC]/60 hover:bg-[#002A5C]/20 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-[#FFD700]/20 flex items-center justify-center group-hover:bg-[#FFD700]/30">
                    <span className="text-xl">👨‍🏫</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Analyze a professor</p>
                    <p className="text-sm text-[#8b9aad]">See ratings & insights</p>
                  </div>
                </Link>
                <Link href="/dashboard?action=progress"
                  className="flex items-center gap-3 p-4 bg-[#121922] border border-[#1e2a3a] rounded-xl hover:border-[#0066CC]/60 hover:bg-[#002A5C]/20 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-[#0066CC]/20 flex items-center justify-center group-hover:bg-[#0066CC]/30">
                    <span className="text-xl">📋</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Degree progress</p>
                    <p className="text-sm text-[#8b9aad]">Track your requirements</p>
                  </div>
                </Link>
              </div>
            </section>

            {/* Featured professors */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Featured Professors</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROFESSORS.slice(0, 4).map((p) => (
                  <ProfessorCard key={p.id} professor={p} />
                ))}
              </div>
            </section>
          </div>

          {/* Chat */}
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
