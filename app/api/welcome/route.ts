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
    const hasMat257 = completedSet.has('MAT257Y1') || completedSet.has('MAT257')
    const hasMat327 = completedSet.has('MAT327H1') || completedSet.has('MAT327')
    const hasMat347 = completedSet.has('MAT347Y1') || completedSet.has('MAT347')
    const hasMat337 = completedSet.has('MAT337H1') || completedSet.has('MAT337')
    const hasMat357 = completedSet.has('MAT357H1') || completedSet.has('MAT357')
    const hasCSC148 = completedSet.has('CSC148H1') || completedSet.has('CSC148')
    const hasCSC165 = completedSet.has('CSC165H1') || completedSet.has('CSC165')
    const hasCSC207 = completedSet.has('CSC207H1') || completedSet.has('CSC207')
    const hasCSC209 = completedSet.has('CSC209H1') || completedSet.has('CSC209')
    const hasCSC236 = completedSet.has('CSC236H1') || completedSet.has('CSC236')
    const hasCSC258 = completedSet.has('CSC258H1') || completedSet.has('CSC258')
    const hasCSC263 = completedSet.has('CSC263H1') || completedSet.has('CSC263')
    const hasCSC311 = completedSet.has('CSC311H1') || completedSet.has('CSC311')
    const hasSTA237 = completedSet.has('STA237H1') || completedSet.has('STA237')
    const hasSTA238 = completedSet.has('STA238H1') || completedSet.has('STA238')
    const hasSTA257 = completedSet.has('STA257H1') || completedSet.has('STA257')
    const hasSTA302 = completedSet.has('STA302H1') || completedSet.has('STA302')

    const isHighCapacity = studyHours === '20-30h' || studyHours === '30h+'
    const isGradSchool = goals.toLowerCase().includes('grad') || goals.toLowerCase().includes('research') || goals.toLowerCase().includes('theoretical')
    const isMath = program.toLowerCase().includes('math') || interests.includes('Pure Mathematics')
    const isCS = program.toLowerCase().includes('computer') || interests.includes('Computer Science')
    const isStats = program.toLowerCase().includes('stat') || program.toLowerCase().includes('data') || interests.includes('Statistics')
    const isLifeSci = program.toLowerCase().includes('bio') || program.toLowerCase().includes('neuro') || interests.includes('Biology')
    const isPsych = program.toLowerCase().includes('psych') || interests.includes('Psychology')
    const isEcon = program.toLowerCase().includes('econ') || interests.includes('Economics')
    const isSpecialist = program.toLowerCase().includes('specialist')
    const isMathSpecialist = program.toLowerCase().includes('mathematics specialist') || program.toLowerCase().includes('math specialist')
    const isCSSpecialist = program.toLowerCase().includes('computer science specialist')
    const isPhysics = program.toLowerCase().includes('physics') || interests.includes('Physics')

    const yearLabel = yearType === 'first' ? 'First Year' : yearType === 'second' ? 'Second Year' : 'Third or Fourth Year'
    const targetFall = yearType === 'first' ? 'First Year Fall' : yearType === 'second' ? 'Second Year Fall' : 'Third Year Fall'
    const targetWinter = yearType === 'first' ? 'First Year Winter' : yearType === 'second' ? 'Second Year Winter' : 'Third Year Winter'
    const targetFall2 = 'Fourth Year Fall'
    const targetWinter2 = 'Fourth Year Winter'

    const shortLower = shortAnswer.toLowerCase()
    const wantsMat157 = shortLower.includes('157') || shortLower.includes('challenge') || shortLower.includes('ambitious') || shortLower.includes('push myself') || shortLower.includes('hardest')
    const wantsMinimalMath = shortLower.includes('minimize math') || shortLower.includes('just need to pass') || shortLower.includes('not interested in math') || shortLower.includes('hate math') || shortLower.includes('math is secondary')
    const wantsAccelerate = shortLower.includes('accelerate') || shortLower.includes('ahead of schedule') || shortLower.includes('fast') || shortLower.includes('as many as possible')
    const wantsCSC207Early = shortLower.includes('csc207') || shortLower.includes('software design') || wantsAccelerate
    const wantsCSC240 = shortLower.includes('csc240') || shortLower.includes('discrete') || (isCS && selfAssessment === 'strong' && isGradSchool)
    const isVeryConfident = selfAssessment === 'strong' && (isHighCapacity || isGradSchool)

    const selfAssessmentContext = selfAssessment === 'shaky'
      ? yearType === 'first'
        ? 'SHAKY FIRST YEAR: Prefer MAT135H1+MAT136H1 over MAT137Y1 unless student says they want proofs. Lighter load.'
        : 'SHAKY UPPER YEAR: Do NOT send back to first year courses. Max 4 courses per semester. Avoid stacking multiple hard courses. Fill prereq gaps at current year level only.'
      : selfAssessment === 'strong'
        ? yearType === 'first'
          ? 'STRONG FIRST YEAR: Read short answer carefully. Consider MAT157Y1 for math-heavy, MAT240H1 alongside MAT157Y1 for very ambitious, CSC240H1 for theory CS, PHY151+152 for physics. Can overlap programs. Do not mechanically apply all — use short answer to judge.'
          : yearType === 'second'
            ? 'STRONG SECOND YEAR: Can handle harder combinations. Strong math can take MAT257Y1+MAT327H1+MAT267H1 together. Strong CS can push CSC265H1. Be aggressive based on short answer.'
            : 'STRONG THIRD/FOURTH YEAR: MUST include 400-level courses if prereqs met. Can handle 5 courses per semester. Be very ambitious. Do not be conservative. Include graduate-prep courses. Read short answer for direction.'
        : 'SOLID: Standard progression.'

    const courseList = [
      'MAT135H1=Calculus I (Fall only H1)',
      'MAT136H1=Calculus II (Winter only H1)',
      'MAT137Y1=Calculus with Proofs (Full year Y1 starts Fall)',
      'MAT157Y1=Analysis I (Full year Y1 starts Fall) harder alternative to MAT137',
      'MAT223H1=Linear Algebra I (H1)',
      'MAT224H1=Linear Algebra II (H1)',
      'MAT235Y1=Multivariable Calculus (Full year Y1 starts Fall)',
      'MAT237Y1=Multivariable Calculus with Proofs (Full year Y1 starts Fall)',
      'MAT240H1=Algebra I (H1)',
      'MAT244H1=Introduction to Differential Equations (H1)',
      'MAT246H1=Abstract Mathematics (H1)',
      'MAT247H1=Algebra II (H1)',
      'MAT257Y1=Analysis II (Full year Y1 starts Fall)',
      'MAT267H1=Advanced Ordinary Differential Equations (H1)',
      'MAT301H1=Groups and Symmetries (H1)',
      'MAT309H1=Introduction to Mathematical Logics (H1)',
      'MAT315H1=Introduction to Number Theory (H1)',
      'MAT327H1=Introduction to Topology (H1)',
      'MAT332H1=Introduction to Graph Theory (H1)',
      'MAT334H1=Complex Variables (H1)',
      'MAT335H1=Chaos Fractals and Dynamics (H1)',
      'MAT337H1=Introduction to Real Analysis (H1)',
      'MAT344H1=Introduction to Combinatorics (H1)',
      'MAT347Y1=Groups Rings and Fields (Full year Y1 starts Fall)',
      'MAT351Y1=Partial Differential Equations (Full year Y1 starts Fall)',
      'MAT354H1=Complex Analysis I (H1)',
      'MAT357H1=Foundations of Real Analysis (H1)',
      'MAT363H1=Introduction to Differential Geometry (H1)',
      'MAT401H1=Polynomial Equations and Fields (H1)',
      'MAT402H1=Classical Geometry I (H1)',
      'MAT409H1=Set Theory (H1)',
      'MAT415H1=Algebraic Number Theory (H1)',
      'MAT417H1=Analytic Number Theory (H1)',
      'MAT425H1=Differential Topology (H1)',
      'MAT436H1=Introduction to Linear Operators (H1)',
      'MAT445H1=Representation Theory (H1)',
      'MAT448H1=Introduction to Commutative Algebra and Algebraic Geometry (H1)',
      'MAT454H1=Complex Analysis II (H1)',
      'MAT457H1=Advanced Real Analysis I (H1)',
      'MAT458H1=Advanced Real Analysis II (H1)',
      'MAT475H1=Problem Solving Seminar (H1)',
      'APM346H1=Partial Differential Equations (H1)',
      'APM421H1=Mathematical Foundations of Quantum Mechanics (H1)',
      'APM426H1=General Relativity (H1)',
      'APM446H1=Applied Nonlinear Equations (H1)',
      'APM461H1=Combinatorial Methods (H1)',
      'APM462H1=Nonlinear Optimization (H1)',
      'STA130H1=Introduction to Statistical Reasoning and Data Science (H1)',
      'STA237H1=Probability Statistics and Data Analysis I (H1)',
      'STA238H1=Probability Statistics and Data Analysis II (H1)',
      'STA247H1=Probability with Computer Applications (H1)',
      'STA248H1=Statistics for Computer Scientists (H1)',
      'STA257H1=Probability and Statistics I (H1)',
      'STA261H1=Probability and Statistics II (H1)',
      'STA302H1=Methods of Data Analysis I (H1)',
      'STA303H1=Methods of Data Analysis II (H1)',
      'STA314H1=Statistical Methods for Machine Learning I (H1)',
      'STA347H1=Probability (H1)',
      'STA365H1=Applied Bayesian Statistics (H1)',
      'STA410H1=Statistical Computation (H1)',
      'STA414H1=Statistical Methods for Machine Learning II (H1)',
      'STA437H1=Methods for Multivariate Data (H1)',
      'STA447H1=Stochastic Processes (H1)',
      'STA457H1=Time Series Analysis (H1)',
      'STA475H1=Survival Analysis (H1)',
      'CSC108H1=Introduction to Computer Programming (H1)',
      'CSC110Y1=Foundations of Computer Science I (CS stream first year only, Full year Y1 Fall only)',
      'CSC111H1=Foundations of Computer Science II (CS stream first year only, H1 Winter only, continuation of CSC110Y1)',
      'CSC148H1=Introduction to Computer Science (H1)',
      'CSC165H1=Mathematical Expression and Reasoning for Computer Science (H1)',
      'CSC207H1=Software Design (H1)',
      'CSC209H1=Software Tools and Systems Programming (H1)',
      'CSC236H1=Introduction to the Theory of Computation (H1)',
      'CSC240H1=Discrete Mathematics for CS (H1) harder alternative to CSC165',
      'CSC258H1=Computer Organization (H1)',
      'CSC263H1=Data Structures and Analysis (H1)',
      'CSC265H1=Enriched Data Structures (H1) harder alternative to CSC263',
      'CSC304H1=Algorithmic Game Theory and Mechanism Design (H1)',
      'CSC311H1=Introduction to Machine Learning (H1)',
      'CSC316H1=Data Visualization (H1)',
      'CSC317H1=Computer Graphics (H1)',
      'CSC318H1=The Design of Interactive Computational Media (H1)',
      'CSC343H1=Introduction to Databases (H1)',
      'CSC369H1=Operating Systems (H1)',
      'CSC373H1=Algorithm Design and Analysis (H1)',
      'CSC384H1=Introduction to Artificial Intelligence (H1)',
      'CSC401H1=Natural Language Computing (H1)',
      'CSC412H1=Probabilistic Learning and Reasoning (H1)',
      'CSC413H1=Neural Networks and Deep Learning (H1)',
      'CSC420H1=Introduction to Image Understanding (H1)',
      'CSC428H1=Human-Computer Interaction (H1)',
      'CSC436H1=Numerical Algorithms (H1)',
      'CSC448H1=Formal Languages and Automata Theory (H1)',
      'CSC458H1=Computer Networks (H1)',
      'CSC463H1=Computational Complexity and Computability (H1)',
      'CSC473H1=Advanced Algorithm Design (H1)',
      'CSC485H1=Computational Linguistics (H1)',
      'CSC486H1=Knowledge Representation and Reasoning (H1)',
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
      'ECO101H1=Principles of Microeconomics (H1 Fall)',
      'ECO102H1=Principles of Macroeconomics (H1 Winter)',
      'ECO200Y1=Microeconomic Theory (Full year Y1)',
      'ECO220Y1=Introduction to Data Analysis and Applied Econometrics (Full year Y1)',
      'ECO325H1=Advanced Economic Theory (H1)',
      'ECO358H1=Financial Economics I (H1)',
      'PSY100H1=Introductory Psychology (H1)',
      'PSY201H1=Statistics for Psychologists (H1)',
      'PSY220H1=Social Psychology (H1)',
      'PSY270H1=Introduction to Cognitive Psychology (H1)',
      'SOC100H1=Introduction to Sociology (H1)',
    ].join('\n')

    const prereqList = [
      'MAT257Y1 needs MAT157Y1 and MAT247H1',
      'MAT267H1 needs MAT157Y1 and MAT240H1',
      'MAT247H1 needs MAT240H1',
      'MAT237Y1 needs MAT137Y1',
      'MAT246H1 needs MAT137Y1 and MAT223H1',
      'MAT327H1 needs MAT157Y1 OR (MAT237Y1 and MAT246H1)',
      'MAT334H1 needs MAT235Y1 or MAT237Y1 or MAT257Y1',
      'MAT337H1 needs MAT237Y1 and MAT246H1',
      'MAT347Y1 needs MAT257Y1 or MAT247H1',
      'MAT351Y1 needs MAT267H1 and MAT257Y1',
      'MAT354H1 needs MAT257Y1',
      'MAT357H1 needs MAT257Y1',
      'MAT301H1 needs MAT237Y1',
      'MAT315H1 needs MAT157Y1 OR (MAT237Y1 and MAT246H1)',
      'MAT344H1 needs MAT223H1 or MAT240H1',
      'MAT401H1 needs MAT301H1',
      'MAT415H1 needs MAT347Y1',
      'MAT417H1 needs MAT334H1 or MAT354H1',
      'MAT425H1 needs MAT327H1 and MAT257Y1',
      'MAT445H1 needs MAT347Y1',
      'MAT448H1 needs MAT347Y1',
      'MAT454H1 needs MAT354H1',
      'MAT457H1 needs MAT357H1',
      'MAT458H1 needs MAT457H1',
      'MAT363H1 needs MAT237Y1 and MAT247H1',
      'APM346H1 needs MAT237Y1 and MAT244H1',
      'APM421H1 needs MAT357H1',
      'APM446H1 needs MAT351Y1',
      'APM426H1 needs MAT363H1',
      'APM461H1 needs MAT247H1 and MAT347Y1',
      'APM462H1 needs MAT237Y1 and MAT247H1',
      'STA237H1 needs MAT137Y1 or MAT136H1 already completed',
      'STA247H1 needs MAT137Y1 or MAT136H1 already completed',
      'STA257H1 needs MAT137Y1 or MAT157Y1 already completed and CSC148H1',
      'STA238H1 needs STA237H1',
      'STA248H1 needs STA247H1',
      'STA261H1 needs STA257H1',
      'STA302H1 needs STA238H1 and MAT223H1',
      'STA303H1 needs STA302H1',
      'STA347H1 needs MAT237Y1 and STA257H1 or STA247H1',
      'STA447H1 needs STA347H1',
      'STA410H1 needs STA302H1 and CSC148H1 and MAT223H1',
      'STA314H1 needs STA302H1 and CSC148H1 and MAT237Y1 and MAT223H1',
      'STA414H1 needs STA314H1',
      'STA365H1 needs STA302H1',
      'STA437H1 needs STA302H1',
      'STA457H1 needs STA302H1',
      'STA475H1 needs STA303H1',
      'CSC148H1 needs CSC108H1 or high school programming',
      'CSC207H1 needs CSC148H1',
      'CSC209H1 needs CSC148H1',
      'CSC236H1 needs CSC148H1 and CSC165H1',
      'CSC240H1 needs CSC148H1',
      'CSC258H1 needs CSC148H1 and CSC165H1 or CSC240H1',
      'CSC263H1 needs CSC207H1 and CSC236H1',
      'CSC265H1 needs CSC240H1',
      'CSC311H1 needs CSC207H1 and MAT237Y1 and STA238H1 and MAT223H1',
      'CSC343H1 needs CSC207H1',
      'CSC369H1 needs CSC209H1 and CSC263H1',
      'CSC373H1 needs CSC263H1',
      'CSC384H1 needs CSC263H1 and MAT223H1',
      'CSC412H1 needs CSC311H1',
      'CSC413H1 needs CSC311H1',
      'CSC420H1 needs CSC263H1 and MAT223H1',
      'CSC448H1 needs CSC236H1 and CSC263H1',
      'CSC463H1 needs CSC373H1 and MAT223H1',
      'CSC473H1 needs CSC263H1',
      'CSC486H1 needs CSC384H1',
    ].join('\n')

    const futureDirectionMap: Record<string, string> = {
      'ml-ai': 'CSC263 -> CSC311 -> CSC412/CSC413/CSC486. Also needs MAT237Y1 and STA238H1.',
      'systems': 'CSC207+CSC209 -> CSC258+CSC263 -> CSC369+CSC458.',
      'theory-cs': 'CSC236/CSC240 -> CSC263/CSC265 -> CSC373+CSC463+CSC448+CSC473.',
      'vision-graphics': 'CSC263 -> CSC420+CSC317. Needs MAT237Y1 and MAT223H1.',
      'nlp': 'CSC207 -> CSC311 -> CSC401+CSC485.',
      'pure-math': 'MAT157Y1 -> MAT240+MAT247 -> MAT257Y1 -> MAT347Y1+MAT327+MAT357 -> MAT415+MAT425+MAT445+MAT448+MAT454+MAT457.',
      'analysis': 'MAT237+MAT246 -> MAT337+MAT354+MAT357 -> MAT454+MAT457+APM346.',
      'algebra': 'MAT240 -> MAT246+MAT247 -> MAT301+MAT315+MAT347Y1 -> MAT401+MAT415+MAT445+MAT448.',
      'stats-data': 'STA237+STA238 -> STA302+STA347 -> STA303+STA410+STA437+STA457. Also CSC343.',
      'quant-finance': 'STA257+STA261 -> STA347+MAT337+ECO358.',
      'bio-research': 'Upper-year BIO. STA237 for research methods.',
      'neuro': 'PSY upper-year plus BIO and STA237.',
      'physics-research': 'PHY131+132 -> PHY254+PHY256 -> PHY350+PHY354.',
      'grad-math': 'MAT157 -> MAT257+MAT240+MAT267 -> MAT347Y1+MAT327+MAT357 -> MAT415+MAT425+MAT445+MAT457+MAT458.',
      'grad-cs': 'CSC263 -> CSC311+CSC373 -> CSC412+CSC413+CSC494.',
      'industry-swe': 'CSC207+CSC209 -> CSC263+CSC343 -> CSC369.',
      'other': 'Balanced breadth.',
    }
    const futureDirectionContext = futureDirection ? 'FUTURE DIRECTION: ' + futureDirection + ' — ' + (futureDirectionMap[futureDirection] || '') : ''

    const systemPrompt = [
      'You are an expert UofT academic advisor. Build personalized course plans.',
      '',
      'HARD RULES (code will enforce these anyway, but follow them):',
      '1. Y1 courses cover full year. Put in Fall JSON only. Never repeat in Winter.',
      '2. CALCULUS: Pick exactly one path — MAT137Y1 alone, OR MAT157Y1 alone, OR MAT135H1(Fall)+MAT136H1(Winter). Never mix.',
      '3. MAT137Y1 and MAT157Y1 are mutually exclusive. MAT135H1 and MAT136H1 cannot appear with MAT137Y1 or MAT157Y1.',
      '4. STA237H1/STA247H1 need MAT137Y1 already completed. STA257H1 needs MAT137Y1/MAT157Y1 already completed.',
      '5. CSC110Y1 and CSC111H1 are ONLY for CS stream first-year students.',
      '6. Never include courses already in the completed list.',
      '7. Check all prerequisites before including any course.',
      '',
      'AMBITION RULES:',
      '- selfAssessment=strong means BE VERY AMBITIOUS. Include 400-level courses if prereqs allow.',
      '- For third/fourth year strong students: MAT415, MAT425, MAT445, MAT448, MAT454, MAT457, MAT458 are all fair game.',
      '- Do not be conservative. If prereqs are met and student is strong, push hard.',
      '- Third/fourth year has NO fixed requirements. Only prereqs matter.',
      '',
      'SEMESTER COUNT:',
      '- First year: 2 semesters. 8-10 courses total.',
      '- Second year: 2 semesters. 8-10 courses total.',
      '- Third/fourth year: MUST generate 4 semesters: Third Year Fall, Third Year Winter, Fourth Year Fall, Fourth Year Winter. 14-20 courses total.',
      '',
      'PERSONALIZATION:',
      '- Short answer overrides everything. Read it carefully.',
      '- For third/fourth year: templates are suggestions only. Follow student interests and completed courses.',
      '- Include cross-disciplinary courses when student shows interest.',
      '',
      'ONLY USE COURSES FROM THIS LIST:',
      courseList,
      '',
      'PREREQUISITES:',
      prereqList,
    ].join('\n')

    const firstYearTemplates = [
      'FIRST YEAR TEMPLATES:',
      '',
      'CS in-stream:',
      'Fall: CSC110Y1 + MAT137Y1 or MAT157Y1 + MAT223H1 or MAT240H1 + ECO101H1',
      'Winter: CSC111H1 + MAT137Y1 or MAT157Y1 continues + MAT224H1 or MAT247H1 + STA130H1 + ECO102H1',
      '',
      'CS out-of-stream standard:',
      'Fall: MAT137Y1 + CSC148H1 + CSC165H1 + ECO101H1',
      'Winter: MAT137Y1 continues + MAT223H1 + STA130H1 + ECO102H1 + PSY100H1',
      '',
      'CS out-of-stream ambitious (wants challenge/157 in short answer):',
      'Fall: MAT157Y1 + CSC148H1 + CSC165H1 or CSC240H1 + ECO101H1',
      'Winter: MAT157Y1 continues + MAT223H1 or MAT240H1 + STA130H1 + ECO102H1',
      '',
      'CS out-of-stream very confident (explicit accelerate in short answer):',
      'Fall: MAT157Y1 + MAT240H1 + CSC148H1 + ECO101H1',
      'Winter: MAT157Y1 continues + MAT247H1 + CSC240H1 + CSC207H1 + ECO102H1',
      '',
      'Math Specialist:',
      'Fall: MAT157Y1 + MAT240H1 + CSC108H1 + PHY131H1 or PHY151H1',
      'Winter: MAT157Y1 continues + MAT247H1 + CSC148H1 + STA130H1 + PHY132H1 or PHY152H1',
      '',
      'Math Major:',
      'Fall: MAT137Y1 + MAT223H1 + CSC108H1 + ECO101H1',
      'Winter: MAT137Y1 continues + MAT224H1 + STA130H1 + CSC148H1 + ECO102H1',
      '',
      'Life Sciences:',
      'Fall: MAT135H1 + BIO120H1 + CHM135H1 + PSY100H1',
      'Winter: MAT136H1 + BIO130H1 + CHM136H1 + SOC100H1',
      '',
      'Physics:',
      'Fall: MAT157Y1 + PHY151H1 + MAT223H1 + ECO101H1',
      'Winter: MAT157Y1 continues + PHY152H1 + MAT240H1 + ECO102H1',
      '',
      'Stats/Data Science:',
      'Fall: MAT137Y1 + MAT223H1 + CSC148H1 + ECO101H1',
      'Winter: MAT137Y1 continues + STA130H1 + CSC165H1 + ECO102H1',
    ].join('\n')

    const secondYearTemplates = [
      'SECOND YEAR TEMPLATES (adjust heavily based on completed courses):',
      '',
      'CS with CSC148+CSC165 completed:',
      'Fall: CSC207H1 + CSC209H1 + CSC236H1 + MAT237Y1',
      'Winter: MAT237Y1 continues + CSC258H1 + CSC263H1 + STA237H1 (only if MAT137 completed) + MAT223H1',
      '',
      'CS very strong with MAT157 completed:',
      'Fall: CSC207H1 + CSC209H1 + CSC236H1 or CSC240H1 + MAT257Y1',
      'Winter: MAT257Y1 continues + CSC258H1 + CSC265H1 + STA257H1 or STA238H1 + MAT223H1',
      '',
      'Math Specialist with MAT157 completed:',
      'Fall: MAT257Y1 + MAT267H1 + STA257H1 + CSC207H1 or MAT327H1',
      'Winter: MAT257Y1 continues + MAT247H1 + MAT246H1 + STA261H1 + MAT315H1',
      '',
      'Math Major with MAT137 completed:',
      'Fall: MAT237Y1 + MAT240H1 + MAT246H1 + ECO101H1',
      'Winter: MAT237Y1 continues + MAT247H1 + STA237H1 + MAT223H1 + ECO102H1',
      '',
      'Stats with MAT137 completed:',
      'Fall: MAT237Y1 + STA237H1 + CSC148H1 + ECO101H1',
      'Winter: MAT237Y1 continues + STA238H1 + MAT223H1 + CSC165H1 + ECO102H1',
    ].join('\n')

    const thirdYearTemplates = [
      'THIRD/FOURTH YEAR: No fixed requirements. Be creative and personalized.',
      'Must generate 4 semesters: Third Year Fall, Third Year Winter, Fourth Year Fall, Fourth Year Winter.',
      'Only constraint: prerequisites must be met.',
      'For STRONG students: include 400-level courses freely if prereqs met.',
      '',
      'Reference paths (adjust based on completed courses and short answer):',
      '',
      'CS ML path:',
      'Y3F: CSC311H1 + CSC369H1 + CSC343H1 + CSC373H1',
      'Y3W: CSC412H1 + CSC413H1 + STA302H1 + CSC384H1',
      'Y4F: CSC486H1 + STA347H1 + STA314H1 + CSC494H1',
      'Y4W: STA414H1 + CSC420H1 + MAT337H1 + elective',
      '',
      'CS Theory path:',
      'Y3F: CSC373H1 + CSC448H1 + CSC463H1 + MAT337H1',
      'Y3W: CSC473H1 + MAT344H1 + STA347H1 + CSC384H1',
      'Y4F: CSC494H1 + MAT315H1 + MAT401H1 + elective',
      'Y4W: APM461H1 + MAT309H1 + elective + elective',
      '',
      'Math Specialist grad-prep (has MAT257+MAT247+MAT327):',
      'Y3F: MAT347Y1 + MAT337H1 + MAT354H1 + STA347H1',
      'Y3W: MAT347Y1 continues + MAT357H1 + MAT315H1 + MAT301H1',
      'Y4F: MAT457H1 + MAT445H1 + MAT415H1 + MAT425H1',
      'Y4W: MAT458H1 + MAT448H1 + MAT417H1 + MAT475H1',
      '',
      'Math analysis path (has MAT237+MAT246):',
      'Y3F: MAT337H1 + MAT354H1 + MAT301H1 + STA347H1',
      'Y3W: MAT357H1 + MAT334H1 + MAT344H1 + STA302H1',
      'Y4F: MAT457H1 + MAT454H1 + APM346H1 + MAT315H1',
      'Y4W: MAT458H1 + APM446H1 + MAT401H1 + elective',
      '',
      'Stats upper year:',
      'Y3F: STA302H1 + STA347H1 + CSC343H1 + MAT337H1',
      'Y3W: STA303H1 + STA410H1 + STA437H1 + MAT334H1',
      'Y4F: STA447H1 + STA314H1 + STA457H1 + ECO358H1',
      'Y4W: STA414H1 + STA365H1 + STA475H1 + elective',
    ].join('\n')

    const templates = yearType === 'first' ? firstYearTemplates : yearType === 'second' ? secondYearTemplates : thirdYearTemplates

    const semesterJsonTemplate = yearType === 'third+'
      ? [
          '    { "semester": "' + targetFall + '", "courses": [] },',
          '    { "semester": "' + targetWinter + '", "courses": [] },',
          '    { "semester": "' + targetFall2 + '", "courses": [] },',
          '    { "semester": "' + targetWinter2 + '", "courses": [] }',
        ].join('\n')
      : [
          '    { "semester": "' + targetFall + '", "courses": [] },',
          '    { "semester": "' + targetWinter + '", "courses": [] }',
        ].join('\n')

    const userPrompt = [
      'Build a complete course plan for ' + profile.name + '.',
      '',
      'PROFILE:',
      '- Program: ' + program + ' (' + (isSpecialist ? 'Specialist' : 'Major or Minor') + ')',
      '- Is Math Specialist: ' + isMathSpecialist,
      '- Is CS Specialist: ' + isCSSpecialist,
      '- Year: ' + yearLabel,
      '- Completed: ' + JSON.stringify(completed),
      '- Goals: ' + goals,
      '- Learning style: ' + learningStyle,
      '- Study hours: ' + studyHours,
      '- Interests: ' + JSON.stringify(interests),
      '',
      'STUDENT IN THEIR OWN WORDS (most important — override templates with this):',
      '"' + shortAnswer + '"',
      '',
      'SELF-ASSESSMENT: ' + selfAssessmentContext,
      '',
      futureDirectionContext,
      '',
      'COMPUTED FLAGS:',
      '- Has MAT157: ' + hasMat157 + ' | Has MAT137: ' + hasMat137 + ' | Has MAT135 only: ' + (hasMat135 && !hasMat137 && !hasMat157),
      '- Has MAT237: ' + hasMat237 + ' | Has MAT257: ' + hasMat257 + ' | Has MAT240: ' + hasMat240 + ' | Has MAT246: ' + hasMat246 + ' | Has MAT247: ' + hasMat247,
      '- Has MAT327: ' + hasMat327 + ' | Has MAT337: ' + hasMat337 + ' | Has MAT347: ' + hasMat347 + ' | Has MAT357: ' + hasMat357,
      '- Has CSC148: ' + hasCSC148 + ' | Has CSC165: ' + hasCSC165 + ' | Has CSC207: ' + hasCSC207 + ' | Has CSC209: ' + hasCSC209,
      '- Has CSC236: ' + hasCSC236 + ' | Has CSC258: ' + hasCSC258 + ' | Has CSC263: ' + hasCSC263 + ' | Has CSC311: ' + hasCSC311,
      '- Has STA237: ' + hasSTA237 + ' | Has STA238: ' + hasSTA238 + ' | Has STA257: ' + hasSTA257 + ' | Has STA302: ' + hasSTA302,
      '- Wants MAT157: ' + wantsMat157 + ' | Wants minimal math: ' + wantsMinimalMath,
      '- Wants CSC207 early: ' + wantsCSC207Early + ' | Wants CSC240: ' + wantsCSC240,
      '- Very confident: ' + isVeryConfident + ' | Grad school: ' + isGradSchool + ' | High capacity: ' + isHighCapacity,
      '- Math: ' + isMath + ' | CS: ' + isCS + ' | Stats: ' + isStats + ' | Physics: ' + isPhysics + ' | LifeSci: ' + isLifeSci + ' | Econ: ' + isEcon,
      '',
      templates,
      '',
      yearType === 'third+' ? 'IMPORTANT: You MUST return exactly 4 semesters: Third Year Fall, Third Year Winter, Fourth Year Fall, Fourth Year Winter. Each with 3-5 courses.' : 'Return exactly 2 semesters.',
      '',
      'Return ONLY this JSON:',
      '{',
      '  "message": "2-3 sentences to ' + profile.name + ' referencing their own words and explaining key decisions",',
      '  "courseSchedule": [',
      semesterJsonTemplate,
      '  ],',
      '  "degreeProgress": {',
      '    "completedCredits": ' + String(completed.length * 0.5) + ',',
      '    "requiredCredits": 20,',
      '    "remainingRequired": ["key remaining course codes"],',
      '    "nextMilestone": "concrete next milestone"',
      '  },',
      '  "advisorNote": "One honest paragraph explaining the philosophy of this plan"',
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

      type CourseItem = { code: string; name: string; reason: string; type: string; workload: number; coreTopics: string[]; whyNow: string }
      type SemItem = { semester: string; courses: CourseItem[] }

      // Step 1: filter completed courses
      const step1 = (parsed.courseSchedule || []).map((sem: SemItem) => ({
        ...sem,
        courses: sem.courses.filter(
          (c: CourseItem) => !completedSet.has(c.code.toUpperCase().replace(/\s/g, ''))
        ),
      }))

      // Step 2: find Y1 courses across entire plan
      const allCodes = step1.flatMap((s: SemItem) => s.courses.map((c: CourseItem) => c.code.toUpperCase().replace(/\s/g, '')))
      const planHasMat137 = allCodes.includes('MAT137Y1') || completedSet.has('MAT137Y1') || completedSet.has('MAT137')
      const planHasMat157 = allCodes.includes('MAT157Y1') || completedSet.has('MAT157Y1') || completedSet.has('MAT157')

      const mustRemove = new Set<string>()
      if (planHasMat137 || planHasMat157) {
        mustRemove.add('MAT135H1')
        mustRemove.add('MAT136H1')
      }
      if (planHasMat137) mustRemove.add('MAT157Y1')
      if (planHasMat157) mustRemove.add('MAT137Y1')

      // Step 3: remove mutual exclusions and deduplicate Y1 across semesters
      const seenY1 = new Set<string>()
      const step3 = step1.map((sem: SemItem) => ({
        ...sem,
        courses: sem.courses.filter((c: CourseItem) => {
          const code = c.code.toUpperCase().replace(/\s/g, '')
          if (mustRemove.has(code)) return false
          if (code.endsWith('Y1')) {
            if (seenY1.has(code)) return false
            seenY1.add(code)
          }
          return true
        }),
      })).filter((sem: SemItem) => sem.courses.length > 0)

      // Step 4: add Y1 courses to Winter semesters for display
      const fallSems = step3.filter((s: SemItem) => s.semester.toLowerCase().includes('fall'))
      const finalSchedule = step3.map((sem: SemItem) => {
        if (!sem.semester.toLowerCase().includes('winter')) return sem
        // find the closest preceding fall
        const fallIdx = fallSems.findIndex((_: SemItem, i: number) =>
          i === fallSems.length - 1 || fallSems[i + 1].semester > sem.semester
        )
        const fallSem = fallSems[fallIdx >= 0 ? fallIdx : 0]
        if (!fallSem) return sem
        const y1s = fallSem.courses
          .filter((c: CourseItem) => c.code.toUpperCase().endsWith('Y1'))
          .map((c: CourseItem) => ({ ...c, whyNow: 'Full year course continuing from Fall.' }))
        const already = sem.courses.some((c: CourseItem) => y1s.some((y: CourseItem) => y.code === c.code))
        if (already) return sem
        return { ...sem, courses: [...y1s, ...sem.courses] }
      })

      return NextResponse.json({
        message: parsed.message || '',
        courseSchedule: finalSchedule,
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
