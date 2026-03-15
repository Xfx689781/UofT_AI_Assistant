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
  goals?: string // 适配 Chat API
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
  { category: 'Other', icon: '✏️', programs: [] },
]

const ADMISSION_CATEGORIES = ['Mathematical & Physical Sciences', 'Life Sciences', 'Computer Science', 'Humanities', 'Social Sciences', 'Rotman Commerce']

const GOALS_FIRST_YEAR = ['Get into Math/Stats/CS POSt', 'Explore before deciding', 'Graduate school eventually', 'Industry/tech job']

const GOALS_UPPER_YEAR = ['Graduate school / Research', 'Industry job', 'Double major/minor exploration', 'Graduate as efficiently as possible']

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
  goals: ''
}

export function saveOnboardingData(data: OnboardingData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    // 同时存一份到 dashboard 通用的 key 
    localStorage.setItem('onboarding_data', JSON.stringify(data))
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
      <div className="flex flex-wrap gap-2 p-2 min-h-[44px] rounded-lg bg-[#0a0e14] border border-[#1e2a3a]">
        {tags.map((tag, i) => (
          <span key={i} className="px-2 py-1 rounded bg-[#002A5C] text-xs text-white flex items-center gap-1">
            {tag} <button onClick={() => removeTag(i)}>×</button>
          </span>
        ))}
        <input 
          value={value} 
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(value))}
          placeholder={placeholder}
          className="bg-transparent outline-none text-white text-sm"
        />
      </div>
    </div>
  )
}

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [data, setData] = useState<OnboardingData>(defaultOnboardingData)
  const [stepIndex, setStepIndex] = useState(0)

  const steps = useMemo(() => {
    const base = ['name', 'year'] as const
    if (!data.yearType) return [...base]
    if (data.yearType === 'first') return [...base, 'admission', 'interests', 'goals-first', 'learning-style'] as const
    return [...base, 'program-category', 'program-select', 'courses-completed', 'goals-upper', 'learning-style'] as const
  }, [data.yearType])

  const currentStepId = steps[stepIndex]
  const update = useCallback(<K extends keyof OnboardingData>(key: K, val: OnboardingData[K]) => {
    setData((d) => ({ ...d, [key]: val }))
  }, [])

  const goNext = () => {
    if (stepIndex === steps.length - 1) {
      saveOnboardingData({ ...data, goals: data.yearType === 'first' ? data.goalsFirstYear : data.goalsSecondYear })
      onComplete()
    } else {
      setStepIndex(i => i + 1)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e14] flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-2xl bg-[#121922] border border-[#1e2a3a] rounded-xl p-8">
        <div className="mb-6">
          <p className="text-xs text-[#8b9aad] uppercase tracking-wider">Step {stepIndex + 1} of {steps.length}</p>
          <div className="h-1 bg-[#1e2a3a] mt-2 rounded-full overflow-hidden">
            <div className="h-full bg-[#0066CC] transition-all" style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} />
          </div>
        </div>

        {currentStepId === 'name' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">What's your name?</h2>
            <input 
              className="w-full bg-[#0a0e14] border border-[#1e2a3a] p-3 rounded-lg outline-none"
              value={data.name} 
              onChange={e => update('name', e.target.value)} 
            />
          </div>
        )}

        {currentStepId === 'year' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Current Year</h2>
            <div className="grid gap-3">
              {(['first', 'second', 'third+'] as const).map(y => (
                <button 
                  key={y}
                  onClick={() => update('yearType', y)}
                  className={`p-4 rounded-lg border transition ${data.yearType === y ? 'border-[#0066CC] bg-[#0066CC]/10' : 'border-[#1e2a3a] bg-[#0a0e14]'}`}
                >
                  {y === 'first' ? 'First Year (Entering UofT)' : y === 'second' ? 'Second Year' : 'Upper Year'}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStepId === 'admission' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Admission Category</h2>
            <select 
              className="w-full bg-[#0a0e14] border border-[#1e2a3a] p-3 rounded-lg"
              value={data.admissionCategory}
              onChange={e => update('admissionCategory', e.target.value)}
            >
              <option value="">Select Category</option>
              {ADMISSION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {currentStepId === 'program-category' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Field</h2>
            <div className="grid grid-cols-2 gap-3">
              {PROGRAM_TREE.map(cat => (
                <button 
                  key={cat.category}
                  onClick={() => update('programCategory', cat.category)}
                  className={`p-3 rounded-lg border text-sm ${data.programCategory === cat.category ? 'border-[#0066CC] bg-[#0066CC]/10' : 'border-[#1e2a3a]'}`}
                >
                  {cat.icon} {cat.category}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStepId === 'courses-completed' && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Completed Courses</h2>
            <p className="text-sm text-[#8b9aad] mb-4">Which core courses have you finished?</p>
            <TagInput tags={data.coursesCompleted} onTagsChange={tags => update('coursesCompleted', tags)} />
          </div>
        )}

        {currentStepId === 'learning-style' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Learning Style</h2>
            <div className="grid gap-3">
              {LEARNING_STYLES.map(s => (
                <button 
                  key={s.id}
                  onClick={() => update('learningStyle', s.id)}
                  className={`flex items-center gap-4 p-4 rounded-lg border text-left ${data.learningStyle === s.id ? 'border-[#0066CC] bg-[#0066CC]/10' : 'border-[#1e2a3a]'}`}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="font-bold">{s.label}</p>
                    <p className="text-xs text-[#8b9aad]">{s.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button onClick={() => setStepIndex(i => i - 1)} disabled={stepIndex === 0} className="text-[#8b9aad] disabled:opacity-0">Back</button>
          <button 
            onClick={goNext}
            className="bg-[#0066CC] px-8 py-2 rounded-lg font-bold hover:bg-[#0052a3] transition"
          >
            {stepIndex === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

