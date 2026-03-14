'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Onboarding, { getOnboardingData } from '@/components/Onboarding'

export default function OnboardingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleComplete = () => {
    router.push('/dashboard')
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="animate-pulse text-[#8b9aad]">Loading...</div>
      </div>
    )
  }

  const existing = getOnboardingData()
  if (existing?.name && existing?.learningStyle) {
    router.replace('/dashboard')
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="text-[#8b9aad]">Redirecting to dashboard...</div>
      </div>
    )
  }

  return <Onboarding onComplete={handleComplete} />
}

