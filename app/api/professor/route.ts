import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are UofT AI Assistant analyzing professors for a specific course at the University of Toronto.

You have web search. For the given course code and student profile:

STEP 1 - Search for professors teaching this course:
- Search "ratemyprofessors.com UofT [course code] [professor name]" for each known professor
- Search "reddit r/UofT [course code] professor which section" for student discussions
- Search "UofT timetable [course code] 2025 professor" to find who has taught recently

STEP 2 - For each professor found, analyze:
- Teaching clarity (how well they explain concepts)
- Exam style (proof-heavy, computational, open-book, etc.)
- Accessibility (office hours, email responsiveness)
- Grading fairness (bell curve, strict, generous)
- Workload (assignments, readings)
- Who they suit best (grad-school-bound, just passing, visual learners, etc.)

STEP 3 - Match professors to the student's profile and goals

STEP 4 - Return ONLY valid JSON:
{
  "courseCode": "MAT237",
  "courseName": "Multivariable Calculus",
  "professors": [
    {
      "name": "John Smith",
      "rmpRating": 4.2,
      "rmpDifficulty": 3.8,
      "numRatings": 45,
      "dimensions": {
        "teachingClarity": 8,
        "examPredictability": 7,
        "accessibility": 9,
        "gradingFairness": 6,
        "workload": 5,
        "engagement": 8
      },
      "examStyle": "Proof-heavy, similar to lecture examples",
      "teachingStyle": "Board-based, very structured, encourages questions",
      "bestFor": "Students aiming for grad school or who want deep understanding",
      "warnings": "Moves fast in first 3 weeks, stick with it",
      "tags": ["#ProofHeavy", "#GoodOfficeHours", "#FastPaced", "#BellCurve"],
      "recentQuotes": [
        "Best prof for MAT237 if you want to actually understand the material",
        "Office hours are incredibly helpful, go every week"
      ],
      "enrollmentTrend": "stable"
    }
  ],
  "recommendedFor": "John Smith",
  "recommendationReason": "Based on your grad school goal and practice-heavy learning style, Smith's structured approach and strong office hours support make him the best fit."
}

RULES:
- Search thoroughly before generating
- Be honest about limitations if data is sparse
- Always give a clear recommendation with reasoning
- Dimensions are scores out of 10
- enrollmentTrend: "rising", "stable", or "dropping" based on what you find`

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 })

    const { courseCode, studentProfile } = await req.json()
    if (!courseCode) return NextResponse.json({ error: 'Course code required' }, { status: 400 })

    const profileSummary = studentProfile ? `
Student goals: ${studentProfile.goalsSecondYear || studentProfile.goalsFirstYear || 'not specified'}
Learning style: ${studentProfile.learningStyle || 'not specified'}
Program: ${studentProfile.programOfStudy || studentProfile.admissionCategory || 'not specified'}
` : ''

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      tools: [{ type: 'web_search_20250305', name: 'web_search' } as never],
      messages: [{
        role: 'user',
        content: `Analyze all professors who teach ${courseCode} at UofT. Search RMP, Reddit r/UofT, and UofT timetable data.\n\nStudent profile:\n${profileSummary}\n\nReturn full professor analysis as JSON.`,
      }],
    })

    let raw = ''
    for (const block of response.content) {
      if (block.type === 'text') raw = block.text.trim()
    }

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: 'Could not parse response', raw }, { status: 500 })

    try {
      const parsed = JSON.parse(jsonMatch[0])
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json({ error: 'JSON parse failed', raw }, { status: 500 })
    }
  } catch (error) {
    console.error('Professor API error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
