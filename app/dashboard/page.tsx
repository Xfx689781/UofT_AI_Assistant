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
  const allCourseCodes = courseRecommendations.map(c => c.code)
  void allCourseCodes

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
              <span className="text-[#8b9aad]">▾</span>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-[#1a2332] border border-[#1e2a3a] rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#1e2a3a]">
                    <p className="text-white font-semibold">{profile?.name}</
