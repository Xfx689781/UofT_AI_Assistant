'use client'

import { useState, useCallback, useMemo } from 'react'

export interface OnboardingData {
  name: string
  yearType: 'first' | 'second+' | ''
  // First year path
  admissionCategory: string
  coursesTaken: string[]
  interests: string[]
  goalsFirstYear: string
  // Second year+ path
  programCategory: string
  programOfStudy: string
  programOther: string
  coursesCompleted: string[]
  goalsSecondYear: string
  // Final (both)
  learningStyle: string
}

const STORAGE_KEY = 'uoft-ai-onboarding'

// ── Program tree ──────────────────────────────────────────────
const PROGRAM_TREE: { category: string; icon: string; programs: string[] }[] = [
  {
    category: 'Mathematics',
    icon: '∑',
    programs: [
      'Mathematics Specialist',
      'Mathematics Major',
      'Mathematics Minor',
      'Applied Mathematics Specialist',
      'Mathematics & Physics Specialist',
      'Mathematics & Philosophy Specialist',
      'Mathematics & Its Applications Specialist (Teaching)',
      'Mathematics & Its Applications Specialist (Probability/Statistics)',
      'Mathematics & Its Applications Specialist (Physical Science)',
      'Actuarial Science Specialist',
      'Actuarial Science Major',
    ],
  },
  {
    category: 'Statistics & Data Science',
    icon: '📊',
    programs: [
      'Statistical Sciences Specialist',
      'Statistical Sciences Specialist (Theory & Methods)',
      'Data Science Specialist',
      'Statistics Major',
      'Statistics Minor',
    ],
  },
  {
    category: 'Computer Science',
    icon: '💻',
    programs: [
      'Computer Science Specialist',
      'Computer Science Specialist (Artificial Intelligence)',
      'Computer Science Major',
      'Computer Science Minor',
      'Bioinformatics & Computational Biology Specialist',
    ],
  },
  {
    category: 'Physics & Astronomy',
    icon: '🔭',
    programs: [
      'Physics Specialist',
      'Physics Major',
      'Physics Minor',
      'Astronomy & Physics Specialist',
      'Astronomy & Astrophysics Major',
      'Astronomy & Astrophysics Minor',
    ],
  },
  {
    category: 'Chemistry',
    icon: '⚗️',
    programs: [
      'Chemistry Specialist',
      'Chemistry Major',
      'Chemistry Minor',
      'Medicinal Chemistry Specialist',
    ],
  },
  {
    category: 'Life Sciences',
    icon: '🧬',
    programs: [
      'Biology Specialist',
      'Biology Major',
      'Biology Minor',
      'Molecular Genetics & Microbiology Specialist',
      'Human Biology Specialist',
      'Neuroscience Specialist',
      'Neuroscience Major',
      'Pharmacology Specialist',
      'Physiology Specialist',
      'Physiology Major',
    ],
  },
  {
    category: 'Economics & Commerce',
    icon: '📈',
    programs: [
      'Economics Specialist',
      'Economics Major',
      'Economics Minor',
      'Finance & Economics Specialist',
      'Accounting Specialist',
      'Management Specialist',
    ],
  },
  {
    category: 'Psychology',
    icon: '🧠',
    programs: [
      'Psychology Specialist',
      'Psychology Major',
      'Psychology Minor',
      'Cognitive Science Specialist',
      'Cognitive Science Major',
    ],
  },
  {
    category: 'Social Sciences',
    icon: '🌐',
    programs: [
      'Sociology Specialist',
      'Sociology Major',
      'Sociology Minor',
      'Political Science Specialist',
      'Political Science Major',
      'Political Science Minor',
      'Criminology & Sociolegal Studies Specialist',
      'Criminology & Sociolegal Studies Major',
      'Geography Specialist',
      'Geography Major',
      'Geography Minor',
      'Urban Studies Specialist',
      'Urban Studies Major',
      'Anthropology Specialist',
      'Anthropology Major',
      'Anthropology Minor',
      'International Relations Specialist',
      'International Relations Major',
    ],
  },
  {
    category: 'Humanities',
    icon: '📚',
    programs: [
      'English Specialist',
      'English Major',
      'English Minor',
      'History Specialist',
      'History Major',
      'History Minor',
      'Philosophy Specialist',
      'Philosophy Major',
      'Philosophy Minor',
      'Linguistics Specialist',
      'Linguistics Major',
      'Linguistics Minor',
      'Art History Specialist',
      'Art History Major',
      'Art History Minor',
      'Drama Specialist',
      'Drama Major',
      'Drama Minor',
    ],
  },
  {
    category: 'Music',
    icon: '🎵',
    programs: [
      'Music Specialist',
      'Music Major',
      'Music Minor',
    ],
  },
  {
    category: 'Languages',
    icon: '🗣️',
    programs: [
      'French Language & Linguistics Specialist',
      'French Major',
      'French Minor',
      'Spanish Major',
      'Spanish Minor',
      'Italian Major',
      'Italian Minor',
      'German Major',
      'German Minor',
      'East Asian Studies Major',
      'East Asian Studies Minor',
      'Near & Middle Eastern Civilizations Specialist',
      'Near & Middle Eastern Civilizations Major',
    ],
  },
  {
    category: 'Environment & Health',
    icon: '🌿',
    programs: [
      'Environmental Science Specialist',
      'Environmental Science Major',
      'Environmental Studies Major',
      'Health Studies Specialist',
      'Health Studies Major',
    ],
  },
  {
    category: 'Interdisciplinary',
    icon: '🔀',
    programs: [
      'Indigenous Studies Major',
      'Indigenous Studies Minor',
      'Women & Gender Studies Specialist',
      'Women & Gender Studies Major',
      'Canadian Studies Major',
      'Archaeology Specialist',
      'Archaeology Major',
    ],
  },
  {
    category: 'Other',
    icon: '✏️',
    programs: [],
  },
]

const ADMISSION_CATEGORIES = [
  'Mathematical & Physical Sciences',
  'Life Sciences',
  'Computer Science',
  'Humanities',
  'Social Sciences',
  'Rotman Commerce',
]

const INTERESTS = [
  'Pure Mathematics', 'Statistics', 'Computer Science', 'Physics',
  'Economics', 'Biology', 'Psychology', 'Philosophy', 'Other',
]

const GOALS_FIRST_YEAR = [
  'Get into Math/Stats/CS POSt',
  'Explore before deciding',
  'Graduate school eventually',
  'Industry/tech job',
]

const GOALS_SECOND_YEAR = [
  'Graduate school / Research',
  'Industry job',
  'Double major/minor exploration',
  'Graduate as efficiently as possible',
]

const LEARNING_STYLES = [
  { id: 'lecture', label: 'Lecture-Based', subtitle: 'I learn best by listening', icon: '📖' },
  { id: 'practice', label: 'Practice-Heavy', subtitle: 'I need lots of problems to solve', icon: '✏️' },
  { id: 'self-study', label: 'Self-Study', subtitle: 'I prefer reading and exploring alone', icon: '🔍' },
  { id: 'collaborative', label: 'Collaborative', subtitle: 'I learn best with others', icon: '👥' },
]

export const defaultOnboardingData: OnboardingData = {
  name: '',
  yearType: '',
  admissionCategory: '',
  coursesTaken: [],
  interests: [],
  goalsFirstYear: '',
  programCategory: '',
  programOfStudy: '',
  programOther: '',
  coursesCompleted: [],
  goalsSecondYear: '',
  learningStyle: '',
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
    const parsed = JSON.parse(raw) as OnboardingData
    if (!Array.isArray(parsed.coursesTaken)) parsed.coursesTaken = []
    if (!Array.isArray(parsed.interests)) parsed.interests = []
    if (!Array.isArray(parsed.coursesCompleted)) parsed.coursesCompleted = []
    return parsed
  } catch {
    return null
  }
}

// ── TagInput ──────────────────────────────────────────────────
function TagInput({
  tags,
  onTagsChange,
  placeholder = 'Type course code and press Enter',
}: {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
}) {
  const [value, setValue] = useState('')

  const addTag = useCallback((tag: string) => {
    const t = tag.trim().toUpperCase()
    if (t && !tags.includes(t)) {
      onTagsChange([...tags, t])
      setValue('')
    }
  }, [tags, onTagsChange])

  const removeTag = useCallback((i: number) => {
    onTagsChange(tags.filter((_, idx) => idx !== i))
  }, [tags, onTagsChange])

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-2 min-h-[44px] rounded-lg bg-[#0a0e14] border border-[#1e2a3a] focus-within:ring-2 focus-within:ring-[#0066CC]">
        {tags.map((tag, i) => (
          <span key={`${tag}-${i}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#002A5C] text-[#e8ecf1] text-sm">
            {tag}
            <button type="button" onClick={() => removeTag(i)} className="text-[#8b9aad] hover:text-white ml-0.5">×</button>
          </span>
        ))}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); if (value.trim()) addTag(value) }
            else if (e.key === 'Backspace' && !value && tags.length) removeTag(tags.length - 1)
          }}
          placeholder={placeholder}
          className="flex-1 min-w-[140px] bg-transparent text-white placeholder-[#6b7a8d] focus:outline-none text-sm py-1"
        />
      </div>
      <p className="text-xs text-[#6b7a8d]">e.g. MAT135, CSC108 — press Enter to add</p>
    </div>
  )
}

// ── Main Onboarding ───────────────────────────────────────────
interface OnboardingProps {
  onComplete: () => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [data, setData] = useState<OnboardingData>(defaultOnboardingData)
  const [stepIndex, setStepIndex] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const steps = useMemo(() => {
    const base = ['name', 'year'] as const
    if (!data.yearType) return [...base]
    if (data.yearType === 'first') {
      return [...base, 'admission', 'courses-first', 'interests', 'goals-first', 'learning-style'] as const
    }
    return [...base, 'program-category', 'program-select', 'courses-second', 'goals-second', 'learning-style'] as const
  }, [data.yearType])

  const currentStepId = steps[stepIndex]
  const totalSteps = steps.length
  const progress = ((stepIndex + 1) / totalSteps) * 100
  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1

  const update = useCallback(<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((d) => ({ ...d, [key]: value }))
  }, [])

  const goNext = useCallback(() => {
    if (isLast) {
      saveOnboardingData(data)
      onComplete()
    } else {
      setDirection('forward')
      setStepIndex((i) => i + 1)
    }
  }, [isLast, data, onComplete])

  const goBack = useCallback(() => {
    setDirection('back')
    setStepIndex((i) => Math.max(0, i - 1))
  }, [])

  const selectedCategory = PROGRAM_TREE.find(c => c.category === data.programCategory)

  const canProceed = useMemo(() => {
    switch (currentStepId) {
      case 'name': return data.name.trim().length > 0
      case 'year': return data.yearType !== ''
      case 'admission': return data.admissionCategory.length > 0
      case 'courses-first': return true
      case 'interests': return data.interests.length > 0
      case 'goals-first': return data.goalsFirstYear.length > 0
      case 'program-category': return data.programCategory.length > 0
      case 'program-select':
        if (data.programCategory === 'Other') return data.programOther.trim().length > 0
        return data.programOfStudy.length > 0
      case 'courses-second': return true
      case 'goals-second': return data.goalsSecondYear.length > 0
      case 'learning-style': return data.learningStyle.length > 0
      default: return false
    }
  }, [currentStepId, data])

  return (
    <div className="min-h-screen bg-[#0a0e14] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">UofT AI Assistant</h1>
          <p className="text-[#8b9aad] text-sm">Step {stepIndex + 1} of {totalSteps}</p>
          <div className="mt-3 h-1.5 bg-[#121922] rounded-full overflow-hidden">
            <div className="h-full bg-[#0066CC] rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div key={currentStepId} className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-8 shadow-xl">

          {/* Name */}
          {currentStepId === 'name' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">What&apos;s your name?</h2>
              <input
                type="text"
                value={data.name}
                onChange={(e) => update('name', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canProceed && goNext()}
                placeholder="e.g. Alex"
                className="w-full px-4 py-3 rounded-lg bg-[#0a0e14] border border-[#1e2a3a] text-white placeholder-[#6b7a8d] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                autoFocus
              />
            </>
          )}

          {/* Year */}
          {currentStepId === 'year' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">What year are you in?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { value: 'first', title: 'First Year', sub: "Still exploring, haven't chosen a POSt yet" },
                  { value: 'second+', title: 'Second Year +', sub: 'Already enrolled in a program of study' },
                ].map(({ value, title, sub }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update('yearType', value as 'first' | 'second+')}
                    className={`text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                      data.yearType === value
                        ? 'border-[#0066CC] bg-[#002A5C]/50 shadow-lg shadow-[#0066CC]/20'
                        : 'border-[#1e2a3a] bg-[#0a0e14]/50 hover:border-[#0066CC]/60 hover:bg-[#002A5C]/20'
                    }`}
                  >
                    <span className="text-2xl font-bold text-white block mb-1">{title}</span>
                    <span className="text-sm text-[#8b9aad]">{sub}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Admission category */}
          {currentStepId === 'admission' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">What&apos;s your admission category?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ADMISSION_CATEGORIES.map((cat) => (
                  <button key={cat} type="button" onClick={() => update('admissionCategory', cat)}
                    className={`px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      data.admissionCategory === cat
                        ? 'border-[#0066CC] bg-[#002A5C]/50 text-white'
                        : 'border-[#1e2a3a] text-[#e8ecf1] hover:border-[#0066CC]/60'
                    }`}
                  >{cat}</button>
                ))}
              </div>
            </>
          )}

          {/* Courses first year */}
          {currentStepId === 'courses-first' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">What courses have you taken so far?</h2>
              <TagInput tags={data.coursesTaken} onTagsChange={(t) => update('coursesTaken', t)} placeholder="e.g. MAT135, CSC108" />
            </>
          )}

          {/* Interests */}
          {currentStepId === 'interests' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">What are you interested in?</h2>
              <p className="text-sm text-[#8b9aad] mb-4">Select all that apply</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {INTERESTS.map((opt) => {
                  const selected = data.interests.includes(opt)
                  return (
                    <button key={opt} type="button"
                      onClick={() => update('interests', selected ? data.interests.filter(x => x !== opt) : [...data.interests, opt])}
                      className={`px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        selected ? 'border-[#0066CC] bg-[#002A5C]/50 text-white' : 'border-[#1e2a3a] text-[#e8ecf1] hover:border-[#0066CC]/60'
                      }`}
                    >{opt}</button>
                  )
                })}
              </div>
            </>
          )}

          {/* Goals first year */}
          {currentStepId === 'goals-first' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">What are your goals?</h2>
              <div className="space-y-3">
                {GOALS_FIRST_YEAR.map((opt) => (
                  <button key={opt} type="button" onClick={() => update('goalsFirstYear', opt)}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      data.goalsFirstYear === opt ? 'border-[#0066CC] bg-[#002A5C]/50 text-white' : 'border-[#1e2a3a] text-[#e8ecf1] hover:border-[#0066CC]/60'
                    }`}
                  >{opt}</button>
                ))}
              </div>
            </>
          )}

          {/* Program category — big cards */}
          {currentStepId === 'program-category' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">What&apos;s your field of study?</h2>
              <p className="text-sm text-[#8b9aad] mb-4">Pick the broad area first</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {PROGRAM_TREE.map(({ category, icon }) => (
                  <button key={category} type="button"
                    onClick={() => {
                      update('programCategory', category)
                      update('programOfStudy', '')
                      update('programOther', '')
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${
                      data.programCategory === category
                        ? 'border-[#0066CC] bg-[#002A5C]/50 text-white'
                        : 'border-[#1e2a3a] text-[#e8ecf1] hover:border-[#0066CC]/60 hover:bg-[#002A5C]/20'
                    }`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="text-xs font-medium text-center leading-tight">{category}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Program select — specific programs in chosen category */}
          {currentStepId === 'program-select' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">
                {data.programCategory === 'Other' ? 'Specify your program' : `Choose your ${data.programCategory} program`}
              </h2>
              {data.programCategory !== 'Other' && (
                <button type="button" onClick={() => { setDirection('back'); setStepIndex(i => i - 1) }}
                  className="text-xs text-[#0066CC] hover:underline mb-4 block"
                >
                  ← Change field
                </button>
              )}

              {data.programCategory === 'Other' ? (
                <input
                  type="text"
                  value={data.programOther}
                  onChange={(e) => update('programOther', e.target.value)}
                  placeholder="e.g. Engineering Science, Renaissance Studies..."
                  className="w-full mt-2 px-4 py-3 rounded-lg bg-[#0a0e14] border border-[#1e2a3a] text-white placeholder-[#6b7a8d] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  autoFocus
                />
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 mt-2">
                  {selectedCategory?.programs.map((prog) => (
                    <button key={prog} type="button" onClick={() => update('programOfStudy', prog)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        data.programOfStudy === prog
                          ? 'border-[#0066CC] bg-[#002A5C]/50 text-white'
                          : 'border-[#1e2a3a] text-[#e8ecf1] hover:border-[#0066CC]/60'
                      }`}
                    >{prog}</button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Courses second year */}
          {currentStepId === 'courses-second' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Which courses have you completed?</h2>
              <TagInput tags={data.coursesCompleted} onTagsChange={(t) => update('coursesCompleted', t)} />
            </>
          )}

          {/* Goals second year */}
          {currentStepId === 'goals-second' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">What are your goals?</h2>
              <div className="space-y-3">
                {GOALS_SECOND_YEAR.map((opt) => (
                  <button key={opt} type="button" onClick={() => update('goalsSecondYear', opt)}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      data.goalsSecondYear === opt ? 'border-[#0066CC] bg-[#002A5C]/50 text-white' : 'border-[#1e2a3a] text-[#e8ecf1] hover:border-[#0066CC]/60'
                    }`}
                  >{opt}</button>
                ))}
              </div>
            </>
          )}

          {/* Learning style */}
          {currentStepId === 'learning-style' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">What&apos;s your learning style?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {LEARNING_STYLES.map(({ id, label, subtitle, icon }) => (
                  <button key={id} type="button" onClick={() => update('learningStyle', id)}
                    className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                      data.learningStyle === id
                        ? 'border-[#0066CC] bg-[#002A5C]/50 shadow-lg shadow-[#0066CC]/20'
                        : 'border-[#1e2a3a] hover:border-[#0066CC]/60 hover:bg-[#002A5C]/20'
                    }`}
                  >
                    <span className="text-2xl block mb-2">{icon}</span>
                    <span className="font-semibold text-white block">{label}</span>
                    <span className="text-sm text-[#8b9aad]">&quot;{subtitle}&quot;</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Nav buttons */}
          <div className="flex justify-between mt-8">
            <button type="button" onClick={goBack} disabled={isFirst}
              className="px-4 py-2 rounded-lg text-[#8b9aad] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >Back</button>
            <button type="button" onClick={goNext} disabled={!canProceed}
              className="px-6 py-2 rounded-lg bg-[#0066CC] text-white font-medium hover:bg-[#0080e6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >{isLast ? 'Finish' : 'Next'}</button>
          </div>
        </div>

        <p className="mt-6 text-center text-[#6b7a8d] text-sm">
          Your answers are stored locally and help personalize recommendations.
        </p>
      </div>
    </div>
  )
}
