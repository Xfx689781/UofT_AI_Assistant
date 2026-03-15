'use client'

import  useState, useCallback, useMemo } from 'react'

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
  goals?: string 
  [key: string]: any 
}

const STORAGE_KEY = 'uoft-ai-onboarding'

// --- 数据常量保持不变 ---
const PROGRAM_TREE = [
  { category: 'Mathematics', icon: '∑', programs: ['Mathematics Specialist', 'Mathematics Major', 'Mathematics Minor', 'Applied Mathematics Specialist', 'Actuarial Science Specialist'] },
  { category: 'Statistics & Data Science', icon: '📊', programs: ['Statistical Sciences Specialist', 'Data Science Specialist', 'Statistics Major'] },
  { category: 'Computer Science', icon: '💻', programs: ['Computer Science Specialist', 'Computer Science Major', 'Bioinformatics Specialist'] },
  { category: 'Physics & Astronomy', icon: '🔭', programs: ['Physics Specialist', 'Physics Major', 'Astronomy & Physics Specialist'] },
  { category: 'Chemistry', icon: '⚗️', programs: ['Chemistry Specialist', 'Chemistry Major'] },
  { category: 'Economics & Commerce', icon: '📈', programs: ['Economics Specialist', 'Economics Major', 'Finance & Economics Specialist', 'Accounting Specialist'] },
  { category: 'Psychology', icon: '🧠', programs: ['Psychology Specialist', 'Psychology Major', 'Cognitive Science Specialist'] },
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

// --- 核心修复：导出这两个函数 ---
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
    localStorage.setItem('onboarding_data', JSON.stringify(data))
  }
}

export function getOnboardingData(): OnboardingData | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('onboarding_data')
  if (!raw) return null
  try {
    return JSON.parse(raw) as OnboardingData
  } catch {
    return null
  }
}

// --- 辅助组件 ---
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
            {tag} <button type="button" onClick={() => removeTag(i)}>×</button>
          </span>
        ))}
        <input 
          value={value} 
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); addTag(value); } }}
          placeholder={placeholder}
          className="bg-transparent outline-none text-white text-sm flex-1 min-w-[120px]"
        />
      </div>
    </div>
  )
}

// --- 主组件 ---
export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [data, setData] = useState<OnboardingData>(defaultOnboardingData)
  const [stepIndex, setStepIndex] = useState(0)

  // 这里的步骤逻辑完全保留
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

        {/* --- 渲染逻辑区 --- */}
        {currentStepId === 'name' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">What's your name?</h2>
            <input className="w-full bg-[#0a0e14] border border-[#1e2a3a] p-3 rounded-lg outline-none" value={data.name} onChange={e => update('name', e.target.value)} />
          </div>
        )}

        {currentStepId === 'year' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Current Year</h2>
            <div className="grid gap-3">
              {(['first', 'second', 'third+'] as const).map(y => (
                <button key={y} onClick={() => update('yearType', y)} className={`p-4 rounded-lg border text-left transition ${data.yearType === y ? 'border-[#0066CC] bg-[#0066CC]/10' : 'border-[#1e2a3a] bg-[#0a0e14]'}`}>
                  {y === 'first' ? 'First Year (Entering UofT)' : y === 'second' ? 'Second Year' : 'Upper Year'}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStepId === 'admission' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Admission Category</h2>
            <div className="grid grid-cols-1 gap-2">
              {ADMISSION_CATEGORIES.map(c => (
                <button key={c} onClick={() => update('admissionCategory', c)} className={`p-3 rounded-lg border text-left ${data.admissionCategory === c ? 'border-[#0066CC] bg-[#0066CC]/10' : 'border-[#1e2a3a]'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStepId === 'interests' && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Interests</h2>
            <p className="text-[#8b9aad] text-sm mb-4">What subjects are you curious about?</p>
            <TagInput tags={data.interests} onTagsChange={t => update('interests', t)} placeholder="e.g. AI, Economics, Music..." />
          </div>
        )}

        {currentStepId === 'program-category' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Field</h2>
            <div className="grid grid-cols-2 gap-3">
              {PROGRAM_TREE.map(cat => (
                <button key={cat.category} onClick={() => update('programCategory', cat.category)} className={`p-3 rounded-lg border text-sm text-left ${data.programCategory === cat.category ? 'border-[#0066CC] bg-[#0066CC]/10' : 'border-[#1e2a3a]'}`}>
                  {cat.icon} {cat.category}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStepId === 'program-select' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Program of Study</h2>
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
              {PROGRAM_TREE.find(c => c.category === data.programCategory)?.programs.map(p => (
                <button key={p} onClick={() => update('programOfStudy', p)} className={`p-3 rounded-lg border text-left text-sm ${data.programOfStudy === p ? 'border-[#0066CC] bg-[#0066CC]/10' : 'border-[#1e2a3a]'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => update('programOfStudy', '__other__')} className={`p-3 rounded-lg border text-left text-sm ${data.programOfStudy === '__other__' ? 'border-[#0066CC] bg-[#0066CC]/10' : 'border-[#1e2a3a]'}`}>Other / Not Listed</button>
            </div>
          </div>
        )}

        {currentStepId === 'courses-completed' && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Completed Courses</h2>
            <p className="text-sm text-[#8b9aad] mb-4">Add your core UofT courses (e.g., MAT137, CSC148)</p>
            <TagInput tags={data.coursesCompleted} onTagsChange={t => update('coursesCompleted', t)} />
          </div>
        )}

        {(currentStepId === 'goals-first' || currentStepId === 'goals-upper') && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Primary Goal</h2>
            <div className="grid gap-3">
              {(currentStepId === 'goals-first' ? GOALS_FIRST_YEAR : GOALS_UPPER_YEAR).map(g => (
                <button key={g} onClick={() => update(currentStepId === 'goals-first' ? 'goalsFirstYear' : 'goalsSecondYear', g)} className={`p-4 rounded-lg border text-left ${ (data.goalsFirstYear === g || data.goalsSecondYear === g) ? 'border-[#0066CC] bg-[#0066CC]/10' : 'border-[#1e2a3a]'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStepId === 'learning-style' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Learning Style</h2>
            <div className="grid gap-3">
              {LEARNING_STYLES.map(s => (
                <button key={s.id} onClick={() => update('learningStyle', s.id)} className={`flex items-center gap-4 p-4 rounded-lg border text-left ${data.learningStyle === s.id ? 'border-[#0066CC] bg-[#0066CC]/10' : 'border-[#1e2a3a]'}`}>
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

        {/* --- 底部控制 --- */}
        <div className="mt-8 flex justify-between">
          <button onClick={() => setStepIndex(i => i - 1)} disabled={stepIndex === 0} className="text-[#8b9aad] disabled:opacity-0">Back</button>
          <button onClick={goNext} className="bg-[#0066CC] px-8 py-2 rounded-lg font-bold hover:bg-[#0052a3] transition">
            {stepIndex === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
