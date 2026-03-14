import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 })

    const { courseCode, studentProfile } = await req.json()
    if (!courseCode) return NextResponse.json({ error: 'courseCode required' }, { status: 400 })

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
            content: `Analyze professors who teach ${courseCode} at University of Toronto.

Student profile:
- Goals: ${studentProfile?.goalsSecondYear || studentProfile?.goalsFirstYear || 'not specified'}
- Learning style: ${studentProfile?.learningStyle || 'not specified'}
- Program: ${studentProfile?.programOfStudy || studentProfile?.admissionCategory || 'not specified'}
- Completed courses: ${JSON.stringify(studentProfile?.coursesCompleted || [])}

Based on your knowledge of RMP reviews and Reddit r/UofT discussions, return this JSON object:
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
      return NextResponse.json({ error: 'Could not parse response', raw }, { status: 500 })
    }

    try {
      return NextResponse.json(JSON.parse(jsonMatch[0]))
    } catch {
      return NextResponse.json({ error: 'JSON parse failed', raw }, { status: 500 })
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
