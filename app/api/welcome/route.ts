import { NextResponse } from 'next/server'

const PROGRAM_CALENDAR_URLS: Record<string, string> = {
  'Mathematics Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1165',
  'Mathematics Major': 'https://artsci.calendar.utoronto.ca/program/asmaj1165',
  'Mathematics Minor': 'https://artsci.calendar.utoronto.ca/program/asmin1165',
  'Applied Mathematics Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1196',
  'Mathematics & Physics Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1312',
  'Statistical Sciences Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1169',
  'Statistics Major': 'https://artsci.calendar.utoronto.ca/program/asmaj1169',
  'Data Science Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1697',
  'Computer Science Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1689',
  'Computer Science Major': 'https://artsci.calendar.utoronto.ca/program/asmaj1689',
  'Computer Science Minor': 'https://artsci.calendar.utoronto.ca/program/asmin1689',
  'Psychology Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1397',
  'Psychology Major': 'https://artsci.calendar.utoronto.ca/program/asmaj1397',
  'Sociology Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1435',
  'Sociology Major': 'https://artsci.calendar.utoronto.ca/program/asmaj1435',
  'Human Biology Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1213',
  'Neuroscience Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1216',
}

interface Course {
  code: string
  name: string
  reason: string
  type: string
  workload: number
  prerequisites: string[]
}

interface Semester {
  semester: string
  totalWorkload: number
  courses: Course[]
}

export async function POST(req: Request) {
  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY
    const tavilyKey = process.env.TAVILY_API_KEY
    if (!openrouterKey) return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 })
    if (!tavilyKey) return NextResponse.json({ error: 'TAVILY_API_KEY not configured' }, { status: 500 })

    const profile = await req.json()
    if (!profile?.name) return NextResponse.json({ error: 'Invalid profile' }, { status: 400 })

    const program = profile.programOfStudy && profile.programOfStudy !== '__other__'
      ? profile.programOfStudy : profile.programOther || profile.admissionCategory
    const completed: string[] = profile.coursesCompleted || profile.coursesTaken || []
    const goals = profile.goalsSecondYear || profile.goalsFirstYear || ''
    const startYear = profile.yearType === 'first' ? 1 : 2

    // Normalize completed courses for filtering
    const completedSet = new Set(completed.map(c => c.toUpperCase().replace(/\s/g, '')))

    // Step 1: Fetch real program requirements from UofT calendar
    const calendarUrl = PROGRAM_CALENDAR_URLS[program]
    const searchResults = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: `${program} required courses prerequisites credits`,
        search_depth: 'advanced',
        include_domains: ['artsci.calendar.utoronto.ca'],
        ...(calendarUrl ? { include_urls: [calendarUrl] } : {}),
        max_results: 5,
      }),
    }).then(r => r.json())

    const programContext = (searchResults.results || [])
      .map((r: { url: string; content: string }) => `[${r.url}]\n${r.content}`)
      .join('\n\n')

    // Step 2: Generate plan with AI
    const semesters = [
      'First Year Fall', 'First Year Winter',
      'Second Year Fall', 'Second Year Winter',
      'Third Year Fall', 'Third Year Winter',
      'Fourth Year Fall', 'Fourth Year Winter',
    ]
    const remainingSemesters = semesters.slice((startYear - 1) * 2)

    // 建议在 API 路由中这样优化 Prompt 部分
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  // ... 其他配置保持不变
  body: JSON.stringify({
    model: 'openai/gpt-4o', // 建议使用 4o 获得更强的逻辑推理能力
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a Senior UofT Academic Advisor.
        TASKS: 
        1. Create a 4-year degree plan. 
        2. MANDATORY: Fill 5 courses per semester (unless graduation requirements are met sooner).
        3. BALANCE: Mix 2-3 program core courses with 2 breadth/elective courses per semester.
        4. VALIDATION: Only use courses found in the provided calendar data.
        5. FORMAT: JSON output strictly following the schema.`,
      },
      {
        role: 'user',
        content: `Generate a full, aggressive degree plan for ${profile.name}.
        Program: ${program}
        Completed: ${JSON.stringify(completed)}
        Goals: ${goals}
        Learning Style: ${profile.learningStyle}

        Calendar Context: ${programContext}

        CRITICAL: Provide 5 courses per semester. If a student needs breadth requirements, select suitable courses (e.g., BR1, BR2, etc.).

        Output as this JSON:
        {
          "message": "String: 2 sentence encouraging advice",
          "courseSchedule": [
            {
              "semester": "First Year Fall",
              "courses": [
                { "code": "MAT137Y1", "name": "Calculus", "type": "CORE", "workload": 10, "reason": "Program req" }
              ]
            }
          ],
          "degreeProgress": { ... }
        }`,
      },
    ],
  }),
})})

    const data = await response.json()
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })

    const raw = data.choices?.[0]?.message?.content?.trim() || ''
    try {
      const parsed = JSON.parse(raw)

      // Filter out already completed courses from schedule
      const filteredSchedule = (parsed.courseSchedule || [])
        .map((sem: Semester) => ({
          ...sem,
          courses: sem.courses.filter(
            (c: Course) => !completedSet.has(c.code.toUpperCase().replace(/\s/g, ''))
          ),
          totalWorkload: sem.courses
            .filter((c: Course) => !completedSet.has(c.code.toUpperCase().replace(/\s/g, '')))
            .reduce((sum: number, c: Course) => sum + (c.workload || 8), 0),
        }))
        .filter((sem: Semester) => sem.courses.length > 0)

      return NextResponse.json({
        message: parsed.message || '',
        courseSchedule: filteredSchedule,
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
