import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY
    const tavilyKey = process.env.TAVILY_API_KEY
    if (!openrouterKey) return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 })
    if (!tavilyKey) return NextResponse.json({ error: 'TAVILY_API_KEY not configured' }, { status: 500 })

    const { courseCode, studentProfile } = await req.json()
    if (!courseCode) return NextResponse.json({ error: 'courseCode required' }, { status: 400 })

    // Step 1: Search for real professor data
    const searches = await Promise.all([
      fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${courseCode} UofT professor 2024 2025 who teaches`,
          search_depth: 'advanced',
          max_results: 5,
        }),
      }).then(r => r.json()),
      fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${courseCode} University of Toronto ratemyprofessors review`,
          search_depth: 'advanced',
          max_results: 5,
        }),
      }).then(r => r.json()),
      fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `site:reddit.com/r/UofT ${courseCode} professor section recommendation`,
          search_depth: 'advanced',
          max_results: 5,
        }),
      }).then(r => r.json()),
    ])

    const context = searches
      .flatMap(s => s.results || [])
      .map((r: { url: string; content: string }) => `[${r.url}]\n${r.content}`)
      .join('\n\n')

    // Step 2: Analyze with AI
    const studentLearningProfile = `
- Program: ${studentProfile?.programOfStudy || studentProfile?.admissionCategory || 'not specified'}
- Goals: ${studentProfile?.goalsSecondYear || studentProfile?.goalsFirstYear || 'not specified'}
- Learning style: ${studentProfile?.learningStyle || 'not specified'}
- Completed courses: ${JSON.stringify(studentProfile?.coursesCompleted || [])}
- Interests: ${JSON.stringify(studentProfile?.interests || [])}
`

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
            content: `You are an expert UofT academic advisor. Analyze professor data from real search results.
CRITICAL RULES:
- Only use professor names found in the search results. Do NOT invent names.
- If a professor name appears in search results, use their exact full name.
- Base all scores on evidence from the search results.
- If data is limited, say so in warnings.
- You must respond with only a valid JSON object.`,
          },
          {
            role: 'user',
            content: `Analyze professors for ${courseCode} at University of Toronto.

REAL SEARCH DATA (use only names found here):
${context}

Student profile:
${studentLearningProfile}

For each professor found in the search data:
1. Calculate a MATCH SCORE (0-100%) based on alignment between:
   - Student's learning style vs professor's teaching style
   - Student's goals vs professor's strengths
   - Student's completed courses vs professor's course difficulty level

2. Analyze:
   - Does this professor have active research? What field?
   - Is their research field consistent with what they teach?
   - Teaching style breakdown
   - Student learning style compatibility

Return this JSON:
{
  "courseCode": "${courseCode}",
  "courseName": "full official course name",
  "recommendedFor": "Most matched professor name",
  "recommendationReason": "detailed personalized reason based on student profile",
  "studentLearningAnalysis": "2-3 sentences analyzing this student's learning profile and what type of professor suits them",
  "professors": [
    {
      "name": "Exact name from search results only",
      "matchScore": 93.33,
      "rmpRating": 4.2,
      "rmpDifficulty": 3.5,
      "numRatings": 45,
      "hasResearch": true,
      "researchArea": "Differential geometry and topology",
      "teachingResearchAlignment": "High — teaches MAT257 which directly relates to his research in smooth manifolds",
      "dimensions": {
        "teachingClarity": 8,
        "examPredictability": 7,
        "accessibility": 9,
        "gradingFairness": 6,
        "workload": 5,
        "engagement": 8
      },
      "teachingStyleAnalysis": "Lecture-heavy with emphasis on rigorous proofs. Encourages student participation during office hours rather than in class.",
      "studentCompatibility": "Best for students who prefer structured learning and are comfortable with abstract mathematics.",
      "examStyle": "Proof-based, similar to problem sets. 3-hour final worth 50%.",
      "bestFor": "Students aiming for grad school in pure math",
      "warnings": "First 3 weeks are very dense, attend every lecture",
      "tags": ["#ProofHeavy", "#GoodOfficeHours", "#ResearchActive", "#BellCurve"],
      "recentQuotes": ["paraphrased feedback from search results", "another paraphrased quote"],
      "enrollmentTrend": "stable"
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
