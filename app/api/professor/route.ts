import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY
    const tavilyKey = process.env.TAVILY_API_KEY
    if (!openrouterKey) return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 })
    if (!tavilyKey) return NextResponse.json({ error: 'TAVILY_API_KEY not configured' }, { status: 500 })

    const { courseCode, studentProfile } = await req.json()
    if (!courseCode) return NextResponse.json({ error: 'courseCode required' }, { status: 400 })

    const search1 = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: courseCode + ' UofT professor 2024 2025 who teaches University Toronto',
        search_depth: 'advanced',
        max_results: 5,
      }),
    }).then(r => r.json())

    const search2 = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: courseCode + ' University of Toronto ratemyprofessors review rating',
        search_depth: 'advanced',
        max_results: 5,
      }),
    }).then(r => r.json())

    const search3 = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: 'reddit r/UofT ' + courseCode + ' professor which section best 2024',
        search_depth: 'advanced',
        max_results: 5,
      }),
    }).then(r => r.json())

    const context = [
      ...(search1.results || []),
      ...(search2.results || []),
      ...(search3.results || []),
    ].map((r: { url: string; content: string }) => '[' + r.url + ']\n' + r.content).join('\n\n')

    const program = studentProfile?.programOfStudy || studentProfile?.programOther || studentProfile?.admissionCategory || 'not specified'
    const goals = studentProfile?.goalsSecondYear || studentProfile?.goalsFirstYear || ''
    const learningStyle = studentProfile?.learningStyle || ''
    const studyHours = studentProfile?.studyHoursPerWeek || ''
    const examPref = studentProfile?.examPreference || ''
    const officeHours = studentProfile?.officeHoursImportance || ''
    const shortAnswer = studentProfile?.shortAnswer || ''
    const selfAssessment = studentProfile?.selfAssessment || ''
    const futureDirection = studentProfile?.futureDirection || ''
    const interests = studentProfile?.interests || []

    const isGradSchool = goals.toLowerCase().includes('grad') || goals.toLowerCase().includes('research') || goals.toLowerCase().includes('theoretical')
    const needsSupport = officeHours === 'critical'
    const wantsChallenge = selfAssessment === 'strong' || isGradSchool
    const lightLoad = studyHours === 'Under 10h'
    const heavyLoad = studyHours === '30h+'

    const studentArchetype = [
      isGradSchool ? 'GRAD_SCHOOL_BOUND' : '',
      goals.toLowerCase().includes('industry') ? 'INDUSTRY_FOCUSED' : '',
      needsSupport ? 'NEEDS_SUPPORT' : '',
      wantsChallenge ? 'WANTS_CHALLENGE' : '',
      lightLoad ? 'LIGHT_WORKLOAD_PREF' : '',
      heavyLoad ? 'CAN_HANDLE_HEAVY' : '',
      learningStyle === 'lecture' ? 'LECTURE_LEARNER' : '',
      learningStyle === 'practice' ? 'PRACTICE_LEARNER' : '',
      learningStyle === 'self-study' ? 'SELF_STUDY_LEARNER' : '',
      learningStyle === 'collaborative' ? 'COLLABORATIVE_LEARNER' : '',
      examPref === 'proof-based' ? 'PROOF_EXAM_PREF' : '',
      examPref === 'computation' ? 'COMPUTATION_PREF' : '',
    ].filter(Boolean).join(', ')

    const systemPrompt = 'You are a UofT professor recommendation engine. Your job is to match professors to a specific student based on their profile.\n\nCRITICAL: matchScore MUST be calculated based on the student profile. Different students MUST get different scores for the same professor.\n\nSCORING RULES (calculate each component carefully):\n\nlearningStyleFit (0-35 points):\n- LECTURE_LEARNER + professor known for clear structured lectures = 30-35\n- LECTURE_LEARNER + disorganized professor = 5-10\n- PRACTICE_LEARNER + professor who assigns many problem sets = 30-35\n- PRACTICE_LEARNER + theory-only professor = 8-12\n- SELF_STUDY_LEARNER + professor who posts notes and resources = 30-35\n- SELF_STUDY_LEARNER + attendance-mandatory professor = 10-15\n- COLLABORATIVE_LEARNER + discussion-based professor = 30-35\n\ngoalsFit (0-35 points):\n- GRAD_SCHOOL_BOUND + research-active rigorous professor = 30-35\n- GRAD_SCHOOL_BOUND + easy/lax professor = 5-15\n- INDUSTRY_FOCUSED + applied practical professor = 30-35\n- WANTS_CHALLENGE + demanding professor = 28-35\n- WANTS_CHALLENGE + easy professor = 5-15\n\npracticalFit (0-30 points):\n- NEEDS_SUPPORT + highly accessible professor = 25-30\n- NEEDS_SUPPORT + inaccessible professor = 5-10\n- LIGHT_WORKLOAD_PREF + heavy workload professor = 5-12\n- CAN_HANDLE_HEAVY + any workload = 22-30\n- PROOF_EXAM_PREF + proof-based exams = 25-30\n- COMPUTATION_PREF + computation exams = 25-30\n\nmatchScore = learningStyleFit + goalsFit + practicalFit (total out of 100)\n\nOnly use professor names found in the search data. Return only 2 professors. If no professors found return notFound:true.'

    const userPrompt = 'Analyze professors for ' + courseCode + ' at UofT.\n\nSEARCH DATA:\n' + context + '\n\nSTUDENT PROFILE:\n- Program: ' + program + '\n- Goals: ' + goals + '\n- Learning style: ' + learningStyle + '\n- Study hours: ' + studyHours + '\n- Exam preference: ' + examPref + '\n- Office hours importance: ' + officeHours + '\n- Future direction: ' + futureDirection + '\n- Interests: ' + JSON.stringify(interests) + '\n- Self-assessment: ' + selfAssessment + '\n\nSTUDENT IN THEIR OWN WORDS:\n"' + shortAnswer + '"\n\nARCHETYPE: ' + studentArchetype + '\n\nUsing the scoring rules, calculate matchScore for each professor based on THIS student\'s archetype. The scores must be different from each other and reflect the student profile.\n\nReturn JSON:\n{\n  "courseCode": "' + courseCode + '",\n  "courseName": "exact course name",\n  "dataConfidence": "high/medium/low",\n  "yearsFound": ["2024"],\n  "studentLearningAnalysis": "2-3 sentences about why this student needs a specific type of professor for this course, referencing their archetype and own words",\n  "recommendedFor": "Professor Name",\n  "recommendationReason": "personalized reason referencing student archetype and short answer",\n  "professors": [\n    {\n      "name": "name from search only",\n      "matchScore": 87,\n      "matchBreakdown": {\n        "learningStyleFit": 30,\n        "goalsFit": 32,\n        "practicalFit": 25\n      },\n      "yearsTaught": ["2024"],\n      "dataSource": "RMP + Reddit",\n      "rmpRating": 4.2,\n      "rmpDifficulty": 3.5,\n      "numRatings": 45,\n      "hasResearch": true,\n      "researchArea": "research field",\n      "teachingResearchAlignment": "how research relates to teaching",\n      "dimensions": {\n        "teachingClarity": 8,\n        "examPredictability": 7,\n        "accessibility": 9,\n        "gradingFairness": 6,\n        "workload": 5,\n        "engagement": 8\n      },\n      "teachingStyleAnalysis": "teaching style description",\n      "studentCompatibility": "why this score for THIS specific student archetype ' + studentArchetype + ' — mention their learning style and goals directly",\n      "examStyle": "exam format",\n      "bestFor": "type of student",\n      "warnings": "heads up relevant to this student type",\n      "tags": ["#ProofHeavy"],\n      "recentQuotes": ["paraphrased student feedback"],\n      "enrollmentTrend": "stable"\n    }\n  ]\n}'

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + openrouterKey,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://uof-t-ai-assistant.vercel.app',
        'X-Title': 'UofT AI Assistant',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    const data = await aiRes.json()
    if (data.error) return NextResponse.json({ error: 'OpenRouter: ' + JSON.stringify(data.error) }, { status: 500 })

    const raw = data.choices?.[0]?.message?.content?.trim() || ''
    try {
      const parsed = JSON.parse(raw)
      if (parsed.notFound) {
        return NextResponse.json({ error: 'No professor data found for ' + courseCode + '. Try the full course code e.g. MAT237Y1.', notFound: true }, { status: 404 })
      }
      const top2 = parsed.professors
        ? [...parsed.professors].sort((a: { matchScore: number }, b: { matchScore: number }) => (b.matchScore || 0) - (a.matchScore || 0)).slice(0, 2)
        : []
      return NextResponse.json({ ...parsed, professors: top2 })
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) return NextResponse.json({ error: 'Could not parse response' }, { status: 500 })
      const parsed = JSON.parse(match[0])
      const top2 = parsed.professors
        ? [...parsed.professors].sort((a: { matchScore: number }, b: { matchScore: number }) => (b.matchScore || 0) - (a.matchScore || 0)).slice(0, 2)
        : []
      return NextResponse.json({ ...parsed, professors: top2 })
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
