'use client'

import { useRouter } from 'next/navigation'

export default function SignupIntroPage() {
  const router = useRouter()

  const handleSelect = (path: 'first' | 'second+') => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('uoft-ai-auth-path', path)
      } catch {
        // ignore
      }
    }
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#0066CC33,_transparent_60%),radial-gradient(circle_at_bottom,_#002A5C55,_transparent_55%)] pointer-events-none" />
      <div className="relative z-10 w-full max-w-3xl bg-[#050811]/80 border border-[#1e2a3a] rounded-2xl p-8 md:p-10 shadow-[0_0_60px_rgba(0,0,0,0.7)]">
        <div className="mb-6">
          <p className="text-xs text-[#8b9aad] mb-1">Sign Up</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Welcome to UofT AI Assistant
          </h1>
          <p className="text-sm text-[#c8d4e0] mt-2">
            Are you a first-year student still exploring, or already in a Program of Study (POSt)?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <button
            type="button"
            onClick={() => handleSelect('first')}
            className="text-left p-6 rounded-xl border-2 border-[#1e2a3a] bg-[#0a0e14]/70 hover:border-[#0066CC]/80 hover:bg-[#002A5C]/40 transition-all duration-200 shadow-sm hover:shadow-[#0066CC]/20"
          >
            <span className="text-sm uppercase tracking-wide text-[#6b7a8d] mb-2 block">
              First Year Path
            </span>
            <span className="text-xl font-semibold text-white block mb-1">
              First Year Student
            </span>
            <span className="text-sm text-[#8b9aad]">
              I haven&apos;t chosen my Program of Study (POSt) yet.
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect('second+')}
            className="text-left p-6 rounded-xl border-2 border-[#1e2a3a] bg-[#0a0e14]/70 hover:border-[#0066CC]/80 hover:bg-[#002A5C]/40 transition-all duration-200 shadow-sm hover:shadow-[#0066CC]/20"
          >
            <span className="text-sm uppercase tracking-wide text-[#6b7a8d] mb-2 block">
              Upper Year Path
            </span>
            <span className="text-xl font-semibold text-white block mb-1">
              Second Year or Above
            </span>
            <span className="text-sm text-[#8b9aad]">
              I&apos;m already enrolled in a POSt.
            </span>
          </button>
        </div>

        <p className="mt-6 text-xs text-[#6b7a8d]">
          Next, you&apos;ll answer a few quick questions so the assistant can tailor advice to your program,
          courses, and goals.
        </p>
      </div>
    </div>
  )
}

