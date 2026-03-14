import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })

    const { courseCode, studentProfile } = await req.json()
    if (!courseCode) return NextResponse.json({ error: 'courseCode required' }, { status: 400 })

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    })

    const prompt = `You are a UofT academic advisor with knowledge of Rate My Professors and Reddit r/UofT.

Analyze professors who teach ${courseCode} at University of Toronto.

Student profile:
- Goals: ${studentProfile?.goalsSecondYear || studentProfile?.goalsFirstYear || 'not specified'}
- Learning style: ${studentProfile?.learningStyle || 'not specified'}
- Program: ${studentProfile?.programOfStudy || studentProfile?.admissionCategory || 'not specified'}
- Completed courses: ${JSON.stringify(studentProfile?.coursesCompleted || [])}

Return a JSON object with this exact structure:
{
  "courseCode": "${courseCode}",
  "courseName": "full course name",
  "recommendedFor": "Professor Name",
  "recommendationReason": "personalized reason for this student",
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
      "examStyle": "description of exam format and style",
      "teachingStyle": "description of teaching approach",
      "bestFor": "type of student who thrives with this prof",
      "warnings": "honest heads up for students",
      "tags": ["#ProofHeavy", "#GoodOfficeHours", "#BellCurve"],
      "recentQuotes": ["paraphrased student feedback 1", "paraphrased student feedback 2"],
      "enrollmentTrend": "stable"
    }
  ]
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    try {
      return NextResponse.json(JSON.parse(text))
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return NextResponse.json({ error: 'Could not parse response', raw: text }, { status: 500 })
      return NextResponse.json(JSON.parse(jsonMatch[0]))
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
