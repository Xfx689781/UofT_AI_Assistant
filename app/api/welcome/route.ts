import { NextResponse } from 'next/server'

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

    // Step 1: Search real UofT program requirements
    const searches = await Promise.all([
      fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `"${program}" requirements courses artsci.calendar.utoronto.ca`,
          search_depth: 'advanced',
          max_results: 5,
        }),
      }).then(r => r.json()),
      fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `UofT ${program} prerequisite course list degree requirements`,
          search_depth: 'advanced',
          max_results: 5,
        }),
      }).then(r => r.json()),
    ])

    const context = searches
      .flatMap(s => s.results || [])
      .map((r: { url: string; content: string }) => `[${r.url}]\n${r.content}`)
      .join('\n\n')

    const currentYear = profile.yearType === 'first' ? 1 :
      profile.yearType === 'second+' ? 2 : 1

    const completedCourses = profile.coursesCompleted || profile.coursesTaken || []

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
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
            content: `You are a UofT academic advisor. Use the search results to generate an ACCURATE course plan.
CRITICAL RULES:
- Use ONLY real UofT course codes found in search results or well-known UofT courses
- Prerequisites MUST be accurate (e.g. MAT237 requires MAT137, MAT240 requires MAT137)
- Label semesters as "First Year Fall", "First Year Winter", "Second Year Fall", etc. NOT by calendar year
- Max 5 courses per semester, aim for 4-5
- Never put a course before its prerequisites are completed
- Required courses must match the actual program requirements from search results`,
          },
          {
            role: 'user',
            content: `Generate complete degree plan for this UofT student.

Student:
- Name: ${profile.name}
- Program: ${program}
- Currently in: Year ${currentYear}
- Completed courses: ${JSON.stringify(completedCourses)}
- Goals: ${profile.goalsSecondYear || profile.goalsFirstYear || 'not specified'}
- Learning style: ${profile.learningStyle}

REAL PROGRAM DATA FROM UOFT CALENDAR:
${context}

KNOWN UOFT PREREQUISITES (use these):
- MAT237: requires MAT137 (or MAT157)
- MAT240: requires MAT137
- MAT247: requires MAT240
- MAT257: requires MAT157
- MAT301: requires MAT240
- MAT315: requires MAT246 or MAT240
- MAT334: requires MAT237
- MAT337: requires MAT237 and MAT246
- MAT357: requires MAT257
- STA237: requires MAT135 or MAT137
- STA238: requires STA237
- STA347: requires MAT237 and STA238
- CSC148: requires CSC108
- CSC207: requires CSC148
- CSC236: requires CSC148

Generate plan starting from Year ${currentYear}, semester by semester until graduation.
Each semester should be labeled "First Year Fall/Winter", "Second Year Fall/Winter", etc.

Return this JSON:
{
  "message": "warm 2-3 sentence welcome for ${profile.name} with one specific tip",
  "courseSchedule": [
    {
      "semester": "Second Year Fall",
      "totalWorkload": 38,
      "courses": [
        {
          "code": "MAT237",
          "name": "Multivariable Calculus",
          "reason": "Core requirement for ${program}",
          "type": "required",
          "workload": 10,
          "prerequisites": ["MAT137"]
        }
      ]
    }
  ],
  "degreeProgress": {
    "completedCredits": ${completedCourses.length * 0.5},
    "requiredCredits": 20,
    "remainingRequired": ["MAT237", "MAT240", "MAT246"],
    "nextMilestone": "Complete first year calculus and linear algebra to unlock upper year courses"
  }
}`,
          },
        ],
      }),
    })

    const data = await response.json()
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })

    const raw = data.choices?.[0]?.message?.content?.trim() || ''
    try {
      const parsed = JSON.parse(raw)
      return NextResponse.json({
        message: parsed.message || '',
        courseSchedule: parsed.courseSchedule || [],
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
