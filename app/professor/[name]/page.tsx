'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import RadarChart, { type RadarDataPoint } from '@/components/RadarChart'
import type { Professor } from '@/lib/data'

export default function ProfessorPage() {
  const params = useParams()
  const name = params.name as string
  const [professor, setProfessor] = useState<Professor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!name) return
    fetch(`/api/professor?slug=${encodeURIComponent(name)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setProfessor(data)
        if (!data) setLoading(false)
      })
      .catch(() => setProfessor(null))
      .finally(() => setLoading(false))
  }, [name])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="animate-pulse text-[#8b9aad]">Loading professor...</div>
      </div>
    )
  }

  if (!professor) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex flex-col items-center justify-center gap-4">
        <p className="text-[#8b9aad]">Professor not found.</p>
        <Link
          href="/dashboard"
          className="text-[#0066CC] hover:underline"
        >
          Back to dashboard
        </Link>
      </div>
    )
  }

  const radarData: RadarDataPoint[] = [
    { subject: 'Teaching Clarity', value: professor.radar.teachingClarity, fullMark: 5 },
    { subject: 'Exam Difficulty', value: professor.radar.examDifficulty, fullMark: 5 },
    { subject: 'Workload', value: professor.radar.workload, fullMark: 5 },
    { subject: 'Accessibility', value: professor.radar.accessibility, fullMark: 5 },
    { subject: 'Grading Fairness', value: professor.radar.gradingFairness, fullMark: 5 },
    { subject: 'Course Engagement', value: professor.radar.courseEngagement, fullMark: 5 },
  ]

  const trendData = professor.yearlyRatings.map((r) => ({
    year: String(r.year),
    Overall: r.overall,
    'Teaching Clarity': r.teachingClarity,
    'Grading Fairness': r.gradingFairness,
    'Course Engagement': r.courseEngagement,
  }))

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <header className="border-b border-[#1e2a3a] bg-[#121922]/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-[#8b9aad] hover:text-white transition-colors"
          >
            ← Dashboard
          </Link>
          <span className="text-[#1e2a3a]">|</span>
          <h1 className="text-lg font-bold text-white">UofT AI Assistant</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-1">{professor.name}</h1>
          <p className="text-[#8b9aad] mb-4">{professor.department}</p>
          <div className="flex flex-wrap gap-2">
            {professor.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm px-3 py-1 rounded-full bg-[#002A5C]/50 text-[#FFD700] border border-[#0066CC]/30"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Rating dimensions</h2>
          <RadarChart data={radarData} color="#0066CC" />
          <p className="text-xs text-[#6b7a8d] mt-2">
            Higher values are better except &quot;Exam Difficulty&quot; (higher = harder).
          </p>
        </section>

        <section className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Historical trend (2022–2025)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
                <XAxis dataKey="year" tick={{ fill: '#8b9aad', fontSize: 12 }} />
                <YAxis domain={[0, 5]} tick={{ fill: '#8b9aad', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121922',
                    border: '1px solid #1e2a3a',
                    borderRadius: '8px',
                    color: '#e8ecf1',
                  }}
                  labelStyle={{ color: '#8b9aad' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => <span className="text-[#8b9aad]">{value}</span>}
                />
                <Line type="monotone" dataKey="Overall" stroke="#FFD700" strokeWidth={2} dot={{ fill: '#FFD700' }} />
                <Line type="monotone" dataKey="Teaching Clarity" stroke="#0066CC" strokeWidth={1.5} dot={{ fill: '#0066CC' }} />
                <Line type="monotone" dataKey="Grading Fairness" stroke="#22c55e" strokeWidth={1.5} dot={{ fill: '#22c55e' }} />
                <Line type="monotone" dataKey="Course Engagement" stroke="#a855f7" strokeWidth={1.5} dot={{ fill: '#a855f7' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-2">AI prediction for next year</h2>
          <p className="text-[#e8ecf1] leading-relaxed">{professor.prediction}</p>
        </section>

        <section className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Sample student quotes</h2>
          <ul className="space-y-3">
            {professor.quotes.map((quote, i) => (
              <li
                key={i}
                className="pl-4 border-l-2 border-[#0066CC]/50 text-[#c8d4e0] text-sm italic"
              >
                &quot;{quote}&quot;
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
