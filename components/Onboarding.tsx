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
    programs: ['Physics Specialist', 'Physics Major', 'Physics Minor', 'Astronomy & Physics Specialist'],
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
      'Sociology Specialist', 'Sociology Major', 'Political Science Specialist',
      'Political Science Major', 'Criminology & Sociolegal Studies Specialist',
      'Geography Specialist', 'Urban Studies Specialist',
      'Anthropology Specialist', 'International Relations Specialist',
    ],
  },
  {
    category: 'Humanities', icon: '📚',
    programs: [
      'English Specialist', 'English Major', 'History Specialist', 'History Major',
      'Philosophy Specialist', 'Philosophy Major', 'Linguistics Specialist', 'Linguistics Major',
    ],
  },
  { category: 'Music', icon: '🎵', programs: ['Music Specialist', 'Music Major', 'Music Minor'] },
  {
    category: 'Environment & Health', icon: '🌿',
    programs: [
      'Environmental Science Specialist', 'Environmental Science Major',
      'Health Studies Specialist', 'Health Studies Major',
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
  { id: 'lecture', label: 'Lecture-Based', subtitle: 'I learn best by listening to structured lectures', icon: '📖' },
  { id: 'practice', label: 'Practice-Heavy', subtitle: 'I need lots of problems and exercises', icon: '✏️' },
  { id: 'self-study', label: 'Self-Study', subtitle: 'I prefer reading textbooks and exploring alone', icon: '🔍' },
  { id: 'collaborative', label: 'Collaborative', subtitle: 'I learn best discussing with others', icon: '👥' },
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
      <p className="text-xs text-[#6b7a8d]">Press Enter to add each course</p>
    </div>
  )
}

function ChipSelect({ options, selected, onToggle, single }: {
  options: string[]
  selected: string[]
  onToggle: (val: string) => void
  single?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onToggle(opt)}
          className={'px-3 py-1.5 rounded-lg border text-sm transition-all ' + (selected.includes(opt) ? 'border-[#0066CC] bg-[#002A5C]/60 text-white' : 'border-[#1e2a3a] text-[#8b9aad] hover:border-[#0066CC]/60 hover:text-white')}
        >{opt}</button>
      ))}
    </div>
  )
}

const FIRST_YEAR_CHIPS = ['MAT135', 'MAT136', 'MAT137', 'MAT157', 'MAT223', 'CSC108', 'CSC110Y1', 'CSC148', 'CSC165', 'STA130', 'PHY131', 'PHY132', 'CHM135', 'CHM136', 'BIO120', 'BIO130', 'ECO101', 'ECO102', 'PSY100', 'SOC100']
const UPPER_YEAR_CHIPS = ['MAT135', 'MAT136', 'MAT137', 'MAT157', 'MAT223', 'MAT224', 'MAT237', 'MAT240', 'MAT244', 'MAT246', 'MAT247', 'MAT257', 'CSC108', 'CSC148', 'CSC165', 'CSC207', 'CSC209', 'CSC236', 'CSC258', 'CSC263', 'STA237', 'STA238', 'STA247', 'STA257', 'PHY131', 'PHY132', 'BIO120', 'BIO130', 'PSY100', 'ECO101', 'ECO102']

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
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

  return (
    <div className="min-h-screen bg-[#0a0e14] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">UofT AI Assistant</h1>
          <p className="text-[#8b9aad] text-xs">Step {stepIndex + 1} of {totalSteps}</p>
          <div className="mt-2 h-1.5 bg-[#121922] rounded-full overflow-hidden">
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
              <p className="text-sm text-[#8b9aad] mb-5">This shapes your entire course recommendation</p>
              <div className="space-y-3">
                {([
                  { value: 'first', title: 'Starting First Year', sub: "About to begin at UofT, have not chosen a POSt yet" },
                  { value: 'second', title: 'Entering Second Year', sub: 'Completed first year, entering a program of study' },
                  { value: 'third+', title: 'Third Year and Beyond', sub: 'In your program, planning upper-year and advanced courses' },
                ] as { value: 'first' | 'second' | 'third+'; title: string; sub: string }[]).map(({ value, title, sub }) => (
                  <button key={value} type="button" onClick={() => update('yearType', value)}
                    className={'w-full text-left p-4 rounded-xl border-2 transition-all ' + (data.yearType === value ? 'border-[#0066CC] bg-[#002A5C]/40' : 'border-[#1e2a3a] bg-[#0a0e14]/50 hover:border-[#0066CC]/50')}
                  >
                    <span className="text-white font-bold block">{title}</span>
                    <span className="text-[#8b9aad] text-sm">{sub}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {currentStepId === 'admission' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-5">What is your admission category?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ADMISSION_CATEGORIES.map((cat) => (
                  <button key={cat} type="button" onClick={() => update('admissionCategory', cat)}
                    className={'px-4 py-3 rounded-xl border-2 text-left transition-all ' + (data.admissionCategory === cat ? 'border-[#0066CC] bg-[#002A5C]/40 text-white' : 'border-[#1e2a3a] text-[#e8ecf1] hover:border-[#0066CC]/50')}
                  >{cat}</button>
                ))}
              </div>
            </>
          )}

          {currentStepId === 'courses-first' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">What courses have you taken this year?</h2>
              <p className="text-sm text-[#8b9aad] mb-4">Include Fall and Winter courses</p>
              <TagInput tags={data.coursesTaken} onTagsChange={(t) => update('coursesTaken', t)} placeholder="e.g. MAT137, CSC108" />
              <div className="mt-4 p-3 bg-[#0a0e14] rounded-lg border border-[#1e2a3a]">
                <p className="text-xs text-[#8b9aad] font-semibold mb-2">Quick add common first year courses:</p>
                <div className="flex flex-wrap gap-1.5">
                  {FIRST_YEAR_CHIPS.map(c => (
                    <button key={c} type="button" onClick={() => { if (!data.coursesTaken.includes(c)) update('coursesTaken', [...data.coursesTaken, c]) }}
                      className={'px-2 py-1 rounded text-xs font-mono transition-all ' + (data.coursesTaken.includes(c) ? 'bg-[#0066CC] text-white' : 'bg-[#1e2a3a] text-[#8b9aad] hover:text-white hover:bg-[#243040]')}
                    >{c}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentStepId === 'interests' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">What subjects interest you?</h2>
              <p className="text-sm text-[#8b9aad] mb-4">Select all that apply — this shapes your cross-disciplinary recommendations</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {INTERESTS.map((opt) => {
                  const selected = data.interests.includes(opt)
                  return (
                    <button key={opt} type="button"
                      onClick={() => update('interests', selected ? data.interests.filter(x => x !== opt) : [...data.interests, opt])}
                      className={'px-4 py-3 rounded-xl border-2 text-left transition-all ' + (selected ? 'border-[#0066CC] bg-[#002A5C]/40 text-white' : 'border-[#1e2a3a] text-[#e8ecf1] hover:border-[#0066CC]/50')}
                    >{opt}</button>
                  )
                })}
              </div>
            </>
          )}

          {currentStepId === 'goals-first' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-5">What is your primary goal this year?</h2>
              <div className="space-y-3">
                {GOALS_FIRST_YEAR.map((opt) => (
                  <button key={opt} type="button" onClick={() => update('goalsFirstYear', opt)}
                    className={'w-full px-4 py-3 rounded-xl border-2 text-left transition-all ' + (data.goalsFirstYear === opt ? 'border-[#0066CC] bg-[#002A5C]/40 text-white' : 'border-[#1e2a3a] text-[#e8ecf1] hover:border-[#0066CC]/50')}
                  >{opt}</button>
                ))}
              </div>
            </>
          )}

          {currentStepId === 'program-category' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">What is your field of study?</h2>
              <p className="text-sm text-[#8b9aad] mb-4">Pick the broad area first</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {PROGRAM_TREE.map(({ category, icon }) => (
                  <button key={category} type="button"
                    onClick={() => { update('programCategory', category); update('programOfStudy', ''); update('programOther', '') }}
                    className={'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ' + (data.programCategory === category ? 'border-[#0066CC] bg-[#002A5C]/40 text-white' : 'border-[#1e2a3a] text-[#e8ecf1] hover:border-[#0066CC]/50')}
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="text-xs font-medium text-center leading-tight">{category}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {currentStepId === 'program-select' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">
                {data.programCategory === 'Other' ? 'Specify your program' : 'Choose your ' + data.programCategory + ' program'}
              </h2>
              {data.programCategory !== 'Other' && (
                <button type="button" onClick={() => setStepIndex(i => i - 1)}
                  className="text-xs text-[#0066CC] hover:underline mb-3 block">Change field</button>
              )}
              {data.programCategory === 'Other' ? (
                <input type="text" value={data.programOther}
                  onChange={(e) => update('programOther', e.target.value)}
                  placeholder="e.g. Engineering Science..."
                  className="w-full mt-2 px-4 py-3 rounded-lg bg-[#0a0e14] border border-[#1e2a3a] text-white placeholder-[#6b7a8d] focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  autoFocus
                />
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 mt-2">
                  {selectedCategory?.programs.map((prog) => (
                    <button key={prog} type="button" onClick={() => update('programOfStudy', prog)}
                      className={'w-full text-left px-4 py-3 rounded-xl border-2 transition-all ' + (data.programOfStudy === prog ? 'border-[#0066CC] bg-[#002A5C]/40 text-white' : 'border-[#1e2a3a] text-[#e8ecf1] hover:border-[#0066CC]/50')}
                    >{prog}</button>
                  ))}
                </div>
              )}
            </>
          )}

          {currentStepId === 'courses-completed' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">
                {data.yearType === 'second' ? 'What courses did you complete in first year?' : 'What courses have you completed so far?'}
              </h2>
              <p className="text-sm text-[#8b9aad] mb-4">Used to check prerequisites and avoid repeating courses</p>
              <TagInput tags={data.coursesCompleted} onTagsChange={(t) => update('coursesCompleted', t)} />
              <div className="mt-4 p-3 bg-[#0a0e14] rounded-lg border border-[#1e2a3a]">
                <p className="text-xs text-[#8b9aad] font-semibold mb-2">Quick add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {UPPER_YEAR_CHIPS.map(c => (
                    <button key={c} type="button" onClick={() => { if (!data.coursesCompleted.includes(c)) update('coursesCompleted', [...data.coursesCompleted, c]) }}
                      className={'px-2 py-1 rounded text-xs font-mono transition-all ' + (data.coursesCompleted.includes(c) ? 'bg-[#0066CC] text-white' : 'bg-[#1e2a3a] text-[#8b9aad] hover:text-white hover:bg-[#243040]')}
                    >{c}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentStepId === 'goals-upper' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-5">What is your primary goal?</h2>
              <div className="space-y-3">
                {GOALS_UPPER_YEAR.map((opt) => (
                  <button key={opt} type="button" onClick={() => update('goalsSecondYear', opt)}
                    className={'w-full px-4 py-3 rounded-xl border-2 text-left transition-all ' + (data.goalsSecondYear === opt ? 'border-[#0066CC] bg-[#002A5C]/40 text-white' : 'border-[#1e2a3a] text-[#e8ecf1] hover:border-[#0066CC]/50')}
                  >{opt}</button>
                ))}
              </div>
            </>
          )}

          {currentStepId === 'learning-style' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-5">What is your learning style?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {LEARNING_STYLES.map(({ id, label, subtitle, icon }) => (
                  <button key={id} type="button" onClick={() => update('learningStyle', id)}
                    className={'text-left p-5 rounded-xl border-2 transition-all ' + (data.learningStyle === id ? 'border-[#0066CC] bg-[#002A5C]/40' : 'border-[#1e2a3a] hover:border-[#0066CC]/50')}
                  >
                    <span className="text-2xl block mb-2">{icon}</span>
                    <span className="font-semibold text-white block">{label}</span>
                    <span className="text-sm text-[#8b9aad]">{subtitle}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {currentStepId === 'study-preferences' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">Your study preferences</h2>
              <p className="text-sm text-[#8b9aad] mb-6">Used to personalize your professor match scores</p>
              <div className="space-y-6">

                <div>
                  <p className="text-sm text-white font-medium mb-3">How many hours per week can you dedicate to studying?</p>
                  <ChipSelect
                    options={['Under 10h', '10-20h', '20-30h', '30h+']}
                    selected={data.studyHoursPerWeek ? [data.studyHoursPerWeek] : []}
                    onToggle={(v) => update('studyHoursPerWeek', v)}
                    single
                  />
                </div>

                <div>
                  <p className="text-sm text-white font-medium mb-3">What exam format do you perform best in?</p>
                  <ChipSelect
                    options={['Proof / Theory', 'Computation / Numerical', 'Multiple Choice', 'Open Book', 'Take Home', 'No Preference']}
                    selected={data.examPreference ? [data.examPreference] : []}
                    onToggle={(v) => update('examPreference', v)}
                    single
                  />
                </div>

                <div>
                  <p className="text-sm text-white font-medium mb-3">How important is professor accessibility to you?</p>
                  <div className="space-y-2">
                    {[
                      { id: 'critical', label: 'Critical', sub: 'I go to office hours often and need a responsive prof' },
                      { id: 'helpful', label: 'Helpful but not essential', sub: 'I appreciate it but can figure things out myself' },
                      { id: 'not-needed', label: 'Not important', sub: 'I learn independently and rarely reach out' },
                    ].map(({ id, label, sub }) => (
                      <button key={id} type="button" onClick={() => update('officeHoursImportance', id)}
                        className={'w-full text-left p-3 rounded-xl border-2 transition-all ' + (data.officeHoursImportance === id ? 'border-[#0066CC] bg-[#002A5C]/40 text-white' : 'border-[#1e2a3a] text-[#e8ecf1] hover:border-[#0066CC]/50')}
                      >
                        <p className="font-medium text-sm">{label}</p>
                        <p className="text-xs text-[#8b9aad] mt-0.5">{sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-white font-medium mb-3">
                    How do you prefer to get help when stuck? <span className="text-[#6b7a8d] font-normal">(optional)</span>
                  </p>
                  <ChipSelect
                    options={['Email professor', 'Office hours in person', 'Online forum / Piazza', 'Study group', 'Figure it out alone']}
                    selected={data.communicationPreference ? [data.communicationPreference] : []}
                    onToggle={(v) => update('communicationPreference', v)}
                    single
                  />
                </div>

              </div>
            </>
          )}

          <div className="flex justify-between mt-8">
            <button type="button" onClick={goBack} disabled={isFirst}
              className="px-4 py-2 rounded-lg text-[#8b9aad] hover:text-white disabled:opacity-0 transition-colors"
            >Back</button>
