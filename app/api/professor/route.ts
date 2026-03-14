import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY
    const tavilyKey = process.env.TAVILY_API_KEY
    if (!openrouterKey) return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 })
    if (!tavilyKey) return NextResponse.json({ error: 'TAVILY_API_KEY not configured' }, { status: 500 })

    const { courseCode, studentProfile } = await req.json()
    if (!courseCode) return NextResponse.json({ error: 'courseCode required' }, { status: 400 })

    // Step 1: Search recent data only (2023-2025)
    const searches = await Promise.all([
      fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${courseCode} UofT professor 2024 2025 instructor University Toronto timetable`,
          search_depth: 'advanced',
          max_results: 5,
          days: 730, // last 2 years only
        }),
      }).then(r => r.json()),
      fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${courseCode} ratemyprofessors University Toronto 2023 2024 2025`,
          search_depth: 'advanced',
          max_results: 5,
          days: 730,
        }),
      }).then(r => r.json()),
      fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `reddit r/UofT ${courseCode} professor 2023 2024 2025 which section`,
          search_depth: 'advanced',
          max_results: 5,
          days: 730,
        }),
      }).then(r => r.json()),
      // Also search UofT timetable directly
      fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${courseCode} instructor site:ttb.calendars.utoronto.ca OR site:timetable.iit.artsci.utoronto.ca`,
          search_depth: 'advanced',
          max_results: 3,
        }),
      }).then(r => r.json()),
    ])

    const allResults = searches.flatMap(s => s.results || [])
    const context = allResults
      .map((r: { url: string; content: string; published_date?: string }) =>
        `[${r.url}${r.published_date ? ` — ${r.published_date}` : ''}]\n${r.content}`)
      .join('\n\n')

    // Check if course likely exists based on search results
    const hasRelevantResults = allResults.some(r =>
      r.content.toLowerCase().includes(courseCode.toLowerCase().replace('h1', '').replace('y1', ''))
    )

    if (!hasRelevantResults) {
      return NextResponse.json({
        error: `No data found for ${courseCode}. Please check the course code and try again.`,
        notFound: true,
      }, { status: 404 })
    }

    // Build detailed student profile for personalization
    const learningStyleMap: Record<string, string> = {
      'lecture': 'learns best through structured lectures, prefers clear explanations over self-discovery',
      'practice': 'learns through repetition and problem-solving, needs many practice problems',
      'self-study': 'independent learner, prefers reading and exploring concepts alone',
      'collaborative': 'learns best in group settings, benefits from discussion',
    }

    const goalMap: Record<string, string> = {
      'Graduate school / Research': 'aiming for graduate school, needs rigorous theoretical foundation',
      'Industry job': 'focused on practical skills and industry-relevant experience',
      'Double major/minor exploration': 'exploring multiple fields, needs flexibility',
      'Graduate as efficiently as possible': 'wants to graduate quickly, needs clear grading and manageable workload',
      'Get into Math/Stats/CS POSt': 'first year trying to get high GPA for competitive POSt admission',
      'Explore before deciding': 'still exploring, needs engaging teaching to stay motivated',
    }

    const completedCourses = studentProfile?.coursesCompleted || studentProfile?.coursesTaken || []
    const learningStyle = studentProfile?.learningStyle || ''
    const goals = studentProfile?.goalsSecondYear || studentProfile?.goalsFirstYear || ''
    const studyHours = studentProfile?.studyHoursPerWeek || 'not specified'
    const examPreference = studentProfile?.examPreference || 'not specified'
    const officeHoursImportance = studentProfile?.officeHoursImportance || 'not specified'

    const detailedProfile = `
STUDENT PROFILE (use ALL of these for personalization):
- Program: ${studentProfile?.programOfStudy || studentProfile?.admissionCategory || 'not specified'}
- Goals: ${goals} → ${goalMap[goals] || goals}
- Learning style: ${learningStyle} → ${learningStyleMap[learningStyle] || learningStyle}
- Study hours per week: ${studyHours}
- Exam preference: ${examPreference}
- Office hours importance: ${officeHoursImportance}
- Completed courses: ${JSON.stringify(completedCourses)}
- Interests: ${JSON.stringify(studentProfile?.interests || [])}
- Communication preference: ${studentProfile?.communicationPreference || 'not specified'}
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
            content: `You are an expert UofT academic advisor analyzing professor data.

ANTI-HALLUCINATION RULES (CRITICAL):
1. ONLY use professor names that EXPLICITLY appear in the search results
2. If you cannot find ANY professor names in the search data, return {"notFound": true, "message": "No professor data found for this course in recent years"}
3. NEVER invent, guess, or assume professor names
4. If a name appears only once with no context, note low confidence in warnings
5. Focus on 2023-2025 data only — ignore older mentions

PERSONALIZATION RULES:
- Match score MUST differ between different student profiles
- A practice-heavy learner gets high score for prof who assigns many problem sets
- A lecture-based learner gets high score for clear structured lectures
- Grad school student gets high score for research-active rigorous profs
- Industry student gets high score for applied, practical profs
- Low office-hours-importance student should NOT penalize inaccessible profs heavily
- High study hours student can handle higher workload profs`,
          },
          {
            role: 'user',
            content: `Analyze professors for ${courseCode} at University of Toronto.

SEARCH DATA (2023-2025 only):
${context}

${detailedProfile}

MATCH SCORE CALCULATION (must be personalized to THIS student):
- Learning style alignment: 35 points
  * lecture student + structured board-heavy prof = high
  * practice student + problem-set-heavy prof = high  
  * self-study student + minimal hand-holding prof = high
  * collaborative student + discussion-based prof = high
- Goals alignment: 35 points
  * grad school + research-active rigorous prof = high
  * industry + applied practical prof = high
  * efficiency + clear grader generous curve = high
  * POSt admission + manageable workload fair grader = high
- Practical fit: 30 points
  * office hours importance vs accessibility score
  * study hours availability vs workload
  * exam preference vs exam style

If no professor names found in search data, return:
{"notFound": true, "message": "No recent professor data found for ${courseCode}. This course may not have been offered recently or the code may be incorrect."}

Otherwise return:
{
  "courseCode": "${courseCode}",
  "courseName": "official course name",
  "dataConfidence": "high/medium/low",
  "yearsFound": ["2024", "2023"],
  "studentLearningAnalysis": "2-3 sentences analyzing THIS student's specific profile and what teaching style suits them — be specific about their learning style and goals",
  "recommendedFor": "Professor Name",
  "recommendationReason": "specific reason tied to THIS student's learning style, goals, and preferences",
  "professors": [
    {
      "name": "Name from search only",
      "yearsTaught": ["2024", "2023"],
      "dataSource": "RMP + Reddit" or "Reddit only" or "Timetable only",
      "matchScore": 87.5,
      "matchBreakdown": {
        "learningStyleFit": 30,
        "goalsFit": 32,
        "practicalFit": 25.5
      },
      "rmpRating": 4.2,
      "rmpDifficulty": 3.5,
      "numRatings": 45,
      "hasResearch": true,
      "researchArea": "field if found",
      "teachingResearchAlignment": "how research relates to teaching",
      "dimensions": {
        "teachingClarity": 8,
        "examPredictability": 7,
        "accessibility": 9,
        "gradingFairness": 6,
        "workload": 5,
        "engagement": 8
      },
      "teachingStyleAnalysis": "detailed description",
      "studentCompatibility": "why this prof specifically matches THIS student's profile",
      "examStyle": "format and style",
      "bestFor": "type of student",
      "warnings": "honest heads up, note if data is limited",
      "tags": ["#ProofHeavy"],
      "recentQuotes": ["paraphrased from search data only"],
      "enrollmentTrend": "rising/stable/dropping"
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
      const parsed = JSON.parse(raw)
      // If AI says not found, return 404
      if (parsed.notFound) {
        return NextResponse.json({ error: parsed.message, notFound: true }, { status: 404 })
      }
      return NextResponse.json(parsed)
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return NextResponse.json({ error: 'Could not parse response' }, { status: 500 })
      return NextResponse.json(JSON.parse(jsonMatch[0]))
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
