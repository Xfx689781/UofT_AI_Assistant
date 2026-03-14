'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getOnboardingData, type OnboardingData } from '@/components/Onboarding'
import Chat from '@/components/Chat'

interface CourseRec {
  code: string
  name: string
  reason: string
  type: 'required' | 'elective'
}

interface SemesterPlan {
  semester: string
  courses: CourseRec[]
}

interface DegreeProgress {
  completedCredits: number
  requiredCredits: number
  remainingRequired: string[]
  nextMilestone: string
}

interface ProfessorDimensions {
  teachingClarity: number
  examPredictability: number
  accessibility: number
  gradingFairness: number
  workload: number
  engagement: number
}

interface Professor {
  name: string
  rmpRating: number
  rmpDifficulty: number
  numRatings: number
  dimensions: ProfessorDimensions
  examStyle: string
  teachingStyle: string
  bestFor: string
  warnings: string
  tags: string[]
  recentQuotes: string[]
  enrollmentTrend: 'rising' | 'stable' | 'dropping'
}

interface ProfessorData {
  courseCode: string
  courseName: string
  professors: Professor[]
  recommendedFor: string
  recommendationReason: string
}

function getDisplayProgram(profile: OnboardingData): string {
  if (profile.yearType === 'first') return profile.admissionCategory || 'First Year'
  if (profile.programOfStudy && profile.programOfStudy !== '__other__') return profile.programOfStudy
  return profile.programOther || 'Second Year+'
}

function DimensionBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#8b9aad] w-36 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-[#0a0e14] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${value * 10}%`,
            background: value >= 7 ? '#22c55e' : value >= 5 ? '#0066CC' : '#ef4444'
          }}
        />
      </div>
      <span className="text-xs text-white w-6 text-right">{value}</span>
    </div>
  )
}

function ProfessorCard({ prof, isRecommended, studentProfile }: {
  prof: Professor
  isRecommended: boolean
  studentProfile: OnboardingData | null
}) {
  const [expanded, setExpanded] = useState(isRecommended)
  const trendColor = prof.enrollmentTrend === 'rising' ? 'text-green-400' : prof.enrollmentTrend === 'dropping' ? 'text-red-400' : 'text-yellow-400'
  const trendIcon = prof.enrollmentTrend === 'rising' ? '↑' : prof.enrollmentTrend === 'dropping' ? '↓' : '→'

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${isRecommended ? 'border-[#0066CC] bg-[#002A5C]/20' : 'border-[#1e2a3a] bg-[#121922]'}`}>
      <button type="button" onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0066CC]/20 flex items-center justify-center text-white font-bold text-sm">
            {prof.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="text-white font-medium">{prof.name}</p>
              {isRecommended && (
                <span className="px-2 py-0.5 rounded-full bg-[#0066CC] text-white text-xs font-bold">★ Best for you</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-[#8b9aad]">RMP {prof.rmpRating}/5</span>
              <span className="text-xs text-[#8b9aad]">Difficulty {prof.rmpDifficulty}/5</span>
              <span className={`text-xs ${trendColor}`}>{trendIcon} Enrollment {prof.enrollmentTrend}</span>
            </div>
          </div>
        </div>
        <span className="text-[#8b9aad]">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-[#1e2a3a]">
          {/* Dimensions */}
          <div className="pt-4 space-y-2">
            <DimensionBar label="Teaching Clarity" value={prof.dimensions.teachingClarity} />
            <DimensionBar label="Exam Predictability" value={prof.dimensions.examPredictability} />
            <DimensionBar label="Accessibility" value={prof.dimensions.accessibility} />
            <DimensionBar label="Grading Fairness" value={prof.dimensions.gradingFairness} />
            <DimensionBar label="Workload" value={prof.dimensions.workload} />
            <DimensionBar label="Engagement" value={prof.dimensions.engagement} />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {prof.tags.map(tag => (
              <span key={tag} className="px-2 py-1 rounded-full bg-[#1e2a3a] text-[#8b9aad] text-xs">{tag}</span>
            ))}
          </div>

          {/* Exam & Teaching style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#0a0e14] rounded-lg p-3">
              <p className="text-xs text-[#8b9aad] mb-1">📝 Exam Style</p>
              <p className="text-white text-sm">{prof.examStyle}</p>
            </div>
            <div className="bg-[#0a0e14] rounded-lg p-3">
              <p className="text-xs text-[#8b9aad] mb-1">🎓 Teaching Style</p>
              <p className="text-white text-sm">{prof.teachingStyle}</p>
            </div>
          </div>

          {/* Best for */}
          <div className="bg-[#002A5C]/30 border border-[#0066CC]/30 rounded-lg p-3">
            <p className="text-xs text-[#0066CC] mb-1">✅ Best For</p>
            <p className="text-white text-sm">{prof.bestFor}</p>
          </div>

          {/* Warning */}
          {prof.warnings && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-xs text-yellow-400 mb-1">⚠️ Heads Up</p>
              <p className="text-[#c8d4e0] text-sm">{prof.warnings}</p>
            </div>
          )}

          {/* Quotes */}
          {prof.recentQuotes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-[#8b9aad]">💬 What students say</p>
              {prof.recentQuotes.map((q, i) => (
                <div key={i} className="bg-[#0a0e14] rounded-lg px-3 py-2 text-[#c8d4e0] text-sm italic">
                  &quot;{q}&quot;
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProfessorSearch({ studentProfile }: { studentProfile: OnboardingData | null }) {
  const [courseCode, setCourseCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ProfessorData | null>(null)
  const [error, setError] = useState('')

  async function search() {
    if (!courseCode.trim()) return
    setLoading(true)
    setError('')
    setData(null)
    try {
      const res = await fetch('/api/professor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseCode: courseCode.toUpperCase(), studentProfile }),
      })
      const json = await res.json()
      if (json.error) setError(json.error)
      else setData(json)
    } catch {
      setError('Failed to load professor data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-1">👨‍🏫 Professor Lens</h2>
      <p className="text-sm text-[#8b9aad] mb-4">Enter a course code to get AI-powered professor analysis based on RMP, Reddit, and enrollment trends</p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={courseCode}
          onChange={e => setCourseCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="e.g. MAT237, STA238, CSC311"
          className="flex-1 px-4 py-2.5 rounded-lg bg-[#0a0e14] border border-[#1e2a3a] text-white placeholder-[#6b7a8d] focus:outline-none focus:ring-2 focus:ring-[#0066CC] uppercase"
        />
        <button
          type="button"
          onClick={search}
          disabled={loading || !courseCode.trim()}
          className="px-5 py-2.5 rounded-lg bg-[#0066CC] text-white font-medium hover:bg-[#0080e6] disabled:opacity-50 transition-all"
        >
          {loading ? '...' : 'Analyze'}
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          <p className="text-[#8b9aad] text-sm animate-pulse">🔍 Searching RMP, Reddit r/UofT, and enrollment data...</p>
          {[1, 2].map(i => <div key={i} className="h-16 bg-[#0a0e14] rounded-xl animate-pulse" />)}
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">{data.courseCode} — {data.courseName}</h3>
              <p className="text-xs text-[#8b9aad]">{data.professors.length} professors analyzed</p>
            </div>
          </div>

          {/* Recommendation banner */}
          {data.recommendedFor && (
            <div className="bg-[#002A5C]/40 border border-[#0066CC]/50 rounded-xl p-4">
              <p className="text-[#0066CC] text-xs font-semibold mb-1">🎯 RECOMMENDED FOR YOU</p>
              <p className="text-white font-medium">{data.recommendedFor}</p>
              <p className="text-[#c8d4e0] text-sm mt-1">{data.recommendationReason}</p>
            </div>
          )}

          {/* Professor cards */}
          <div className="space-y-3">
            {data.professors.map(prof => (
              <ProfessorCard
                key={prof.name}
                prof={prof}
                isRecommended={prof.name === data.recommendedFor}
                studentProfile={studentProfile}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
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
      .then(res => res.json())
      .then(json => {
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
          <Link href="/dashboard" className="text-lg font-bold text-white">UofT AI Assistant</Link>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1e2a3a] hover:bg-[#243040] transition-all text-sm text-white">
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
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium">
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
              <h1 className="text-2xl font-bold text-white mb-2">Welcome back, {profile?.name ?? 'Student'}!</h1>
              {loading && <p className="text-[#8b9aad] animate-pulse">🤖 Searching UofT calendar and generating your personalized plan...</p>}
              {!loading && welcomeMessage && <p className="text-[#c8d4e0] leading-relaxed">{welcomeMessage}</p>}
              {!loading && !welcomeMessage && <p className="text-[#8b9aad]">Here&apos;s your dashboard.</p>}
            </section>

            {/* Degree Progress */}
            {degreeProgress && (
              <section className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">📋 Degree Progress</h2>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1 h-3 bg-[#0a0e14] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#0066CC] to-[#00aaff] rounded-full transition-all duration-1000"
                      style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="text-white font-bold text-sm whitespace-nowrap">
                    {degreeProgress.completedCredits} / {degreeProgress.requiredCredits} credits
                  </span>
                </div>
                <p className="text-[#8b9aad] text-sm mb-3">🎯 {degreeProgress.nextMilestone}</p>
                {degreeProgress.remainingRequired.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {degreeProgress.remainingRequired.slice(0, 10).map(c => (
                      <span key={c} className="px-2 py-1 rounded-md bg-[#002A5C]/50 border border-[#0066CC]/30 text-[#c8d4e0] text-xs font-mono">
                        {c}
                      </span>
                    ))}
                    {degreeProgress.remainingRequired.length > 10 && (
                      <span className="px-2 py-1 text-[#8b9aad] text-xs">+{degreeProgress.remainingRequired.length - 10} more</span>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Course Plan */}
            {(courseSchedule.length > 0 || loading) && (
              <section className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-1">📅 Your Course Plan</h2>
                <p className="text-xs text-[#8b9aad] mb-4">AI-generated from UofT calendar + your profile. No specific sections — those open later.</p>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-[#0a0e14] rounded-xl animate-pulse" />)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {courseSchedule.map((sem, i) => (
                      <div key={i} className="border border-[#1e2a3a] rounded-xl overflow-hidden">
                        <button type="button" onClick={() => toggleSemester(i)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-[#0a0e14] hover:bg-[#0f1520] transition-all">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-[#0066CC] flex items-center justify-center text-white text-xs font-bold">{i + 1}</span>
                            <span className="text-white font-medium">{sem.semester}</span>
                            <span className="text-[#8b9aad] text-xs">{sem.courses.length} courses</span>
                          </div>
                          <span className="text-[#8b9aad] text-sm">{expandedSemesters.has(i) ? '▲' : '▼'}</span>
                        </button>
                        {expandedSemesters.has(i) && (
                          <div className="divide-y divide-[#1e2a3a]">
                            {sem.courses.map((course, j) => (
                              <div key={j} className="px-4 py-3 flex items-start gap-3">
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="px-2 py-0.5 rounded bg-[#002A5C] text-[#0099ff] text-xs font-mono font-bold">
                                    {course.code}
                                  </span>
                                  {course.type === 'required' && (
                                    <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">req</span>
                                  )}
                                </div>
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
                )}
              </section>
            )}

            {/* Professor Lens */}
            <ProfessorSearch studentProfile={profile} />

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
