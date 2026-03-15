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
        query: courseCode + ' UofT instructor professor name teaches timetable 2024 2025',
        search_depth: 'advanced',
        max_results: 6,
      }),
    }).then(r => r.json())

    const search2 = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: courseCode + ' University of Toronto ratemyprofessors professor review',
        search_depth: 'advanced',
        max_results: 6,
      }),
    }).then(r => r.json())

    const search3 = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: 'reddit r/UofT ' + courseCode + ' professor section who took 2023 2024',
        search_depth: 'advanced',
        max_results: 5,
      }),
    }).then(r => r.json())

    const allResults = [
      ...(search1.results || []),
      ...(search2.results || []),
      ...(search3.results || []),
    ]

    const context = allResults
      .map((r: { url: string; content: string }) => '[' + r.url + ']\n' + r.content)
      .join('\n\n')

    // Build student profile
    const program = studentProfile?.programOfStudy || studentProfile?.programOther || studentProfile?.admissionCategory || ''
    const goals = studentProfile?.goalsSecondYear || studentProfile?.goalsFirstYear || ''
    const learningStyle = studentProfile?.learningStyle || ''
    const studyHours = studentProfile?.studyHoursPerWeek || ''
    const examPref = studentProfile?.examPreference || ''
    const officeHours = studentProfile?.officeHoursImportance || ''
    const shortAnswer = studentProfile?.shortAnswer || ''
    const selfAssessment = studentProfile?.selfAssessment || ''
    const futureDirection = studentProfile?.futureDirection || ''
    const professorPref = studentProfile?.professorPreference || ''
    const interests = studentProfile?.interests || []

    const isGradSchool = goals.toLowerCase().includes('grad') || goals.toLowerCase().includes('research') || goals.toLowerCase().includes('theoretical')
    const needsSupport = officeHours === 'critical'
    const wantsChallenge = selfAssessment === 'strong' || isGradSchool
    const isSelfStudy = learningStyle === 'self-study'
    const isLecture = learningStyle === 'lecture'
    const isPractice = learningStyle === 'practice'
    const notNeededSupport = officeHours === 'not-needed'
    const lightLoad = studyHours === 'Under 10h'
    const heavyLoad = studyHours === '30h+'

    // Detect preference signals from professor preference text
    const prefLower = professorPref.toLowerCase()
    const shortLower = shortAnswer.toLowerCase()
    const wantsDemanding = prefLower.includes('push') || prefLower.includes('tough') || prefLower.includes('demanding') || prefLower.includes('hard') || prefLower.includes('don\'t care about rmp') || prefLower.includes('learn more') || shortLower.includes('challenge')
    const wantsWarm = prefLower.includes('accessible') || prefLower.includes('clear') || prefLower.includes('warm') || prefLower.includes('support') || prefLower.includes('office hours') || prefLower.includes('rmp') || prefLower.includes('organized')
    const wantsResearch = prefLower.includes('research') || prefLower.includes('grad school') || isGradSchool
    const doesNotCareRMP = prefLower.includes('don\'t care') || prefLower.includes('not care') || prefLower.includes('rmp doesn') || notNeededSupport
    const wantsRigor = wantsDemanding || (isSelfStudy && !needsSupport) || (wantsChallenge && !needsSupport)

    const studentArchetype = [
      isGradSchool ? 'GRAD_SCHOOL_BOUND' : '',
      goals.toLowerCase().includes('industry') ? 'INDUSTRY_FOCUSED' : '',
      needsSupport ? 'NEEDS_SUPPORT' : '',
      notNeededSupport ? 'INDEPENDENT_LEARNER' : '',
      wantsChallenge ? 'WANTS_CHALLENGE' : '',
      lightLoad ? 'LIGHT_WORKLOAD_PREF' : '',
      heavyLoad ? 'CAN_HANDLE_HEAVY' : '',
      isSelfStudy ? 'SELF_STUDY_LEARNER' : '',
      isLecture ? 'LECTURE_LEARNER' : '',
      isPractice ? 'PRACTICE_LEARNER' : '',
      wantsDemanding ? 'WANTS_DEMANDING_PROF' : '',
      wantsWarm ? 'WANTS_WARM_ACCESSIBLE_PROF' : '',
      wantsResearch ? 'WANTS_RESEARCH_ALIGNED_PROF' : '',
      wantsRigor ? 'WANTS_RIGOR' : '',
    ].filter(Boolean).join(', ')

    const systemPrompt = [
      'You are a UofT professor recommendation engine. You find ONE best professor match for a specific student.',
      '',
      'ANTI-HALLUCINATION — THIS IS THE MOST IMPORTANT RULE:',
      '1. You may ONLY use professor names that appear VERBATIM and EXPLICITLY in the search data.',
      '2. Before including any professor, find the exact sentence in the search data that mentions their name AND connects them to ' + courseCode + '.',
      '3. If a name appears in search results for a DIFFERENT course, it does NOT count for ' + courseCode + '.',
      '4. Do NOT infer professor names from partial matches, department pages, or unrelated courses.',
      '5. Do NOT use names that only appear in generic university pages without course connection.',
      '6. If you cannot find at least one professor name clearly connected to ' + courseCode + ' in the search data, return {"notFound": true}.',
      '7. Common trap: a Chinese or any foreign name appearing in search results may be a student, not a professor. Only use names explicitly labeled as instructor/professor/taught by.',
      '',
      'OUTPUT: Return exactly ONE professor — the best match for this student.',
      'No RMP ratings. No difficulty scores. No enrollment trends.',
      'Focus entirely on WHY this professor is the best fit for THIS student.',
      '',
      'MATCHING PHILOSOPHY:',
      'The goal is not to find the highest-rated professor. It is to find the professor whose teaching style, rigor level, and approach best fits this specific student.',
      '',
      'PROFESSOR ARCHETYPES (use as reference when search data matches):',
      'Demanding/Rigorous archetype (e.g. Almut Burchard style): High expectations, proves everything rigorously, does not hand-hold, students who struggle may find it hard but strong students love it. BEST FOR: SELF_STUDY_LEARNER, WANTS_CHALLENGE, GRAD_SCHOOL_BOUND, WANTS_DEMANDING_PROF, INDEPENDENT_LEARNER.',
      'Warm/Organized archetype (e.g. Mary Pugh style): Clear organized lectures, accessible, students feel supported, very good RMP. BEST FOR: LECTURE_LEARNER, NEEDS_SUPPORT, WANTS_WARM_ACCESSIBLE_PROF, students who struggle.',
      'Research-Active archetype (e.g. Soheil Behnezhad style): Cutting-edge content, high expectations, research-focused teaching. BEST FOR: GRAD_SCHOOL_BOUND, WANTS_RESEARCH_ALIGNED_PROF, WANTS_CHALLENGE.',
      '',
      'SCORING (internal, do not show):',
      'For SELF_STUDY_LEARNER or INDEPENDENT_LEARNER or WANTS_DEMANDING_PROF: Demanding/Rigorous professor wins.',
      'For LECTURE_LEARNER or NEEDS_SUPPORT or WANTS_WARM_ACCESSIBLE_PROF: Warm/Organized professor wins.',
      'For GRAD_SCHOOL_BOUND + WANTS_RESEARCH_ALIGNED_PROF: Research-Active professor wins.',
      'If student is WANTS_CHALLENGING and does NOT have NEEDS_SUPPORT: lean toward demanding prof even if RMP is lower.',
      'If student says in their own words they want to be pushed -> demanding prof wins regardless of RMP.',
      'If student says they need clear explanations and go to office hours -> warm prof wins.',
    ].join('\n')

    const userPrompt = [
      'Find the single best professor match for this student taking ' + courseCode + ' at UofT.',
      '',
      'SEARCH DATA (only use professor names explicitly found here):',
      context,
      '',
      'STUDENT PROFILE:',
      '- Program: ' + program,
      '- Goals: ' + goals,
      '- Learning style: ' + learningStyle,
      '- Study hours: ' + studyHours,
      '- Exam preference: ' + examPref,
      '- Office hours importance: ' + officeHours,
      '- Future direction: ' + futureDirection,
      '- Interests: ' + JSON.stringify(interests),
      '- Self-assessment: ' + selfAssessment,
      '',
      'STUDENT IN THEIR OWN WORDS:',
      '"' + shortAnswer + '"',
      '',
      'PROFESSOR PREFERENCE (what student said they want):',
      '"' + professorPref + '"',
      '',
      'STUDENT ARCHETYPE: ' + studentArchetype,
      '',
      'TASK:',
      '1. Scan the search data for professor names explicitly connected to ' + courseCode + '.',
      '2. Pick the ONE professor whose style best matches this student archetype.',
      '3. If the student archetype includes WANTS_DEMANDING_PROF or SELF_STUDY_LEARNER -> prefer the more rigorous professor.',
      '4. If the student archetype includes NEEDS_SUPPORT or WANTS_WARM_ACCESSIBLE_PROF -> prefer the more accessible professor.',
      '5. Write the match explanation in terms of the student\'s own words and archetype.',
      '',
      'FINAL VERIFICATION: Before responding, confirm the professor name appears verbatim in the search data above AND is connected to ' + courseCode + '. If not found, return notFound.',
      '',
      'Return ONLY this JSON:',
      '{',
      '  "courseCode": "' + courseCode + '",',
      '  "courseName": "exact course name",',
      '  "dataConfidence": "high/medium/low",',
      '  "yearsFound": ["2024", "2023"],',
      '  "studentLearningAnalysis": "2-3 sentences about what teaching style this student needs based on their archetype and own words",',
      '  "professor": {',
      '    "name": "exact name from search data only",',
      '    "matchScore": 87,',
      '    "matchBreakdown": {',
      '      "learningStyleFit": 30,',
      '      "goalsFit": 32,',
      '      "practicalFit": 25',
      '    },',
      '    "whyThisStudent": "detailed explanation of why this professor is the best match for THIS student — reference their archetype (' + studentArchetype + '), their own words, and their specific needs. Be direct and specific.",',
      '    "teachingStyle": "description of how this professor teaches",',
      '    "bestFor": "type of student who thrives with this professor",',
      '    "warnings": "honest heads up relevant to this student type, or empty string if none",',
      '    "hasResearch": true,',
      '    "researchArea": "field if found in search data",',
      '    "dimensions": {',
      '      "teachingClarity": 8,',
      '      "examPredictability": 7,',
      '      "accessibility": 9,',
      '      "gradingFairness": 6,',
      '      "workload": 5,',
      '      "engagement": 8',
      '    },',
      '    "recentQuotes": ["paraphrased student feedback from search data, max 2"],',
      '    "tags": ["#Rigorous", "#ProofHeavy"]',
      '  }',
      '}',
    ].join('\n')

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
        return NextResponse.json({
          error: 'No professor data found for ' + courseCode + '. Try the full course code e.g. MAT237Y1.',
          notFound: true,
        }, { status: 404 })
      }
      // Normalize: support both single professor and array
      const prof = parsed.professor || (parsed.professors && parsed.professors[0])
      if (!prof) {
        return NextResponse.json({ error: 'No professor found', notFound: true }, { status: 404 })
      }
      return NextResponse.json({
        courseCode: parsed.courseCode,
        courseName: parsed.courseName,
        dataConfidence: parsed.dataConfidence,
        yearsFound: parsed.yearsFound,
        studentLearningAnalysis: parsed.studentLearningAnalysis,
        recommendedFor: prof.name,
        recommendationReason: prof.whyThisStudent,
        professors: [prof],
      })
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) return NextResponse.json({ error: 'Could not parse response' }, { status: 500 })
      const parsed = JSON.parse(match[0])
      const prof = parsed.professor || (parsed.professors && parsed.professors[0])
      if (!prof) return NextResponse.json({ error: 'No professor found', notFound: true }, { status: 404 })
      return NextResponse.json({
        courseCode: parsed.courseCode,
        courseName: parsed.courseName,
        dataConfidence: parsed.dataConfidence,
        yearsFound: parsed.yearsFound,
        studentLearningAnalysis: parsed.studentLearningAnalysis,
        recommendedFor: prof.name,
        recommendationReason: prof.whyThisStudent,
        professors: [prof],
      })
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
