'use client'

import { useState } from 'react'
import type { OnboardingData } from '@/components/Onboarding'

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
  matchScore: number
  rmpRating: number
  rmpDifficulty: number
  numRatings: number
  hasResearch: boolean
  researchArea: string
  teachingResearchAlignment: string
  dimensions: ProfessorDimensions
  teachingStyleAnalysis: string
  studentCompatibility: string
  examStyle: string
  bestFor: string
  warnings: string
  tags: string[]
  recentQuotes: string[]
  enrollmentTrend: string
}

interface ProfessorData {
  courseCode: string
  courseName: string
  professors: Professor[]
  recommendedFor: string
  recommendationReason: string
  studentLearningAnalysis: string
}

function MatchScore({ score }: { score: number }) {
  const color = score >= 85 ? '#22c55e' : score >= 70 ? '#0066CC' : '#f59e0b'
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e2a3a" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${score} 100`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
          {Math.round(score)}%
        </span>
      </div>
      <div>
        <p className="text-xs text-[#8b9aad]">Match</p>
        <p className="text-sm font-semibold" style={{ color }}>
          {score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Fair'}
        </p>
      </div>
    </div>
  )
}

function DimensionBar({ label, value }: { label: string; value: number }) {
  const color = value >= 7 ? '#22c55e' : value >= 5 ? '#0066CC' : '#ef4444'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#8b9aad] w-36 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#0a0e14] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value * 10}%`, background: color }} />
      </div>
      <span className="text-xs text-white w-4 text-right">{value}</span>
    </div>
  )
}

function ProfessorCard({ prof, isRecommended }: {
  prof: Professor
  isRecommended: boolean
}) {
  const [expanded, setExpanded] = useState(isRecommended)

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      isRecommended ? 'border-[#0066CC] bg-[#002A5C]/20' : 'border-[#1e2a3a] bg-[#121922]'
    }`}>
      <button type="button" onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#0066CC]/20 flex items-center justify-center text-white font-bold text-sm">
            {prof.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white font-medium">{prof.name}</p>
              {isRecommended && (
                <span className="px-2 py-0.5 rounded-full bg-[#0066CC] text-white text-xs font-bold">★ Best for you</span>
              )}
              {prof.hasResearch && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs">🔬 Research Active</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="text-xs text-[#8b9aad]">RMP {prof.rmpRating}/5</span>
              <span className="text-xs text-[#8b9aad]">Difficulty {prof.rmpDifficulty}/5</span>
              <span className="text-xs text-[#8b9aad]">({prof.numRatings} ratings)</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MatchScore score={prof.matchScore || 0} />
          <span className="text-[#8b9aad]">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-5 space-y-4 border-t border-[#1e2a3a]">
          <div className="pt-4 bg-[#002A5C]/20 border border-[#0066CC]/20 rounded-lg p-3">
            <p className="text-xs text-[#0066CC] font-semibold mb-1">🎯 Compatibility with your profile</p>
            <p className="text-[#c8d4e0] text-sm">{prof.studentCompatibility}</p>
          </div>

          {prof.hasResearch && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <p className="text-xs text-purple-400 font-semibold mb-1">🔬 Research Background</p>
              <p className="text-white text-sm font-medium">{prof.researchArea}</p>
              <p className="text-[#8b9aad] text-xs mt-1">{prof.teachingResearchAlignment}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-[#8b9aad] font-semibold uppercase tracking-wide">Performance Metrics</p>
            <DimensionBar label="Teaching Clarity" value={prof.dimensions.teachingClarity} />
            <DimensionBar label="Exam Predictability" value={prof.dimensions.examPredictability} />
            <DimensionBar label="Accessibility" value={prof.dimensions.accessibility} />
            <DimensionBar label="Grading Fairness" value={prof.dimensions.gradingFairness} />
            <DimensionBar label="Workload" value={prof.dimensions.workload} />
            <DimensionBar label="Engagement" value={prof.dimensions.engagement} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#0a0e14] rounded-lg p-3">
              <p className="text-xs text-[#8b9aad] mb-1">🎓 Teaching Style</p>
              <p className="text-white text-sm">{prof.teachingStyleAnalysis}</p>
            </div>
            <div className="bg-[#0a0e14] rounded-lg p-3">
              <p className="text-xs text-[#8b9aad] mb-1">📝 Exam Style</p>
              <p className="text-white text-sm">{prof.examStyle}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {prof.tags.map(tag => (
              <span key={tag} className="px-2 py-1 rounded-full bg-[#1e2a3a] text-[#8b9aad] text-xs">{tag}</span>
            ))}
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <p className="text-xs text-green-400 mb-1">✅ Best For</p>
            <p className="text-white text-sm">{prof.bestFor}</p>
          </div>

          {prof.warnings && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-xs text-yellow-400 mb-1">⚠️ Heads Up</p>
              <p className="text-[#c8d4e0] text-sm">{prof.warnings}</p>
            </div>
          )}

          {prof.recentQuotes?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-[#8b9aad] font-semibold">💬 What students say</p>
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

export function ProfessorSearch({ studentProfile }: { studentProfile: OnboardingData | null }) {
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
      <p className="text-sm text-[#8b9aad] mb-4">
        AI-powered analysis using real RMP data, Reddit r/UofT, and your learning profile
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={courseCode}
          onChange={e => setCourseCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="e.g. MAT237, STA238, CSC311"
          className="flex-1 px-4 py-2.5 rounded-lg bg-[#0a0e14] border border-[#1e2a3a] text-white placeholder-[#6b7a8d] focus:outline-none focus:ring-2 focus:ring-[#0066CC] uppercase"
        />
        <button type="button" onClick={search} disabled={loading || !courseCode.trim()}
          className="px-5 py-2.5 rounded-lg bg-[#0066CC] text-white font-medium hover:bg-[#0080e6] disabled:opacity-50 transition-all">
          {loading ? '...' : 'Analyze'}
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          <p className="text-[#8b9aad] text-sm animate-pulse">
            🔍 Searching RMP, Reddit r/UofT, and UofT timetable...
          </p>
          {[1, 2].map(i => <div key={i} className="h-20 bg-[#0a0e14] rounded-xl animate-pulse" />)}
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {data && (
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-semibold text-lg">{data.courseCode} — {data.courseName}</h3>
            <p className="text-xs text-[#8b9aad]">{data.professors.length} professors analyzed</p>
          </div>

          {data.studentLearningAnalysis && (
            <div className="bg-[#1e2a3a]/50 border border-[#1e2a3a] rounded-xl p-4">
              <p className="text-xs text-[#0066CC] font-semibold mb-1">🧠 Your Learning Profile Analysis</p>
              <p className="text-[#c8d4e0] text-sm">{data.studentLearningAnalysis}</p>
            </div>
          )}

          {data.recommendedFor && (
            <div className="bg-[#002A5C]/40 border border-[#0066CC]/50 rounded-xl p-4">
              <p className="text-[#0066CC] text-xs font-semibold mb-1">🎯 RECOMMENDED FOR YOU</p>
              <p className="text-white font-medium text-lg">{data.recommendedFor}</p>
              <p className="text-[#c8d4e0] text-sm mt-1">{data.recommendationReason}</p>
            </div>
          )}

          <div className="space-y-3">
            {[...data.professors]
              .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
              .map(prof => (
                <ProfessorCard
                  key={prof.name}
                  prof={prof}
                  isRecommended={prof.name === data.recommendedFor}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
