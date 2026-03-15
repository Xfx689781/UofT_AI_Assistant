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
            : 'STRONG THIRD/FOURTH YEAR: Student excelled and wants advanced material. You MUST include 400-level courses (MAT4XX, CSC4XX, STA4XX, APM4XX) wherever prereqs are met. Can handle 5 courses per semester. Be very ambitious — do not hold back. The student wants to be pushed and is ready for graduate-prep content.'
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
      'MAT367H1=Differential Geometry (H1)',
      'MAT370H1=Introduction to Mathematical Probability (H1)',
      'MAT377H1=Mathematical Probability Theory (H1)',
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
      'MAT449H1=Algebraic Curves (H1)',
      'MAT454H1=Complex Analysis II (H1)',
      'MAT457H1=Advanced Real Analysis I (H1)',
      'MAT458H1=Advanced Real Analysis II (H1)',
      'MAT475H1=Problem Solving Seminar (H1)',
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
      'STA313H1=Data Visualization (H1)',
      'STA304H1=Surveys, Sampling and Observational Data (H1)',
      'STA305H1=Design and Analysis of Experiments (H1)',
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
      'CSC309H1=Programming on the Web (H1)',
      'CSC316H1=Data Visualization (H1)',
      'CSC324H1=Principles of Programming Languages (H1)',
      'CSC318H1=The Design of Interactive Computational Media (H1)',
      'CSC343H1=Introduction to Databases (H1) needs CSC207',
      'CSC369H1=Operating Systems (H1) needs CSC209+CSC263',
      'CSC373H1=Algorithm Design and Analysis (H1) needs CSC263',
      'CSC384H1=Introduction to Artificial Intelligence (H1) needs CSC263+MAT223',
      'CSC367H1=Parallel Programming (H1)',
      'CSC368H1=Computer Architecture (H1)',
      'CSC401H1=Natural Language Computing (H1) needs CSC207',
      'CSC410H1=Software Testing and Verification (H1)',
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
      'PHY224H1=Practical Physics I (H1)',
      'PHY250H1=Electricity and Magnetism (H1)',
      'PHY252H1=Thermal Physics (H1)',
      'PHY254H1=Classical Mechanics (H1)',
      'PHY256H1=Introduction to Quantum Physics (H1)',
      'PHY324H1=Practical Physics II (H1)',
      'PHY350H1=Electromagnetic Theory (H1)',
      'PHY354H1=Advanced Classical Mechanics (H1)',
      'PHY356H1=Quantum Mechanics I (H1)',
      'PHY357H1=Nuclear and Particle Physics (H1)',
      'PHY358H1=Quantum Materials from Atoms to Crystals (H1)',
      'PHY365H1=Quantum Information (H1)',
      'PHY385H1=Introductory Optics (H1)',
      'PHY392H1=Physics of Climate (H1)',
      'PHY407H1=Computational Physics (H1)',
      'PHY450H1=Relativistic Electrodynamics (H1)',
      'PHY452H1=Statistical Mechanics (H1)',
      'PHY454H1=Continuum Mechanics (H1)',
      'PHY456H1=Quantum Mechanics II (H1)',
      'PHY460H1=Nonlinear Physics (H1)',
      'PHY483H1=Relativity Theory I (H1)',
      'PHY484H1=Relativity Theory II (H1)',
      'PHY485H1=Laser Physics (H1)',
      'PHY487H1=Condensed Matter Physics (H1)',
      'PHY489H1=Introduction to High Energy Physics (H1)',
      'PHY491H1=Current Interpretations of Quantum Mechanics (H1)',
      'ECO101H1=Principles of Microeconomics (H1 typically Fall)',
      'ECO102H1=Principles of Macroeconomics (H1 typically Winter)',
      'ECO105Y1=Principles of Economics for Non-Specialists (Full year Y1)',
      'ECO200Y1=Microeconomic Theory (Full year Y1)',
      'ECO202Y1=Macroeconomic Theory and Policy (Full year Y1)',
      'ECO204Y1=Microeconomic Theory and Applications for Commerce (Full year Y1)',
      'ECO206Y1=Microeconomic Theory (Full year Y1)',
      'ECO208Y1=Macroeconomic Theory (Full year Y1)',
      'ECO210H1=Mathematical Methods for Economic Theory (H1)',
      'ECO220Y1=Introduction to Data Analysis and Applied Econometrics (Full year Y1)',
      'ECO225H1=Big-Data Tools for Economists (H1)',
      'ECO227Y1=Foundations of Econometrics (Full year Y1)',
      'ECO316H1=Applied Game Theory (H1)',
      'ECO320H1=Economic Analysis of Law (H1)',
      'ECO324H1=Economic Development (H1)',
      'ECO325H1=Advanced Economic Theory Macro (H1)',
      'ECO326H1=Advanced Microeconomics Game Theory (H1)',
      'ECO331H1=Behavioural and Experimental Economics (H1)',
      'ECO349H1=Money Banking and Financial Markets (H1)',
      'ECO358H1=Financial Economics I (H1)',
      'ECO359H1=Financial Economics II Corporate Finance (H1)',
      'ECO362H1=Economic Growth (H1)',
      'ECO364H1=International Trade Theory (H1)',
      'ECO365H1=International Monetary Economics (H1)',
      'ECO367H1=The Economics of Inequality (H1)',
      'ECO375H1=Applied Econometrics I (H1)',
      'ECO437H1=Quantitative Macroeconomics (H1)',
      'ECO439H1=Empirical Methods in Microeconomics (H1)',
      'ECO462H1=Financial Econometrics (H1)',
      'ECO475H1=Applied Econometrics II (H1)',
      'BIO120H1=Adaptation and Biodiversity (H1)',
      'BIO130H1=Molecular and Cell Biology (H1)',
      'BIO220H1=From Genomes to Ecosystems in a Changing World (H1)',
      'BCH210H1=Biochemistry (H1)',
      'BIO230H1=From Genes to Organisms (H1)',
      'BIO260H1=Concepts in Genetics (H1)',
      'HMB200H1=Introduction to Neuroscience (H1)',
      'HMB265H1=General and Human Genetics (H1)',
      'HMB300H1=Neurobiology of Behaviour (H1)',
      'HMB342H1=Epidemiology of Health and Disease (H1)',
      'HMB360H1=Neurogenomics (H1)',
      'HMB440H1=Dementia (H1)',
      'HMB441H1=Genetics of Human Disease (H1)',
      'HMB450H1=Neurodevelopmental Diversity and Diseases (H1)',
      'CHM135H1=Chemistry Physical Principles (H1)',
      'CHM136H1=Introductory Organic Chemistry I (H1)',
      'CHM151Y1=Chemistry The Molecular Science (Full year Y1)',
      'CHM210H1=Chemistry of Environmental Change (H1)',
      'CHM217H1=Introduction to Analytical Chemistry (H1)',
      'CHM222H1=Introduction to Physical Chemistry (H1)',
      'CHM236H1=Introductory Inorganic Chemistry I (H1)',
      'CHM247H1=Introductory Organic Chemistry II (H1)',
      'CHM249H1=Organic Chemistry (H1)',
      'CHM317H1=Introduction to Instrumental Methods of Analysis (H1)',
      'CHM326H1=Introductory Quantum Mechanics and Spectroscopy (H1)',
      'CHM338H1=Intermediate Inorganic Chemistry (H1)',
      'CHM342H1=Modern Organic Synthesis (H1)',
      'CHM347H1=Organic Chemistry of Biological Compounds (H1)',
      'CHM348H1=Organic Reaction Mechanisms (H1)',
      'CHM379H1=Biomolecular Chemistry (H1)',
      'CHM423H1=Applications of Quantum Mechanics (H1)',
      'CHM427H1=Statistical Mechanics (H1)',
      'CHM447H1=Bio-organic Chemistry (H1)',
      'COG250H1=Introduction to Cognitive Science (H1)',
      'PSY100H1=Introductory Psychology (H1)',
      'PSY201H1=Statistics I (H1)',
      'PSY202H1=Statistics II (H1)',
      'PSY210H1=Introduction to Developmental Psychology (H1)',
      'PSY220H1=Introduction to Social Psychology (H1)',
      'PSY230H1=Personality and Its Transformations (H1)',
      'PSY240H1=Introduction to Psychopathology and Clinical Science (H1)',
      'PSY260H1=Introduction to Learning and Plasticity (H1)',
      'PSY270H1=Introduction to Cognitive Psychology (H1)',
      'PSY280H1=Introduction to Sensation and Perception (H1)',
      'PSY290H1=Behavioural Neuroscience (H1)',
      'PSY312H1=Cognitive Development (H1)',
      'PSY320H1=Social Psychology Attitudes (H1)',
      'PSY326H1=Social Cognition (H1)',
      'PSY370H1=Thinking and Reasoning (H1)',
      'PSY371H1=Higher Cognitive Processes (H1)',
      'PSY372H1=Human Memory (H1)',
      'PSY380H1=Vision Science (H1)',
      'PSY390H1=Behavioural Genetics (H1)',
      'PSY396H1=Neurochemical Basis of Behaviour (H1)',
      'SOC100H1=Introduction to Sociology (H1)',
      'SOC150H1=Introduction to Sociology II (H1)',
      'SOC202H1=Introduction to Quantitative Methods in Sociology (H1)',
      'SOC204H1=Introduction to Qualitative Methods in Sociology (H1)',
      'SOC205H1=Urban Sociology (H1)',
      'SOC212H1=Sociology of Crime and Deviance (H1)',
      'SOC252H1=Intermediate Quantitative Methods in Sociology (H1)',
      'SOC260H1=Introduction to Political Sociology (H1)',
      'SOC270H1=Introduction to Social Networks (H1)',
      'SOC308H1=Global Inequality (H1)',
      'SOC312H1=Population and Society (H1)',
      'SOC329H1=Social Movements (H1)',
      'SOC331H1=Sociology of Technology (H1)',
      'SOC334H1=Sociology of Mental Health (H1)',
      'SOC356H1=Data Technology and Society (H1)',
      'PHL100Y1=Ancient Wisdom Modern Insights Introduction to Philosophy (Full year Y1)',
      'PHL232H1=Knowledge and Reality (H1)',
      'PHL233H1=Philosophy for Scientists (H1)',
      'PHL245H1=Modern Symbolic Logic (H1)',
      'PHL246H1=Probability and Inductive Logic (H1)',
      'PHL255H1=Philosophy of Science (H1)',
      'PHL265H1=Introduction to Political Philosophy (H1)',
      'PHL271H1=Law and Morality (H1)',
      'PHL273H1=Environmental Ethics (H1)',
      'PHL275H1=Introduction to Ethics (H1)',
      'PHL277H1=Ethics and Data (H1)',
      'PHL281H1=Bioethics (H1)',
      'AST101H1=The Sun and Its Neighbours (H1)',
      'AST121H1=Origin and Evolution of the Universe (H1)',
      'AST201H1=Stars and Galaxies (H1)',
      'AST221H1=Stars and Planets (H1)',
      'AST222H1=Galaxies and Cosmology (H1)',
      'AST251H1=Life on Other Worlds (H1)',
      'AST320H1=Introduction to Astrophysics (H1)',
      'AST325H1=Introduction to Practical Astronomy (H1)',
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
      'MAT449H1 needs MAT347Y1 and MAT354H1',
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
      'CSC108H1 has no prerequisite and is good for students (who want to get into CS POSt and not in CS stream) with no strong background in high school (taking first-year fall), or as a breadth course for life sci or arts/business students (taking anytime they want).',
      'CSC148H1 needs CSC108H1 or high school programming',
      'CSC207H1 needs CSC148H1',
      'CSC209H1 needs CSC148H1',
      'CSC236H1 needs CSC148H1 and CSC165H1',
      'CSC240H1 needs CSC148H1 — harder alternative to CSC165',
      'CSC258H1 needs CSC148H1 and (CSC165H1 or CSC240H1)',
      'CSC263H1 needs CSC207H1 and (CSC236H1 or CSC240H1)',
      'CSC265H1 needs CSC240H1 and MAT157Y1 (but MAY157Y1 can be waived sometimes)',
      'CSC311H1 needs CSC207H1 and (MAT235Y1 or MAT237Y1 or MAT257Y1 or MAT157Y1(67%) or MAT137Y1(73%) or (MAT135H1(77%) and MAT136H1(77%)) and (STA257H1 or STA247H1 or STA237H1) and (MAT223H1 or MAT240H1)',
      'CSC343H1 needs CSC207H1',
      'CSC304H1 needs (MAT136H1 or MAT137Y1 or MAT157Y1) and (STA237H1 or STA247H1 or STA157H1)',
      'CSC324H1 needs CSC263H1 or CSC265H1',
      'CSC317H1 needs CSC209H1 and (MAT235Y1 or MAT237Y1 or MAT257Y1) and (MAT223H1 or MAT240H1)',
      'CSC309H1 needs CSC209H1',
      'CSC369H1 needs CSC209H1 and (CSC263H1 or CSC265H1)',
      'CSC410H1 needs CSC207H1 and (CSC263H1 or CSC240H1)',
      'CSC316H1 needs CSC207H1',
      'CSC318H1 needs any 0.5 CSC credit (1 CSC course)',
      'CSC336H1 needs CSC148H1 and (MAT223H1 or MAT240H1) and (MAT135H1 or MAT137Y1 or MAT157Y1)',
      'CSC367H1 needs CSC258H1 and CSC209H1',
      'CSC368H1 needs CSC258H1 and CSC209H1',
      'CSC428H1 needs CSC318H1 and CSC207H1 and (STA237H1 or STA247H1 or STA257H1)',
      'CSC373H1 needs CSC263H1',
      'CSC458H1 needs CSC258H1 and CSC209H1 and (CSC263H1 or CSC265H1)',
      'CSC384H1 needs CSC263H1 and (MAT223H1 or MAT240H1)',
      'CSC412H1 needs CSC311H1',
      'CSC413H1 needs CSC311H1 and (MAT235Y1 or MAT237Y1 or MAT257Y1) and (MAT223H1 or MAT240H1)',
      'CSC417H1 needs CSC209H1 and (MAT235Y1 or MAT237Y1 or MAT257Y1) and (MAT223H1 or MAT240H1)',
      'CSC420H1 needs CSC320H1 and (CSC263H1 or CSC265H1) and (MAT223H1 or MAT240H1)',
      'CSC448H1 needs (CSC236H1 or CSC240H1) and (CSC263H1 or CSC265H1)',
      'CSC436H1 needs CSC336H1',
      'CSC463H1 needs CSC373H1 and (MAT223H1 or MAT240H1)',
      'CSC485H1 needs CSC209H1 and (STA237H1 or STA247H1 or STA257H1)',
      'CSC486H1 needs CSC384H1',
      'CSC469H1 needs CSC369H1',
    ].join('\n')

    const futureDirectionMap: Record<string, string> = {
  'ml-ai': 'Direction: Machine Learning / AI. Key upper courses to work toward (if prereqs met): CSC311H1, CSC412H1, CSC413H1, CSC486H1, STA314H1, STA414H1, CSC384H1, CSC420H1. Check completed flags to see what is already done and what is next.',
  'systems': 'Direction: Systems / Low-Level. Key upper courses: CSC369H1, CSC458H1, CSC469H1, CSC373H1, CSC473H1, CSC448H1. Check what is completed and build from there.',
  'theory-cs': 'Direction: Theory of CS. Key upper courses: CSC373H1, CSC448H1, CSC463H1, CSC473H1, APM461H1, MAT309H1, MAT344H1. Strong students should also consider MAT315H1 and MAT401H1.',
  'vision-graphics': 'Direction: Vision / Graphics. Key upper courses: CSC420H1, CSC317H1, CSC412H1. Needs MAT237Y1 and MAT223H1 as prereqs.',
  'nlp': 'Direction: NLP. Key upper courses: CSC401H1, CSC485H1, CSC311H1, CSC412H1, CSC413H1.',
  'pure-math': 'Direction: Pure Mathematics. Key upper courses depending on what is completed: MAT347Y1, MAT327H1, MAT354H1, MAT357H1, MAT337H1, MAT301H1, MAT315H1. At 4th year level: MAT415H1, MAT425H1, MAT445H1, MAT448H1, MAT454H1, MAT457H1, MAT458H1, MAT475H1. Push 400-level aggressively for strong students.',
  'analysis': 'Direction: Analysis / PDE. Key courses: MAT337H1, MAT354H1, MAT357H1, APM346H1. At advanced level: MAT454H1, MAT457H1, MAT458H1, APM446H1. Build on whatever analysis courses are already completed.',
  'algebra': 'Direction: Algebra. Key courses: MAT301H1, MAT315H1, MAT347Y1. At advanced level: MAT401H1, MAT415H1, MAT445H1, MAT448H1. Build on what is completed.',
  'stats-data': 'Direction: Statistics / Data Science. Key courses: STA302H1, STA303H1, STA347H1, STA410H1, STA437H1, STA457H1. Advanced: STA447H1, STA314H1, STA414H1, STA365H1. Also consider CSC343H1 for data work.',
  'quant-finance': 'Direction: Quantitative Finance. Key courses: STA347H1, STA261H1, MAT337H1, ECO358H1, STA302H1. Also STA447H1 for stochastic processes.',
  'bio-research': 'Direction: Biology Research. Key courses: upper-year BIO, STA237H1, STA238H1, STA302H1 for research methods.',
  'neuro': 'Direction: Neuroscience / Cog Sci. Key courses: PSY270H1, PSY230H1, PSY240H1, STA237H1, BIO230H1.',
  'physics-research': 'Direction: Physics Research. Key courses: PHY254H1, PHY256H1, PHY350H1, PHY354H1. Build sequentially on what is completed.',
  'grad-math': 'Direction: Math Graduate School. Push hardest possible. 400-level is the goal: MAT415H1, MAT425H1, MAT445H1, MAT448H1, MAT454H1, MAT457H1, MAT458H1, MAT475H1. Also MAT347Y1, MAT327H1, MAT357H1 if not yet done. Do not hold back.',
  'grad-cs': 'Direction: CS Graduate School / Research. Key courses: CSC311H1, CSC412H1, CSC413H1, CSC373H1, CSC494H1. Also consider STA314H1, STA414H1 for ML research track.',
  'industry-swe': 'Direction: Software Engineering / Industry. Key practical courses: CSC343H1, CSC369H1, CSC209H1, CSC458H1, CSC316H1, CSC318H1. Focus on applied and systems courses.',
  'other': 'Direction: Undecided / Broad. Build a balanced plan mixing different fields of courses based on interests. Use short answer as primary guide.',
}
    
    const futureDirectionContext = futureDirection ? 'FUTURE DIRECTION: ' + futureDirection + '\n' + (futureDirectionMap[futureDirection] || '') : ''

    const systemPrompt = [
      'You are an expert UofT academic advisor. Build precise, personalized, and ambitious course plans.',
      '',
      'ANTI-HALLUCINATION — MOST IMPORTANT RULE:',
      'You may ONLY use course codes that appear VERBATIM in the COURSE LIST provided below, or on the UofT ArtSci Calendar.',
      'DO NOT invent course codes. DO NOT guess course codes. DO NOT use codes that does not exist (like MAT345H1, CSC444H1, PHY323H1)',
      'Before including any course, find its exact code in the course list. If it is not there, do not include it.',
      'If you cannot find enough courses from the list to fill the plan, use breadth electives from PSY, SOC, PHL and many other subject that ARE either in the list or in UofT academic calendar.',
      '',
      'ABSOLUTE RULES — never violate:',
      '1. Y1 = FULL YEAR course. It covers BOTH Fall AND Winter semesters. Place it in Fall JSON ONLY. NEVER put it in Winter. NEVER put MAT136H1 in the same plan as MAT137Y1 — they are mutually exclusive alternatives. MAT136H1 is the second half of MAT135H1+MAT136H1 path. MAT137Y1 replaces BOTH MAT135H1 and MAT136H1. You cannot have both.',
      '2. MAT137Y1 and MAT157Y1 are mutually exclusive. Never both in same plan.',
      '3. MAT135H1 is Fall only H1. MAT136H1 is Winter only H1. These are ONLY used if the student is NOT taking MAT137Y1 or MAT157Y1.',
      '4. FIRST YEAR CALCULUS RULE: Pick exactly ONE path: (a) MAT137Y1 alone covers full year, OR (b) MAT157Y1 alone covers full year, OR (c) MAT135H1 in Fall + MAT136H1 in Winter. Never mix these paths.',
      '5. Same logic applies to other Y1 courses: MAT237Y1 covers full year, never pair with a H1 equivalent. MAT257Y1 covers full year. MAT235Y1 covers full year. MAT351Y1 covers full year. MAT347Y1 covers full year. CHM151Y1 covers full year. ECO200Y1/ECO202Y1/ECO220Y1 covers full year.',
      '6. CSC110Y1 and CSC111H1 are only provided to CS stream first-year students. CSC110Y1 is full year but Fall only. CSC111H1 is its Winter continuation — they are a pair.',
      '7. STA237H1 and STA247H1 need MAT136H1 or MAT137Y1 ALREADY COMPLETED. STA257H1 needs MAT137Y1 or MAT157Y1 ALREADY COMPLETED. If the student is currently taking MAT137Y1 this year, they cannot also take STA237H1 in the same plan.',
      '8. COURSE COUNT: First/Second year: 8-10 total across 2 semesters (4-5 per semester). Third/Fourth year: 14-20 total across 4 semesters (3-5 per semester). A plan with fewer than 8 courses for first/second year or fewer than 14 for third/fourth year is UNACCEPTABLE.',
      '   If the plan feels too narrow (only required courses), add relevant electives. Good electives: MAT344H1, MAT332H1, MAT335H1, STA302H1, STA347H1, CSC343H1, CSC316H1, CSC304H1, ECO358H1, PSY270H1, MAT301H1, MAT334H1.',
      '9. MANDATORY BREADTH: At least 1-2 courses outside main department unless student explicitly says not to.',
      '10. For third+ year: generate EXACTLY 4 semesters. Total 14-20 courses across all four semesters.',
      '11. Third/Fourth year has NO fixed requirements. Only prereqs must be met. Be creative and personalized.',
      '12. NEVER include courses already in the completed list.',
      '',
      'CSC207H1 IN FIRST YEAR RULE:',
      'CSC207H1 requires CSC148H1 as prerequisite.',
      'In a first year plan, CSC207H1 is ONLY allowed in Winter if:',
      '  (a) CSC148H1 is in Fall of the same plan AND student explicitly wants to accelerate, OR',
      '  (b) Student said in short answer they want CSC207 specifically or mentioned accelerating.',
      'Do NOT add CSC207H1 to a standard first year plan.',
      '',
      'CSC240H1 RULE:',
      'CSC240H1 is a harder alternative to CSC165H1+CSC236H1 for theory-focused CS students.',
      'Use CSC240H1 instead of CSC165H1 ONLY if:',
      '  (a) Student is CS Specialist or theory-cs direction AND selfAssessment=strong AND isGradSchool, OR',
      '  (b) Student explicitly mentions CSC240 or discrete math in short answer.',
      'Otherwise always use CSC165H1.',
      '',
      'CSC265H1 is a harder exclusive alternative to CSC263H1 for very strong CS students.',
      '',
      'TEMPLATE FLEXIBILITY RULES:',
      '- First year: templates are mostly fixed (these are standard required sequences). Follow closely.',
      '- Second year: templates are guidelines. Adjust based on student short answer and flags.',
      '- Third/Fourth year: templates are starting points only. The student short answer and futureDirection are the primary guide. Include courses the student mentions if prereqs allow. Be creative and ambitious.',
      '- For all years: NEVER violate prerequisites. Check every course against the prereq list before including.',
      '- If student mentions a course explicitly: include it if prereqs allow.',
      '',
      'AMBITION FOR STRONG STUDENTS:',
      '- selfAssessment=strong means push hard. Do not be conservative.',
      '- For third/fourth year strong students: MAT415H1, MAT425H1, MAT445H1, MAT448H1, MAT454H1, MAT457H1, MAT458H1, STA447H1, STA414H1, CSC494H1, APM421H1, APM446H1 are all fair game if prereqs met.',
      '',
      'PHYSICS SPECIALIST RULE: PHY151H1 is Fall, PHY152H1 is Winter. Both must appear for physics specialist students.',
      '',
      'SHORT ANSWER IS MOST IMPORTANT. Read it and let it override template defaults.',
      'If student says they want to challenge themselves or love math -> push MAT157Y1.',
      'If student says math is secondary or just needs to pass -> use MAT135+MAT136.',
      'If student mentions specific courses -> include them if prereqs allow.',
      '',
      'ONLY USE COURSES FROM THIS LIST:',
      courseList,
      '',
      'PREREQUISITES:',
      prereqList,
    ].join('\n')

    const firstYearTemplates = [
      'FIRST YEAR TEMPLATES (CS student must take CSC110Y1 fall + CSC111H1 winter, and NO CSC108/148/165. Pick best match then adjust from short answer):',
      '',
      'CS in-stream (computer science first-year):',
      'Fall: CSC110Y1 + MAT137/157Y1(Y1) + MAT223/240H1 + (ECO101H1/others)',
      'Winter: CSC111H1 + MAT137/157Y1(Y1) continues + MAT224/247H1 + (STA130H1/ECO102H1/PSY100H1/others)',
      'Total: 8~10 courses',
      '',
      'Out of CS but CS ambitious (short answer mentions challenge/math):',
      'Fall: MAT157Y1(Y1) + MAT240H1 + CSC148H1 + (ECO101H1/PHY131H1/PHY151H1/others)',
      'Winter: MAT157Y1(Y1) continues + MAT247H1 + CSC165/240H1 + (STA130H1/ECO102H1/PHY131H1/others)',
      'Total: 8~10 courses. CSC207 NOT included — CSC148 prereq not done yet.',
      '',
      'CS very confident + math very confident + wants accelerate (explicit in short answer):',
      'Fall: MAT157Y1(Y1) + MAT240H1 + CSC148H1 + (STA130H1/ECO101H1/PHY151H1/others)',
      'Winter: MAT157Y1(Y1) continues + MAT247H1 + CSC240H1 + (PHY152H1/CSC207H1/ECO102H1/others)',
      'Total: 8~12. CSC207 allowed Winter because CSC148 was Fall.',
      '',
      'CS theory track + very confident (CSC Specialist + grad school + strong + mentions theory):',
      'Fall: MAT137/157Y1(Y1) + MAT223/240H1 + CSC148H1 + CSC240H1 + ECO101H1',
      'Winter: MAT137/157Y1(Y1) continues + MAT224/247H1 + CSC207H1 + STA130H1 + ECO102H1',
      'Total: 8~12. Note: CSC240H1 replaces CSC165H1 for theory track.',
      '',
      'CS minimal math (short answer says just need to pass math):',
      'Fall: MAT135H1 + CSC148H1 + ECO101H1 + SOC100H1',
      'Winter: MAT136H1 + MAT223H1 + CSC165H1 + ECO102H1',
      'Total: 8~9 courses.',
      '',
      'Math Specialist:',
      'Fall: MAT157Y1(Y1) + MAT240H1 + CSC108H1 + (PHY131H1/PHY151H1)',
      'Winter: MAT157Y1(Y1) continues + MAT247H1 + CSC148H1 + STA130H1 + (PHY132H1/PHY152H1) + (CSC165H1/other breadth)',
      'Total: 8~10 courses.',
      '',
      'Math Major:',
      'Fall: MAT137Y1(Y1) + MAT223H1 + CSC108H1 + ECO101H1',
      'Winter: MAT137Y1(Y1) continues + MAT224H1 + STA130H1 + CSC148H1 + ECO102H1',
      'Total: 8~10. STA237 cannot be used — MAT137 not yet completed.',
      '',
      'Stats/Data Science:',
      'Fall: MAT137Y1(Y1) + MAT223H1 + CSC108/148H1 + ECO101H1',
      'Winter: MAT137Y1(Y1) continues + STA130H1 + CSC165H1 + ECO102H1 + PSY100H1',
      'Total: 8~10.',
      '',
      'Life Sciences:',
      'Fall: MAT135H1 + BIO120H1 + CHM135H1 + PSY100H1',
      'Winter: MAT136H1 + BIO130H1 + CHM136H1 + SOC100H1',
      'Total: 8.',
      '',
      'Math and Physics Specialist:',
      'Fall: MAT157Y1(Y1) + PHY151H1 + MAT223H1 + CSC108/148H1 + ECO101H1',
      'Winter: MAT157Y1(Y1) continues + PHY152H1 + MAT240H1 + (CSC148H1) + (CSC165/240H1) + ECO102H1',
      'Total: 8~12.',
      '',
      'Economics/Commerce:',
      'Fall: MAT133Y1(Y1) + ECO101H1 + PSY100H1 + RSM100H1',
      'Winter: MAT133Y1(Y1) continues + ECO102H1 + RSM219H1 + SOC100H1',
      'Total: 6~9.',
    ].join('\n')

    const secondYearTemplates = [
  'SECOND YEAR GUIDANCE:',
  'Second year is transitional. Use the completed flags to figure out where the student is, then build forward.',
  'Do not mechanically copy a template — read the flags, read the short answer, then decide.',
  '',
  'KEY DECISIONS TO MAKE FOR SECOND YEAR:',
  '- CS student: main question is whether to take MAT237Y1 this year (needs MAT137 completed). If yes, pair it with CSC207+CSC209+CSC236 in Fall. If MAT137 not done, reconsider.',
  '- Math Specialist: main question is MAT257Y1 (needs MAT157+MAT247). If both done, MAT257Y1 is the centerpiece. Pair with MAT267H1, STA257H1, MAT327H1 depending on strength.',
  '- Math Major: MAT237Y1 is the centerpiece if MAT137 done. Pair with MAT240H1, MAT246H1, MAT223H1.',
  '- Stats: MAT237Y1 + STA237H1 together if MAT137 done. Build toward STA238H1 in Winter.',
  '- Strong students can compress: e.g. CS with MAT157 can take MAT257Y1 instead of MAT237Y1, or fit CSC263H1 in Winter if CSC207+CSC236 are both in Fall.',
  '- Shaky students: reduce load to 4 per semester, avoid stacking two hard courses in same semester.',
  '',
  'IMPORTANT PREREQ CHECKS FOR SECOND YEAR:',
  '- STA237H1 needs MAT137Y1 already completed — not currently taking',
  '- CSC263H1 needs CSC207H1 AND CSC236H1 both done first',
  '- MAT257Y1 needs MAT157Y1 AND MAT247H1 both done',
  '- MAT237Y1 needs MAT137Y1 done',
  '',
  'COURSE COUNT: 8-10 total across 2 semesters. 4-5 per semester.',
  'BREADTH: include 1-2 courses outside main department (ECO101, ECO102, STA130, PSY100, SOC100 etc.)',
].join('\n')

const thirdYearTemplates = [
  'THIRD/FOURTH YEAR: You MUST generate EXACTLY 4 semesters: "' + targetFall + '", "' + targetWinter + '", "' + targetFall2 + '", "' + targetWinter2 + '".',
  'Each semester: 3-5 courses. Total: 14-20 courses across all 4 semesters.',
  '',
  'PHILOSOPHY FOR UPPER YEARS:',
  'There are NO fixed required courses. The only constraint is prerequisites.',
  'Your job is to build the most personalized, ambitious, coherent plan possible based on:',
  '  1. What courses the student has completed (check every flag carefully)',
  '  2. What their futureDirection says they want to work toward',
  '  3. What they said in their own words (short answer)',
  '  4. How confident they are (selfAssessment)',
  '',
  'DO NOT just copy a template. Think about what this specific student has done and what logically comes next.',
  'DO NOT include courses already completed. DO NOT include first-year intro courses unless genuinely missing as a prereq.',
  '',
  'FOR STRONG STUDENTS (selfAssessment=strong):',
  'You MUST push 400-level courses. If prereqs are met, include them. Do not be conservative.',
  'Examples of 400-level courses available if prereqs met:',
  '  Math: MAT415H1, MAT417H1, MAT425H1, MAT445H1, MAT448H1, MAT454H1, MAT457H1, MAT458H1, MAT475H1, MAT409H1, MAT401H1',
  '  CS: CSC412H1, CSC413H1, CSC486H1, CSC494H1, CSC469H1, CSC463H1, CSC473H1',
  '  Stats: STA414H1, STA447H1, STA410H1, STA437H1, STA457H1, STA475H1, STA465H1',
  '  APM: APM421H1, APM426H1, APM446H1, APM461H1, APM462H1',
  '',
  'SEMESTER PROGRESSION LOGIC:',
  '- Third Year Fall: courses that are immediately unlocked by completed courses',
  '- Third Year Winter: courses that need Third Year Fall as prereq, plus parallel electives',
  '- Fourth Year Fall: more advanced courses, start of capstone/research if applicable',
  '- Fourth Year Winter: most advanced courses, finish degree requirements, breadth',
  '',
  'BREADTH: At least 1~2 courses outside main department somewhere across the 4 semesters.',
  '',
  'REFERENCE POOLS BY DIRECTION (use as inspiration, not as fixed plans):',
  '- CS ML: CSC311->CSC412+CSC413, CSC384, CSC486, STA302->STA347->STA314->STA414, CSC420, CSC494',
  '- CS Theory: CSC373->CSC463+CSC473, CSC448, CSC384, APM461, MAT309, MAT344, MAT315',
  '- CS Systems: CSC369->CSC469, CSC458, CSC373->CSC473, CSC448, CSC494',
  '- Math pure/grad: MAT347Y1->MAT415+MAT445+MAT448, MAT327->MAT354->MAT454, MAT357->MAT457->MAT458, MAT475',
  '- Math analysis: MAT337->MAT357->MAT457->MAT458, MAT334->MAT354->MAT454, APM346->APM446',
  '- Math algebra: MAT301->MAT401, MAT315, MAT347Y1->MAT415+MAT445+MAT448',
  '- Stats: STA302->STA303->STA365+STA437+STA457+STA475, STA347->STA447, STA314->STA414',
  '- Physics: PHY254->PHY256->PHY350->PHY354, APM426',
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
      '- Completed courses (DO NOT include any of these in the plan): ' + JSON.stringify(completed),
      '- Goals: ' + goals,
      '- Learning style: ' + learningStyle,
      '- Study hours: ' + studyHours,
      '- Interests: ' + JSON.stringify(interests),
      '',
      'STUDENT IN THEIR OWN WORDS (most important — this overrides template defaults):',
      '"' + shortAnswer + '"',
      '',
      'SELF-ASSESSMENT: ' + selfAssessmentContext,
      '',
      futureDirectionContext,
      '',
      'COMPUTED FLAGS:',
      '- Has MAT157: ' + hasMat157 + ' | Has MAT137: ' + hasMat137 + ' | Has MAT135 only: ' + (hasMat135 && !hasMat137 && !hasMat157),
      '- Has MAT237: ' + hasMat237 + ' | Has MAT257: ' + hasMat257 + ' | Has MAT240: ' + hasMat240 + ' | Has MAT246: ' + hasMat246 + ' | Has MAT247: ' + hasMat247,
      '- Has CSC148: ' + hasCSC148 + ' | Has CSC165: ' + hasCSC165 + ' | Has CSC207: ' + hasCSC207 + ' | Has CSC209: ' + hasCSC209,
      '- Has CSC236: ' + hasCSC236 + ' | Has CSC258: ' + hasCSC258 + ' | Has CSC263: ' + hasCSC263 + ' | Has CSC311: ' + hasCSC311,
      '- Has STA237: ' + hasSTA237 + ' | Has STA238: ' + hasSTA238 + ' | Has STA257: ' + hasSTA257,
      '- Wants MAT157: ' + wantsMat157 + ' | Wants minimal math: ' + wantsMinimalMath + ' | Wants accelerate: ' + wantsAccelerate,
      '- Wants CSC207 early: ' + wantsCSC207Early + ' | Wants CSC240: ' + wantsCSC240,
      '- Very confident: ' + isVeryConfident + ' | Grad school: ' + isGradSchool + ' | High capacity: ' + isHighCapacity,
      '- Math: ' + isMath + ' | CS: ' + isCS + ' | Stats: ' + isStats + ' | LifeSci: ' + isLifeSci + ' | Psych: ' + isPsych + ' | Econ: ' + isEcon + ' | Physics: ' + isPhysics,
      '',
      templates,
      '',
      yearType === 'third+'
        ? 'CRITICAL: You MUST return exactly 4 semesters: "' + targetFall + '", "' + targetWinter + '", "' + targetFall2 + '", "' + targetWinter2 + '". Each must have 3-5 courses. Total must be 14-20 courses. Strong student must see 400-level courses.'
        : 'Return exactly 2 semesters. Total 8-10 courses. 4-5 per semester.',
      '',
      'Return ONLY this JSON:',
      '{',
      '  "message": "2-3 sentences to ' + profile.name + ' — reference their own words, explain key decision (why 137 vs 157 vs 135/136, why CSC240 vs CSC165 if applicable), be direct",',
      '  "courseSchedule": [',
      semesterJsonTemplate,
      '  ],',
      '  "degreeProgress": {',
      '    "completedCredits": ' + String(completed.length * 0.5) + ',',
      '    "requiredCredits": 20,',
      '    "remainingRequired": ["key remaining course codes"],',
      '    "nextMilestone": "concrete next milestone after this plan"',
      '  },',
      '  "advisorNote": "One honest paragraph — explain the philosophy of this plan, what the mix achieves, and what to focus on after"',
      '}',
      '',
      'Each course object must have: code, name, reason (personalized to student), type ("required" or "elective"), coreTopics (array of 3 topics), whyNow (why this semester).',
   'FINAL CHECK before responding:',
     '1. Every course code must exist in the course list above — no exceptions.',
     '2. Every course must have its prereqs satisfied by the completed list.',
     '3. Third/Fourth year must have 4 semesters with 3-5 courses each.',
     '4. If unsure about a course code, use a different course that is certain exists in the list.',
    '',
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

      type CourseItem = {
        code: string; name: string; reason: string; type: string
        workload?: number; coreTopics: string[]; whyNow: string
      }
      type SemItem = { semester: string; courses: CourseItem[] }

      // Step 1: filter completed courses
      const step1 = (parsed.courseSchedule || []).map((sem: SemItem) => ({
        ...sem,
        courses: sem.courses.filter((c: CourseItem) => {
          const norm = c.code.toUpperCase().replace(/\s/g, '')
          return !completedSet.has(norm) && !completedSet.has(norm.replace(/(H1|H2|Y1|Y2)$/, ''))
        }),
      }))

      // Step 2: detect calculus path in plan
      const allPlanCodes = step1.flatMap((s: SemItem) => s.courses.map((c: CourseItem) => c.code.toUpperCase().replace(/\s/g, '')))
      const planHas137 = allPlanCodes.includes('MAT137Y1')
      const planHas157 = allPlanCodes.includes('MAT157Y1')

      // Step 3: remove mutual exclusions for calculus only
      const step2 = step1.map((sem: SemItem) => ({
        ...sem,
        courses: sem.courses.filter((c: CourseItem) => {
          const code = c.code.toUpperCase().replace(/\s/g, '')
          if ((planHas137 || planHas157) && (code === 'MAT135H1' || code === 'MAT136H1')) return false
          if (planHas137 && code === 'MAT157Y1') return false
          if (planHas157 && code === 'MAT137Y1') return false
          return true
        }),
      }))

      // Step 4: deduplicate Y1 courses — only keep first occurrence
      const seenY1 = new Set<string>()
      const step3 = step2.map((sem: SemItem) => ({
        ...sem,
        courses: sem.courses.filter((c: CourseItem) => {
          const code = c.code.toUpperCase().replace(/\s/g, '')
          if (code.endsWith('Y1')) {
            if (seenY1.has(code)) return false
            seenY1.add(code)
          }
          return true
        }),
      }))

      // Step 5: add Y1 continuations to Winter semesters for display
      const finalSchedule = step3.map((sem: SemItem, idx: number) => {
        if (!sem.semester.toLowerCase().includes('winter')) return sem
        const prevSem = step3[idx - 1]
        if (!prevSem) return sem
        const y1s = prevSem.courses
          .filter((c: CourseItem) => c.code.toUpperCase().endsWith('Y1'))
          .map((c: CourseItem) => ({ ...c, whyNow: 'Full year course — continues from Fall.' }))
        if (y1s.length === 0) return sem
        const alreadyHas = sem.courses.some((c: CourseItem) => y1s.some((y: CourseItem) => y.code === c.code))
        if (alreadyHas) return sem
        return { ...sem, courses: [...y1s, ...sem.courses] }
      })

      // Step 6: fallback if filtering wiped everything
      const hasContent = finalSchedule.some((s: SemItem) => s.courses.length > 0)

      return NextResponse.json({
        message: parsed.message || '',
        courseSchedule: hasContent ? finalSchedule : (parsed.courseSchedule || []),
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
