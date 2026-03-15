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
    const selfAssessment = profile.selfAssessment || 'solid'
    const futureDirection = profile.futureDirection || ''
    const shortAnswer = profile.shortAnswer || ''

    const completedSet = new Set(completed.map((c: string) => c.toUpperCase().replace(/\s/g, '')))

    const hasMat157 = completedSet.has('MAT157Y1') || completedSet.has('MAT157')
    const hasMat137 = completedSet.has('MAT137Y1') || completedSet.has('MAT137')
    const hasMat135 = completedSet.has('MAT135H1') || completedSet.has('MAT135')
    const hasMat136 = completedSet.has('MAT136H1') || completedSet.has('MAT136')
    const hasMat237 = completedSet.has('MAT237Y1') || completedSet.has('MAT237')
    const hasMat240 = completedSet.has('MAT240H1') || completedSet.has('MAT240')
    const hasMat246 = completedSet.has('MAT246H1') || completedSet.has('MAT246')
    const hasMat247 = completedSet.has('MAT247H1') || completedSet.has('MAT247')
    const hasCSC148 = completedSet.has('CSC148H1') || completedSet.has('CSC148')
    const hasCSC165 = completedSet.has('CSC165H1') || completedSet.has('CSC165')
    const hasCSC207 = completedSet.has('CSC207H1') || completedSet.has('CSC207')
    const hasCSC236 = completedSet.has('CSC236H1') || completedSet.has('CSC236')
    const hasCSC263 = completedSet.has('CSC263H1') || completedSet.has('CSC263')
    const hasCSC311 = completedSet.has('CSC311H1') || completedSet.has('CSC311')
    const hasSTA237 = completedSet.has('STA237H1') || completedSet.has('STA237')
    const hasSTA238 = completedSet.has('STA238H1') || completedSet.has('STA238')

    const isHighCapacity = studyHours === '20-30h' || studyHours === '30h+'
    const isGradSchool = goals.toLowerCase().includes('grad') || goals.toLowerCase().includes('research') || goals.toLowerCase().includes('theoretical')
    const isMath = program.toLowerCase().includes('math') || interests.includes('Pure Mathematics')
    const isCS = program.toLowerCase().includes('computer') || interests.includes('Computer Science')
    const isStats = program.toLowerCase().includes('stat') || program.toLowerCase().includes('data') || interests.includes('Statistics')
    const isLifeSci = program.toLowerCase().includes('bio') || program.toLowerCase().includes('neuro') || interests.includes('Biology')
    const isPsych = program.toLowerCase().includes('psych') || interests.includes('Psychology')
    const isSpecialist = program.toLowerCase().includes('specialist')

    const yearLabel = yearType === 'first' ? 'First Year' : yearType === 'second' ? 'Second Year' : 'Third or Fourth Year'
    const targetSemesters = yearType === 'first' ? ['Fall 2025', 'Winter 2026'] : yearType === 'second' ? ['Fall 2025', 'Winter 2026'] : ['Fall 2025', 'Winter 2026']

    const selfAssessmentContext = selfAssessment === 'shaky'
      ? 'SHAKY: Student has gaps. Consolidate before advancing. If only MAT135+136, start with MAT137. Do not push hard courses.'
      : selfAssessment === 'strong'
        ? 'STRONG: Student excelled and wants acceleration. Push upper-year courses early if prereqs met. Be ambitious.'
        : 'SOLID: Student is ready for standard progression. Follow normal year path with 1-2 stretch courses.'

    const courseList = 'MAT135H1=Calculus I\nMAT136H1=Calculus II\nMAT137Y1=Calculus with Proofs\nMAT157Y1=Analysis I\nMAT223H1=Linear Algebra I\nMAT224H1=Linear Algebra II\nMAT235Y1=Multivariable Calculus\nMAT237Y1=Multivariable Calculus with Proofs\nMAT240H1=Algebra I\nMAT244H1=Introduction to Differential Equations\nMAT246H1=Abstract Mathematics\nMAT247H1=Algebra II\nMAT257Y1=Analysis II\nMAT267H1=Advanced Ordinary Differential Equations\nMAT301H1=Groups and Symmetries\nMAT315H1=Introduction to Number Theory\nMAT327H1=Introduction to Topology\nMAT334H1=Complex Variables\nMAT337H1=Introduction to Real Analysis\nMAT344H1=Introduction to Combinatorics\nMAT347Y1=Groups Rings and Fields\nMAT354H1=Complex Analysis I\nMAT357H1=Foundations of Real Analysis\nMAT363H1=Introduction to Differential Geometry\nSTA237H1=Probability Statistics and Data Analysis I\nSTA238H1=Probability Statistics and Data Analysis II\nSTA257H1=Probability and Statistics I\nSTA261H1=Probability and Statistics II\nSTA302H1=Methods of Data Analysis I\nSTA347H1=Probability\nCSC108H1=Introduction to Computer Programming\nCSC110Y1=Foundations of Computer Science I\nCSC148H1=Introduction to Computer Science\nCSC165H1=Mathematical Expression and Reasoning for Computer Science\nCSC207H1=Software Design\nCSC209H1=Software Tools and Systems Programming\nCSC236H1=Introduction to the Theory of Computation\nCSC258H1=Computer Organization\nCSC263H1=Data Structures and Analysis\nCSC311H1=Introduction to Machine Learning\nCSC343H1=Introduction to Databases\nCSC369H1=Operating Systems\nCSC373H1=Algorithm Design and Analysis\nCSC384H1=Introduction to Artificial Intelligence\nCSC401H1=Natural Language Computing\nCSC412H1=Probabilistic Learning and Reasoning\nCSC413H1=Neural Networks and Deep Learning\nCSC418H1=Computer Graphics\nCSC420H1=Introduction to Image Understanding\nCSC448H1=Formal Languages and Automata Theory\nCSC458H1=Computer Networks\nCSC463H1=Computational Complexity and Computability\nCSC473H1=Advanced Algorithm Design\nCSC485H1=Computational Linguistics\nCSC494H1=Computer Science Project\nPHY131H1=Introduction to Physics I\nPHY132H1=Introduction to Physics II\nPHY151H1=Foundations of Physics I\nPHY152H1=Foundations of Physics II\nPHY254H1=Mechanics\nPHY256H1=Introduction to Quantum Mechanics\nPHY350H1=Electromagnetic Theory\nPHY354H1=Advanced Classical Mechanics\nBIO120H1=Adaptation and Biodiversity\nBIO130H1=Molecular and Cell Biology\nBIO230H1=From Genes to Organisms\nBIO240H1=From Organisms to Ecosystems\nECO101H1=Principles of Microeconomics\nECO102H1=Principles of Macroeconomics\nECO200Y1=Microeconomic Theory\nECO202Y1=Macroeconomic Theory\nECO220Y1=Introduction to Data Analysis and Applied Econometrics\nECO325H1=Advanced Economic Theory\nECO358H1=Financial Economics I\nPSY100H1=Introductory Psychology\nPSY201H1=Statistics for Psychologists\nPSY220H1=Social Psychology\nPSY230H1=Personality and Its Transformations\nPSY240H1=Introduction to Abnormal Psychology\nPSY270H1=Introduction to Cognitive Psychology\nSOC100H1=Introduction to Sociology'

    const prereqList = 'MAT257Y1 needs MAT157Y1\nMAT267H1 needs MAT157Y1 and MAT240H1\nMAT240H1 needs MAT137Y1\nMAT247H1 needs MAT240H1\nMAT237Y1 needs MAT137Y1\nMAT246H1 needs MAT137Y1\nMAT327H1 needs MAT257Y1\nMAT347Y1 needs MAT247H1\nMAT337H1 needs MAT237Y1 and MAT246H1\nMAT354H1 needs MAT257Y1\nMAT357H1 needs MAT257Y1\nMAT301H1 needs MAT240H1\nMAT315H1 needs MAT246H1\nSTA257H1 needs MAT137Y1\nSTA261H1 needs STA257H1\nSTA302H1 needs STA238H1 and MAT223H1\nSTA347H1 needs MAT237Y1 and STA238H1\nCSC207H1 needs CSC148H1\nCSC209H1 needs CSC148H1\nCSC236H1 needs CSC148H1 and CSC165H1\nCSC258H1 needs CSC148H1 and CSC165H1\nCSC263H1 needs CSC207H1 and CSC236H1\nCSC311H1 needs CSC207H1 and MAT237Y1 and STA238H1\nCSC343H1 needs CSC207H1\nCSC369H1 needs CSC209H1 and CSC263H1\nCSC373H1 needs CSC263H1\nCSC384H1 needs CSC263H1 and MAT223H1\nCSC412H1 needs CSC311H1\nCSC413H1 needs CSC311H1\nCSC418H1 needs CSC207H1 and MAT237Y1\nCSC420H1 needs CSC263H1 and MAT223H1\nCSC448H1 needs CSC236H1 and MAT223H1\nCSC463H1 needs CSC236H1 and MAT223H1\nCSC473H1 needs CSC263H1\nCSC485H1 needs CSC207H1'

    const futureDirectionContext = futureDirection ? 'FUTURE DIRECTION: ' + futureDirection + '. This means: ' + ({
      'ml-ai': 'prioritize path toward CSC311, CSC412, CSC413, STA347. Math foundation matters.',
      'systems': 'prioritize CSC209, CSC258, CSC369, CSC458, CSC469.',
      'theory-cs': 'prioritize CSC236, CSC263, CSC373, CSC463, CSC473, CSC448.',
      'vision-graphics': 'prioritize CSC420, CSC418, linear algebra, MAT237.',
      'nlp': 'prioritize CSC401, CSC485, CSC311, linguistics courses.',
      'pure-math': 'push toward MAT246, MAT240, MAT247, MAT337, MAT347, MAT327.',
      'analysis': 'push toward MAT237, MAT246, MAT337, MAT354, MAT357, MAT351.',
      'algebra': 'push toward MAT240, MAT246, MAT247, MAT301, MAT315, MAT347.',
      'stats-data': 'prioritize STA257, STA261, STA302, STA347, CSC343.',
      'quant-finance': 'prioritize STA347, MAT337, ECO358, ECO325.',
      'bio-research': 'prioritize upper-year BIO courses and quantitative methods.',
      'neuro': 'prioritize PSY upper-year, BIO courses, maybe STA for research methods.',
      'physics-research': 'prioritize PHY254, PHY256, PHY350, PHY354.',
      'grad-math': 'push hardest math courses: MAT257, MAT347, MAT327, MAT357.',
      'grad-cs': 'push toward research courses, CSC494, senior seminars, theory.',
      'industry-swe': 'prioritize practical CS: CSC209, CSC343, CSC369, project courses.',
      'other': 'balance breadth and depth based on interests.',
    } as Record<string, string>)[futureDirection] || '' : ''

    const systemPrompt = 'You are an expert UofT academic advisor who builds real semester course plans.\n\nCRITICAL RULES:\n1. Only use courses from the exact list with their exact names. Never invent courses.\n2. Never include courses already completed by the student.\n3. Strictly check prerequisites — only include a course if prereqs are in completed list.\n4. Generate exactly 2 semesters: Fall and Winter.\n5. Total across both semesters: 8 to 12 courses. Distribute sensibly (4-6 per semester).\n6. MANDATORY MIX: Every plan must include courses from at least 2 different departments. A pure math student still gets 1-2 stats or CS courses. A CS student gets 1-2 math or stats courses. A life sci student gets quantitative electives. Never fill a plan with only one subject.\n7. The student short answer is THE most important signal. Read it carefully and let it directly shape course choices.\n8. Self-assessment controls ambition level: shaky=consolidate, solid=standard, strong=accelerate.\n9. Year 1 students have no completed courses. Give them a standard first year plan appropriate to their admission category and interests.\n10. For Y courses (full year like MAT237Y1): count them in Fall semester but note they run all year.\n\nCOURSE LIST:\n' + courseList + '\n\nPREREQUISITES:\n' + prereqList

    const userPrompt = 'Build a complete Fall + Winter course plan for ' + profile.name + '.\n\nPROFILE:\n- Program: ' + program + ' (' + (isSpecialist ? 'Specialist' : 'Major or Minor') + ')\n- Year: ' + yearLabel + '\n- Completed: ' + JSON.stringify(completed) + '\n- Goals: ' + goals + '\n- Learning style: ' + learningStyle + '\n- Study hours/week: ' + studyHours + '\n- Interests: ' + JSON.stringify(interests) + '\n\nSTUDENT IN THEIR OWN WORDS (most important — read carefully):\n"' + shortAnswer + '"\n\nSELF-ASSESSMENT: ' + selfAssessmentContext + '\n\n' + futureDirectionContext + '\n\nFLAGS:\n- Has MAT157: ' + hasMat157 + ' | Has MAT137: ' + hasMat137 + ' | Has MAT135+136 only: ' + (hasMat135 && hasMat136 && !hasMat137 && !hasMat157) + '\n- Has MAT237: ' + hasMat237 + ' | Has MAT240: ' + hasMat240 + ' | Has MAT246: ' + hasMat246 + ' | Has MAT247: ' + hasMat247 + '\n- Has CSC148: ' + hasCSC148 + ' | Has CSC165: ' + hasCSC165 + ' | Has CSC207: ' + hasCSC207 + ' | Has CSC236: ' + hasCSC236 + ' | Has CSC263: ' + hasCSC263 + ' | Has CSC311: ' + hasCSC311 + '\n- Has STA237: ' + hasSTA237 + ' | Has STA238: ' + hasSTA238 + '\n- Grad school: ' + isGradSchool + ' | High capacity: ' + isHighCapacity + '\n- Math: ' + isMath + ' | CS: ' + isCS + ' | Stats: ' + isStats + ' | LifeSci: ' + isLifeSci + ' | Psych: ' + isPsych + '\n\nKEY DECISIONS:\n- If yearType=first: No completed courses. Plan standard first year based on admission category and interests. Math/Phys stream gets MAT137Y1+MAT223H1+CSC148H1 etc. Life sci gets BIO120+BIO130+CHM etc.\n- If shaky AND only MAT135+136 AND wants grad school: MUST put MAT137Y1 in Fall.\n- If strong AND has MAT157: push MAT257Y1+MAT240H1 in same plan.\n- ALWAYS include at least 1 course outside main program (cross-disciplinary).\n- Do NOT pad with random courses — every course must have a clear reason.\n\nReturn ONLY this JSON:\n{\n  "message": "2-3 sentences to ' + profile.name + ' — reference their own words, their self-assessment (' + selfAssessment + '), and one key insight about their plan",\n  "courseSchedule": [\n    {\n      "semester": "' + targetSemesters[0] + '",\n      "courses": [\n        {\n          "code": "MAT157Y1",\n          "name": "Analysis I",\n          "reason": "Based on what you said about enjoying rigorous math — this sets the foundation for everything in your direction.",\n          "type": "required",\n          "workload": 12,\n          "coreTopics": ["Real number axioms", "Limits and continuity", "Differentiation", "Integration", "Sequences and series"],\n          "whyNow": "Take this in Fall — it runs all year and unlocks MAT257, MAT240, and the whole specialist track."\n        }\n      ]\n    },\n    {\n      "semester": "' + targetSemesters[1] + '",\n      "courses": []\n    }\n  ],\n  "degreeProgress": {\n    "completedCredits": ' + String(completed.length * 0.5) + ',\n    "requiredCredits": 20,\n    "remainingRequired": ["key remaining required course codes"],\n    "nextMilestone": "concrete next milestone after this year"\n  },\n  "advisorNote": "One direct paragraph — explain the philosophy behind this plan, what the mix is trying to achieve, and what to focus on after this year"\n}'

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
      const filteredSchedule = (parsed.courseSchedule || []).map((sem: {
        semester: string
        courses: { code: string; name: string; reason: string; type: string; workload: number; coreTopics: string[]; whyNow: string }[]
      }) => ({
        ...sem,
        courses: sem.courses.filter(
          (c: { code: string }) => !completedSet.has(c.code.toUpperCase().replace(/\s/g, ''))
        ),
      })).filter((sem: { courses: { code: string }[] }) => sem.courses.length > 0)

      return NextResponse.json({
        message: parsed.message || '',
        courseSchedule: filteredSchedule,
        degreeProgress: parsed.degreeProgress || null,
        advisorNote: parsed.advisorNote || '',
      })
    } catch {
      return NextResponse.json({ message: '', courseSchedule: [], degreeProgress: null, advisorNote: '' })
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
