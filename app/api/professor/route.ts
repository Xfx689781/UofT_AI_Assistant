import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY
    const tavilyKey = process.env.TAVILY_API_KEY
    if (!openrouterKey) return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 })
    if (!tavilyKey) return NextResponse.json({ error: 'TAVILY_API_KEY not configured' }, { status: 500 })

    const { courseCode, studentProfile } = await req.json()
    if (!courseCode) return NextResponse.json({ error: 'courseCode required' }, { status: 400 })

    // Serial searches to avoid rate limiting
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

    // Build detailed student persona for strong personalization
    const goals = studentProfile?.goalsSecondYear || studentProfile?.goalsFirstYear || ''
    const learningStyle = studentProfile?.learningStyle || ''
    const studyHours = studentProfile?.studyHoursPerWeek || 'not specified'
    const examPref = studentProfile?.examPreference || 'not specified'
    const officeHours = studentProfile?.officeHoursImportance || 'not specified'
    const program = studentProfile?.programOfStudy || studentProfile?.admissionCategory || ''
    const interests = studentProfile?.interests || []
    const completed = studentProfile?.coursesCompleted || studentProfile?.coursesTaken || []
    const commPref = studentProfile?.communicationPreference || 'not specified'

    // Derive student archetype for clearer AI instruction
    const isGradSchool = goals.toLowerCase().includes('grad') || goals.toLowerCase().includes('research')
    const isIndustry = goals.toLowerCase().includes('industry') || goals.toLowerCase().includes('job')
    const isMath = program.toLowerCase().includes('math') || interests.includes('Pure Mathematics')
    const isCS = program.toLowerCase().includes('computer') || interests.includes('Computer Science')
    const isLifeSci = program.toLowerCase().includes('bio') || program.toLowerCase().includes('neuro') || program.toLowerCase().includes('physio') || interests.includes('Biology')
    const isPsych = program.toLowerCase().includes('psych') || interests.includes('Psychology')
    const isLectureStyle = learningStyle === 'lecture'
    const isPracticeStyle = learningStyle === 'practice'
    const isSelfStudy = learningStyle === 'self-study'
    const needsOfficeHours = officeHours === 'critical'
    const lightWorkload = studyHours === 'Under 10h'
    const heavyWorkload = studyHours === '30h+'
    const prefersProofExam = examPref === 'proof-based'
    const prefersComputation = examPref === 'computation'
    const prefersOpenBook = examPref === 'open-book' || examPref === 'take-home'

    const studentArchetype = [
      isGradSchool ? 'GRAD_SCHOOL_BOUND' : '',
      isIndustry ? 'INDUSTRY_FOCUSED' : '',
      isMath ? 'MATH_SPECIALIST' : '',
      isCS ? 'CS_STUDENT' : '',
      isLifeSci ? 'LIFE_SCI_STUDENT' : '',
      isPsych ? 'PSYCH_STUDENT' : '',
      isLectureStyle ? 'LECTURE_LEARNER' : '',
      isPracticeStyle ? 'PRACTICE_LEARNER' : '',
      isSelfStudy ? 'SELF_STUDY_LEARNER' : '',
      needsOfficeHours ? 'NEEDS_SUPPORT' : '',
      lightWorkload ? 'LIGHT_WORKLOAD_PREF' : '',
      heavyWorkload ? 'CAN_HANDLE_HEAVY' : '',
      prefersProofExam ? 'PROOF_EXAM_PREF' : '',
      prefersComputation ? 'COMPUTATION_PREF' : '',
      prefersOpenBook ? 'FLEXIBLE_EXAM_PREF' : '',
    ].filter(Boolean).join(', ')

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
            content: `You are a UofT academic advisor that gives HIGHLY PERSONALIZED professor recommendations.

Your most important job: match scores MUST differ significantly between different student types.
A PSYCH_STUDENT asking about MAT237 should get very different scores than a MATH_SPECIALIST.
A NEEDS_SUPPORT student should get much higher scores for accessible professors.
A SELF_STUDY_LEARNER should get higher scores for professors who are less hand-holdy.

SCORING RULES (be strict about these):
- learningStyleFit (0-35):
  * LECTURE_LEARNER + structured board-heavy prof = 30-35
  * LECTURE_LEARNER + disorganized prof = 5-10
  * PRACTICE_LEARNER + problem-set-heavy prof = 30-35
  * PRACTICE_LEARNER + theory-only prof = 5-10
  * SELF_STUDY_LEARNER + prof who posts notes/resources = 30-35
  * SELF_STUDY_LEARNER + attendance-dependent prof = 10-15
  * COLLABORATIVE_LEARNER + discussion-heavy prof = 30-35

- goalsFit (0-35):
  * GRAD_SCHOOL_BOUND + research-active rigorous prof = 30-35
  * GRAD_SCHOOL_BOUND + easy/applied prof = 5-15
  * INDUSTRY_FOCUSED + applied practical prof = 30-35
  * INDUSTRY_FOCUSED + overly theoretical prof = 10-20
  * LIFE_SCI_STUDENT or PSYCH_STUDENT taking math course = goalsFit max 20 (they need it to pass not excel)
  * MATH_SPECIALIST + proof-heavy prof = 30-35

- practicalFit (0-30):
  * NEEDS_SUPPORT + accessible prof (high accessibility score) = 25-30
  * NEEDS_SUPPORT + inaccessible prof = 5-10
  * LIGHT_WORKLOAD_PREF + heavy workload prof = 5-15
  * CAN_HANDLE_HEAVY + any workload = 20-30
  * PROOF_EXAM_PREF + proof-based exams = 25-30
  * COMPUTATION_PREF + computation exams = 25-30
  * FLEXIBLE_EXAM_PREF + any format = 20-25

Only use professor names found in search data. Return valid JSON only.`,
          },
          {
            role: 'user',
            content: `Analyze professors for ${courseCode} at University of Toronto.

SEARCH DATA:
${context}

STUDENT ARCHETYPE: ${studentArchetype || 'GENERAL_STUDENT'}

RAW PROFILE:
- Program: ${program}
- Goals: ${goals}
- Learning style: ${learningStyle}
- Study hours/week: ${studyHours}
- Exam preference: ${examPref}
- Office hours importance: ${officeHours}
- Communication preference: ${commPref}
- Interests: ${JSON.stringify(interests)}
- Completed courses: ${JSON.stringify(completed)}

Based on this student's archetype and raw profile, calculate match scores per the scoring rules.
A ${studentArchetype || 'GENERAL_STUDENT'} student's scores will look very different from a MATH_SPECIALIST's scores.

Return JSON:
{
  "courseCode": "${courseCode}",
  "courseName": "full official name",
  "dataConfidence": "high/medium/low",
  "yearsFound": ["2024", "2023"],
  "studentLearningAnalysis": "2-3 sentences specifically about this student's archetype (${studentArchetype}) and what teaching style suits them for ${courseCode}",
  "recommendedFor": "Professor Name",
  "recommendationReason": "personalized reason referencing student archetype and specific needs",
  "professors": [
    {
      "name": "name from search data only",
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
      "researchArea": "field if found",
      "teachingResearchAlignment": "how research relates to course content",
      "dimensions": {
        "teachingClarity": 8,
        "examPredictability": 7,
        "accessibility": 9,
        "gradingFairness": 6,
        "workload": 5,
        "engagement": 8
      },
      "teachingStyleAnalysis": "detailed teaching style",
      "studentCompatibility": "explain specifically why this score for THIS archetype student — reference their learning style, goals, and preferences directly",
      "examStyle": "format and style",
      "bestFor": "type of student who thrives",
      "warnings": "honest heads up, especially relevant to this student type",
      "tags": ["#ProofHeavy", "#GoodOfficeHours"],
      "recentQuotes": ["paraphrased from search data"],
      "enrollmentTrend": "rising/stable/dropping"
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
