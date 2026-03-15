import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 })

    const profile = await req.json()
    if (!profile?.name) return NextResponse.json({ error: 'Invalid profile' }, { status: 400 })

    const program = profile.programOfStudy && profile.programOfStudy !== '__other__'
      ? profile.programOfStudy : profile.programOther || profile.admissionCategory

    const completed: string[] = profile.coursesCompleted || profile.coursesTaken || []
    const goals = profile.goalsSecondYear || profile.goalsFirstYear || ''
    const yearType = profile.yearType || 'first'
    const interests: string[] = profile.interests || []
    const learningStyle = profile.learningStyle || ''
    const studyHours = profile.studyHoursPerWeek || '10-20h'
    const examPref = profile.examPreference || ''

    const completedSet = new Set(completed.map((c: string) => c.toUpperCase().replace(/\s/g, '')))

    const hasMat157 = completedSet.has('MAT157Y1') || completedSet.has('MAT157')
    const hasMat137 = completedSet.has('MAT137Y1') || completedSet.has('MAT137')
    const hasMat237 = completedSet.has('MAT237Y1') || completedSet.has('MAT237')
    const hasMat240 = completedSet.has('MAT240H1') || completedSet.has('MAT240')
    const hasCSC148 = completedSet.has('CSC148H1') || completedSet.has('CSC148')
    const hasCSC207 = completedSet.has('CSC207H1') || completedSet.has('CSC207')
    const hasCSC236 = completedSet.has('CSC236H1') || completedSet.has('CSC236')
    const hasSTA237 = completedSet.has('STA237H1') || completedSet.has('STA237')
    const hasSTA238 = completedSet.has('STA238H1') || completedSet.has('STA238')

    const isHighCapacity = studyHours === '20-30h' || studyHours === '30h+' || hasMat157
    const isGradSchool = goals.toLowerCase().includes('grad') || goals.toLowerCase().includes('research') || goals.toLowerCase().includes('theoretical')
    const isIndustry = goals.toLowerCase().includes('industry') || goals.toLowerCase().includes('job')
    const isMath = program.toLowerCase().includes('math') || interests.includes('Pure Mathematics')
    const isCS = program.toLowerCase().includes('computer') || interests.includes('Computer Science')
    const isStats = program.toLowerCase().includes('stat') || program.toLowerCase().includes('data') || interests.includes('Statistics')
    const isLifeSci = program.toLowerCase().includes('bio') || program.toLowerCase().includes('neuro') || interests.includes('Biology')
    const isPsych = program.toLowerCase().includes('psych') || interests.includes('Psychology')
    const isSpecialist = program.toLowerCase().includes('specialist')
    const yearLabel = yearType === 'first' ? 'First Year' : yearType === 'second' ? 'Second Year' : 'Third or Fourth Year'

    const logicParts: string[] = []
    if (hasMat157 && isSpecialist && isGradSchool) {
      logicParts.push('PUSH HARD: MAT257Y1 MAT240H1 MAT267H1 STA257H1 MAT315H1 MAT327H1')
    } else if (hasMat157) {
      logicParts.push('MAT257Y1 MAT240H1 STA257H1 cross into CS or Stats')
    }
    if (hasMat137 && !hasMat237 && isMath) {
      logicParts.push('MAT237Y1 MAT246H1 MAT240H1 are immediate next steps')
    }
    if (isCS && hasCSC148 && !hasCSC207) {
      logicParts.push('CSC207H1 CSC209H1 CSC236H1 are immediate next steps')
    }
    if (isCS && hasCSC207 && hasCSC236 && !isHighCapacity) {
      logicParts.push('CSC263H1 CSC258H1 CSC343H1 based on prereqs')
    }
    if (isCS && hasCSC207 && hasCSC236 && isHighCapacity) {
      logicParts.push('CSC263H1 CSC369H1 CSC373H1 CSC311H1 consider MAT337H1 for theory depth')
    }
    if (isStats && hasMat137 && !hasSTA237) {
      logicParts.push('STA237H1 or STA257H1 are immediate next steps')
    }
    if (isStats && hasSTA238 && hasMat237) {
      logicParts.push('STA302H1 STA347H1 are next')
    }
    if (isLifeSci) {
      logicParts.push('Program requirements first then STA237H1 for quantitative skills')
    }
    if (isPsych) {
      logicParts.push('PSY program requirements STA237H1 if quantitative focus')
    }
    if (isMath && isGradSchool && hasMat237 && hasMat240) {
      logicParts.push('MAT247H1 MAT337H1 MAT347Y1 MAT301H1 for graduate preparation')
    }
    if (isCS && isMath) {
      logicParts.push('Cross-disciplinary: MAT337H1 STA347H1 would strengthen theoretical foundation')
    }
    if (isCS && isStats) {
      logicParts.push('Cross-disciplinary: CSC311H1 CSC412H1 CSC413H1 for ML track')
    }

    const recommendationLogic = logicParts.join('; ') || 'Recommend courses based on completed prerequisites and program requirements'

    const courseList = [
      'MAT135H1 = Calculus I',
      'MAT136H1 = Calculus II',
      'MAT137Y1 = Calculus with Proofs',
      'MAT157Y1 = Analysis I',
      'MAT223H1 = Linear Algebra I',
      'MAT224H1 = Linear Algebra II',
      'MAT235Y1 = Multivariable Calculus',
      'MAT237Y1 = Multivariable Calculus with Proofs',
      'MAT240H1 = Algebra I',
      'MAT244H1 = Introduction to Differential Equations',
      'MAT246H1 = Abstract Mathematics',
      'MAT247H1 = Algebra II',
      'MAT257Y1 = Analysis II',
      'MAT267H1 = Advanced Ordinary Differential Equations',
      'MAT301H1 = Groups and Symmetries',
      'MAT315H1 = Introduction to Number Theory',
      'MAT327H1 = Introduction to Topology',
      'MAT334H1 = Complex Variables',
      'MAT337H1 = Introduction to Real Analysis',
      'MAT344H1 = Introduction to Combinatorics',
      'MAT347Y1 = Groups Rings and Fields',
      'MAT354H1 = Complex Analysis I',
      'MAT357H1 = Foundations of Real Analysis',
      'MAT363H1 = Introduction to Differential Geometry',
      'STA237H1 = Probability Statistics and Data Analysis I',
      'STA238H1 = Probability Statistics and Data Analysis II',
      'STA247H1 = Probability with Computer Applications',
      'STA257H1 = Probability and Statistics I',
      'STA261H1 = Probability and Statistics II',
      'STA302H1 = Methods of Data Analysis I',
      'STA347H1 = Probability',
      'CSC108H1 = Introduction to Computer Programming',
      'CSC110Y1 = Foundations of Computer Science I',
      'CSC148H1 = Introduction to Computer Science',
      'CSC165H1 = Mathematical Expression and Reasoning for Computer Science',
      'CSC207H1 = Software Design',
      'CSC209H1 = Software Tools and Systems Programming',
      'CSC236H1 = Introduction to the Theory of Computation',
      'CSC258H1 = Computer Organization',
      'CSC263H1 = Data Structures and Analysis',
      'CSC311H1 = Introduction to Machine Learning',
      'CSC343H1 = Introduction to Databases',
      'CSC369H1 = Operating Systems',
      'CSC373H1 = Algorithm Design and Analysis',
      'CSC384H1 = Introduction to Artificial Intelligence',
      'CSC401H1 = Natural Language Computing',
      'CSC412H1 = Probabilistic Learning and Reasoning',
      'CSC413H1 = Neural Networks and Deep Learning',
      'CSC420H1 = Introduction to Image Understanding',
      'CSC448H1 = Formal Languages and Automata Theory',
      'CSC463H1 = Computational Complexity and Computability',
      'CSC473H1 = Advanced Algorithm Design',
      'PHY131H1 = Introduction to Physics I',
      'PHY132H1 = Introduction to Physics II',
      'PHY151H1 = Foundations of Physics I',
      'PHY152H1 = Foundations of Physics II',
      'BIO120H1 = Adaptation and Biodiversity',
      'BIO130H1 = Molecular and Cell Biology',
      'ECO101H1 = Principles of Microeconomics',
      'ECO102H1 = Principles of Macroeconomics',
      'PSY100H1 = Introductory Psychology',
      'SOC100H1 = Introduction to Sociology',
    ].join('\n')

    const prereqList = [
      'MAT257Y1 needs MAT157Y1',
      'MAT267H1 needs MAT157Y1 and MAT240H1',
      'MAT240H1 needs MAT137Y1',
      'MAT247H1 needs MAT240H1',
      'MAT237Y1 needs MAT137Y1',
      'MAT246H1 needs MAT137Y1',
      'MAT327H1 needs MAT257Y1',
      'MAT347Y1 needs MAT247H1',
      'MAT337H1 needs MAT237Y1 and MAT246H1',
      'MAT354H1 needs MAT257Y1',
      'MAT357H1 needs MAT257Y1',
      'STA257H1 needs MAT137Y1',
      'STA261H1 needs STA257H1',
      'STA302H1 needs STA238H1 and MAT223H1',
      'STA347H1 needs MAT237Y1 and STA238H1',
      'CSC207H1 needs CSC148H1',
      'CSC209H1 needs CSC148H1',
      'CSC236H1 needs CSC148H1 and CSC165H1',
      'CSC258H1 needs CSC148H1 and CSC165H1',
      'CSC263H1 needs CSC207H1 and CSC236H1',
      'CSC311H1 needs CSC207H1 and MAT237Y1 and STA238H1',
      'CSC343H1 needs CSC207H1',
      'CSC369H1 needs CSC209H1 and CSC263H1',
      'CSC373H1 needs CSC263H1',
      'CSC384H1 needs CSC263H1 and MAT223H1',
      'CSC412H1 needs CSC311H1',
      'CSC413H1 needs CSC311H1',
    ].join('\n')

    const systemPrompt = 'You are a brilliant UofT upperclassman advisor. Strong students get hard courses. Weak students get manageable ones. Be direct and ambitious.\n\nCRITICAL: You must ONLY recommend courses from this exact list with these exact names. Never invent courses or names.\n\nCOURSE LIST:\n' + courseList + '\n\nPREREQUISITES:\n' + prereqList + '\n\nRULES:\n1. Only recommend courses from the list above\n2. Only recommend if prereqs are met based on completed courses\n3. Never repeat completed courses\n4. Include 1-2 cross-disciplinary picks when relevant\n5. Math specialist going to grad school: push MAT257Y1 MAT267H1 MAT327H1 MAT347Y1\n6. CS student: core CS sequence plus optional MAT337H1 STA347H1 for theory depth\n7. Stats student: STA257H1 path plus MAT237Y1 CSC343H1\n8. Give different recommendations for different student profiles'

    const userPrompt = 'Recommend courses for ' + profile.name + '.\n\nPROFILE:\n- Program: ' + program + ' (' + (isSpecialist ? 'Specialist' : 'Major or Minor') + ')\n- Year: ' + yearLabel + '\n- Completed: ' + JSON.stringify(completed) + '\n- Goals: ' + goals + '\n- Learning style: ' + learningStyle + '\n- Study hours per week: ' + studyHours + '\n- Exam preference: ' + examPref + '\n- Interests: ' + JSON.stringify(interests) + '\n\nDERIVED:\n- Capability: ' + (isHighCapacity ? 'HIGH' : 'MODERATE') + '\n- Math track: ' + (hasMat157 ? 'MAT157 hard track' : hasMat137 ? 'MAT137 standard' : 'No calc yet') + '\n- Has MAT237: ' + hasMat237 + '\n- Has MAT240: ' + hasMat240 + '\n- Has CSC207: ' + hasCSC207 + '\n- Has CSC236: ' + hasCSC236 + '\n- Has STA238: ' + hasSTA238 + '\n- Grad school: ' + isGradSchool + '\n- Industry: ' + isIndustry + '\n- Math student: ' + isMath + '\n- CS student: ' + isCS + '\n- Stats student: ' + isStats + '\n\nRECOMMENDATION LOGIC: ' + recommendationLogic + '\n\nReturn ONLY this JSON:\n{\n  "message": "2-3 sentences to ' + profile.name + ' — acknowledge their specific background and give one direct piece of advice",\n  "courseRecommendations": [\n    {\n      "code": "MAT257Y1",\n      "name": "Analysis II",\n      "priority": "essential",\n      "reason": "You finished MAT157 — this is your next step. Covers differential forms, analysis on manifolds, Stokes theorem, and multilinear algebra. Essential for any math grad program.",\n      "coreTopics": ["Differential forms", "Analysis on manifolds", "Stokes theorem", "Multilinear algebra"],\n      "prereqsMet": true,\n      "difficulty": "hard",\n      "workload": 15,\n      "crossDiscipline": false\n    }\n  ],\n  "degreeProgress": {\n    "completedCredits": ' + String(completed.length * 0.5) + ',\n    "requiredCredits": 20,\n    "remainingRequired": ["list key remaining courses"],\n    "nextMilestone": "specific next milestone for this student"\n  },\n  "advisorNote": "One direct honest paragraph of advice for this student"\n}'

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
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

    const data = await response.json()
    if (data.error) return NextResponse.json({ error: data.error.message || 'OpenRouter error' }, { status: 500 })

    const raw = data.choices?.[0]?.message?.content?.trim() || ''
    try {
      const parsed = JSON.parse(raw)
      const filtered = (parsed.courseRecommendations || []).filter(
        (c: { code: string }) => !completedSet.has(c.code.toUpperCase().replace(/\s/g, ''))
      )
      return NextResponse.json({
        message: parsed.message || '',
        courseRecommendations: filtered,
        degreeProgress: parsed.degreeProgress || null,
        advisorNote: parsed.advisorNote || '',
      })
    } catch {
      return NextResponse.json({ message: '', courseRecommendations: [], degreeProgress: null, advisorNote: '' })
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
