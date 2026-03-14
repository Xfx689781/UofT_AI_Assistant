import { NextResponse } from 'next/server'

interface CourseWithDetails {
  code: string
  name: string
  reason: string
  type: 'required' | 'elective'
  workload: number
  prerequisites: string[]
  coreTopics: string[]
  whyNow: string
}

interface SemesterPlan {
  semester: string
  totalWorkload: number
  courses: CourseWithDetails[]
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 })

    const profile = await req.json()
    if (!profile?.name) return NextResponse.json({ error: 'Invalid profile' }, { status: 400 })

    const program = profile.programOfStudy && profile.programOfStudy !== '__other__'
      ? profile.programOfStudy : profile.programOther || profile.admissionCategory

    const completed: string[] = profile.coursesCompleted || profile.coursesTaken || []
    const goals = profile.goalsSecondYear || profile.goalsFirstYear || ''
    const yearType = profile.yearType || 'first'
    const interests = profile.interests || []
    const learningStyle = profile.learningStyle || ''
    const studyHours = profile.studyHoursPerWeek || '10–20h'

    const completedSet = new Set(completed.map(c => c.toUpperCase().replace(/\s/g, '')))

    // Derive student context
    const isGradSchool = goals.toLowerCase().includes('grad') || goals.toLowerCase().includes('research') || goals.toLowerCase().includes('theoretical')
    const isIndustry = goals.toLowerCase().includes('industry') || goals.toLowerCase().includes('job')
    const isMath = program.toLowerCase().includes('math') || interests.includes('Pure Mathematics')
    const isCS = program.toLowerCase().includes('computer') || interests.includes('Computer Science')
    const isStats = program.toLowerCase().includes('stat') || program.toLowerCase().includes('data') || interests.includes('Statistics')
    const isLifeSci = program.toLowerCase().includes('bio') || program.toLowerCase().includes('neuro') || program.toLowerCase().includes('physio') || interests.includes('Biology')
    const isPsych = program.toLowerCase().includes('psych') || interests.includes('Psychology')
    const canHandleHeavy = studyHours === '20–30h' || studyHours === '30h+'

    // Semester labels based on year
    const semesterMap: Record<string, string[]> = {
      'first': ['First Year Fall', 'First Year Winter', 'Second Year Fall', 'Second Year Winter', 'Third Year Fall', 'Third Year Winter', 'Fourth Year Fall', 'Fourth Year Winter'],
      'second': ['Second Year Fall', 'Second Year Winter', 'Third Year Fall', 'Third Year Winter', 'Fourth Year Fall', 'Fourth Year Winter'],
      'third+': ['Third Year Fall', 'Third Year Winter', 'Fourth Year Fall', 'Fourth Year Winter'],
    }
    const semesters = semesterMap[yearType] || semesterMap['first']

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://uof-t-ai-assistant.vercel.app',
        'X-Title': 'UofT AI Assistant',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are an expert UofT academic advisor who thinks about courses from a HIGH-LEVEL KNOWLEDGE PERSPECTIVE, not just a checklist perspective.

Your philosophy: recommend courses that build a student's intellectual foundation, connect ideas across fields, and serve their long-term trajectory — not just whatever is "required next."

CRITICAL RULES:
1. NEVER recommend courses the student has already completed: ${JSON.stringify(completed)}
2. Semester labels MUST be exactly from this list: ${JSON.stringify(semesters)}
3. Respect prerequisites strictly
4. For each course, explain its core intellectual content (not just "it's required")
5. Max 4-5 courses per semester — quality over quantity
6. Vary recommendations based on student profile — a psych student and a math specialist should get completely different courses
7. If student is strong (30h+ study time, grad school goals) → include challenging upper-year courses earlier
8. Use REAL UofT course codes with suffix (MAT237Y1, not just MAT237)

KNOWN PREREQUISITES:
- MAT237Y1 → MAT137Y1
- MAT240H1 → MAT137Y1  
- MAT244H1 → MAT135H1+MAT136H1+MAT223H1
- MAT246H1 → MAT137Y1
- MAT247H1 → MAT240H1
- MAT257Y1 → MAT157Y1
- MAT267H1 → MAT157Y1+MAT240H1
- MAT301H1 → MAT240H1
- MAT327H1 → MAT257Y1
- MAT334H1 → MAT237Y1
- MAT337H1 → MAT237Y1+MAT246H1
- MAT347Y1 → MAT247H1
- MAT351Y1 → MAT267H1+MAT237Y1
- MAT354H1 → MAT257Y1
- MAT357H1 → MAT257Y1
- MAT363H1 → MAT237Y1+MAT224H1
- STA237H1 → MAT137Y1
- STA238H1 → STA237H1
- STA302H1 → STA238H1+MAT223H1
- STA347H1 → MAT237Y1+STA238H1
- CSC148H1 → CSC108H1
- CSC110Y1 → none
- CSC111H1 → CSC110Y1
- CSC207H1 → CSC148H1
- CSC209H1 → CSC148H1
- CSC236H1 → CSC148H1+CSC165H1
- CSC258H1 → CSC148H1+CSC165H1
- CSC263H1 → CSC207H1+CSC236H1
- CSC311H1 → CSC207H1+MAT237Y1+STA238H1
- CSC369H1 → CSC209H1+CSC263H1
- CSC373H1 → CSC263H1`,
          },
          {
            role: 'user',
            content: `Generate a high-level course plan for ${profile.name}.

STUDENT PROFILE:
- Program: ${program}
- Year: ${yearType} (starting from ${semesters[0]})
- Completed courses: ${JSON.stringify(completed)} ← DO NOT include any of these
- Goals: ${goals}
- Learning style: ${learningStyle}
- Study capacity: ${studyHours}/week
- Interests: ${JSON.stringify(interests)}
- Student type: ${[
  isGradSchool ? 'GRAD_SCHOOL_BOUND' : '',
  isIndustry ? 'INDUSTRY_FOCUSED' : '',
  isMath ? 'MATH_STUDENT' : '',
  isCS ? 'CS_STUDENT' : '',
  isStats ? 'STATS_STUDENT' : '',
  isLifeSci ? 'LIFE_SCI_STUDENT' : '',
  isPsych ? 'PSYCH_STUDENT' : '',
  canHandleHeavy ? 'HIGH_CAPACITY' : 'MODERATE_CAPACITY',
].filter(Boolean).join(', ')}

PHILOSOPHY: Think about what courses will genuinely develop this student intellectually. 
- For MATH_STUDENT + GRAD_SCHOOL_BOUND: prioritize proof-based theory courses (MAT246, MAT240, MAT337, MAT347)
- For CS_STUDENT + INDUSTRY_FOCUSED: prioritize systems + ML courses (CSC263, CSC369, CSC311, CSC343)
- For LIFE_SCI_STUDENT: mix of required bio courses + relevant quantitative electives
- For HIGH_CAPACITY students: can introduce upper-year courses a year earlier if prereqs are met
- Cross-disciplinary electives are valuable — a math student might benefit from STA347, a CS student from MAT337

For each course, explain its CORE INTELLECTUAL CONTENT — what will the student actually learn and why it matters for their trajectory.

Return ONLY this JSON:
{
  "message": "warm 2-3 sentence welcome for ${profile.name} that reflects their specific trajectory (${program}, ${goals}) with one concrete insight",
  "courseSchedule": [
    {
      "semester": "${semesters[0]}",
      "totalWorkload": 38,
      "courses": [
        {
          "code": "MAT246H1",
          "name": "Abstract Mathematics",
          "reason": "Foundation for all upper-year math — introduces the language of proofs",
          "type": "required",
          "workload": 8,
          "prerequisites": ["MAT137Y1"],
          "coreTopics": ["Mathematical induction", "Set theory", "Logic and proof techniques", "Functions and relations", "Introduction to abstract structures"],
          "whyNow": "Take this in second year — it's the bridge between computational math and abstract thinking. Everything in MAT301, MAT337, MAT347 builds on this."
        }
      ]
    }
  ],
  "degreeProgress": {
    "completedCredits": ${completed.length * 0.5},
    "requiredCredits": 20,
    "remainingRequired": ["list key remaining required courses"],
    "nextMilestone": "specific and meaningful next step for this student"
  }
}`,
          },
        ],
      }),
    })

    const data = await response.json()
    if (data.error) return NextResponse.json({ error: data.error.message || 'OpenRouter error' }, { status: 500 })

    const raw = data.choices?.[0]?.message?.content?.trim() || ''
    try {
      const parsed = JSON.parse(raw)

      // Filter out completed courses (safety net)
      const filtered = (parsed.courseSchedule || [])
        .map((sem: SemesterPlan) => ({
          ...sem,
          courses: sem.courses.filter(
            (c: CourseWithDetails) => !completedSet.has(c.code.toUpperCase().replace(/\s/g, ''))
          ),
          totalWorkload: sem.courses
            .filter((c: CourseWithDetails) => !completedSet.has(c.code.toUpperCase().replace(/\s/g, '')))
            .reduce((sum: number, c: CourseWithDetails) => sum + (c.workload || 8), 0),
        }))
        .filter((sem: SemesterPlan) => sem.courses.length > 0)

      return NextResponse.json({
        message: parsed.message || '',
        courseSchedule: filtered,
        degreeProgress: parsed.degreeProgress || null,
      })
    } catch {
      return NextResponse.json({ message: '', courseSchedule: [], degreeProgress: null })
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
