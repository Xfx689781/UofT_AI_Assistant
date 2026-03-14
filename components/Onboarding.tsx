'use client'

import { useState } from 'react'

export interface OnboardingData {
  name: string
  program: string
  year: string
  coursesCompleted: string
  learningStyle: string
  goals: string
}

const STORAGE_KEY = 'uoft-ai-onboarding'

const STEPS = [
  {
    id: 'name',
    question: "What's your name?",
    placeholder: 'e.g. Alex',
    field: 'name' as keyof OnboardingData,
  },
  {
    id: 'program',
    question: 'What program are you in?',
    placeholder: 'e.g. Computer Science, Mathematics, Life Sciences',
    field: 'program' as keyof OnboardingData,
  },
  {
    id: 'year',
    question: 'What year are you in?',
    placeholder: '1, 2, 3, 4, or 4+',
    field: 'year' as keyof OnboardingData,
  },
  {
    id: 'courses',
    question: 'What courses have you completed? (comma-separated or list)',
    placeholder: 'e.g. MAT135, MAT136, CSC108',
    field: 'coursesCompleted' as keyof OnboardingData,
  },
  {
    id: 'learning',
    question: "What's your learning style?",
    options: ['Visual', 'Lecture', 'Self-study', 'Mixed'],
    field: 'learningStyle' as keyof OnboardingData,
  },
  {
    id: 'goals',
    question: "What are your goals?",
    options: ['Grad school', 'Industry', 'Undecided'],
    field: 'goals' as keyof OnboardingData,
  },
]

const defaultData: OnboardingData = {
  name: '',
  program: '',
  year: '',
  coursesCompleted: '',
  learningStyle: '',
  goals: '',
}

export function saveOnboardingData(data: OnboardingData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

export function getOnboardingData(): OnboardingData | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as OnboardingData
  } catch {
    return null
  }
}

interface OnboardingProps {
  onComplete: () => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(defaultData)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const canProceed =
    current.options
      ? (current.field && data[current.field])
      : (current.field && String(data[current.field] || '').trim())

  const handleNext = () => {
    if (isLast) {
      saveOnboardingData(data)
      onComplete()
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => setStep((s) => Math.max(0, s - 1))

  const update = (value: string) => {
    if (current.field) {
      setData((d) => ({ ...d, [current.field]: value }))
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e14] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">UofT AI Assistant</h1>
          <p className="text-[#8b9aad] text-sm">
            Step {step + 1} of {STEPS.length}
          </p>
          <div className="mt-3 h-1.5 bg-[#121922] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0066CC] rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">{current.question}</h2>

          {current.options ? (
            <div className="space-y-2">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => update(opt)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    data[current.field as keyof OnboardingData] === opt
                      ? 'border-[#0066CC] bg-[#002A5C]/40 text-white'
                      : 'border-[#1e2a3a] text-[#e8ecf1] hover:border-[#0066CC]/60 hover:bg-[#002A5C]/20'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={data[current.field as keyof OnboardingData] as string}
              onChange={(e) => update(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canProceed && handleNext()}
              placeholder={current.placeholder}
              className="w-full px-4 py-3 rounded-lg bg-[#0a0e14] border border-[#1e2a3a] text-white placeholder-[#6b7a8d] focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
              autoFocus
            />
          )}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 0}
              className="px-4 py-2 rounded-lg text-[#8b9aad] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed}
              className="px-6 py-2 rounded-lg bg-[#0066CC] text-white font-medium hover:bg-[#0080e6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-[#6b7a8d] text-sm">
          Your answers are stored locally and help personalize recommendations.
        </p>
      </div>
    </div>
  )
}
