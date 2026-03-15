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
    const isMathSpecialist = program.toLowerCase().includes('mathematics specialist') || program.toLowerCase().includes('math specialist')

    const yearLabel = yearType === 'first' ? 'First Year' : yearType === 'second' ? 'Second Year' : 'Third or Fourth Year'
    const targetFall = yearType === 'first' ? 'Fall 2025' : yearType === 'second' ? 'Fall 2025' : 'Fall 2025'
    const targetWinter = yearType === 'first' ? 'Winter 2026' : yearType === 'second' ? 'Winter 2026' : 'Winter 2026'

    const selfAssessmentContext = selfAssessment === 'shaky'
      ? 'SHAKY: Student has gaps or low confidence. Consolidate before advancing. Do not push hard courses. If first year and unsure about math, MAT135(Fall)+MAT136(Winter) is safer than MAT137Y1.'
      : selfAssessment === 'strong'
        ? 'STRONG: Student excelled and wants acceleration. Push upper-year courses early if prereqs met. Be ambitious. A strong ambitious CS student can take MAT157Y1 instead of MAT137Y1.'
        : 'SOLID: Student is ready for standard progression.'

    const courseList = [
      'MAT135H1=Calculus I (Fall only, H1)',
      'MAT136H1=Calculus II (Winter only, H1)',
      'MAT137Y1=Calculus with Proofs (Full year Y1, starts Fall)',
      'MAT157Y1=Analysis I (Full year Y1, starts Fall) — harder alternative to MAT137, for Math Specialist or ambitious students',
      'MAT223H1=Linear Algebra I (H1)',
      'MAT224H1=Linear Algebra II (H1)',
      'MAT235Y1=Multivariable Calculus (Full year Y1, starts Fall)',
      'MAT237Y1=Multivariable Calculus with Proofs (Full year Y1, starts Fall)',
      'MAT240H1=Algebra I (H1)',
      'MAT244H1=Introduction to Differential Equations (H1)',
      'MAT246H1=Abstract Mathematics (H1)',
      'MAT247H1=Algebra II (H1)',
      'MAT257Y1=Analysis II (Full year Y1, starts Fall)',
      'MAT267H1=Advanced Ordinary Differential Equations (H1)',
      'MAT301H1=Groups and Symmetries (H1)',
      'MAT315H1=Introduction to Number Theory (H1)',
      'MAT327H1=Introduction to Topology (H1)',
      'MAT334H1=Complex Variables (H1)',
      'MAT337H1=Introduction to Real Analysis (H1)',
      'MAT344H1=Introduction to Combinatorics (H1)',
      'MAT347Y1=Groups Rings and Fields (Full year Y1, starts Fall)',
      'MAT351Y1=Partial Differential Equations (Full year Y1, starts Fall)',
      'MAT354H1=Complex Analysis I (H1)',
      'MAT357H1=Foundations of Real Analysis (H1)',
      'MAT363H1=Introduction to Differential Geometry (H1)',
      'STA130H1=Introduction to Statistical Reasoning and Data Science (H1)',
      'STA237H1=Probability Statistics and Data Analysis I (H1)',
      'STA238H1=Probability Statistics and Data Analysis II (H1)',
      'STA257H1=Probability and Statistics I (H1)',
      'STA261H1=Probability and Statistics II (H1)',
      'STA302H1=Methods of Data Analysis I (H1)',
      'STA347H1=Probability (H1)',
      'CSC108H1=Introduction to Computer Programming (H1)',
      'CSC110Y1=Foundations of Computer Science I (Full year Y1, Fall only offering)',
      'CSC148H1=Introduction to Computer Science (H1)',
      'CSC165H1=Mathematical Expression and Reasoning for Computer Science (H1)',
      'CSC207H1=Software Design (H1)',
      'CSC209H1=Software Tools and Systems Programming (H1)',
      'CSC236H1=Introduction to the Theory of Computation (H1)',
      'CSC258H1=Computer Organization (H1)',
      'CSC263H1=Data Structures and Analysis (H1)',
      'CSC311H1=Introduction to Machine Learning (H1)',
      'CSC343H1=Introduction to Databases (H1)',
      'CSC369H1=Operating Systems (H1)',
      'CSC373H1=Algorithm Design and Analysis (H1)',
      'CSC384H1=Introduction to Artificial Intelligence (H1)',
      'CSC401H1=Natural Language Computing (H1)',
      'CSC412H1=Probabilistic Learning and Reasoning (H1)',
      'CSC413H1=Neural Networks and Deep Learning (H1)',
      'CSC418H1=Computer Graphics (H1)',
      'CSC420H1=Introduction to Image Understanding (H1)',
      'CSC448H1=Formal Languages and Automata Theory (H1)',
      'CSC458H1=Computer Networks (H1)',
      'CSC463H1=Computational Complexity and Computability (H1)',
      'CSC473H1=Advanced Algorithm Design (H1)',
      'CSC485H1=Computational Linguistics (H1)',
      'CSC494H1=Computer Science Project (H1)',
      'PHY131H1=Introduction to Physics I (H1)',
      'PHY132H1=Introduction to Physics II (H1)',
      'PHY151H1=Foundations of Physics I (H1)',
      'PHY152H1=Foundations of Physics II (H1)',
      'PHY254H1=Mechanics (H1)',
      'PHY256H1=Introduction to Quantum Mechanics (H1)',
      'PHY350H1=Electromagnetic Theory (H1)',
      'PHY354H1=Advanced Classical Mechanics (H1)',
      'BIO120H1=Adaptation and Biodiversity (H1)',
      'BIO130H1=Molecular and Cell Biology (H1)',
      'BIO230H1=From Genes to Organisms (H1)',
      'BIO240H1=From Organisms to Ecosystems (H1)',
      'ECO101H1=Principles of Microeconomics (H1)',
      'ECO102H1=Principles of Macroeconomics (H1)',
      'ECO200Y1=Microeconomic Theory (Full year Y1)',
      'ECO202Y1=Macroeconomic Theory (Full year Y1)',
      'ECO220Y1=Introduction to Data Analysis and Applied Econometrics (Full year Y1)',
      'ECO325H1=Advanced Economic Theory (H1)',
      'ECO358H1=Financial Economics I (H1)',
      'PSY100H1=Introductory Psychology (H1)',
      'PSY201H1=Statistics for Psychologists (H1)',
      'PSY220H1=Social Psychology (H1)',
      'PSY230H1=Personality and Its Transformations (H1)',
      'PSY240H1=Introduction to Abnormal Psychology (H1)',
      'PSY270H1=Introduction to Cognitive Psychology (H1)',
      'SOC100H1=Introduction to Sociology (H1)',
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
      'MAT351Y1 needs MAT267H1 and MAT237Y1',
      'MAT354H1 needs MAT257Y1',
      'MAT357H1 needs MAT257Y1',
      'MAT301H1 needs MAT240H1',
      'MAT315H1 needs MAT246H1',
      'STA237H1 needs MAT137Y1 already completed',
      'STA257H1 needs MAT137Y1 already completed',
      'STA261H1 needs STA257H1',
      'STA302H1 needs STA238H1 and MAT223H1',
      'STA347H1 needs MAT237Y1 and STA238H1',
      'CSC148H1 needs CSC108H1 or equivalent',
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
      'CSC418H1 needs CSC207H1 and MAT237Y1',
      'CSC420H1 needs CSC263H1 and MAT223H1',
      'CSC448H1 needs CSC236H1 and MAT223H1',
      'CSC463H1 needs CSC236H1 and MAT223H1',
      'CSC473H1 needs CSC263H1',
    ].join('\n')

    const futureDirectionContext = !futureDirection ? '' : 'FUTURE DIRECTION: ' + futureDirection + ' — ' + ({
      'ml-ai': 'path: CSC148+CSC165 -> CSC207+CSC236 -> CSC263 -> CSC311 -> CSC412/CSC413. Also needs MAT237 and STA238.',
      'systems': 'path: CSC148+CSC165 -> CSC207+CSC209 -> CSC258+CSC263 -> CSC369+CSC458.',
      'theory-cs': 'path: CSC148+CSC165 -> CSC236 -> CSC263 -> CSC373+CSC463+CSC448.',
      'vision-graphics': 'path: CSC263 -> CSC420+CSC418. Also needs MAT237 and MAT223.',
      'nlp': 'path: CSC207 -> CSC401+CSC485+CSC311.',
      'pure-math': 'path: MAT157Y1 -> MAT257Y1+MAT240H1 -> MAT247H1 -> MAT347Y1+MAT327H1.',
      'analysis': 'path: MAT137/157 -> MAT237+MAT246 -> MAT337+MAT354+MAT357.',
      'algebra': 'path: MAT137/157 -> MAT240 -> MAT246+MAT247 -> MAT301+MAT315+MAT347.',
      'stats-data': 'path: MAT137 -> STA237+STA238 -> STA302+STA347. Also CSC343.',
      'quant-finance': 'path: MAT137 -> STA257+STA261 -> STA347+MAT337+ECO358.',
      'bio-research': 'upper-year BIO courses plus STA237 for research methods.',
      'neuro': 'PSY upper-year plus BIO and STA237.',
      'physics-research': 'PHY131+PHY132 -> PHY254+PHY256 -> PHY350+PHY354.',
      'grad-math': 'push hardest: MAT157Y1 -> MAT257Y1+MAT240H1+MAT267H1 -> MAT347Y1+MAT327H1+MAT357H1.',
      'grad-cs': 'push toward research: CSC263 -> CSC311+CSC373 -> CSC412+CSC413+CSC494.',
      'industry-swe': 'practical path: CSC148+CSC165 -> CSC207+CSC209 -> CSC263+CSC343 -> CSC369.',
      'other': 'balanced breadth across interests.',
    } as Record<string, string>)[futureDirection]

    const systemPrompt = [
      'You are an expert UofT academic advisor. You build precise Fall + Winter semester plans.',
      '',
      'COURSE SESSION RULES (CRITICAL — never violate these):',
      '1. Y1 = full year course. It occupies BOTH Fall and Winter. Place it in Fall semester only in your JSON. Do NOT also add it to Winter.',
      '2. H1 = half year course. Place in either Fall or Winter.',
      '3. MAT137Y1 and MAT157Y1 are MUTUALLY EXCLUSIVE alternatives. Never schedule both in the same plan.',
      '   - MAT137Y1: standard calculus with proofs. For CS, Stats, Math Major, Life Sci honors, general science.',
      '   - MAT157Y1: harder analysis. Primarily for Mathematics Specialist or Physics Specialist. A very ambitious CS/Stats student CAN take it if they explicitly want a challenge and say so in their short answer.',
      '   - MAT135H1(Fall) + MAT136H1(Winter): for students who just need calculus for their program and do not want proof-based courses. Good for life sci, econ, or students who said in short answer they want to minimize math.',
      '4. CSC110Y1 is a full-year alternative to CSC148+CSC165. It is only offered starting in Fall. Never put it in Winter.',
      '5. STA237H1 requires MAT137Y1 to already be COMPLETED. If the student is taking MAT137Y1 this year, STA237H1 cannot be in the same plan.',
      '6. A Y1 course takes approximately 2 H1 course slots worth of workload. Account for this in semester load.',
      '7. Typical semester load: 4-5 courses. With one Y1 course, add 3-4 H1 courses around it.',
      '8. Total plan: 8-12 courses across both semesters combined.',
      '',
      'MANDATORY MIX RULE:',
      'Every plan must have at least 1-2 courses outside the student main subject. Examples:',
      '- Math specialist: include 1 stats or CS course',
      '- CS student: include 1 math or stats course',
      '- Life sci student: include STA237H1 or similar quantitative course',
      '- Never fill entire plan with only one department',
      '',
      'SHORT ANSWER IS MOST IMPORTANT:',
      'Read the student short answer carefully. If they say they want to minimize math -> give MAT135+MAT136. If they say they are ambitious and love math -> consider MAT157Y1. If they mention specific courses they want -> include them if prereqs allow.',
      '',
      'ONLY USE COURSES FROM THIS LIST WITH EXACT NAMES:',
      courseList,
      '',
      'PREREQUISITES (only include course if prereqs are in completed list):',
      prereqList,
    ].join('\n')

    const userPrompt = [
      'Build a Fall + Winter course plan for ' + profile.name + '.',
      '',
      'PROFILE:',
      '- Program: ' + program + ' (' + (isSpecialist ? 'Specialist' : 'Major or Minor') + ')',
      '- Is Math Specialist: ' + isMathSpecialist,
      '- Year: ' + yearLabel,
      '- Completed courses: ' + JSON.stringify(completed),
      '- Goals: ' + goals,
      '- Learning style: ' + learningStyle,
      '- Study hours/week: ' + studyHours,
      '- Interests: ' + JSON.stringify(interests),
      '',
      'STUDENT IN THEIR OWN WORDS (most important input):',
      '"' + shortAnswer + '"',
      '',
      'SELF-ASSESSMENT: ' + selfAssessmentContext,
      '',
      futureDirectionContext,
      '',
      'DERIVED FLAGS:',
      '- Has MAT157: ' + hasMat157 + ' | Has MAT137: ' + hasMat137 + ' | Has MAT135 only: ' + (hasMat135 && !hasMat137 && !hasMat157) + ' | Has MAT136: ' + hasMat136,
      '- Has MAT237: ' + hasMat237 + ' | Has MAT240: ' + hasMat240 + ' | Has MAT246: ' + hasMat246 + ' | Has MAT247: ' + hasMat247,
      '- Has CSC148: ' + hasCSC148 + ' | Has CSC165: ' + hasCSC165 + ' | Has CSC207: ' + hasCSC207 + ' | Has CSC236: ' + hasCSC236 + ' | Has CSC263: ' + hasCSC263 + ' | Has CSC311: ' + hasCSC311,
      '- Has STA237: ' + hasSTA237 + ' | Has STA238: ' + hasSTA238,
      '- Grad school: ' + isGradSchool + ' | High capacity: ' + isHighCapacity,
      '- Math: ' + isMath + ' | CS: ' + isCS + ' | Stats: ' + isStats + ' | LifeSci: ' + isLifeSci + ' | Psych: ' + isPsych,
      '',
      'KEY DECISION LOGIC:',
      '- First year CS student (standard): MAT137Y1(Fall Y1) + CSC148H1(Fall) + CSC165H1(Fall) + MAT223H1(Winter) + CSC207H1(Winter) + 1 elective',
      '- First year CS student (ambitious, says so in short answer): MAT157Y1(Fall Y1) + CSC148H1(Fall) + CSC165H1(Fall) + MAT223H1(Winter) + CSC207H1(Winter)',
      '- First year CS student (wants to minimize math, says so): MAT135H1(Fall) + CSC148H1(Fall) + CSC165H1(Fall) + MAT136H1(Winter) + CSC207H1(Winter)',
      '- First year Math Specialist: MAT157Y1(Fall Y1) + MAT223H1(Fall) + CSC148H1(Winter) + MAT240H1(Winter)',
      '- First year Math Major: MAT137Y1(Fall Y1) + MAT223H1(Fall) + 2-3 other courses',
      '- Second year CS (has CSC148+CSC165): CSC207H1 + CSC209H1 + CSC236H1 + CSC258H1 + MAT237Y1 or MAT240H1',
      '- Remember: if placing MAT137Y1 in Fall, do NOT add STA237H1 — prereq not met until end of year',
      '',
      'Return ONLY this JSON:',
      '{',
      '  "message": "2-3 sentences to ' + profile.name + ' — reference their own words, mention the key decision made (e.g. why 137 vs 157 vs 135/136), be direct",',
      '  "courseSchedule": [',
      '    {',
      '      "semester": "' + targetFall + '",',
      '      "courses": [',
      '        {',
      '          "code": "MAT137Y1",',
      '          "name": "Calculus with Proofs",',
      '          "reason": "personalized reason referencing their short answer and goals",',
      '          "type": "required",',
      '          "workload": 12,',
      '          "coreTopics": ["topic1", "topic2"],',
      '          "whyNow": "why this semester specifically"',
      '        }',
      '      ]',
      '    },',
      '    {',
      '      "semester": "' + targetWinter + '",',
      '      "courses": []',
      '    }',
      '  ],',
      '  "degreeProgress": {',
      '    "completedCredits": ' + String(completed.length * 0.5) + ',',
      '    "requiredCredits": 20,',
      '    "remainingRequired": ["key remaining course codes"],',
      '    "nextMilestone": "concrete next milestone after this year"',
      '  },',
      '  "advisorNote": "One honest paragraph explaining the philosophy of this plan and what comes next"',
      '}',
    ].join('\n')

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
      })).filter((sem: { courses: unknown[] }) => sem.courses.length > 0)

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
