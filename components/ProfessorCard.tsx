'use client'

import { useState } from 'react'
import type { OnboardingData } from '@/components/Onboarding'

interface RadarData {
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
  radarData: RadarData
  teachingStyleAnalysis: string
  studentCompatibility: string
  examStyle: string
  bestFor: string
  warnings: string
  tags: string[]
  recentQuotes: string[]
  yearsTaught: string[]
}

interface ProfessorData {
  courseCode: string
  courseName: string
  professors: Professor[]
  recommendedFor: string
  recommendationReason: string
  studentLearningAnalysis: string
  isHistorical: boolean
  historicalNote: string
}

// Radar chart using SVG
function RadarChart({ data, matchScore }: { data: RadarData; matchScore: number }) {
  const dimensions = [
    { key: 'teachingClarity', label: 'Clarity' },
    { key: 'examPredictability', label: 'Exam Predict.' },
    { key: 'accessibility', label: 'Access.' },
    { key: 'gradingFairness', label: 'Fairness' },
    { key: 'workload', label: 'Workload' },
    { key: 'engagement', label: 'Engagement' },
  ]

  const size = 180
  const center = size / 2
  const maxRadius = 65
  const levels = 5
  const angleStep = (2 * Math.PI) / dimensions.length

  function getPoint(index: number, value: number) {
    const angle = index * angleStep - Math.PI / 2
    const radius = (value / 10) * maxRadius
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  }

  function getLabelPoint(index: number) {
    const angle = index * angleStep - Math.PI / 2
    const radius = maxRadius + 20
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  }

  // Grid lines
  const gridLines = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * maxRadius
    const points = dimensions.map((_, idx) => {
      const angle = idx * angleStep - Math.PI / 2
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`
    })
    return points.join(' ')
  })

  // Data polygon
  const dataPoints = dimensions.map((dim, i) =>
    getPoint(i, data[dim.key as keyof RadarData])
  )
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'

  const matchColor = matchScore >= 85 ? '#22c55e' : matchScore >= 70 ? '#0066CC' : '#f59e0b'

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid */}
        {gridLines.map((pts, i) => (
          <polygon key={i} points={pts} fill="none" stroke="#1e2a3a" strokeWidth="1" />
        ))}
        {/* Axis lines */}
        {dimensions.map((_, i) => {
          const end = getPoint(i, 10)
          return <line key={i} x1={center} y1={center} x2={end.x} y2={end.y} stroke="#1e2a3a" strokeWidth="1" />
        })}
        {/* Data polygon */}
        <path d={dataPath} fill={`${matchColor}22`} stroke={matchColor} strokeWidth="2" />
        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={matchColor} />
        ))}
        {/* Labels */}
        {dimensions.map((dim, i) => {
          const lp = getLabelPoint(i)
          return (
            <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fill="#8b9aad">
              {dim.label}
            </text>
          )
        })}
      </svg>

      {/* Match score circle */}
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e2a3a" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={matchColor} strokeWidth="3"
              strokeDasharray={`${matchScore} 100`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
            {Math.round(matchScore)}%
          </span>
        </div>
        <p className="text-xs mt-1 font-semibold" style={{ color: matchColor }}>
          {matchScore >= 85 ? 'Excellent Match' : matchScore >= 70 ? 'Good Match' : 'Fair Match'}
        </p>
      </div>
    </div>
  )
}

function ProfessorCard({ prof, isRecommended, rank }: {
  prof: Professor
  isRecommended: boolean
  rank: number
}) {
  const [expanded, setExpanded] = useState(isRecommended)
  const radarData = prof.radarData || {
    teachingClarity: 5, examPredictability: 5, accessibility: 5,
    gradingFairness: 5, workload: 5, engagement: 5,
  }

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      isRecommended ? 'border-[#0066CC] bg-[#002A5C]/20' : 'border-[#1e2a3a] bg-[#121922]'
    }`}>
      <button type="button" onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-all">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
              style={{ background: rank === 1 ? '#FFD700' : '#6b7a8d' }}>
              #{rank}
            </div>
          </div>
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
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs">🔬 Research</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="text-xs text-[#8b9aad]">RMP {prof.rmpRating}/5</span>
              <span className="text-xs text-[#8b9aad]">Diff {prof.rmpDifficulty}/5</span>
              {prof.yearsTaught?.length > 0 && (
                <span className="text-xs text-[#8b9aad]">Taught: {prof.yearsTaught.join(', ')}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-2xl font-bold" style={{
              color: prof.matchScore >= 85 ? '#22c55e' : prof.matchScore >= 70 ? '#0066CC' : '#f59e0b'
            }}>
              {Math.round(prof.matchScore || 0)}%
            </p>
            <p className="text-xs text-[#8b9aad]">match</p>
          </div>
          <span className="text-[#8b9aad] ml-2">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-5 border-t border-[#1e2a3a]">
          {/* Radar chart + compatibility */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="flex justify-center">
              <RadarChart data={radarData} matchScore={prof.matchScore || 0} />
            </div>
            <div className="flex-1 space-y-3">
              <div className="bg-[#002A5C]/20 border border-[#0066CC]/20 rounded-lg p-3">
                <p className="text-xs text-[#0066CC] font-semibold mb-1">🎯 Why this match?</p>
                <p className="text-[#c8d4e0] text-sm">{prof.studentCompatibility}</p>
              </div>

              {prof.hasResearch && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                  <p className="text-xs text-purple-400 font-semibold mb-1">🔬 Research</p>
                  <p className="text-white text-sm">{prof.researchArea}</p>
                  <p className="text-[#8b9aad] text-xs mt-1">{prof.teachingResearchAlignment}</p>
                </div>
              )}
            </div>
          </div>

          {/* Teaching & Exam */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="bg-[#0a0e14] rounded-lg p-3">
              <p className="text-xs text-[#8b9aad] mb-1">🎓 Teaching Style</p>
              <p className="text-white text-sm">{prof.teachingStyleAnalysis}</p>
            </div>
            <div className="bg-[#0a0e14] rounded-lg p-3">
              <p className="text-xs text-[#8b9aad] mb-1">📝 Exam Style</p>
              <p className="text-white text-sm">{prof.examStyle}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {prof.tags?.map(tag => (
              <span key={tag} className="px-2 py-1 rounded-full bg-[#1e2a3a] text-[#8b9aad] text-xs">{tag}</span>
            ))}
          </div>

          {/* Best for */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mt-3">
            <p className="text-xs text-green-400 mb-1">✅ Best For</p>
            <p className="text-white text-sm">{prof.bestFor}</p>
          </div>

          {/* Warning */}
          {prof.warnings && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-3">
              <p className="text-xs text-yellow-400 mb-1">⚠️ Heads Up</p>
              <p className="text-[#c8d4e0] text-sm">{prof.warnings}</p>
            </div>
          )}

          {/* Quotes */}
          {prof.recentQuotes?.length > 0 && (
            <div className="space-y-2 mt-3">
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

export function ProfessorSearch({
  studentProfile,
  allowedCourses,
}: {
  studentProfile: OnboardingData | null
  allowedCourses: string[]
}) {
  const [selectedCourse, setSelectedCourse] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ProfessorData | null>(null)
  const [error, setError] = useState('')

  async function search(code: string) {
    if (!code) return
    setSelectedCourse(code)
    setLoading(true)
    setError('')
    setData(null)
    try {
      const res = await fetch('/api/professor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseCode: code, studentProfile }),
      })
      const json = await res.json()
      if (json.error) setError(json.error)
      else setData(json)
    } catch {
      setError('Failed to load professor data')
    }
