'use client'

import { useState, useCallback, useMemo } from 'react'

export interface OnboardingData {
  name: string
  yearType: 'first' | 'second' | 'third+' | ''
  admissionCategory: string
  coursesTaken: string[]
  interests: string[]
  goalsFirstYear: string
  programCategory: string
  programOfStudy: string
  programOther: string
  coursesCompleted: string[]
  goalsSecondYear: string
  learningStyle: string
  studyHoursPerWeek: string
  examPreference: string
  officeHoursImportance: string
  communicationPreference: string
}

const STORAGE_KEY = 'uoft-ai-onboarding'

const PROGRAM_TREE: { category: string; icon: string; programs: string[] }[] = [
  {
    category: 'Mathematics', icon: '∑',
    programs: [
      'Mathematics Specialist', 'Mathematics Major', 'Mathematics Minor',
      'Applied Mathematics Specialist', 'Mathematics & Physics Specialist',
      'Mathematics & Philosophy Specialist',
      'Mathematics & Its Applications Specialist (Teaching)',
      'Mathematics & Its Applications Specialist (Probability/Statistics)',
      'Mathematics & Its Applications Specialist (Physical Science)',
      'Actuarial Science Specialist', 'Actuarial Science Major',
    ],
  },
  {
    category: 'Statistics & Data Science', icon: '📊',
    programs: [
      'Statistical Sciences Specialist', 'Statistical Sciences Specialist (Theory & Methods)',
      'Data Science Specialist', 'Statistics Major', 'Statistics Minor',
    ],
  },
  {
    category: 'Computer Science', icon: '💻',
    programs: [
      'Computer Science Specialist', 'Computer Science Specialist (Artificial Intelligence)',
      'Computer Science Major', 'Computer Science Minor',
      'Bioinformatics & Computational Biology Specialist',
    ],
  },
  {
    category: 'Physics & Astronomy', icon: '🔭',
    programs: [
      'Physics Specialist', 'Physics Major', 'Physics Minor',
      'Astronomy & Physics Specialist', 'Astronomy & Astrophysics Major',
    ],
  },
  {
    category: 'Chemistry', icon: '⚗️',
    programs: ['Chemistry Specialist', 'Chemistry Major', 'Chemistry Minor', 'Medicinal Chemistry Specialist'],
  },
  {
    category: 'Life Sciences', icon: '🧬',
    programs: [
      'Biology Specialist', 'Biology Major', 'Biology Minor',
      'Molecular Genetics & Microbiology Specialist', 'Human Biology Specialist',
      'Neuroscience Specialist', 'Neuroscience Major', 'Pharmacology Specialist',
      'Physiology Specialist', 'Physiology Major',
    ],
  },
  {
    category: 'Economics & Commerce', icon: '📈',
    programs: [
      'Economics Specialist', 'Economics Major', 'Economics Minor',
      'Finance & Economics Specialist', 'Accounting Specialist', 'Management Specialist',
    ],
  },
  {
    category: 'Psychology', icon: '🧠',
    programs: [
      'Psychology Specialist', 'Psychology Major', 'Psychology Minor',
      'Cognitive Science Specialist', 'Cognitive Science Major',
    ],
  },
  {
    category: 'Social Sciences', icon: '🌐',
    programs: [
      'Sociology Specialist', 'Sociology Major', 'Sociology Minor',
      'Political Science Specialist', 'Political Science Major', 'Political Science Minor',
      'Criminology & Sociolegal Studies Specialist', 'Criminology & Sociolegal Studies Major',
      'Geography Specialist', 'Geography Major', 'Geography Minor',
      'Urban Studies Specialist', 'Urban Studies Major',
      'Anthropology Specialist', 'Anthropology Major', 'Anthropology Minor',
      'International Relations Specialist', 'International Relations Major',
    ],
  },
  {
    category: 'Humanities', icon: '📚',
    programs: [
      'English Specialist', 'English Major', 'English Minor',
      'History Specialist', 'History Major', 'History Minor',
      'Philosophy Specialist', 'Philosophy Major', 'Philosophy Minor',
      'Linguistics Specialist', 'Linguistics Major', 'Linguistics Minor',
      'Art History Specialist', 'Art History Major', 'Art History Minor',
      'Drama Specialist', 'Drama Major', 'Drama Minor',
    ],
  },
  { category: 'Music', icon: '🎵', programs: ['Music Specialist', 'Music Major', 'Music Minor'] },
  {
    category: 'Languages', icon: '🗣️',
    programs: [
      'French Language & Linguistics Specialist', 'French Major', 'French Minor',
      'Spanish Major', 'Spanish Minor', 'Italian Major', 'Italian Minor',
      'German Major', 'German Minor', 'East Asian Studies Major', 'East Asian Studies Minor',
      'Near & Middle Eastern Civilizations Specialist', 'Near & Middle Eastern Civilizations Major',
    ],
  },
  {
    category: 'Environment & Health', icon: '🌿',
    programs: [
      'Environmental Science Specialist', 'Environmental Science Major',
      'Environmental Studies Major', 'Health Studies Specialist', 'Health Studies Major',
    ],
  },
  {
    category: 'Interdisciplinary', icon: '🔀',
    programs: [
      'Indigenous Studies Major', 'Indigenous Studies Minor',
      'Women & Gender Studies Specialist', 'Women & Gender Studies Major',
      'Canadian Studies Major', 'Archaeology Specialist', 'Archaeology Major',
    ],
  },
  { category: 'Other', icon: '✏️', programs: [] },
]

const ADMISSION_CATEGORIES = [
  'Mathematical & Physical Sciences', 'Life Sciences', 'Computer Science',
  'Humanities', 'Social Sciences', 'Rotman Commerce',
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

const GOALS_UPPER_YEAR = [
  'Graduate school / Research',
  'Industry job',
  'Double major/minor exploration',
  'Graduate as efficiently as possible',
  'Build a strong theoretical foundation',
]

const LEARNING_STYLES = [
  { id: 'lecture', label: 'Lecture-Based', subtitle: 'I learn best by listening', icon: '📖' },
  { id: 'practice', label: 'Practice-Heavy', subtitle: 'I need lots of problems to solve', icon: '✏️' },
  { id: 'self-study', label: 'Self-Study', subtitle: 'I prefer reading and exploring alone', icon: '🔍' },
  { id: 'collaborative', label: 'Collaborative', subtitle: 'I learn best with others', icon: '👥' },
]

export const defaultOnboardingData: OnboardingData = {
  name: '', yearType: '', admissionCategory: '',
  coursesTaken: [], interests: [], goalsFirstYear: '',
  programCategory: '', programOfStudy: '', programOther: '',
  coursesCompleted: [], goalsSecondYear: '', learningStyle: '',
  studyHoursPerWeek: '', examPreference: '',
  officeHoursImportance: '', communicationPreference: '',
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

function TagInput({ tags, onTagsChange, placeholder = 'Type course code and press Enter' }: {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
}) {
  const [value, setValue] = useState('')
  const addTag = useCallback((tag: string) => {
    const t = tag.trim().toUpperCase()
    if (t && !tags.includes(t)) { onTagsChange([...tags, t]); setValue('') }
  }, [tags, onTagsChange])
  const removeTag = useCallback((i: number) => {
    onTagsChange(tags.filter((_, idx) => idx !== i))
  }, [tags, onTagsChange])
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-2 min-h-[44px] rounded-lg bg-[#0a0e14] border border-[#1e2a3a] focus-within:ring-2 focus-within:ring-[#0066CC]">
        {tags.map((tag, i) => (
          <span key={tag + i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#002A5C] text-[#e8ecf1] text-sm">
            {tag}
            <button type="button" onClick={() => removeTag(i)} className="text-[#8b9aad] hover:text-white ml-0.5">x</button>
          </span>
        ))}
        <input type="text" value={value}
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

interface OnboardingProps { onComplete: () => void }

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [data, setData] = useState<OnboardingData>(defaultOnboardingData)
  const [stepIndex, setStepIndex] = useState(0)

  const steps = useMemo(() => {
    const base = ['name', 'year'] as const
    if (!data.yearType) return [...base]
    if (data.yearType === 'first') {
      return [...base, 'admission', 'courses-first', 'interests', 'goals-first', 'learning-style', 'study-preferences'] as const
    }
    return [...base, 'program-category', 'program-select', 'courses-completed', 'goals-upper', 'learning-style', 'study-preferences'] as const
  }, [data.yearType])

  const currentStepId = steps[stepIndex]
  const totalSteps = steps.length
  const progress = ((stepIndex + 1) / totalSteps) * 100
  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1

  const update = useCallback(<K extends keyof OnboardingData>(key: K, val: OnboardingData[K]) => {
    setData((d) => ({ ...d, [key]: val }))
  }, [])

  const goNext = useCallback(() => {
    if (isLast) { saveOnboardingData(data); onComplete() }
    else { setStepIndex((i) => i + 1) }
  }, [isLast, data, onComplete])

  const goBack = useCallback(() => setStepIndex((i) => Math.max(0, i - 1)), [])

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
        return data.programCategory === 'Other' ? data.programOther.trim().length > 0 : data.programOfStudy.length > 0
      case 'courses-completed': return true
      case 'goals-upper': return data.goalsSecondYear.length > 0
      case 'learning-style': return data.learningStyle.length > 0
      case 'study-preferences': return data.studyHoursPerWeek !== '' && data.examPreference !== '' && data.officeHoursImportance !== ''
      default: return false
    }
  }, [currentStepId, data])

  const firstYearChips = ['MAT135', 'MAT136', 'MAT137', 'MAT157', 'MAT223', 'CSC108', 'CSC110Y1', 'CSC148', 'CSC165', 'STA130', 'PHY131', 'PHY132', 'CHM135', 'CHM136', 'BIO120', 'BIO130', 'ECO101', 'ECO102', 'PSY100', 'SOC100']
  const upperYearChips = ['MAT135', 'MAT136', 'MAT137', 'MAT157', 'MAT223', 'MAT224', 'MAT235', 'MAT237', 'MAT240', 'MAT244', 'MAT246', 'MAT247', 'MAT257', 'CSC108', 'CSC148', 'CSC165', 'CSC207', 'CSC209', 'CSC236', 'CSC258', 'CSC263', 'STA237', 'STA238', 'STA247', 'PHY131', 'PHY132', 'BIO120', 'BIO130', 'PSY100', 'SOC100', 'ECO101', 'ECO102']

  return (
    <div className="min-h-screen bg-[#0a0e14] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">UofT AI Assistant</h1>
          <p className="text-[#8b9aad] text-sm">Step {stepIndex + 1} of {totalSteps}</p>
          <div className="mt-3 h-1.5 bg-[#121922] rounded-full overflow-hidden">
            <div className="h-full bg-[#0066CC] rounded-full transition-all duration-500" style={{ width: progress + '%' }} />
          </div>
        </div>

        <div key={currentStepId} className="bg-[#121922] border border-[#1e2a3a] rounded-xl p-8 shadow-xl">

          {currentStepId === 'name' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">What is your name?</h2>
              <input type="text" value={data.name}
                onChange={(e) => update('name', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canProceed && goNext()}
                placeholder="e.g. Alex"
                className="w-full px-4 py-3 rounded-lg bg-[#0a0e14] border border-[#1e2a3a] text-white placeholder-[#6b7a8d] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                autoFocus
              />
            </>
          )}

          {currentStepId === 'year' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">Where are you in your journey?</h2>
              <p className="text-sm text-[#8b9aad] mb-6">This helps us recommend the right courses for your next step</p>
              <div className="space-y-3">
                {([
                  { value: 'first', title: 'Starting First Year', sub: "About to begin at UofT, haven't chosen a POSt yet" },
                  { value: 'second', title: 'Entering Second Year', sub: 'Completed first year, now entering a program of study' },
                  { value: 'third+', title: 'Third Year and Beyond', sub: 'In your program, planning upper-year courses' },
                ] as { value: 'first' | 'second' | 'third+'; title: string; sub: string }[]).map(({ value, title, sub }) => (
                  <button key={v
