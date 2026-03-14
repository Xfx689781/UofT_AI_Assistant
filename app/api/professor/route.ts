import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY
    const tavilyKey = process.env.TAVILY_API_KEY
    if (!geminiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    if (!tavilyKey) return NextResponse.json({ error: 'TAVILY_API_KEY not configured' }, { status: 500 })

    const { courseCode, studentProfile } = await req.json()
    if (!courseCode) return NextResponse.json({ error: 'courseCode required' }, { status: 400 })

    // Search RMP + Reddit + UofT timetable
    const searchRes = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: `${courseCode} UofT professor ratemyprofessors reddit 2024 2025 review`,
        search_depth: 'advanced',
        include_answer: true,
        max_results: 8,
      }),
    })

    const searchData = await searchRes.json()
    const context = (searchData.results || [])
      .map((r: { url: string; content: string }) => `Source: ${r.url}\n${r.content}`)
      .join('\n\n')

    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: { responseMimeType: 'application/json' },
    })

    const prompt = `
You are a specialized academic advisor for University of Toronto.
Analyze the search results below about professors for ${courseCode}.

Student profile:
- Goals: ${studentProfile?.goalsSecondYear || studentProfile?.goalsFirstYear || 'not specified'}
- Learning style: ${studentProfile?.learningStyle || 'not specified'}
- Program: ${studentProfile?.programOfStudy || studentProfile?.admissionCategory || 'not specified'}
- Completed courses: ${JSON.stringify(studentProfile?.coursesCompleted || [])}

Search results:
${context}

Instructions:
- Identify all professors found for ${courseCode}
- Score each dimension 1-10 based on evidence from the search results
- Recommend the best professor for THIS specific student based on their profile
- enrollmentTrend: guess "rising/stable/dropping" based on reviews sentiment
- If data is sparse, still give best estimates with lower confidence noted in warnings
- recentQuotes must be paraphrased from search results, never exact copied text

Return ONLY this JSON:
{
  "courseCode": "${courseCode}",
  "courseName": "full course name",
  "recommendedFor": "Professor Name",
  "recommendationReason": "personalized reason based on student profile",
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
      "examStyle": "description of exam format",
      "teachingStyle": "description of teaching approach",
      "bestFor": "type of student who thrives",
      "warnings": "honest heads up",
      "tags": ["#ProofHeavy", "#GoodOfficeHours"],
      "recentQuotes": ["paraphrased student feedback 1", "paraphrased student feedback 2"],
      "enrollmentTrend": "stable"
    }
  ]
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: 'Could not parse response' }, { status: 500 })
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
