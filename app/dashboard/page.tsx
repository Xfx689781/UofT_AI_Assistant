'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getOnboardingData, type OnboardingData } from '@/components/Onboarding'
import { ProfessorSearch } from '@/components/ProfessorCard'
import Chat from '@/components/Chat'

interface CourseRecommendation {
  code: string
  name: string
  priority: 'essential' | 'recommended' | 'elective'
  reason: string
  coreTopics: string[]
  prereqsMet: boolean
  difficulty: 'easy' | 'medium' | 'hard'
  workload: number
  crossDiscipline: boolean
}

interface DegreeProgress {
  completedCredits: number
  requiredCredits: number
  remainingRequired: string[]
  nextMilestone: string
}

function getDisplayProgram(profile: OnboardingData): string {
  if (profile.yearType === 'first') return profile.admissionCategory || 'First Year'
  if (profile.programOfStudy && profile.programOfStudy !== '__other__') return profile.programOfStudy
  return profile.programOther || 'Upper Year'
}

export default function DashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<OnboardingData | null>(null)
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null)
  const [courseRecommendations, setCourseRecommendations] = useState<CourseRecommendation[]>([])
  const [degreeProgress, setDegreeProgress] = useState<DegreeProgress | null>(null)
  const [advisorNote, setAdvisorNote] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())

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
      .then(res => res.json())
      .then(json => {
        if (json.message) setWelcomeMessage(json.message)
        if (json.courseRecommendations) setCourseRecommendations(json.courseRecommendations)
        if (json.degreeProgress) setDegreeProgress(json.degreeProgress)
        if (json.advisorNote) setAdvisorNote(json.advisorNote)
      })
      .catch(() => setWelcomeMessage(null))
      .finally(() => setLoading(false))
  }, [profile?.name])

  function handleLogout() {
    localStorage.clear()
    router.replace('/')
  }

  function toggleCourse(key: string) {
    setExpandedCourses(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
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
      <header className="border-b border-[#1e2a3a] bg-[#121922]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-lg font-bold text-white">UofT AI Assistant</Link>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1e2a3a] hover:bg-[#243040] transition-all text-sm text-white">
              <div className="w-7 h-7 rounded-full bg-[#0066CC] flex items-center justify-center text-white font-bold text-xs">
                {profile?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <span>{profile?.name ?? 'Student'}</span>
              <span className="text-[#8b9aad]">v</span>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-[#1a2332] border border-[#1e2a3a] rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#1e2a3a]">
                    <p className="text-white font-semibold">{profile?.name}</p>
                    <p className="text-[#8b9aad] text-xs mt-0.5">{displayProgram}</p>
                  </div>
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium">
                    Log Out
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
                {'Welcome back, ' + (profile?.name ?? 'Student') + '!'}
              </h1>
              {loading && (
                <p className="text-[#8b9aad] animate-pulse">Building your personalized course recommendations...</p>
              )}
              {!loading && welcomeMessage && (
                <p className="text-[#c8d4e0] leading-relaxed">{welcomeMessage}</p>
              )}
              {!loading && !welcomeMessage && (
                <p className="text-[#8b9aad]">Here is your dashboard.</p>
              )}
            </section>

            {degreeProgress && (
              <section className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Degree Progress</h2>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1 h-3 bg-[#0a0e14] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0066CC] to-[#00aaff] rounded-full transition-all duration-1000"
                      style={{ width: progressPct + '%' }}
                    />
                  </div>
                  <span className="text-white font-bold text-sm whitespace-nowrap">
                    {degreeProgress.completedCredits} / {degreeProgress.requiredCredits} credits
                  </span>
                </div>
                <p className="text-[#8b9aad] text-sm mb-3">{degreeProgress.nextMilestone}</p>
                {degreeProgress.remainingRequired.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {degreeProgress.remainingRequired.slice(0, 10).map(c => (
                      <span
                        key={c}
                        onClick={() => window.open('https://artsci.calendar.utoronto.ca/course/' + c.toLowerCase().replace(/\s/g, ''), '_blank')}
                        className="px-2 py-1 rounded-md bg-[#002A5C]/50 border border-[#0066CC]/30 text-[#c8d4e0] text-xs font-mono cursor-pointer hover:border-[#0066CC] hover:text-white transition-all"
                      >
                        {c}
                      </span>
                    ))}
                    {degreeProgress.remainingRequired.length > 10 && (
                      <span className="px-2 py-1 text-[#8b9aad] text-xs">
                        +{degreeProgress.remainingRequired.length - 10} more
                      </span>
                    )}
                  </div>
                )}
              </section>
            )}

            {(courseRecommendations.length > 0 || loading) && (
              <section className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-1">Recommended Courses for You</h2>
                <p className="text-xs text-[#8b9aad] mb-4">
                  Curated based on your completed courses, goals, and learning style
                </p>

                {advisorNote && !loading && (
                  <div className="mb-4 bg-[#002A5C]/30 border border-[#0066CC]/30 rounded-xl p-4">
                    <p className="text-xs text-[#0066CC] font-semibold mb-1">Advisor Note</p>
                    <p className="text-[#c8d4e0] text-sm leading-relaxed">{advisorNote}</p>
                  </div>
                )}

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-14 bg-[#0a0e14] rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(['essential', 'recommended', 'elective'] as const).map(priority => {
                      const courses = courseRecommendations.filter(c => c.priority === priority)
                      if (courses.length === 0) return null
                      return (
                        <div key={priority}>
                          <p className="text-xs text-[#8b9aad] font-semibold uppercase tracking-wide mb-2 mt-4">
                            {priority === 'essential' ? 'Essential' : priority === 'recommended' ? 'Recommended' : 'Elective'}
                          </p>
                          {courses.map((course, j) => {
                            const courseKey = priority + '-' + j
                            const isExpanded = expandedCourses.has(courseKey)
                            const diffColor = course.difficulty === 'hard' ? 'text-red-400' : course.difficulty === 'medium' ? 'text-yellow-400' : 'text-green-400'
                            return (
                              <div key={j} className="border border-[#1e2a3a] rounded-xl overflow-hidden mb-2">
                                <button
                                  type="button"
                                  onClick={() => toggleCourse(courseKey)}
                                  className="w-full px-4 py-3 flex items-start gap-3 hover:bg-[#0f1520] transition-all text-left"
                                >
                                  <div className="flex items-center gap-2 shrink-0 mt-0.5">
                                    <span
                                      className="px-2 py-0.5 rounded bg-[#002A5C] text-[#0099ff] text-xs font-mono font-bold hover:bg-[#003580] transition-all cursor-pointer"
                                      onClick={e => {
                                        e.stopPropagation()
                                        window.open('https://artsci.calendar.utoronto.ca/course/' + course.code.toLowerCase().replace(/\s/g, ''), '_blank')
                                      }}
                                    >
                                      {course.code}
                                    </span>
                                    <span className={'text-xs ' + diffColor}>
                                      {course.difficulty === 'hard' ? 'Hard' : course.difficulty === 'medium' ? 'Med' : 'Easy'}
                                    </span>
                                    {course.crossDiscipline && (
                                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs">cross</span>
                                    )}
                                    <span className="text-xs text-[#6b7a8d]">{course.workload}h/wk</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-white text-sm font-medium">{course.name}</p>
                                    <p className="text-[#8b9aad] text-xs mt-0.5 line-clamp-1">{course.reason}</p>
                                  </div>
                                  <span className="text-[#8b9aad] text-xs shrink-0">{isExpanded ? 'v' : '>'}</span>
                                </button>

                                {isExpanded && (
                                  <div className="px-4 pb-4 space-y-3 bg-[#0a0e14]/50">
                                    <p className="text-[#c8d4e0] text-sm leading-relaxed pt-2">{course.reason}</p>
                                    {course.coreTopics && course.coreTopics.length > 0 && (
                                      <div>
                                        <p className="text-xs text-[#0066CC] font-semibold mb-2">Core Topics</p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {course.coreTopics.map((topic, k) => (
                                            <span
                                              key={k}
                                              className="px-2 py-1 rounded-lg bg-[#002A5C]/40 border border-[#0066CC]/20 text-[#c8d4e0] text-xs"
                                            >
                                              {topic}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            )}

            <ProfessorSearch studentProfile={profile} />

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
