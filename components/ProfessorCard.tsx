'use client'

import Link from 'next/link'
import type { Professor } from '@/lib/data'

interface ProfessorCardProps {
  professor: Professor
}

export default function ProfessorCard({ professor }: ProfessorCardProps) {
  const avgRating =
    professor.yearlyRatings.length > 0
      ? (
          professor.yearlyRatings.reduce((s, r) => s + r.overall, 0) /
          professor.yearlyRatings.length
        ).toFixed(1)
      : '—'

  return (
    <Link
      href={`/professor/${professor.slug}`}
      className="block bg-[#121922] border border-[#1e2a3a] rounded-xl p-5 hover:border-[#0066CC]/60 hover:bg-[#121922]/90 transition-all group"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-white group-hover:text-[#0066CC] transition-colors">
          {professor.name}
        </h3>
        <span className="text-sm font-medium text-[#FFD700] bg-[#002A5C]/50 px-2 py-0.5 rounded">
          {avgRating}/5
        </span>
      </div>
      <p className="text-sm text-[#8b9aad] mb-3">{professor.department}</p>
      <div className="flex flex-wrap gap-1.5">
        {professor.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded bg-[#002A5C]/40 text-[#8b9aad]"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  )
}
