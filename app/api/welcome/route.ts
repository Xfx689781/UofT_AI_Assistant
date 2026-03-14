import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })

    const profile = await req.json()
    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    })

    const prompt = `
You are an expert academic advisor for University of Toronto.
Student profile: ${JSON.stringify(profile)}

Search your knowledge of UofT's official program requirements for "${profile.programOfStudy || profile.admissionCategory}" and generate:

1. A warm personalized welcome message mentioning their name and one specific academic tip
2. A realistic semester-by-semester course plan based on:
   - Their completed courses: ${JSON.stringify(profile.coursesCompleted || profile.coursesTaken || [])}
   - Their program requirements (use real UofT course codes)
   - Their goal: ${profile.goalsSecondYear || profile.goalsFirstYear}
   - Strict prerequisite checking
   - Max 5 courses per semester
   - NO sections, NO professors, courses only
3. Degree progress estimate

Return ONLY this JSON:
{
  "message": "personalized 2-3 sentence welcome",
  "courseSchedule": [
    {
      "semester": "Fall 2026",
      "courses": [
        { "code": "MAT237", "name": "Multivariable Calculus", "reason": "Required, prereqs met", "type": "required" }
      ]
    }
  ],
  "degreeProgress": {
    "completedCredits": 2,
    "requiredCredits": 20,
    "remainingRequired": ["MAT237", "MAT246"],
    "nextMilestone": "Complete MAT237 to unlock upper-year math"
  }
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ message: text, courseSchedule: [], degreeProgress: null })
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
