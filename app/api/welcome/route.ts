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

    // Detect ambition signals from short answer
    const shortLower = shortAnswer.toLowerCase()
    const wantsMat157 = shortLower.includes('157') || shortLower.includes('challenge') || shortLower.includes('ambitious') || shortLower.includes('push myself') || shortLower.includes('hardest')
    const wantsMinimalMath = shortLower.includes('minimize math') || shortLower.includes('just need to pass') || shortLower.includes('not interested in math') || shortLower.includes('hate math') || shortLower.includes('math is secondary')
    const wantsAccelerate = shortLower.includes('accelerate') || shortLower.includes('ahead of schedule') || shortLower.includes('fast') || shortLower.includes('as many as possible')
    const wantsCSC207Early = shortLower.includes('csc207') || shortLower.includes('software design') || wantsAccelerate
    const wantsCSC240 = shortLower.includes('csc240') || shortLower.includes('discrete') || (isCS && selfAssessment === 'strong' && isGradSchool)
    const isVeryConfident = selfAssessment === 'strong' && (isHighCapacity || isGradSchool)

    const selfAssessmentContext = selfAssessment === 'shaky'
  ? yearType === 'first'
    ? 'SHAKY FIRST YEAR: Student has low confidence. Prefer MAT135H1+MAT136H1 over MAT137Y1 unless they specifically say they want proofs. Do not push hard courses.'
    : 'SHAKY UPPER YEAR: Student struggled but is already in their program. Do NOT send them back to first year courses. Lighter load max 4 courses per semester, avoid stacking multiple very hard courses, if missing a prerequisite from their own year level include it but never go below their current year, prioritize courses with better professor support.'
  : selfAssessment === 'strong'
    ? yearType === 'first'
      ? 'STRONG FIRST YEAR: Student excelled and wants to be challenged. Read their short answer carefully to decide how ambitious to be. Possible harder alternatives depending on their program and what they say: MAT157Y1 instead of MAT137Y1 for math-heavy students, MAT240H1 in Fall alongside MAT157Y1 for very ambitious math students, MAT247H1 in Winter for exceptionally strong math students, CSC240H1 instead of CSC165H1 for theory-focused CS students, PHY151H1+PHY152H1 instead of PHY131+PHY132 for physics students, CHM151Y1 instead of CHM135+CHM136 for chemistry students. These can overlap — a student can be strong in both math and CS simultaneously. Do NOT mechanically apply all of these. Use the short answer to judge which ones actually apply to this student and how many they can realistically handle.'
      : yearType === 'second'
        ? 'STRONG SECOND YEAR: Student excelled in first year and wants acceleration. Read their short answer to calibrate. Can handle more courses per semester and harder combinations. For example a strong math student can take MAT257Y1+MAT327H1+MAT267H1 in the same year. A strong CS student can push CSC265H1 in second year. Let the short answer guide how aggressive to be.'
        : 'STRONG THIRD/FOURTH YEAR: Student excelled and wants advanced material. Can include 400-level courses if prereqs met. Can handle 5 courses per semester. Read their short answer to understand their specific direction and ambition level.'
    : 'SOLID: Standard progression for their year level.'
     
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
      'MAT315H1=Introduction to Number Theory (H1)',
      'MAT309H1=Introduction to Mathematical Logics (H1)',
      'MAT332H1=Introduction to Graph Theory (H1)',
      'MAT327H1=Introduction to Topology (H1)',
      'MAT334H1=Complex Variables (H1)',
      'MAT335H1=Chaos, Factals and Dynamics (H1)',
      'MAT337H1=Introduction to Real Analysis (H1)',
      'MAT344H1=Introduction to Combinatorics (H1)',
      'MAT347Y1=Groups Rings and Fields (Full year Y1 starts Fall)',
      'MAT351Y1=Partial Differential Equations (Full year Y1 starts Fall)',
      'MAT354H1=Complex Analysis I (H1)',
      'MAT357H1=Foundations of Real Analysis (H1)',
      'MAT363H1=Introduction to Differential Geometry (H1)',
      'MAT401H1=Polynomial Equations and Fields (H1)',
      'MAT402H1=Classical Geometry I (H1)',
      'MAT403H1=Classical Geometry II (H1)',
      'MAT409H1=Set Theory (H1)',
      'MAT415H1=Algebraic Number Theory (H1)',
      'MAT417H1=Analytic Number Theory (H1)',
      'MAT425H1=Differential Topology (H1)',
      'MAT436H1=Introduction to Linear Operators (H1)',
      'MAT437H1=K-Theory and C*-Algebras (H1)',
      'MAT445H1=Representation Theory (H1)',
      'MAT448H1=Introduction to Commutative Algebra and Algebraic Geometry (H1)',
      'MAT454H1=Complex Analysis II (H1)',
      'MAT457H1=Advanced Real Analysis I (H1)',
      'MAT458H1=Advanced Real Analysis II (H1)',
      'MAT475H1=Problem Solving Seminar I (H1)',
      'APM421H1=Mathematical Foundations of Quantum Mechanics and Quantum Information Theory (H1)',
      'APM346H1=Partial Differential Equations (H1)',
      'APM446H1=Applied Nonlinear Equations (H1)',
      'APM426H1=General Relativity (H1)',
      'APM461H1=Combinatorial Methods (H1)',
      'APM462H1=Nonlinear Optimization (H1)',
      'STA130H1=Introduction to Statistical Reasoning and Data Science (H1)',
      'STA237H1=Probability Statistics and Data Analysis I (H1) needs MAT137 completed',
      'STA238H1=Probability Statistics and Data Analysis II (H1)',
      'STA247H1=Probability with Computer Applications (H1)',
      'STA248H1=Statistics for Computer Scientists (H1)',
      'STA257H1=Probability and Statistics I (H1) needs MAT137 completed',
      'STA261H1=Probability and Statistics II (H1)',
      'STA302H1=Methods of Data Analysis I (H1)',
      'STA303H1=Methods of Data Analysis II (H1)',
      'STA365H1=Applied Bayesian Statistics (H1)',
      'STA347H1=Probability (H1)',
      'STA447H1=Stochastic Processes (H1)',
      'STA410H1=Statistical Computation (H1)',
      'STA314H1=Statistical Methods for Machine Learning I (H1)',
      'STA414H1=Statistical Methods for Machine Learning II (H1)',
      'STA437H1=Methods for Multivariate Data (H1)',
      'STA465H1=Spatial Data Analysis (H1)',
      'STA475H1=Survival Analysis (H1)',
      'STA457H1=Time Series Analysis (H1)',
      'CSC108H1=Introduction to Computer Programming (H1)',
      'CSC110Y1=Foundations of Computer Science I (ONLY FOR FIRST YEAR COMPUTER SCIENCE STUDENTS, Full year Y1 but Fall only)',
      'CSC111H1=Foundations of Computer Science II (ONLY FOR FIRST YEAR COMPUTER SCIENCE STUDENTS, H1 winter only)',
      'CSC148H1=Introduction to Computer Science (H1)',
      'CSC165H1=Mathematical Expression and Reasoning for Computer Science (H1)',
      'CSC207H1=Software Design (H1) needs CSC148',
      'CSC209H1=Software Tools and Systems Programming (H1) needs CSC148',
      'CSC236H1=Introduction to the Theory of Computation (H1) needs CSC148+CSC165',
      'CSC240H1=Discrete Mathematics for CS (H1) harder alternative to CSC165 needs CSC148',
      'CSC258H1=Computer Organization (H1) needs CSC148+CSC165',
      'CSC263H1=Data Structures and Analysis (H1) needs CSC207+CSC236',
      'CSC265H1=Enriched Data Structures (H1) needs CSC240+MAT157 (but MAT157 can usually be waived)',
      'CSC311H1=Introduction to Machine Learning (H1) needs CSC207+MAT237+STA238',
      'CSC304H1=Algorithmic Game Theory and Mechanism Design (H1)',
      'CSC316H1=Data Visualization (H1)',
      'CSC318H1=The Design of Interactive Computational Media (H1)',
      'CSC343H1=Introduction to Databases (H1) needs CSC207',
      'CSC369H1=Operating Systems (H1) needs CSC209+CSC263',
      'CSC373H1=Algorithm Design and Analysis (H1) needs CSC263',
      'CSC384H1=Introduction to Artificial Intelligence (H1) needs CSC263+MAT223',
      'CSC401H1=Natural Language Computing (H1) needs CSC207',
      'CSC412H1=Probabilistic Learning and Reasoning (H1) needs CSC311',
      'CSC413H1=Neural Networks and Deep Learning (H1) needs CSC311',
      'CSC428H1=Human-Computer Interactions (H1)',
      'CSC317H1=Computer Graphics (H1) needs CSC209+MAT237+MAT223',
      'CSC420H1=Introduction to Image Understanding (H1) needs CSC263+MAT223',
      'CSC448H1=Formal Languages and Automata Theory (H1) needs CSC236+MAT223',
      'CSC458H1=Computer Networks (H1)',
      'CSC436H1=Numerical Algorithms (H1)',
      'CSC463H1=Computational Complexity and Computability (H1) needs CSC236+MAT223',
      'CSC473H1=Advanced Algorithm Design (H1) needs CSC263',
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
      'ECO101H1=Principles of Microeconomics (H1 typically Fall)',
      'ECO102H1=Principles of Macroeconomics (H1 typically Winter)',
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
      'MAT257Y1 needs MAT157Y1 and MAT247H1',
      'MAT267H1 needs MAT157Y1 and MAT240H1',
      'MAT247H1 needs MAT240H1',
      'MAT237Y1 needs MAT137Y1',
      'MAT246H1 needs MAT137Y1 and MAT223H1',
      'MAT327H1 needs MAT157Y1 or (MAT237Y1 and MAT246H1)',
      'MAT334H1 needs MAT235Y1 or MAT237Y1 or MAT257Y1',
      'MAT347Y1 needs MAT257Y1 or MAT247H1(85%)',
      'MAT337H1 needs MAT237Y1 and MAT246H1',
      'MAT351Y1 needs (MAT267H1 and MAT257Y1) or (MAT327H1 and MAT244H1 and MAT237Y1(85%))',
      'MAT354H1 needs MAT257Y1 or (MAT327H1 and MAT237Y1(85%))',
      'MAT357H1 needs MAT257Y1 or (MAT327H1 and MAT237Y1(85%))',
      'MAT301H1 needs MAT235Y1 or MAT237Y1',
      'MAT309H1 needs MAT257Y1 or ((MAT235Y1 or MAT237Y1) and (MAT223H1 and MAT240H1) and (MAT157Y1 or MAT246H1 or CSC236H1 or CSC240H1))',
      'MAT315H1 needs MAT157Y1 or (MAT237Y1 and MAT246H1)',
      'MAT415H1 needs MAT347Y1',
      'MAT417H1 needs MAT334H1 or MAT354H1',
      'MAT425H1 needs MAT327H1 and MAT257Y1',
      'MAT344H1 needs MAT223H1 or MAT240H1',
      'MAT332H1 needs MAT224H1 or MAT247H1',
      'MAT335H1 needs MAT137Y1 or MAT157Y1 or MAT235H1',
      'MAT409H1 needs MAT357H1',
      'MAT363H1 needs (MAT237Y1 and MAT224H1/MAT247H1) or (MAT257Y1 and MAT247H1)',
      'MAT367H1 needs (MAT237Y1 and MAT246H1 and MAT224H1) or MAT257Y1',
      'MAT377H1 needs MAT257Y1 or (MAT327H1 and MAT237Y1(85%))',
      'MAT370H1 needs (MAT235Y1 or MAT237Y1) and MAT224H1 and MAT246H1',
      'MAT401H1 needs MAT301H1',
      'MAT402H1 needs (MAT224H1 or MAT247H1) and (MAT235Y1 or MAT237Y1 or MAT257Y1)',
      'MAT403H1 needs MAT402H1',
      'MAT445H1 needs MAT347Y1',
      'MAT436H1 needs (MAT224H1 or MAT247H1) and (MAT237Y1 or MAT257Y1)',
      'MAT437H1 needs (MAT224H1 or MAT247H1) and (MAT237Y1 or MAT257Y1)',
      'MAT448H1 needs MAT347Y1',
      'MAT454H1 needs MAT354H1',
      'MAT457H1 needs MAT357H1',
      'MAT458H1 needs MAT457H1',
      'MAT475H1 needs (MAT224H1 or MAT247H1) and (MAT235Y1 or MAT237Y1 or MAT257Y1)',
      'APM346H1 needs (MAT235Y1 or MAT237Y1 or MAT257Y1) and (MAT244H1 or MAT267H1)',
      'APM348H1 needs (MAT235Y1 or MAT237Y1 or MAT257Y1) and (MAT244H1 or MAT267H1) and (MAT223H1 or MAT240H1)',
      'APM421H1 needs MAT357H1 or (MAT337H1 and (MAT224H1 or MAT247H1)',
      'APM446H1 needs MAT351Y1 or APM346H1',
      'APM426H1 needs MAT363H1 or MAT367H1',
      'APM461H1 needs (MAT224H1 or MAT247H1) and (MAT137Y1 or MAT157Y1) and (MAT301H1 or MAT347Y1)',
      'APM462H1 needs (MAT235Y1 or MAT237Y1 or MAT257Y1) and (MAT224H1 or MAT247H1)',
      'STA237H1 needs (MAT136H1 or MAT137Y1) and STA130H1',
      'STA247H1 needs (MAT136H1 or MAT137Y1) and STA130H1',
      'STA257H1 needs (MAT137Y1 or MAT157Y1) and STA130H1 and (CSC111H1 or CSC148H1)',
      'STA261H1 needs STA257H1',
      'STA238H1 needs STA237H1',
      'STA248H1 needs STA247H1',
      'STA302H1 needs STA238H1 and MAT223H1',
      'STA303H1 needs STA302H1',
      'STA347H1 needs MAT237Y1 and (STA257H1 or STA247H1(67%))',
      'STA447H1 needs STA347H1',
      'STA437H1 needs STA302H1',
      'STA457H1 needs STA302H1',
      'STA475H1 needs STA303H1',
      'STA465H1 needs STA302H1 and STA303H1',
      'STA410H1 needs STA302H1 and (CSC110Y1 or CSC148H1) and (MAT223H1 or MAT224H1 or MAT240H1)',
      'STA414H1 needs STA314H1',
      'STA365H1 needs STA302H1',
      'STA314H1 needs STA302H1 and (CSC148H1 or CSC108H1) and (MAT235Y1 or MAT237Y1 or MAT257Y1) and (MAT223H1 or MAT240H1)',
      'CSC148H1 needs CSC108H1 or high school programming',
      'CSC207H1 needs CSC148H1',
      'CSC209H1 needs CSC148H1',
      'CSC236H1 needs CSC148H1 and CSC165H1',
      'CSC240H1 needs CSC148H1 — harder alternative to CSC165',
      'CSC258H1 needs CSC148H1 and CSC165H1 or CSC240H1',
      'CSC263H1 needs CSC207H1 and CSC236H1 or CSC240H1',
      'CSC265H1 needs CSC240H1 and MAT157Y1 (but MAY157Y1 can be waived sometimes)',
      'CSC311H1 needs CSC207H1 and (MAT235Y1 or MAT237Y1 or MAT257Y1 or MAT157Y1(67%) or MAT137Y1(73%) or (MAT135H1(77%) and MAT136H1(77%)) and (STA257H1 or STA247H1 or STA237H1) and (MAT223H1 or MAT240H1)',
      'CSC343H1 needs CSC207H1',
      'CSC304H1 needs (MAT136H1 or MAT137Y1 or MAT157Y1) and (STA237H1 or STA247H1 or STA157H1)',
      'CSC317H1 needs CSC209H1 and (MAT235Y1 or MAT237Y1 or MAT257Y1) and (MAT223H1 or MAT240H1)',
      'CSC369H1 needs CSC209H1 and CSC263H1',
      'CSC316H1 needs CSC207H1',
      'CSC318H1 needs any 0.5 CSC credit (1 CSC course)',
      'CSC336H1 needs CSC148H1 and (MAT223H1 or MAT240H1) and (MAT135H1 or MAT137Y1 or MAT157Y1)',
      'CSC428H1 needs CSC318H1 and CSC207H1 and (STA237H1 or STA247H1 or STA257H1)',
      'CSC373H1 needs CSC263H1',
      'CSC458H1 needs CSC258H1 and CSC209H1 and CSC263H1',
      'CSC384H1 needs CSC263H1 and (MAT223H1 or MAT240H1)',
      'CSC412H1 needs CSC311H1',
      'CSC413H1 needs CSC311H1',
      'CSC417H1 needs CSC209H1 and (MAT235Y1 or MAT237Y1 or MAT257Y1) and (MAT223H1 or MAT240H1)',
      'CSC420H1 needs CSC320H1 and CSC263H1 and MAT223H1',
      'CSC448H1 needs CSC236H1 and CSC263H1',
      'CSC436H1 needs CSC336H1',
      'CSC463H1 needs CSC373H1 and MAT223H1',
      'CSC485H1 needs CSC209H1 and (STA237H1 or STA247H1 or STA257H1)',
      'CSC486H1 needs CSC384H1',
      'CSC469H1 needs CSC369H1',
    ].join('\n')

    const futureDirectionMap: Record<string, string> = {
      'ml-ai': 'Need: CSC148+CSC165 -> CSC207+CSC236 -> CSC263 -> CSC311 -> CSC412/CSC413/CSC486.',
      'systems': 'Need: CSC148+CSC165 -> CSC207+CSC209 -> CSC258+CSC263 -> CSC369+CSC458.',
      'theory-cs': 'Need: CSC148+CSC165/CSC240 -> CSC236 -> CSC263 -> CSC373+CSC463+CSC448. CSC240 recommended over CSC165 for theory track.',
      'vision-graphics': 'Need: CSC263 -> CSC320 -> CSC420+CSC317. Also needs MAT237Y1 and MAT223H1.',
      'nlp': 'Need: CSC207 -> CSC401+CSC485+CSC311.',
      'pure-math': 'Need: MAT157Y1 -> MAT240H1+MAT247H1 -> MAT257Y1 -> MAT347Y1+MAT327H1+MAT357H1+MAT351Y1+MAT354H1 -> MAT4XXH1.',
      'analysis': 'Need: MAT137/157 -> MAT237Y1+MAT246H1 -> MAT337H1+MAT354H1+MAT357H1 -> MAT454H1+MAT457H1.',
      'algebra': 'Need: MAT137/157 -> MAT240H1 -> MAT246H1+MAT247H1 -> MAT301H1+MAT315H1+MAT347Y1.',
      'stats-data': 'Need: MAT137 -> STA237H1+STA238H1 -> STA302H1+STA347H1. Also CSC343H1.',
      'quant-finance': 'Need: MAT137 -> STA257H1+STA261H1 -> STA347H1+MAT337H1+ECO358H1.',
      'bio-research': 'Need upper-year BIO courses. STA237H1 important for research methods.',
      'neuro': 'Need PSY upper-year plus BIO and STA237H1 for research methods.',
      'physics-research': 'Need PHY131+PHY132 -> PHY254H1+PHY256H1 -> PHY350H1+PHY354H1.',
      'grad-math': 'Push hardest: MAT157Y1 -> MAT257Y1+MAT240H1+MAT267H1 -> MAT347Y1+MAT327H1+MAT357H1.',
      'grad-cs': 'Push toward research: CSC263 -> CSC311+CSC373 -> CSC412+CSC413+CSC494H1.',
      'industry-swe': 'Practical: CSC148+CSC165 -> CSC207+CSC209 -> CSC263+CSC343H1 -> CSC369H1.',
      'other': 'Balanced breadth.',
    }
    const futureDirectionContext = futureDirection ? 'FUTURE DIRECTION: ' + futureDirection + '\n' + (futureDirectionMap[futureDirection] || '') : ''

    const systemPrompt = [
      'You are an expert UofT academic advisor. Build precise Fall + Winter course plans.',
      '',
      'ABSOLUTE RULES — never violate:',
      '1. Y1 courses run full year. Place in Fall JSON only. Do NOT repeat in Winter.',
      '2. MAT137Y1 and MAT157Y1 are mutually exclusive. Never both in same plan.',
      '3. MAT135H1 is Fall only. MAT136H1 is Winter only.',
      '4. CSC110Y1 is full year, Fall only start. Alternative to CSC148+CSC165.',
      '5. STA237H1 and STA257H1 need MAT137Y1 ALREADY COMPLETED — not currently taking.',
      '   If student is taking MAT137Y1 this year, they CANNOT take STA237 in same plan.',
      '6. TOTAL COURSES: 8-12 across both semesters. Never fewer than 8. Distribute 4-6 per semester.',
      '7. Y1 course = 2 H1 slots of workload. With one Y1, add 3-4 H1 courses to that semester.',
      '8. MANDATORY BREADTH: Every plan needs at least 1-2 courses outside main department.',
      '   Use ECO101H1, ECO102H1, SOC100H1, PSY100H1, PHY131H1, PHY132H1 as breadth options.',
      '',
      'CSC207H1 IN FIRST YEAR RULE:',
      'CSC207H1 requires CSC148H1 as prerequisite.',
      'In a first year plan, CSC207H1 is ONLY allowed in Winter if:',
      '  (a) CSC148H1 is in Fall of the same plan AND student explicitly wants to accelerate, OR',
      '  (b) Student said in short answer they want CSC207 specifically or mentioned accelerating',
      'Do NOT add CSC207H1 to a standard first year plan.',
      '',
      'CSC240H1 RULE:',
      'CSC240H1 is a harder alternative to CSC165H1 for theory-focused CS students.',
      'Use CSC240H1 instead of CSC165H1 ONLY if:',
      '  (a) Student is CS Specialist or theory-cs direction AND selfAssessment=strong AND isGradSchool, OR',
      '  (b) Student explicitly mentions CSC240 or discrete math in short answer',
      'Otherwise always use CSC165H1.',
      '',
      'TEMPLATE FLEXIBILITY RULES:',
      '- First year: templates are mostly fixed (these are standard required sequences). Follow closely.',
      '- Second year: templates are guidelines. Adjust based on student short answer and flags.',
      '- Third/Fourth year: templates are starting points only. The student short answer and futureDirection are the primary guide. If student mentions specific courses they want, include them if prereqs are met. Be creative and personalized.',
      '- For all years: NEVER violate prerequisites. Check every course against the prereq list before including.',
      '- If student mentions a course explicitly: include it if prereqs allow, explain why in the reason field.',
      '',
      'PHYSICS SPECIALIST RULE: PHY151H1 is Fall, PHY152H1 is Winter. Both must appear for students who wants the physics specialist or graduate studies in physics.',
      '',
      'SHORT ANSWER IS MOST IMPORTANT. Read it and let it override template defaults.',
      'If student says "I want to challenge myself" or "I love math" -> push MAT157Y1.',
      'If student says "math is secondary" or "just need to pass" -> use MAT135+MAT136.',
      'If student mentions specific courses -> include them if prereqs allow.',
      '',
      'ONLY USE COURSES FROM THIS LIST:',
      courseList,
      '',
      'PREREQUISITES:',
      prereqList,
    ].join('\n')

    const firstYearTemplates = [
      'FIRST YEAR TEMPLATES (pick best match then adjust from short answer):',
      '',
      'CS standard (no special signals in short answer):',
      'Fall: MAT137Y1(Y1) + CSC148H1 + CSC165H1 + ECO101H1',
      'Winter: MAT223H1 + STA130H1 + ECO102H1 + PSY100H1',
      'Total: 8 courses',
      '',
      'CS ambitious (short answer mentions challenge/157/accelerate):',
      'Fall: MAT157Y1(Y1) + CSC148H1 + CSC165H1 + ECO101H1',
      'Winter: MAT223H1 + STA130H1 + ECO102H1 + PHY131H1',
      'Total: 8 courses. CSC207 NOT included — CSC148 prereq not done yet.',
      '',
      'CS very confident + wants accelerate (explicit in short answer):',
      'Fall: MAT157Y1(Y1) + CSC148H1 + CSC165H1 + ECO101H1',
      'Winter: MAT223H1 + CSC207H1 + STA130H1 + ECO102H1',
      'Total: 8. CSC207 allowed Winter because CSC148 was Fall.',
      '',
      'CS theory track + very confident (CSC Specialist + grad school + strong + mentions theory):',
      'Fall: MAT157Y1(Y1) + CSC148H1 + CSC240H1 + ECO101H1',
      'Winter: MAT223H1 + CSC207H1 + STA130H1 + ECO102H1',
      'Note: CSC240H1 replaces CSC165H1 for theory track.',
      '',
      'CS minimal math (short answer says just need to pass math):',
      'Fall: MAT135H1 + CSC148H1 + CSC165H1 + ECO101H1 + SOC100H1',
      'Winter: MAT136H1 + MAT223H1 + CSC207H1 + ECO102H1',
      'Total: 9 courses. CSC207 ok Winter because CSC148 was Fall.',
      '',
      'Math Specialist:',
      'Fall: MAT157Y1(Y1) + MAT223H1 + CSC148H1 + PHY131H1',
      'Winter: MAT240H1 + CSC165H1 + STA130H1 + PHY132H1',
      'Total: 8 courses.',
      '',
      'Math Major:',
      'Fall: MAT137Y1(Y1) + MAT223H1 + CSC148H1 + ECO101H1',
      'Winter: MAT244H1 + STA130H1 + ECO102H1 + PSY100H1',
      'Total: 8. STA237 cannot be used — MAT137 not yet completed.',
      '',
      'Stats/Data Science:',
      'Fall: MAT137Y1(Y1) + MAT223H1 + CSC148H1 + ECO101H1',
      'Winter: STA130H1 + CSC165H1 + ECO102H1 + PSY100H1',
      'Total: 8.',
      '',
      'Life Sciences:',
      'Fall: MAT135H1 + BIO120H1 + CHM135H1 + PSY100H1',
      'Winter: MAT136H1 + BIO130H1 + CHM136H1 + SOC100H1',
      'Total: 8.',
      '',
      'Physics:',
      'Fall: MAT157Y1(Y1) + PHY151H1 + MAT223H1 + ECO101H1',
      'Winter: PHY152H1 + MAT240H1 + CSC148H1 + ECO102H1',
      'Total: 8.',
      '',
      'Economics/Commerce:',
      'Fall: MAT135H1 + ECO101H1 + PSY100H1 + SOC100H1',
      'Winter: MAT136H1 + ECO102H1 + MAT223H1 + CSC108H1',
      'Total: 8.',
    ].join('\n')

    const secondYearTemplates = [
      'SECOND YEAR TEMPLATES:',
      '',
      'CS (has CSC148+CSC165):',
      'Fall: CSC207H1 + CSC209H1 + CSC236H1 + MAT237Y1(Y1)',
      'Winter: CSC258H1 + MAT223H1 + STA237H1 — WAIT STA237 needs MAT137 completed',
      'If has MAT137: Winter: CSC258H1 + MAT223H1 + STA237H1 + ECO101H1',
      'If no MAT137 yet: Winter: CSC258H1 + MAT223H1 + MAT137Y1 cannot — already doing MAT237',
      'Total: 8-9 courses.',
      '',
      'CS ambitious (strong + grad school + has MAT157):',
      'Fall: CSC207H1 + CSC236H1 + MAT237Y1(Y1) + CSC209H1',
      'Winter: CSC258H1 + CSC263H1 — prereq CSC207+CSC236 needed, CSC236 done Fall',
      'Actually CSC263 needs CSC207 AND CSC236. CSC207 is Fall, CSC236 is Fall.',
      'So CSC263 CAN be Winter: CSC258H1 + CSC263H1 + STA238H1 + MAT223H1',
      'Total: 8.',
      '',
      'Math Specialist (has MAT157):',
      'Fall: MAT257Y1(Y1) + MAT240H1 + CSC148H1 + ECO101H1',
      'Winter: MAT247H1 + MAT246H1 + STA257H1 + ECO102H1',
      'If very strong (selfAssessment=strong): also add MAT267H1 in Winter',
      'Total: 8-9.',
      '',
      'Math Major (has MAT137):',
      'Fall: MAT237Y1(Y1) + MAT240H1 + CSC148H1 + ECO101H1',
      'Winter: MAT246H1 + STA237H1 + MAT223H1 + ECO102H1',
      'Total: 8.',
      '',
      'Stats (has MAT137):',
      'Fall: STA237H1 + STA238H1 — wait STA238 needs STA237, so STA238 is Winter',
      'Fall: MAT237Y1(Y1) + STA237H1 — wait MAT237 needs MAT137 completed',
      'If has MAT137: Fall: MAT237Y1(Y1) + STA237H1 + CSC148H1 + ECO101H1',
      'Winter: STA238H1 + MAT223H1 + CSC165H1 + ECO102H1',
      'Total: 8.',
    ].join('\n')

    const thirdYearTemplates = [
      'THIRD/FOURTH YEAR TEMPLATES (based on completed courses and future direction):',
      '',
      'CS ML track (has CSC263+CSC207, working toward CSC311):',
      'Needs MAT237Y1 and STA238H1 for CSC311.',
      'If missing MAT237: Fall: MAT237Y1(Y1) + CSC369H1 + CSC343H1 + STA237H1',
      'Winter: STA238H1 + CSC373H1 + ECO101H1 + MAT246H1',
      'If has MAT237+STA238: Fall: CSC311H1 + CSC369H1 + CSC343H1 + CSC373H1',
      'Winter: CSC412H1 + CSC413H1 + CSC384H1 + STA302H1',
      '',
      'CS Systems track (has CSC207+CSC209+CSC263):',
      'Fall: CSC369H1 + CSC373H1 + CSC343H1 + MAT337H1',
      'Winter: CSC458H1 + CSC473H1 + CSC448H1 + STA302H1',
      '',
      'CS Theory track (has CSC236+CSC263):',
      'Fall: CSC373H1 + CSC448H1 + CSC463H1 + MAT337H1',
      'Winter: CSC473H1 + MAT344H1 + STA347H1 + CSC384H1',
      '',
      'Math Specialist upper year (has MAT257+MAT240+MAT247):',
      'For grad-math: Fall: MAT347Y1(Y1) + MAT337H1 + MAT327H1 + STA347H1',
      'Winter: MAT354H1 + MAT357H1 + MAT315H1 + CSC236H1',
      '',
      'Math analysis track (has MAT237+MAT246):',
      'Fall: MAT337H1 + MAT301H1 + STA347H1 + CSC263H1',
      'Winter: MAT334H1 + MAT344H1 + STA302H1 + MAT315H1',
      '',
      'Stats upper year (has STA238+MAT237):',
      'Fall: STA302H1 + STA347H1 + CSC343H1 + MAT337H1',
      'Winter: STA261H1 + CSC311H1 + ECO358H1 + MAT334H1',
    ].join('\n')

    const templates = yearType === 'first' ? firstYearTemplates : yearType === 'second' ? secondYearTemplates : thirdYearTemplates

    const userPrompt = [
      'Build a Fall + Winter course plan for ' + profile.name + '.',
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
      'STUDENT IN THEIR OWN WORDS (most important):',
      '"' + shortAnswer + '"',
      '',
      'SELF-ASSESSMENT: ' + selfAssessmentContext,
      '',
      futureDirectionContext,
      '',
      'FLAGS:',
      '- Has MAT157: ' + hasMat157 + ' | Has MAT137: ' + hasMat137 + ' | Has MAT135 only: ' + (hasMat135 && !hasMat137 && !hasMat157),
      '- Has MAT237: ' + hasMat237 + ' | Has MAT257: ' + hasMat257 + ' | Has MAT240: ' + hasMat240 + ' | Has MAT246: ' + hasMat246 + ' | Has MAT247: ' + hasMat247,
      '- Has CSC148: ' + hasCSC148 + ' | Has CSC165: ' + hasCSC165 + ' | Has CSC207: ' + hasCSC207 + ' | Has CSC209: ' + hasCSC209,
      '- Has CSC236: ' + hasCSC236 + ' | Has CSC258: ' + hasCSC258 + ' | Has CSC263: ' + hasCSC263 + ' | Has CSC311: ' + hasCSC311,
      '- Has STA237: ' + hasSTA237 + ' | Has STA238: ' + hasSTA238 + ' | Has STA257: ' + hasSTA257,
      '- Wants MAT157 (from short answer): ' + wantsMat157,
      '- Wants minimal math (from short answer): ' + wantsMinimalMath,
      '- Wants CSC207 early (from short answer): ' + wantsCSC207Early,
      '- Wants CSC240 (from short answer): ' + wantsCSC240,
      '- Is very confident: ' + isVeryConfident,
      '- Grad school: ' + isGradSchool + ' | High capacity: ' + isHighCapacity,
      '- Math: ' + isMath + ' | CS: ' + isCS + ' | Stats: ' + isStats + ' | LifeSci: ' + isLifeSci + ' | Psych: ' + isPsych + ' | Econ: ' + isEcon + ' | Physics: ' + isPhysics,
      '',
      templates,
      '',
      'Use the template closest to this student then adjust based on their short answer and flags.',
      'MUST produce 8-12 total courses. Include breadth electives to reach minimum.',
      '',
      'Return ONLY this JSON:',
      '{',
      '  "message": "2-3 sentences to ' + profile.name + ' — reference their own words, explain key decision (why 137 vs 157 vs 135/136, why CSC240 vs CSC165 if applicable), be direct",',
      '  "courseSchedule": [',
      '    {',
      '      "semester": "' + targetFall + '",',
      '      "courses": [',
      '        {',
      '          "code": "MAT137Y1",',
      '          "name": "Calculus with Proofs",',
      '          "reason": "personalized reason referencing their short answer",',
      '          "type": "required",',
      '          "workload": 12,',
      '          "coreTopics": ["Real analysis foundations", "Epsilon-delta proofs", "Integration theory"],',
      '          "whyNow": "Take in Fall — runs all year, unlocks MAT240 and MAT237"',
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
      '  "advisorNote": "One honest paragraph — explain the philosophy of this plan, what the mix achieves, what to focus on after"',
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
