import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY
    const tavilyKey = process.env.TAVILY_API_KEY
    if (!openrouterKey) return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 })
    if (!tavilyKey) return NextResponse.json({ error: 'TAVILY_API_KEY not configured' }, { status: 500 })

    const { courseCode, studentProfile } = await req.json()
    if (!courseCode) return NextResponse.json({ error: 'courseCode required' }, { status: 400 })

    const searches = await Promise.all([
      fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${courseCode} UofT professor 2023 2024 2025 who teaches University Toronto`,
          search_depth: 'advanced',
          max_results: 5,
        }),
      }).then(r => r.json()),
      fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${courseCode} University of Toronto ratemyprofessors rating review`,
          search_depth: 'advanced',
          max_results: 5,
        }),
      }).then(r => r.json()),
      fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `reddit r/UofT ${courseCode} professor which section best`,
          search_depth: 'advanced',
          max_results: 5,
        }),
      }).then(r => r.json()),
    ])

    const context = searches
      .flatMap(s => s.results || [])
      .map((r: { url: string; content: string }) => `[${r.url}]\n${r.content}`)
      .join('\n\n')

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
            content: `You are an expert UofT academic advisor analyzing historical professor data.
CRITICAL RULES:
- Only use professor names found in the search results. Do NOT invent names.
- This is HISTORICAL data (past years) — note that as a reference for future enrollment
- Calculate match scores based on student profile alignment
- Return TOP 2 most matched professors
- You must respond with only a valid JSON object.`,
          },
          {
            role: 'user',
            content: `Analyze historical professors for ${courseCode} at University of Toronto.

REAL SEARCH DATA:
${context}

Student profile:
- Program: ${studentProfile?.programOfStudy || studentProfile?.admissionCategory || 'not specified'}
- Goals: ${studentProfile?.goalsSecondYear || studentProfile?.goalsFirstYear || 'not specified'}
- Learning style: ${studentProfile?.learningStyle || 'not specified'}
- Completed courses: ${JSON.stringify(studentProfile?.coursesCompleted || [])}
- Interests: ${JSON.stringify(studentProfile?.interests || [])}

MATCH SCORE calculation (0-100):
- Learning style alignment: 40 points
  (lecture-based student + structured prof = high, self-study student + flexible prof = high)
- Goals alignment: 35 points
  (grad school student + research-active rigorous prof = high)
- Difficulty fit: 25 points
  (match student's completed course difficulty to professor's course demands)

Return TOP 2 professors sorted by matchScore. Return this JSON:
{
  "courseCode": "${courseCode}",
  "courseName": "full official course name",
  "isHistorical": true,
  "historicalNote": "Based on professors who taught this course in recent years (2022-2025). New year's schedule TBA.",
  "studentLearningAnalysis": "2-3 sentences analyzing this student's profile and what teaching style suits them best",
  "recommendedFor": "Name of top matched professor",
  "recommendationReason": "Detailed personalized reason",
  "professors": [
    {
      "name": "Exact name from search results only",
      "matchScore": 93.33,
      "rmpRating": 4.2,
      "rmpDifficulty": 3.5,
      "numRatings": 45,
      "hasResearch": true,
      "researchArea": "e.g. Differential geometry",
      "teachingResearchAlignment": "How their research relates to what they teach",
      "radarData": {
        "teachingClarity": 8,
        "examPredictability": 7,
        "accessibility": 9,
        "gradingFairness": 6,
        "workload": 5,
        "engagement": 8
      },
      "teachingStyleAnalysis": "Detailed teaching style description",
      "studentCompatibility": "Why this prof suits or doesn't suit this specific student",
      "examStyle": "Exam format description",
      "bestFor": "Type of student who thrives",
      "warnings": "Honest heads up",
      "tags": ["#ProofHeavy", "#GoodOfficeHours"],
      "recentQuotes": ["paraphrased student feedback 1", "paraphrased feedback 2"],
      "yearsTaught": ["2023", "2024"]
    }
  ]
}`,
          },
        ],
      }),
    })

    const data = await response.json()
    if (data.error) return NextResponse.json({ error: data.error.message || 'API error' }, { status: 500 })

    const raw = data.choices?.[0]?.message?.content?.trim() || ''
    try {
      return NextResponse.json(JSON.parse(raw))
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return NextResponse.json({ error: 'Could not parse response', raw }, { status: 500 })
      return NextResponse.json(JSON.parse(jsonMatch[0]))
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
