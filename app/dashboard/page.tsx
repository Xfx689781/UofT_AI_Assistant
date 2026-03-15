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

  // 1. 挂载阶段：获取本地存储的用户画像
  useEffect(() => {
    setMounted(true)
    const data = getOnboardingData()
    
    // 如果没有画像数据，强制跳回首页进行 onboarding
    if (!data || !data.name || !data.learningStyle) {
      router.replace('/')
      return
    }
    setProfile(data)
  }, [router])

  // 2. 数据请求阶段：获取欢迎词和个性化建议
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
      .catch(err => console.error("Dashboard fetch error:", err))
      .finally(() => setLoading(false))
  }, [profile])

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

  // 防止 Hydration 错误
  if (!mounted) return null

  const displayProgram = profile ? getDisplayProgram(profile) : ''
  const progressPct = degreeProgress
    ? Math.round((degreeProgress.completedCredits / degreeProgress.requiredCredits) * 100)
    : 0

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      {/* 顶部导航栏 */}
      <header className="border-b border-[#1e2a3a] bg-[#121922]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-lg font-bold text-white tracking-tight">
            UofT <span className="text-[#0066CC]">AI</span> Assistant
          </Link>
          
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1e2a3a] hover:bg-[#243040] transition-all text-sm text-white"
            >
              <div className="w-7 h-7 rounded-full bg-[#0066CC] flex items-center justify-center text-white font-bold text-xs">
                {profile?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <span className="hidden sm:inline">{profile?.name ?? 'Student'}</span>
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
          
          {/* 左侧主内容区域 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 欢迎卡片 */}
            <section className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-white mb-2">
                {'Welcome back, ' + (profile?.name ?? 'Student') + '!'}
              </h1>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-[#1e2a3a] rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-[#1e2a3a] rounded w-1/2 animate-pulse" />
                </div>
              ) : (
                <p className="text-[#c8d4e0] leading-relaxed">
                  {welcomeMessage || "Ready to plan your next semester at UofT?"}
                </p>
              )}
            </section>

            {/* 学位进度条 */}
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
                  <span className="text-white font-bold text-sm">
                    {progressPct}%
                  </span>
                </div>
                <p className="text-[#8b9aad] text-sm mb-4">{degreeProgress.nextMilestone}</p>
                <div className="flex flex-wrap gap-2">
                  {degreeProgress.remainingRequired.map(c => (
                    <span key={c} className="px-2 py-1 rounded bg-[#002A5C]/30 border border-[#0066CC]/20 text-[#c8d4e0] text-xs font-mono">
                      {c}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* 课程建议列表 */}
            <section className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Recommended Courses</h2>
                <p className="text-sm text-[#8b9aad]">Tailored to your {profile?.learningStyle} learning style</p>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[#1e2a3a] rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {courseRecommendations.map((course, idx) => (
                    <div key={idx} className="border border-[#1e2a3a] rounded-xl p-4 hover:border-[#0066CC]/50 transition-colors bg-[#0a0e14]/30">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-[#0066CC] font-mono font-bold">{course.code}</span>
                          <h3 className="text-white font-medium">{course.name}</h3>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          course.difficulty === 'hard' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                        }`}>
                          {course.difficulty.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[#8b9aad] text-sm leading-relaxed">{course.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 教授搜索组件 */}
            <ProfessorSearch studentProfile={profile} />
          </div>

          {/* 右侧固定聊天区域 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 h-[calc(100vh-8rem)] min-h-[500px]">
              {/* 关键修复：关联 profile */}
              <Chat studentProfile={profile} />
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
