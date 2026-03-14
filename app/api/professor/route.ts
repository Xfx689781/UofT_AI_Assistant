import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY
    const tavilyKey = process.env.TAVILY_API_KEY
    if (!openrouterKey) return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 })
    if (!tavilyKey) return NextResponse.json({ error: 'TAVILY_API_KEY not configured' }, { status: 500 })

    const { courseCode, studentProfile } = await req.json()
    if (!courseCode) return NextResponse.json({ error: 'courseCode required' }, { status: 400 })

    // 串行搜索，避免并发限流
    const search1 = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: `${courseCode} UofT professor 2024 2025 who teaches University Toronto`,
        search_depth: 'advanced',
        max_results: 5,
      }),
    }).then(r => r.json())

    const search2 = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: `${courseCode} University of Toronto ratemyprofessors review rating`,
        search_depth: 'advanced',
        max_results: 5,
      }),
    }).then(r => r.json())

    const search3 = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: `reddit r/UofT ${courseCode} professor which section best 2024`,
        search_depth: 'advanced',
        max_results: 5,
      }),
    }).then(r => r.json())

    const context = [
      ...(search1.results || []),
      ...(search2.results || []),
      ...(search3.results || []),
    ]
      .map((r: { url: string; content: string }) => `[${r.url}]\n${r.content}`)
      .join('\n\n')

    const learningStyleMap: Record<string, string> = {
      'lecture': 'learns best through structured lectures',
      'practice': 'needs many practice problems to learn',
      'self-study': 'independent learner, prefers reading alone',
      'collaborative': 'learns best in group settings',
    }

    const goalMap: Record<string, string> = {
      'Graduate school / Research': 'aiming for grad school, needs rigorous theory',
      'Industry job': 'focused on practical industry skills',
      'Double major/minor exploration': 'exploring multiple fields',
      'Graduate as efficiently as possible': 'wants manageable workload and clear grading',
      'Get into Math/Stats/CS POSt': 'needs high GPA for competitive POSt',
      'Explore before deciding': 'needs engaging teaching to stay motivated',
    }

    const goals = studentProfile?.goalsSecondYear || studentProfile?.goalsFirstYear || ''
    const learningStyle = studentProfile?.learningStyle || ''
    const studyHours = studentProfile?.studyHoursPerWeek || 'not specified'
    const examPref = studentProfile?.examPreference || 'not specified'
    const officeHours = studentProfile?.officeHoursImportance || 'not specified'

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
            content: `You are an expert UofT academic advisor.
CRITICAL: Only use professor names explicitly found in the search results. Never invent names.
If no professor names found, return {"notFound": true, "message": "No data found"}.
Respond with only valid JSON.`,
          },
          {
            role: 'user',
            content: `Analyze professors for ${courseCode} at University of Toronto.

SEARCH DATA:
${context}

STUDENT PROFILE:
- Program: ${studentProfile?.programOfStudy || studentProfile?.admissionCategory || 'not specified'}
- Goals: ${goals} (${goalMap[goals] || goals})
- Learning style: ${learningStyle} (${learningStyleMap[learningStyle] || learningStyle})
- Study hours/week: ${studyHours}
- Exam preference: ${examPref}
- Office hours importance: ${officeHours}
- Completed courses: ${JSON.stringify(studentProfile?.coursesCompleted || [])}

Calculate match scores based on THIS specific student's profile.
A practice learner + problem-set heavy prof = high score.
A lecture learner + structured clear prof = high score.
Grad school student + research-active rigorous prof = high score.

Return JSON:
{
  "courseCode": "${courseCode}",
  "courseName": "full name",
  "dataConfidence": "high/medium/low",
  "yearsFound": ["2024", "2023"],
  "studentLearningAnalysis": "2-3 sentences about this specific student's profile",
  "recommendedFor": "Professor Name",
  "recommendationReason": "personalized reason for THIS student",
  "professors": [
    {
      "name": "name from search only",
      "matchScore": 87.5,
      "matchBreakdown": {
        "learningStyleFit": 30,
        "goalsFit": 32,
        "practicalFit": 25.5
      },
      "yearsTaught": ["2024"],
      "dataSource": "RMP + Reddit",
      "rmpRating": 4.2,
      "rmpDifficulty": 3.5,
      "numRatings": 45,
      "hasResearch": true,
      "researchArea": "field",
      "teachingResearchAlignment": "how research relates to teaching",
      "dimensions": {
        "teachingClarity": 8,
        "examPredictability": 7,
        "accessibility": 9,
        "gradingFairness": 6,
        "workload": 5,
        "engagement": 8
      },
      "teachingStyleAnalysis": "description",
      "studentCompatibility": "why this prof matches THIS student specifically",
      "examStyle": "format",
      "bestFor": "type of student",
      "warnings": "heads up",
      "tags": ["#ProofHeavy"],
      "recentQuotes": ["paraphrased feedback"],
      "enrollmentTrend": "stable"
    }
  ]
}`,
          },
        ],
      }),
    })

    const data = await response.json()
    if (data.error) return NextResponse.json({ error: `OpenRouter: ${JSON.stringify(data.error)}` }, { status: 500 })

    const raw = data.choices?.[0]?.message?.content?.trim() || ''
    try {
      const parsed = JSON.parse(raw)
      if (parsed.notFound) {
        return NextResponse.json({ error: parsed.message, notFound: true }, { status: 404 })
      }
      return NextResponse.json(parsed)
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
