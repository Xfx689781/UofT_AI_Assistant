import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })

    const profile = await req.json()
    if (!profile?.name) return NextResponse.json({ error: 'Invalid profile' }, { status: 400 })

    const program = profile.programOfStudy && profile.programOfStudy !== '__other__'
      ? profile.programOfStudy : profile.programOther || profile.admissionCategory

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    })

    const prompt = `You are a UofT academic advisor. Based on UofT Arts & Science requirements for "${program}", generate a personalized academic plan.

Student profile:
- Name: ${profile.name}
- Program: ${program}
- Year: ${profile.yearType}
- Completed courses: ${JSON.stringify(profile.coursesCompleted || profile.coursesTaken || [])}
- Goals: ${profile.goalsSecondYear || profile.goalsFirstYear || 'not specified'}
- Learning style: ${profile.learningStyle || 'not specified'}
- Interests: ${JSON.stringify(profile.interests || [])}

Return a JSON object with this exact structure:
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
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    try {
      const parsed = JSON.parse(text)
      return NextResponse.json({
        message: parsed.message || '',
        courseSchedule: parsed.courseSchedule || [],
        degreeProgress: parsed.degreeProgress || null,
      })
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return NextResponse.json({ message: '', courseSchedule: [], degreeProgress: null })
      const parsed = JSON.parse(jsonMatch[0])
      return NextResponse.json({
        message: parsed.message || '',
        courseSchedule: parsed.courseSchedule || [],
        degreeProgress: parsed.degreeProgress || null,
      })
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
