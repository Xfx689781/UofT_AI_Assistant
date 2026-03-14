import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 })

    const profile = await req.json()
    if (!profile?.name) return NextResponse.json({ error: 'Invalid profile' }, { status: 400 })

    const program = profile.programOfStudy && profile.programOfStudy !== '__other__'
      ? profile.programOfStudy : profile.programOther || profile.admissionCategory

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
            content: 'You are a UofT academic advisor. You must respond with only a valid JSON object.',
          },
          {
            role: 'user',
            content: `Generate a complete degree plan for this UofT student from NOW until graduation (all remaining semesters up to 4th year).

Student:
- Name: ${profile.name}
- Program: ${program}
- Year: ${profile.yearType}
- Completed courses: ${JSON.stringify(profile.coursesCompleted || profile.coursesTaken || [])}
- Goals: ${profile.goalsSecondYear || profile.goalsFirstYear || 'not specified'}
- Learning style: ${profile.learningStyle || 'not specified'}

IMPORTANT:
- Generate ALL semesters from next semester until graduation (typically 6-8 semesters total)
- Each course must include workload (hours per week as a number 1-15)
- Each course must include prerequisites list
- Each semester must include totalWorkload (sum of all course workloads)
- Respect prerequisites strictly
- Required courses first, then electives based on goals
- Max 5 courses per semester

Return this JSON:
{
  "message": "warm 2-3 sentence welcome for ${profile.name} with one specific tip",
  "courseSchedule": [
    {
      "semester": "Fall 2026",
      "totalWorkload": 42,
      "courses": [
        {
          "code": "MAT237",
          "name": "Multivariable Calculus",
          "reason": "Required for your program",
          "type": "required",
          "workload": 10,
          "prerequisites": ["MAT137"]
        }
      ]
    }
  ],
  "degreeProgress": {
    "completedCredits": 2,
    "requiredCredits": 20,
    "remainingRequired": ["MAT237", "MAT246", "MAT301"],
    "nextMilestone": "Complete MAT237 to unlock upper-year math"
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
