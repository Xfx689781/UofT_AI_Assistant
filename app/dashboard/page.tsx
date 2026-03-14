'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getOnboardingData } from '@/components/Onboarding'
import Chat from '@/components/Chat'
import ProfessorCard from '@/components/ProfessorCard'
import { PROFESSORS } from '@/lib/data'

export default function DashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState('')
  const [program, setProgram] = useState('')

  useEffect(() => {
    setMounted(true)
    const data = getOnboardingData()
    if (!data?.name || !data?.program) {
      router.replace('/')
      return
    }
    setName(data.name)
    setProgram(data.program)
  }, [router])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="animate-pulse text-[#8b9aad]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <header className="border-b border-[#1e2a3a] bg-[#121922]/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-lg font-bold text-white">
            UofT AI Assistant
          </Link>
          <span className="text-sm text-[#8b9aad]">
            {name} · {program}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-6">
              <h1 className="text-2xl font-bold text-white mb-1">
                Welcome back, {name || 'Student'}!
              </h1>
              <p className="text-[#8b9aad]">
                Here’s your dashboard. Use the assistant on the right for course and professor help.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Quick actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  href="/dashboard?action=recommend"
                  className="flex items-center gap-3 p-4 bg-[#121922] border border-[#1e2a3a] rounded-xl hover:border-[#0066CC]/60 hover:bg-[#002A5C]/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0066CC]/20 flex items-center justify-center text-[#0066CC] group-hover:bg-[#0066CC]/30">
                    <span className="text-xl">📚</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Recommend courses</p>
                    <p className="text-sm text-[#8b9aad]">Get personalized suggestions</p>
                  </div>
                </Link>
                <Link
                  href="/dashboard?action=analyze"
                  className="flex items-center gap-3 p-4 bg-[#121922] border border-[#1e2a3a] rounded-xl hover:border-[#0066CC]/60 hover:bg-[#002A5C]/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#FFD700]/20 flex items-center justify-center text-[#FFD700] group-hover:bg-[#FFD700]/30">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Analyze a professor</p>
                    <p className="text-sm text-[#8b9aad]">See ratings & insights</p>
                  </div>
                </Link>
                <Link
                  href="/dashboard?action=progress"
                  className="flex items-center gap-3 p-4 bg-[#121922] border border-[#1e2a3a] rounded-xl hover:border-[#0066CC]/60 hover:bg-[#002A5C]/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0066CC]/20 flex items-center justify-center text-[#0066CC] group-hover:bg-[#0066CC]/30">
                    <span className="text-xl">📋</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Check degree progress</p>
                    <p className="text-sm text-[#8b9aad]">Track your requirements</p>
                  </div>
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Featured professors</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROFESSORS.slice(0, 4).map((p) => (
                  <ProfessorCard key={p.id} professor={p} />
                ))}
              </div>
            </section>
          </div>

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
