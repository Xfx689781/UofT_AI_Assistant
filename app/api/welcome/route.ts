import { NextResponse } from 'next/server'

// UofT program calendar URLs
const PROGRAM_URLS: Record<string, string> = {
  'Mathematics Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1165',
  'Mathematics Major': 'https://artsci.calendar.utoronto.ca/program/asmaj1165',
  'Mathematics Minor': 'https://artsci.calendar.utoronto.ca/program/asmin1165',
  'Applied Mathematics Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1196',
  'Mathematics & Physics Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1312',
  'Mathematics & Philosophy Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1309',
  'Statistical Sciences Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1169',
  'Statistics Major': 'https://artsci.calendar.utoronto.ca/program/asmaj1169',
  'Statistics Minor': 'https://artsci.calendar.utoronto.ca/program/asmin1169',
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
  'Life Sciences': 'https://artsci.calendar.utoronto.ca/section/Life-Sciences',
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
    const completed = profile.coursesCompleted || profile.coursesTaken || []
    const goals = profile.goalsSecondYear || profile.goalsFirstYear || ''

    // Step 1: Get real program requirements from UofT calendar
    const programUrl = PROGRAM_URLS[program]
    let programData = ''

    if (programUrl) {
      // Fetch directly from UofT calendar
      const calendarRes = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${program} required courses prerequisites UofT artsci calendar`,
          search_depth: 'advanced',
          include_domains: ['artsci.calendar.utoronto.ca'],
          max_results: 5,
        }),
      }).then(r => r.json())

      programData = (calendarRes.results || [])
        .map((r: { url: string; content: string }) => `[${r.url}]\n${r.content}`)
        .join('\n\n')
    }

    // Step 2: Generate plan with AI using real data
    const startYear = profile.yearType === 'first' ? 1 : 2
    const semesters = [
      'First Year Fall', 'First Year Winter',
      'Second Year Fall', 'Second Year Winter',
      'Third Year Fall', 'Third Year Winter',
      'Fourth Year Fall', 'Fourth Year Winter',
    ]
    const remainingSemesters = semesters.slice((startYear - 1) * 2)

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
            content: `You are an expert UofT academic advisor. Use the REAL program data from UofT's calendar to generate an ACCURATE course plan.

CRITICAL RULES:
- Use ONLY real UofT course codes (e.g. MAT237Y1, CSC207H1)
- Semester labels must be: "First Year Fall", "First Year Winter", "Second Year Fall", etc.
- NEVER put a course before its prerequisites are completed
- Max 5 courses per semester
- Required courses MUST match the official program requirements from the calendar data
- workload is hours/week (1-15)
- prerequisites must be exact course codes`,
          },
          {
            role: 'user',
            content: `Generate complete degree plan for ${profile.name} in ${program} at UofT.

Student info:
- Currently in: Year ${startYear}
- Completed courses: ${JSON.stringify(completed)}
- Goals: ${goals}
- Learning style: ${profile.learningStyle}

OFFICIAL UOFT CALENDAR DATA FOR ${program.toUpperCase()}:
${programData || 'Use your knowledge of UofT programs'}

KNOWN PREREQUISITES:
MAT237Y1 → requires MAT137Y1
MAT240H1 → requires MAT137Y1
MAT247H1 → requires MAT240H1
MAT257Y1 → requires MAT157Y1
MAT267H1 → requires MAT157Y1, MAT240H1
MAT301H1 → requires MAT240H1
MAT327H1 → requires MAT257Y1
MAT337H1 → requires MAT237Y1, MAT246H1
MAT347Y1 → requires MAT247H1
MAT351Y1 → requires MAT267H1, MAT237Y1
MAT354H1 → requires MAT257Y1
MAT357H1 → requires MAT257Y1
STA237H1 → requires MAT137Y1
STA238H1 → requires STA237H1
STA347H1 → requires MAT237Y1, STA238H1
CSC148H1 → requires CSC108H1
CSC110Y1 → no prereqs (new stream)
CSC111H1 → requires CSC110Y1
CSC207H1 → requires CSC148H1
CSC209H1 → requires CSC148H1
CSC236H1 → requires CSC148H1, CSC165H1
CSC258H1 → requires CSC148H1, CSC165H1
CSC263H1 → requires CSC207H1, CSC236H1
CSC369H1 → requires CSC209H1, CSC263H1
CSC373H1 → requires CSC263H1
CSC311H1 → requires CSC207H1, MAT237Y1, STA238H1

Semesters to fill: ${remainingSemesters.join(', ')}

Return ONLY this JSON:
{
  "message": "warm 2-3 sentence welcome for ${profile.name} in ${program} with one specific tip",
  "courseSchedule": [
    {
      "semester": "Second Year Fall",
      "totalWorkload": 42,
      "courses": [
        {
          "code": "MAT237Y1",
          "name": "Multivariable Calculus",
          "reason": "Required for ${program}",
          "type": "required",
          "workload": 12,
          "prerequisites": ["MAT137Y1"]
        }
      ]
    }
  ],
  "degreeProgress": {
    "completedCredits": ${completed.length * 0.5},
    "requiredCredits": 20,
    "remainingRequired": ["MAT237Y1", "MAT240H1"],
    "nextMilestone": "Complete first year requirements to unlock upper year courses"
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
