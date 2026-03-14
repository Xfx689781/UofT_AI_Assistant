'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// 假设这些导入没问题，请确保路径正确
import { getOnboardingData, type OnboardingData } from '@/components/Onboarding'
import Chat from '@/components/Chat'

/**
 * 为了彻底解决类型报错，我们在这里定义所有的接口
 * 这样可以确保它们在同一个文件中被识别
 */
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

// 注意：这里的组件定义必须是独立的，不要包含在 page 导出函数中
function ProfessorSearch({ studentProfile }: { studentProfile: OnboardingData }) {
  
  const [courseCode, setCourseCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ProfessorData | null>(null)
  const [error, setError] = useState('')

  async function handleSearch() {
    if (!courseCode.trim()) return
    setLoading(true); setError(''); setData(null)
    try {
      const res = await fetch('/api/professor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseCode: courseCode.toUpperCase(), studentProfile }),
      })
      const result = await res.json()
      if (result.error) setError(result.error)
      else setData(result)
    } catch {
      setError('AI service temporarily unreachable.')
    } finally {
      setLoading(false)
    }
  }

  return <div className="p-4 bg-[#121922] rounded-xl border border-[#1e2a3a]">
    <h2 className="text-white">Professor Search</h2>
  </div>
}

/**
 * 这是标准的 Page 组件。
 * 确保它没有任何 props，且直接 export default
 */
export default function DashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<OnboardingData | null>(null)

  useEffect(() => {
    setMounted(true)
    const data = getOnboardingData()
    if (!data?.name) {
      router.replace('/')
    } else {
      setProfile(data)
    }
  }, [router])

  // 如果还没挂载，渲染一个简单的空状态，不要渲染复杂的逻辑
  if (!mounted) {
    return <main className="min-h-screen bg-[#0a0e14] p-8 text-white">Loading...</main>
  }

  // 确保 profile 存在才渲染组件
  return (
    <main className="min-h-screen bg-[#0a0e14] p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
      {profile && <ProfessorSearch studentProfile={profile} />}
    </main>
  )
}
