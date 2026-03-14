import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    const { courseCode, studentProfile } = await req.json()
    if (!courseCode) return NextResponse.json({ error: 'courseCode required' }, { status: 400 })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' } as never],
      system: `You are a UofT academic advisor. Search RMP and Reddit r/UofT for professor data and return ONLY valid JSON, no markdown.`,
      messages: [{
        role: 'user',
        content: `Search ratemyprofessors.com and reddit r/UofT for professors teaching ${courseCode} at University of Toronto.

Student profile:
- Goals: ${studentProfile?.goalsSecondYear || studentProfile?.goalsFirstYear || 'not specified'}
- Learning style: ${studentProfile?.learningStyle || 'not specified'}
- Program: ${studentProfile?.programOfStudy || studentProfile?.admissionCategory || 'not specified'}

Return ONLY this JSON:
{
  "courseCode": "${courseCode}",
  "courseName": "full name",
  "recommendedFor": "Professor Name",
  "recommendationReason": "why this prof suits this student",
  "professors": [
    {
      "name": "Full Name",
      "rmpRating": 4.2,
      "rmpDifficulty": 3.5,
      "numRatings": 45,
      "dimensions": {
        "teachingClarity": 8,
        "examPredictability": 7,
        "accessibility": 9,
        "gradingFairness": 6,
        "workload": 5,
        "engagement": 8
      },
      "examStyle": "description",
      "teachingStyle": "description",
      "bestFor": "type of student",
      "warnings": "honest heads up",
      "tags": ["#ProofHeavy", "#GoodOfficeHours"],
      "recentQuotes": ["paraphrased feedback 1", "paraphrased feedback 2"],
      "enrollmentTrend": "stable"
    }
  ]
}`,
      }],
    })

    let raw = ''
    for (const block of response.content) {
      if (block.type === 'text') raw = block.text.trim()
    }

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: 'Could not parse response' }, { status: 500 })
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
