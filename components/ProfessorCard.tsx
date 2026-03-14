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
  yearsTaught?: string[]
  dataSource?: string
  dataConfidence?: string
  matchBreakdown?: {
    learningStyleFit: number
    goalsFit: number
    practicalFit: number
  }
}

interface ProfessorData {
  courseCode: string
  courseName: string
  professors: Professor[]
  recommendedFor: string
  recommendationReason: string
  studentLearningAnalysis: string
  yearsFound?: string[]
  dataConfidence?: string
}

function RadarChart({ dimensions, matchScore }: { dimensions: ProfessorDimensions; matchScore: number }) {
  const keys = [
    { key: 'teachingClarity', label: 'Clarity' },
    { key: 'examPredictability', label: 'Exam Pred.' },
    { key: 'accessibility', label: 'Access.' },
    { key: 'gradingFairness', label: 'Fairness' },
    { key: 'workload', label: 'Workload' },
    { key: 'engagement', label: 'Engage.' },
  ]
  const size = 180
  const cx = size / 2
  const cy = size / 2
  const maxR = 60
  const angleStep = (2 * Math.PI) / keys.length
  const color = matchScore >= 85 ? '#22c55e' : matchScore >= 70 ? '#0066CC' : '#f59e0b'

  const getXY = (i: number, val: number) => {
    const a = i * angleStep - Math.PI / 2
    const r = (val / 10) * maxR
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }

  const gridLevels = [2, 4, 6, 8, 10]
  const dataPoints = keys.map((k, i) => getXY(i, dimensions[k.key as keyof ProfessorDimensions]))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + 'Z'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLevels.map(lvl => {
        const pts = keys.map((_, i) => {
          const a = i * angleStep - Math.PI / 2
          const r = (lvl / 10) * maxR
          return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
        }).join(' ')
        return <polygon key={lvl} points={pts} fill="none" stroke="#1e2a3a" strokeWidth="1" />
      })}
      {keys.map((_, i) => {
        const end = getXY(i, 10)
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#1e2a3a" strokeWidth="1" />
      })}
      <path d={dataPath} fill={`${color}25`} stroke={color} strokeWidth="2" />
      {dataPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />)}
      {keys.map((k, i) => {
        const a = i * angleStep - Math.PI / 2
        const r = maxR + 18
        return (
          <text key={i}
            x={(cx + r * Math.cos(a)).toFixed(1)}
            y={(cy + r * Math.sin(a)).toFixed(1)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="8.5" fill="#8b9aad">
            {k.label}
          </text>
        )
      })}
    </svg>
  )
}

function MatchCircle({ score }: { score: number }) {
  const color = score >= 85 ? '#22c55e' : score >= 70 ? '#0066CC' : '#f59e0b'
  const label = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Fair'
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e2a3a" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${score} 100`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
          {Math.round(score)}%
        </span>
      </div>
      <p className="text-xs font-semibold" style={{ color }}>{label}</p>
    </div>
  )
}

function ProfessorCard({ prof, isRecommended }: { prof: Professor; isRecommended: boolean }) {
  const [expanded, setExpanded] = useState(isRecommended)

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      isRecommended ? 'border-[#0066CC] bg-[#002A5C]/20' : 'border-[#1e2a3a] bg-[#121922]'
    }`}>
      <button type="button" onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0066CC]/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
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
              {prof.yearsTaught && prof.yearsTaught.length > 0 && (
                <span className="text-xs text-[#8b9aad]">📅 {prof.yearsTaught.join(', ')}</span>
              )}
              {prof.dataSource && (
                <span className="text-xs text-[#6b7a8d]">via {prof.dataSource}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <MatchCircle score={prof.matchScore || 0} />
          <span className="text-[#8b9aad]">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-5 border-t border-[#1e2a3a] space-y-4">
          <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center">
            <RadarChart dimensions={prof.dimensions} matchScore={prof.matchScore || 0} />
            <div className="flex-1 space-y-2 w-full">
              {prof.matchBreakdown && (
                <div className="bg-[#0a0e14] rounded-lg p-3 space-y-2">
                  <p className="text-xs text-[#8b9aad] font-semibold uppercase tracking-wide">Match Breakdown</p>
                  {[
                    { label: 'Learning Style Fit', val: prof.matchBreakdown.learningStyleFit, max: 35 },
                    { label: 'Goals Alignment', val: prof.matchBreakdown.goalsFit, max: 35 },
                    { label: 'Practical Fit', val: prof.matchBreakdown.practicalFit, max: 30 },
                  ].map(({ label, val, max }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-xs text-[#8b9aad] w-32 shrink-0">{label}</span>
                      <div className="flex-1 h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden">
                        <div className="h-full bg-[#0066CC] rounded-full"
                          style={{ width: `${(val / max) * 100}%` }} />
                      </div>
                      <span className="text-xs text-white w-12 text-right">{val}/{max}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#002A5C]/20 border border-[#0066CC]/20 rounded-lg p-3">
            <p className="text-xs text-[#0066CC] font-semibold mb-1">🎯 Why this matches you</p>
            <p className="text-[#c8d4e0] text-sm">{prof.studentCompatibility}</p>
          </div>

          {prof.hasResearch && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <p className="text-xs text-purple-400 font-semibold mb-1">🔬 Research Background</p>
              <p className="text-white text-sm font-medium">{prof.researchArea}</p>
              <p className="text-[#8b9aad] text-xs mt-1">{prof.teachingResearchAlignment}</p>
            </div>
          )}

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
            {prof.tags?.map(tag => (
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
      if (json.notFound) {
        setError(`No recent data found for ${courseCode.toUpperCase()}. Check the course code and try again (e.g. MAT237Y1).`)
      } else if (json.error) {
        setError(json.error)
      } else {
        setData(json)
      }
    } catch {
      setError('Failed to load professor data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-1">👨‍🏫 Professor Lens</h2>
      <p className="text-sm text-[#8b9aad] mb-4">
        AI analysis using RMP, Reddit r/UofT, and your learning profile (2023–2025 data)
      </p>

      <div className="flex gap-2 mb-4">
        <input type="text" value={courseCode}
          onChange={e => setCourseCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="e.g. MAT237Y1, STA238H1, CSC311H1"
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
            🔍 Searching RMP, Reddit r/UofT (2023–2025)...
          </p>
          {[1, 2].map(i => <div key={i} className="h-20 bg-[#0a0e14] rounded-xl animate-pulse" />)}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-semibold text-lg">{data.courseCode} — {data.courseName}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <p className="text-xs text-[#8b9aad]">{data.professors.length} professors analyzed</p>
              {data.yearsFound && data.yearsFound.length > 0 && (
                <span className="text-xs text-[#6b7a8d]">📅 {data.yearsFound.join(', ')}</span>
              )}
              {data.dataConfidence && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  data.dataConfidence === 'high' ? 'bg-green-500/20 text-green-400' :
                  data.dataConfidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {data.dataConfidence} confidence
                </span>
              )}
            </div>
          </div>

          {data.studentLearningAnalysis && (
            <div className="bg-[#1e2a3a]/50 border border-[#1e2a3a] rounded-xl p-4">
              <p className="text-xs text-[#0066CC] font-semibold mb-1">🧠 Your Learning Profile</p>
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
