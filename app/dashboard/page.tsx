'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getOnboardingData, type OnboardingData } from '@/components/Onboarding'
import Chat from '@/components/Chat'

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

function DimensionBar({ label, value }: { label: string; value: number }) {
  const getColor = (v: number) => {
    if (v >= 8) return '#22c55e'
    if (v >= 5) return '#0066CC' 
    return '#ef4444' 
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#8b9aad] w-36 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-[#0a0e14] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value * 10}%`, background: getColor(value) }}
        />
      </div>
      <span className="text-xs text-white w-6 text-right font-mono">{value}</span>
    </div>
  )
}

function ProfessorCard({ prof, isRecommended }: { prof: Professor; isRecommended: boolean }) {
  const [expanded, setExpanded] = useState(isRecommended)

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${isRecommended ? 'border-[#0066CC] bg-[#002A5C]/20' : 'border-[#1e2a3a] bg-[#121922]'}`}>
      <button type="button" onClick={() => setExpanded(!expanded)} className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0066CC]/20 flex items-center justify-center text-white font-bold text-sm">
            {prof.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="text-white font-medium">{prof.name}</p>
              {isRecommended && <span className="px-2 py-0.5 rounded-full bg-[#0066CC] text-white text-[10px] font-bold">★ AI RECOMMENDED</span>}
            </div>
            <p className="text-xs text-[#8b9aad] mt-0.5">RMP {prof.rmpRating}/5 • Difficulty {prof.rmpDifficulty}/5</p>
          </div>
        </div>
        <span className="text-[#8b9aad] text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-[#1e2a3a] pt-4">
          <div className="space-y-2">
            {Object.entries(prof.dimensions).map(([k, v]) => (
              <DimensionBar key={k} label={k.replace(/([A-Z])/g, ' $1')} value={v} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[#0a0e14] p-3 rounded-lg"><p className="text-[#8b9aad] text-[10px] uppercase">Exam</p><p className="text-white">{prof.examStyle}</p></div>
            <div className="bg-[#0a0e14] p-3 rounded-lg"><p className="text-[#8b9aad] text-[10px] uppercase">Style</p><p className="text-white">{prof.teachingStyle}</p></div>
          </div>
          <div className="bg-[#002A5C]/30 border border-[#0066CC]/30 rounded-lg p-3">
            <p className="text-[#0066CC] text-[10px] uppercase font-bold mb-1">Best For</p>
            <p className="text-white text-sm">{prof.bestFor}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// --- 搜索组件 ---
function ProfessorSearch({ studentProfile }: { studentProfile: OnboardingData | null }) {
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

  return (
    <div className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">👨‍🏫 AI Professor Lens</h2>
      <div className="flex gap-2 mb-6">
        <input 
          className="flex-1 bg-[#0a0e14] border border-[#1e2a3a] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-[#0066CC] outline-none uppercase"
          placeholder="Enter Course Code (e.g. CSC263)"
          value={courseCode}
          onChange={e => setCourseCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading} className="bg-[#0066CC] px-5 rounded-lg text-white font-medium hover:bg-[#0080e6] transition-colors">
          {loading ? 'Analyzing...' : 'Search'}
        </button>
      </div>

      {loading && <div className="text-sm text-[#8b9aad] animate-pulse">Scanning RMP, Reddit, and Syllabus...</div>}
      {error && <div className="text-sm text-red-400">{error}</div>}
      
      {data && (
        <div className="space-y-4">
          <div className="bg-[#002A5C]/40 border border-[#0066CC]/50 rounded-xl p-4">
            <p className="text-[#0066CC] text-[10px] font-bold uppercase tracking-wider">🎯 Recommended For You</p>
            <p className="text-white font-medium mt-1">{data.recommendedFor}</p>
            <p className="text-[#c8d4e0] text-sm mt-1">{data.recommendationReason}</p>
          </div>
          <div className="space-y-3">
            {data.professors.map(p => <ProfessorCard key={p.name} prof={p} isRecommended={p.name === data.recommendedFor} />)}
          </div>
        </div>
      )}
    </div>
  )
}

// --- Dashboard 主页面代码保持原样结构，只需确保正确导入上述组件 ---
// ... (保留你之前的 return JSX 结构)
