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
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are a UofT academic advisor. You MUST respond with ONLY a raw JSON object. Do NOT use markdown code blocks. Do NOT write ```json. Do NOT add any text before or after the JSON. Start your response directly with { and end with }.',
          },
          {
            role: 'user',
            content: `Student name: ${profile.name}
Program: ${program}
Year type: ${profile.yearType}
Completed courses: ${JSON.stringify(profile.coursesCompleted || profile.coursesTaken || [])}
Goals: ${profile.goalsSecondYear || profile.goalsFirstYear || 'not specified'}
Learning style: ${profile.learningStyle || 'not specified'}
Interests: ${JSON.stringify(profile.interests || [])}

Based on UofT Arts & Science requirements for "${program}", generate a personalized academic plan.

Return this JSON object:
{
  "message": "warm 2-3 sentence welcome for ${profile.name} mentioning their program and one specific academic tip",
  "courseSchedule": [
    {
      "semester": "Fall 2026",
      "courses": [
        {
          "code": "MAT237",
          "name": "Multivariable Calculus",
          "reason": "Required for your program, prereqs met",
          "type": "required"
        }
      ]
    }
  ],
  "degreeProgress": {
    "completedCredits": 2,
    "requiredCredits": 20,
    "remainingRequired": ["MAT237", "MAT246"],
    "nextMilestone": "Complete MAT237 to unlock upper-year math courses"
  }
}`,
          },
        ],
      }),
    })

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content?.trim() || ''

    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Raw response:', raw)
      return NextResponse.json({ message: '', courseSchedule: [], degreeProgress: null })
    }

    try {
      const parsed = JSON.parse(jsonMatch[0])
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
