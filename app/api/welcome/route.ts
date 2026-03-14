// lib/programs.ts
// Real UofT program requirements from artsci.calendar.utoronto.ca

export interface CourseInfo {
  code: string
  name: string
  credits: number // 0.5 = H course, 1.0 = Y course
  prereqs: string[]
  coreqs?: string[]
  workload: number // estimated hours/week
  typically: ('Fall' | 'Winter' | 'Summer')[]
  description: string
  tags: string[]
}

export interface ProgramRequirements {
  name: string
  type: 'Specialist' | 'Major' | 'Minor'
  totalCredits: number
  firstYearCourses: string[] // recommended first year
  requiredCourses: string[] // must complete
  electiveSets: {
    label: string
    minCredits: number
    options: string[]
  }[]
  gradSchoolElectives: string[]
  industryElectives: string[]
  notes: string
}

// ── Course Database ───────────────────────────────────────────

export const COURSES: Record<string, CourseInfo> = {
  // ── First Year Math ──
  MAT135H1: {
    code: 'MAT135H1', name: 'Calculus I',
    credits: 0.5, prereqs: [], workload: 7,
    typically: ['Fall'],
    description: 'Differential calculus. Limits, derivatives, optimization.',
    tags: ['calculus', 'first-year']
  },
  MAT136H1: {
    code: 'MAT136H1', name: 'Calculus II',
    credits: 0.5, prereqs: ['MAT135H1'], workload: 7,
    typically: ['Winter'],
    description: 'Integral calculus. Techniques, applications, sequences.',
    tags: ['calculus', 'first-year']
  },
  MAT137Y1: {
    code: 'MAT137Y1', name: 'Calculus with Proofs',
    credits: 1.0, prereqs: [], workload: 12,
    typically: ['Fall', 'Winter'],
    description: 'Rigorous single-variable calculus with proof-writing. Required for Math Specialist/Major.',
    tags: ['calculus', 'proofs', 'first-year', 'rigorous']
  },
  MAT157Y1: {
    code: 'MAT157Y1', name: 'Analysis I',
    credits: 1.0, prereqs: [], workload: 15,
    typically: ['Fall', 'Winter'],
    description: 'Most rigorous first-year calculus. For pure math specialist track.',
    tags: ['analysis', 'proofs', 'first-year', 'rigorous', 'hardest']
  },
  MAT223H1: {
    code: 'MAT223H1', name: 'Linear Algebra I',
    credits: 0.5, prereqs: [], workload: 7,
    typically: ['Fall', 'Winter'],
    description: 'Systems of equations, matrices, vector spaces, determinants.',
    tags: ['linear-algebra', 'first-year']
  },
  MAT224H1: {
    code: 'MAT224H1', name: 'Linear Algebra II',
    credits: 0.5, prereqs: ['MAT223H1'], workload: 8,
    typically: ['Winter'],
    description: 'Abstract vector spaces, inner product spaces, diagonalization.',
    tags: ['linear-algebra', 'second-year']
  },
  MAT240H1: {
    code: 'MAT240H1', name: 'Algebra I',
    credits: 0.5, prereqs: ['MAT137Y1'], workload: 10,
    typically: ['Fall'],
    description: 'Abstract linear algebra with proofs. For Math Specialist.',
    tags: ['algebra', 'proofs', 'second-year']
  },
  MAT246H1: {
    code: 'MAT246H1', name: 'Abstract Mathematics',
    credits: 0.5, prereqs: ['MAT137Y1'], workload: 8,
    typically: ['Winter'],
    description: 'Introduction to proofs, logic, sets, induction. Bridge course.',
    tags: ['proofs', 'second-year']
  },
  MAT247H1: {
    code: 'MAT247H1', name: 'Algebra II',
    credits: 0.5, prereqs: ['MAT240H1'], workload: 10,
    typically: ['Winter'],
    description: 'Modules, canonical forms, bilinear forms.',
    tags: ['algebra', 'proofs', 'second-year']
  },
  MAT235Y1: {
    code: 'MAT235Y1', name: 'Calculus II (Multivariable)',
    credits: 1.0, prereqs: ['MAT135H1', 'MAT136H1'], workload: 9,
    typically: ['Fall', 'Winter'],
    description: 'Multivariable calculus. For non-specialist math track.',
    tags: ['calculus', 'second-year']
  },
  MAT237Y1: {
    code: 'MAT237Y1', name: 'Multivariable Calculus',
    credits: 1.0, prereqs: ['MAT137Y1'], workload: 12,
    typically: ['Fall', 'Winter'],
    description: 'Rigorous multivariable calculus. Required for Math Specialist/Major.',
    tags: ['calculus', 'second-year', 'rigorous']
  },
  MAT244H1: {
    code: 'MAT244H1', name: 'Introduction to Ordinary Differential Equations',
    credits: 0.5, prereqs: ['MAT135H1', 'MAT136H1', 'MAT223H1'], workload: 8,
    typically: ['Fall', 'Winter'],
    description: 'First and higher order ODEs, systems, applications.',
    tags: ['differential-equations', 'second-year']
  },
  MAT257Y1: {
    code: 'MAT257Y1', name: 'Analysis II',
    credits: 1.0, prereqs: ['MAT157Y1'], workload: 15,
    typically: ['Fall', 'Winter'],
    description: 'Multivariable analysis on manifolds. Specialist pure math track.',
    tags: ['analysis', 'proofs', 'second-year', 'rigorous', 'hardest']
  },
  MAT267H1: {
    code: 'MAT267H1', name: 'Advanced Ordinary Differential Equations',
    credits: 0.5, prereqs: ['MAT157Y1', 'MAT240H1'], workload: 10,
    typically: ['Winter'],
    description: 'ODEs with rigorous treatment. Required for Math Specialist.',
    tags: ['differential-equations', 'third-year']
  },
  MAT301H1: {
    code: 'MAT301H1', name: 'Groups and Symmetries',
    credits: 0.5, prereqs: ['MAT240H1'], workload: 10,
    typically: ['Fall'],
    description: 'Group theory, symmetry, Sylow theorems.',
    tags: ['algebra', 'third-year']
  },
  MAT315H1: {
    code: 'MAT315H1', name: 'Introduction to Number Theory',
    credits: 0.5, prereqs: ['MAT246H1'], workload: 8,
    typically: ['Winter'],
    description: 'Primes, congruences, cryptography, Diophantine equations.',
    tags: ['number-theory', 'third-year']
  },
  MAT327H1: {
    code: 'MAT327H1', name: 'Introduction to Topology',
    credits: 0.5, prereqs: ['MAT257Y1'], workload: 11,
    typically: ['Fall'],
    description: 'Topological spaces, continuity, compactness, connectedness.',
    tags: ['topology', 'third-year', 'grad-prep']
  },
  MAT334H1: {
    code: 'MAT334H1', name: 'Complex Variables',
    credits: 0.5, prereqs: ['MAT237Y1'], workload: 9,
    typically: ['Fall', 'Winter'],
    description: 'Complex analysis, analytic functions, contour integration.',
    tags: ['analysis', 'third-year']
  },
  MAT337H1: {
    code: 'MAT337H1', name: 'Introduction to Real Analysis',
    credits: 0.5, prereqs: ['MAT237Y1', 'MAT246H1'], workload: 11,
    typically: ['Winter'],
    description: 'Rigorous real analysis: sequences, series, continuity.',
    tags: ['analysis', 'third-year', 'grad-prep']
  },
  MAT344H1: {
    code: 'MAT344H1', name: 'Introduction to Combinatorics',
    credits: 0.5, prereqs: ['MAT224H1'], workload: 8,
    typically: ['Fall'],
    description: 'Counting, graph theory, generating functions.',
    tags: ['combinatorics', 'third-year']
  },
  MAT347Y1: {
    code: 'MAT347Y1', name: 'Groups, Rings and Fields',
    credits: 1.0, prereqs: ['MAT247H1'], workload: 12,
    typically: ['Fall', 'Winter'],
    description: 'Abstract algebra. Required for Math Specialist.',
    tags: ['algebra', 'third-year', 'grad-prep']
  },
  MAT351Y1: {
    code: 'MAT351Y1', name: 'Partial Differential Equations',
    credits: 1.0, prereqs: ['MAT267H1', 'MAT237Y1'], workload: 12,
    typically: ['Fall', 'Winter'],
    description: 'PDEs. Required for Math Specialist.',
    tags: ['differential-equations', 'third-year']
  },
  MAT354H1: {
    code: 'MAT354H1', name: 'Complex Analysis I',
    credits: 0.5, prereqs: ['MAT257Y1'], workload: 11,
    typically: ['Fall'],
    description: 'Rigorous complex analysis. For Math Specialist.',
    tags: ['analysis', 'fourth-year', 'grad-prep']
  },
  MAT357H1: {
    code: 'MAT357H1', name: 'Foundations of Real Analysis',
    credits: 0.5, prereqs: ['MAT257Y1'], workload: 12,
    typically: ['Winter'],
    description: 'Measure theory, Lebesgue integration.',
    tags: ['analysis', 'fourth-year', 'grad-prep']
  },
  MAT367H1: {
    code: 'MAT367H1', name: 'Differential Geometry',
    credits: 0.5, prereqs: ['MAT257Y1', 'MAT247H1'], workload: 12,
    typically: ['Winter'],
    description: 'Smooth manifolds, differential forms.',
    tags: ['geometry', 'fourth-year', 'grad-prep']
  },

  // ── Statistics ──
  STA130H1: {
    code: 'STA130H1', name: 'An Introduction to Statistical Reasoning and Data Science',
    credits: 0.5, prereqs: [], workload: 5,
    typically: ['Fall', 'Winter'],
    description: 'Intro stats for students considering Statistical Sciences.',
    tags: ['statistics', 'first-year', 'data-science']
  },
  STA237H1: {
    code: 'STA237H1', name: 'Probability, Statistics and Data Analysis I',
    credits: 0.5, prereqs: ['MAT137Y1'], workload: 7,
    typically: ['Fall', 'Winter'],
    description: 'Probability, distributions, inference basics.',
    tags: ['statistics', 'probability', 'second-year']
  },
  STA238H1: {
    code: 'STA238H1', name: 'Probability, Statistics and Data Analysis II',
    credits: 0.5, prereqs: ['STA237H1'], workload: 8,
    typically: ['Winter'],
    description: 'Inference, regression, data analysis.',
    tags: ['statistics', 'second-year']
  },
  STA247H1: {
    code: 'STA247H1', name: 'Probability with Computer Applications',
    credits: 0.5, prereqs: ['MAT137Y1'], workload: 7,
    typically: ['Fall'],
    description: 'Probability for CS students.',
    tags: ['probability', 'cs', 'second-year']
  },
  STA261H1: {
    code: 'STA261H1', name: 'Probability and Statistics II',
    credits: 0.5, prereqs: ['STA257H1'], workload: 8,
    typically: ['Winter'],
    description: 'Statistical inference for stat specialist track.',
    tags: ['statistics', 'second-year']
  },
  STA302H1: {
    code: 'STA302H1', name: 'Methods of Data Analysis I',
    credits: 0.5, prereqs: ['STA238H1', 'MAT223H1'], workload: 8,
    typically: ['Fall', 'Winter'],
    description: 'Regression analysis, model diagnostics.',
    tags: ['statistics', 'data-analysis', 'third-year']
  },
  STA303H1: {
    code: 'STA303H1', name: 'Methods of Data Analysis II',
    credits: 0.5, prereqs: ['STA302H1'], workload: 8,
    typically: ['Winter'],
    description: 'ANOVA, generalized linear models.',
    tags: ['statistics', 'third-year']
  },
  STA347H1: {
    code: 'STA347H1', name: 'Probability',
    credits: 0.5, prereqs: ['MAT237Y1', 'STA238H1'], workload: 10,
    typically: ['Fall'],
    description: 'Rigorous probability theory.',
    tags: ['probability', 'third-year', 'grad-prep']
  },
  STA355H1: {
    code: 'STA355H1', name: 'Theory of Statistical Practice',
    credits: 0.5, prereqs: ['STA238H1', 'MAT223H1'], workload: 9,
    typically: ['Fall'],
    description: 'Mathematical statistics: estimation, testing.',
    tags: ['statistics', 'theory', 'third-year']
  },
  STA410H1: {
    code: 'STA410H1', name: 'Statistical Computation',
    credits: 0.5, prereqs: ['STA302H1'], workload: 9,
    typically: ['Fall'],
    description: 'Computational methods in statistics.',
    tags: ['statistics', 'computation', 'fourth-year']
  },
  STA414H1: {
    code: 'STA414H1', name: 'Statistical Methods for Machine Learning and Data Mining',
    credits: 0.5, prereqs: ['STA302H1', 'STA347H1'], workload: 10,
    typically: ['Winter'],
    description: 'ML methods from statistical perspective.',
    tags: ['machine-learning', 'statistics', 'fourth-year']
  },
  STA457H1: {
    code: 'STA457H1', name: 'Time Series Analysis',
    credits: 0.5, prereqs: ['STA347H1'], workload: 9,
    typically: ['Fall'],
    description: 'ARIMA, forecasting, spectral analysis.',
    tags: ['time-series', 'fourth-year', 'industry']
  },

  // ── Computer Science ──
  CSC108H1: {
    code: 'CSC108H1', name: 'Introduction to Computer Programming',
    credits: 0.5, prereqs: [], workload: 6,
    typically: ['Fall', 'Winter'],
    description: 'Python programming fundamentals.',
    tags: ['programming', 'first-year']
  },
  CSC110Y1: {
    code: 'CSC110Y1', name: 'Foundations of Computer Science I',
    credits: 1.0, prereqs: [], workload: 12,
    typically: ['Fall', 'Winter'],
    description: 'CS foundations including proofs and Python. New CS entry course.',
    tags: ['cs', 'proofs', 'first-year']
  },
  CSC111H1: {
    code: 'CSC111H1', name: 'Foundations of Computer Science II',
    credits: 0.5, prereqs: ['CSC110Y1'], workload: 10,
    typically: ['Winter'],
    description: 'Data structures and algorithm design.',
    tags: ['cs', 'data-structures', 'first-year']
  },
  CSC148H1: {
    code: 'CSC148H1', name: 'Introduction to Computer Science',
    credits: 0.5, prereqs: ['CSC108H1'], workload: 8,
    typically: ['Fall', 'Winter'],
    description: 'Data structures, recursion, OOP.',
    tags: ['cs', 'data-structures', 'first-year']
  },
  CSC165H1: {
    code: 'CSC165H1', name: 'Mathematical Expression and Reasoning for Computer Science',
    credits: 0.5, prereqs: [], workload: 8,
    typically: ['Fall', 'Winter'],
    description: 'Logic, proofs for CS.',
    tags: ['cs', 'proofs', 'first-year']
  },
  CSC207H1: {
    code: 'CSC207H1', name: 'Software Design',
    credits: 0.5, prereqs: ['CSC148H1'], workload: 9,
    typically: ['Fall', 'Winter'],
    description: 'Design patterns, Java, software engineering.',
    tags: ['cs', 'software-engineering', 'second-year']
  },
  CSC209H1: {
    code: 'CSC209H1', name: 'Software Tools and Systems Programming',
    credits: 0.5, prereqs: ['CSC148H1'], workload: 9,
    typically: ['Fall', 'Winter'],
    description: 'C programming, Unix, systems tools.',
    tags: ['cs', 'systems', 'second-year']
  },
  CSC236H1: {
    code: 'CSC236H1', name: 'Introduction to the Theory of Computation',
    credits: 0.5, prereqs: ['CSC148H1', 'CSC165H1'], workload: 9,
    typically: ['Fall', 'Winter'],
    description: 'Induction, automata, computational complexity.',
    tags: ['cs', 'theory', 'second-year']
  },
  CSC263H1: {
    code: 'CSC263H1', name: 'Data Structures and Analysis',
    credits: 0.5, prereqs: ['CSC207H1', 'CSC236H1'], workload: 10,
    typically: ['Fall', 'Winter'],
    description: 'Advanced data structures, algorithm analysis.',
    tags: ['cs', 'algorithms', 'second-year']
  },
  CSC311H1: {
    code: 'CSC311H1', name: 'Introduction to Machine Learning',
    credits: 0.5, prereqs: ['CSC207H1', 'MAT237Y1', 'STA238H1'], workload: 10,
    typically: ['Fall', 'Winter'],
    description: 'Supervised/unsupervised learning, neural networks.',
    tags: ['machine-learning', 'third-year', 'industry']
  },
  CSC320H1: {
    code: 'CSC320H1', name: 'Introduction to Visual Computing',
    credits: 0.5, prereqs: ['CSC263H1', 'MAT223H1'], workload: 9,
    typically: ['Winter'],
    description: 'Image processing, computer vision basics.',
    tags: ['cs', 'vision', 'third-year']
  },
  CSC343H1: {
    code: 'CSC343H1', name: 'Introduction to Databases',
    credits: 0.5, prereqs: ['CSC207H1'], workload: 8,
    typically: ['Fall', 'Winter'],
    description: 'Relational databases, SQL, query optimization.',
    tags: ['cs', 'databases', 'third-year', 'industry']
  },
  CSC369H1: {
    code: 'CSC369H1', name: 'Operating Systems',
    credits: 0.5, prereqs: ['CSC209H1', 'CSC263H1'], workload: 11,
    typically: ['Fall', 'Winter'],
    description: 'OS concepts, processes, memory management.',
    tags: ['cs', 'systems', 'third-year']
  },
  CSC373H1: {
    code: 'CSC373H1', name: 'Algorithm Design, Analysis and Complexity',
    credits: 0.5, prereqs: ['CSC263H1'], workload: 10,
    typically: ['Fall', 'Winter'],
    description: 'Algorithm design, NP-completeness.',
    tags: ['cs', 'algorithms', 'third-year']
  },
  CSC401H1: {
    code: 'CSC401H1', name: 'Natural Language Computing',
    credits: 0.5, prereqs: ['CSC263H1', 'STA247H1'], workload: 10,
    typically: ['Winter'],
    description: 'NLP, text processing, language models.',
    tags: ['cs', 'nlp', 'fourth-year', 'industry']
  },
  CSC412H1: {
    code: 'CSC412H1', name: 'Probabilistic Learning and Reasoning',
    credits: 0.5, prereqs: ['CSC311H1', 'STA347H1'], workload: 11,
    typically: ['Winter'],
    description: 'Bayesian methods, graphical models, deep learning.',
    tags: ['machine-learning', 'fourth-year', 'grad-prep']
  },
  CSC413H1: {
    code: 'CSC413H1', name: 'Neural Networks and Deep Learning',
    credits: 0.5, prereqs: ['CSC311H1'], workload: 11,
    typically: ['Winter'],
    description: 'Deep learning, CNNs, transformers.',
    tags: ['machine-learning', 'deep-learning', 'fourth-year', 'industry']
  },
  CSC458H1: {
    code: 'CSC458H1', name: 'Computer Networking',
    credits: 0.5, prereqs: ['CSC369H1'], workload: 9,
    typically: ['Fall'],
    description: 'TCP/IP, protocols, network architecture.',
    tags: ['cs', 'networking', 'fourth-year']
  },

  // ── Life Sciences ──
  BIO120H1: {
    code: 'BIO120H1', name: 'Adaptation and Biodiversity',
    credits: 0.5, prereqs: [], workload: 7,
    typically: ['Fall'],
    description: 'Evolution, ecology, biodiversity.',
    tags: ['biology', 'first-year']
  },
  BIO130H1: {
    code: 'BIO130H1', name: 'Molecular and Cell Biology',
    credits: 0.5, prereqs: [], workload: 8,
    typically: ['Winter'],
    description: 'Cell biology, DNA, molecular processes.',
    tags: ['biology', 'first-year']
  },
  BIO220H1: {
    code: 'BIO220H1', name: 'From Genomes to Ecosystems in a Changing World',
    credits: 0.5, prereqs: ['BIO120H1', 'BIO130H1'], workload: 7,
    typically: ['Fall', 'Winter'],
    description: 'Genomics to ecology integration.',
    tags: ['biology', 'second-year']
  },
  BIO230H1: {
    code: 'BIO230H1', name: 'From Genes to Organisms',
    credits: 0.5, prereqs: ['BIO120H1', 'BIO130H1'], workload: 8,
    typically: ['Fall', 'Winter'],
    description: 'Development, genetics, model organisms.',
    tags: ['biology', 'second-year']
  },
  BCH210H1: {
    code: 'BCH210H1', name: 'Biochemistry I',
    credits: 0.5, prereqs: ['CHM135H1', 'CHM136H1', 'BIO130H1'], workload: 9,
    typically: ['Fall', 'Winter'],
    description: 'Proteins, enzymes, metabolism.',
    tags: ['biochemistry', 'second-year']
  },
  HMB265H1: {
    code: 'HMB265H1', name: 'General and Human Genetics',
    credits: 0.5, prereqs: ['BIO120H1', 'BIO130H1'], workload: 8,
    typically: ['Fall', 'Winter'],
    description: 'Mendelian genetics, human genomics.',
    tags: ['genetics', 'second-year']
  },
  PSL300H1: {
    code: 'PSL300H1', name: 'Human Physiology I',
    credits: 0.5, prereqs: ['BIO130H1'], workload: 9,
    typically: ['Fall', 'Winter'],
    description: 'Membrane physiology, neurons, muscle.',
    tags: ['physiology', 'second-year']
  },
  PSL301H1: {
    code: 'PSL301H1', name: 'Human Physiology II',
    credits: 0.5, prereqs: ['PSL300H1'], workload: 9,
    typically: ['Winter'],
    description: 'Cardiovascular, respiratory, renal systems.',
    tags: ['physiology', 'third-year']
  },
  CHM135H1: {
    code: 'CHM135H1', name: 'Chemistry: Physical Principles',
    credits: 0.5, prereqs: [], workload: 8,
    typically: ['Fall'],
    description: 'Thermodynamics, kinetics, quantum chemistry.',
    tags: ['chemistry', 'first-year']
  },
  CHM136H1: {
    code: 'CHM136H1', name: 'Introductory Organic Chemistry',
    credits: 0.5, prereqs: ['CHM135H1'], workload: 8,
    typically: ['Winter'],
    description: 'Organic chemistry fundamentals.',
    tags: ['chemistry', 'first-year']
  },

  // ── Psychology ──
  PSY100H1: {
    code: 'PSY100H1', name: 'Introductory Psychology',
    credits: 0.5, prereqs: [], workload: 6,
    typically: ['Fall', 'Winter'],
    description: 'Overview of psychology.',
    tags: ['psychology', 'first-year']
  },
  PSY201H1: {
    code: 'PSY201H1', name: 'Statistics I',
    credits: 0.5, prereqs: ['PSY100H1'], workload: 7,
    typically: ['Fall', 'Winter'],
    description: 'Statistics for psychology.',
    tags: ['psychology', 'statistics', 'second-year']
  },
  PSY202H1: {
    code: 'PSY202H1', name: 'Statistics II',
    credits: 0.5, prereqs: ['PSY201H1'], workload: 7,
    typically: ['Winter'],
    description: 'Regression, ANOVA for psychology.',
    tags: ['psychology', 'statistics', 'second-year']
  },
  PSY220H1: {
    code: 'PSY220H1', name: 'Social Psychology',
    credits: 0.5, prereqs: ['PSY100H1'], workload: 6,
    typically: ['Fall', 'Winter'],
    description: 'Social influence, attitudes, behavior.',
    tags: ['psychology', 'social', 'second-year']
  },
  PSY230H1: {
    code: 'PSY230H1', name: 'Personality and Its Transformations',
    credits: 0.5, prereqs: ['PSY100H1'], workload: 6,
    typically: ['Fall', 'Winter'],
    description: 'Personality theories and assessment.',
    tags: ['psychology', 'second-year']
  },
  PSY240H1: {
    code: 'PSY240H1', name: 'Introduction to Abnormal Psychology',
    credits: 0.5, prereqs: ['PSY100H1'], workload: 6,
    typically: ['Fall', 'Winter'],
    description: 'Mental disorders, diagnosis, treatment.',
    tags: ['psychology', 'clinical', 'second-year']
  },
  PSY260H1: {
    code: 'PSY260H1', name: 'Learning and Plasticity',
    credits: 0.5, prereqs: ['PSY100H1'], workload: 6,
    typically: ['Fall'],
    description: 'Learning, memory, neural plasticity.',
    tags: ['psychology', 'neuroscience', 'second-year']
  },
  PSY270H1: {
    code: 'PSY270H1', name: 'Introduction to Cognitive Psychology',
    credits: 0.5, prereqs: ['PSY100H1'], workload: 6,
    typically: ['Fall', 'Winter'],
    description: 'Attention, memory, language, reasoning.',
    tags: ['psychology', 'cognitive', 'second-year']
  },
  PSY280H1: {
    code: 'PSY280H1', name: 'Introduction to Sensation and Perception',
    credits: 0.5, prereqs: ['PSY100H1'], workload: 6,
    typically: ['Winter'],
    description: 'Perception, sensory systems.',
    tags: ['psychology', 'second-year']
  },
  PSY290H1: {
    code: 'PSY290H1', name: 'Behavioural Neuroscience',
    credits: 0.5, prereqs: ['PSY100H1'], workload: 7,
    typically: ['Fall', 'Winter'],
    description: 'Brain, behavior, neuroscience foundations.',
    tags: ['psychology', 'neuroscience', 'second-year']
  },

  // ── Sociology ──
  SOC100H1: {
    code: 'SOC100H1', name: 'Introduction to Sociology',
    credits: 0.5, prereqs: [], workload: 5,
    typically: ['Fall', 'Winter'],
    description: 'Social structures, institutions, culture.',
    tags: ['sociology', 'first-year']
  },
  SOC150H1: {
    code: 'SOC150H1', name: 'Introduction to Sociology: Institutions and Inequalities',
    credits: 0.5, prereqs: [], workload: 5,
    typically: ['Fall', 'Winter'],
    description: 'Social inequality, institutions.',
    tags: ['sociology', 'first-year']
  },
  SOC201H1: {
    code: 'SOC201H1', name: 'Classical Sociological Theory',
    credits: 0.5, prereqs: ['SOC100H1'], workload: 6,
    typically: ['Fall'],
    description: 'Marx, Weber, Durkheim.',
    tags: ['sociology', 'theory', 'second-year']
  },
  SOC202H1: {
    code: 'SOC202H1', name: 'Contemporary Sociological Theory',
    credits: 0.5, prereqs: ['SOC100H1'], workload: 6,
    typically: ['Winter'],
    description: 'Modern social theory.',
    tags: ['sociology', 'theory', 'second-year']
  },
  SOC203H1: {
    code: 'SOC203H1', name: 'Statistics for Sociologists I',
    credits: 0.5, prereqs: ['SOC100H1'], workload: 6,
    typically: ['Fall', 'Winter'],
    description: 'Quantitative methods for sociology.',
    tags: ['sociology', 'statistics', 'second-year']
  },
  SOC204H1: {
    code: 'SOC204H1', name: 'Statistics for Sociologists II',
    credits: 0.5, prereqs: ['SOC203H1'], workload: 6,
    typically: ['Winter'],
    description: 'Regression and multivariate methods.',
    tags: ['sociology', 'statistics', 'second-year']
  },
  SOC205H1: {
    code: 'SOC205H1', name: 'Sociological Research Methods',
    credits: 0.5, prereqs: ['SOC100H1'], workload: 6,
    typically: ['Fall', 'Winter'],
    description: 'Qualitative and quantitative research.',
    tags: ['sociology', 'methods', 'second-year']
  },
}

// ── Program Requirements ──────────────────────────────────────

export const PROGRAM_REQUIREMENTS: Record<string, ProgramRequirements> = {
  'Mathematics Specialist': {
    name: 'Mathematics Specialist',
    type: 'Specialist',
    totalCredits: 12,
    firstYearCourses: ['MAT157Y1', 'MAT240H1'],
    requiredCourses: [
      'MAT157Y1', 'MAT240H1', 'MAT247H1', 'MAT257Y1',
      'MAT267H1', 'MAT327H1', 'MAT347Y1', 'MAT351Y1',
      'MAT354H1', 'MAT357H1',
    ],
    electiveSets: [
      {
        label: 'APM/MAT 400-level electives',
        minCredits: 2.0,
        options: ['MAT367H1', 'MAT401H1', 'MAT409H1', 'MAT415H1', 'MAT417H1', 'MAT425H1', 'MAT427H1', 'MAT445H1', 'MAT449H1', 'MAT454H1', 'MAT457H1'],
      },
    ],
    gradSchoolElectives: ['MAT367H1', 'MAT357H1', 'MAT327H1', 'MAT347Y1'],
    industryElectives: ['CSC311H1', 'STA347H1', 'MAT344H1'],
    notes: 'Uses MAT157/257 track. Most rigorous math program at UofT.',
  },

  'Mathematics Major': {
    name: 'Mathematics Major',
    type: 'Major',
    totalCredits: 8,
    firstYearCourses: ['MAT137Y1', 'MAT223H1'],
    requiredCourses: [
      'MAT137Y1', 'MAT223H1', 'MAT224H1', 'MAT237Y1',
      'MAT246H1',
    ],
    electiveSets: [
      {
        label: 'Core upper year',
        minCredits: 2.0,
        options: ['MAT301H1', 'MAT334H1', 'MAT337H1', 'MAT344H1', 'MAT315H1'],
      },
      {
        label: 'APM/MAT 300/400 electives',
        minCredits: 2.0,
        options: ['MAT334H1', 'MAT337H1', 'MAT357H1', 'MAT367H1', 'MAT344H1', 'MAT315H1'],
      },
    ],
    gradSchoolElectives: ['MAT337H1', 'MAT357H1', 'MAT347Y1', 'STA347H1'],
    industryElectives: ['CSC311H1', 'STA302H1', 'MAT344H1', 'CSC343H1'],
    notes: 'Uses MAT137 track. Flexible with electives.',
  },

  'Mathematics Minor': {
    name: 'Mathematics Minor',
    type: 'Minor',
    totalCredits: 4,
    firstYearCourses: ['MAT137Y1', 'MAT223H1'],
    requiredCourses: ['MAT137Y1', 'MAT223H1', 'MAT237Y1', 'MAT246H1'],
    electiveSets: [
      {
        label: 'MAT 200+ electives',
        minCredits: 1.0,
        options: ['MAT224H1', 'MAT301H1', 'MAT334H1', 'MAT337H1'],
      },
    ],
    gradSchoolElectives: ['MAT301H1', 'MAT337H1'],
    industryElectives: ['STA237H1', 'CSC108H1'],
    notes: 'Good complement to CS, Stats, or Physics.',
  },

  'Applied Mathematics Specialist': {
    name: 'Applied Mathematics Specialist',
    type: 'Specialist',
    totalCredits: 12,
    firstYearCourses: ['MAT137Y1', 'MAT223H1'],
    requiredCourses: [
      'MAT137Y1', 'MAT223H1', 'MAT224H1', 'MAT237Y1',
      'MAT244H1', 'MAT246H1', 'MAT337H1', 'MAT351Y1',
    ],
    electiveSets: [
      {
        label: 'APM courses',
        minCredits: 3.0,
        options: ['APM346H1', 'APM421H1', 'APM426H1', 'APM441H1', 'APM446H1', 'APM461H1', 'APM466H1'],
      },
    ],
    gradSchoolElectives: ['MAT337H1', 'APM346H1', 'APM421H1'],
    industryElectives: ['CSC311H1', 'STA347H1', 'APM466H1'],
    notes: 'Focus on mathematical applications to science and engineering.',
  },

  'Mathematics & Physics Specialist': {
    name: 'Mathematics & Physics Specialist',
    type: 'Specialist',
    totalCredits: 15,
    firstYearCourses: ['MAT157Y1', 'PHY151H1', 'PHY152H1'],
    requiredCourses: [
      'MAT157Y1', 'MAT240H1', 'MAT247H1', 'MAT257Y1', 'MAT267H1',
      'PHY151H1', 'PHY152H1', 'PHY224H1', 'PHY250H1', 'PHY252H1', 'PHY324H1', 'PHY350H1',
    ],
    electiveSets: [
      {
        label: 'Upper year MAT/PHY',
        minCredits: 3.0,
        options: ['MAT327H1', 'MAT354H1', 'PHY351H1', 'PHY356H1', 'PHY357H1', 'PHY358H1'],
      },
    ],
    gradSchoolElectives: ['MAT327H1', 'MAT354H1', 'PHY356H1'],
    industryElectives: ['APM346H1', 'PHY357H1'],
    notes: 'Demanding double specialist. Excellent for physics grad school.',
  },

  'Statistical Sciences Specialist': {
    name: 'Statistical Sciences Specialist',
    type: 'Specialist',
    totalCredits: 12,
    firstYearCourses: ['MAT137Y1', 'STA130H1', 'CSC108H1'],
    requiredCourses: [
      'MAT137Y1', 'MAT223H1', 'MAT237Y1', 'MAT246H1',
      'STA237H1', 'STA238H1', 'STA347H1', 'STA355H1',
      'STA302H1', 'CSC108H1', 'CSC148H1',
    ],
    electiveSets: [
      {
        label: 'STA 400-level',
        minCredits: 2.0,
        options: ['STA410H1', 'STA414H1', 'STA457H1', 'STA452H1', 'STA465H1'],
      },
    ],
    gradSchoolElectives: ['STA414H1', 'STA452H1', 'MAT337H1', 'CSC412H1'],
    industryElectives: ['STA457H1', 'CSC311H1', 'STA410H1', 'CSC343H1'],
    notes: 'Strong theory and computation mix.',
  },

  'Data Science Specialist': {
    name: 'Data Science Specialist',
    type: 'Specialist',
    totalCredits: 12,
    firstYearCourses: ['MAT137Y1', 'STA130H1', 'CSC110Y1'],
    requiredCourses: [
      'MAT137Y1', 'MAT223H1', 'STA130H1', 'STA237H1', 'STA238H1',
      'CSC110Y1', 'CSC111H1', 'CSC207H1', 'CSC311H1', 'CSC343H1',
    ],
    electiveSets: [
      {
        label: 'DS electives',
        minCredits: 2.0,
        options: ['STA414H1', 'STA457H1', 'CSC412H1', 'CSC413H1', 'CSC401H1', 'STA302H1'],
      },
    ],
    gradSchoolElectives: ['CSC412H1', 'STA414H1', 'CSC413H1'],
    industryElectives: ['CSC343H1', 'STA457H1', 'CSC401H1', 'CSC413H1'],
    notes: 'Interdisciplinary CS + stats. Very industry-relevant.',
  },

  'Statistics Major': {
    name: 'Statistics Major',
    type: 'Major',
    totalCredits: 8,
    firstYearCourses: ['MAT137Y1', 'STA130H1'],
    requiredCourses: [
      'MAT137Y1', 'MAT223H1', 'STA237H1', 'STA238H1', 'STA347H1', 'STA355H1',
    ],
    electiveSets: [
      {
        label: 'STA 300/400 electives',
        minCredits: 2.0,
        options: ['STA302H1', 'STA303H1', 'STA410H1', 'STA414H1', 'STA457H1'],
      },
    ],
    gradSchoolElectives: ['STA347H1', 'STA414H1', 'MAT237Y1'],
    industryElectives: ['CSC108H1', 'STA457H1', 'STA302H1'],
    notes: 'Flexible stats program.',
  },

  'Computer Science Specialist': {
    name: 'Computer Science Specialist',
    type: 'Specialist',
    totalCredits: 12,
    firstYearCourses: ['CSC110Y1', 'CSC111H1', 'MAT137Y1'],
    requiredCourses: [
      'CSC110Y1', 'CSC111H1', 'CSC207H1', 'CSC209H1',
      'CSC236H1', 'CSC263H1', 'CSC369H1', 'CSC373H1',
      'MAT137Y1', 'MAT223H1', 'STA247H1',
    ],
    electiveSets: [
      {
        label: 'CS 400-level',
        minCredits: 2.0,
        options: ['CSC401H1', 'CSC411H1', 'CSC412H1', 'CSC413H1', 'CSC418H1', 'CSC420H1', 'CSC443H1', 'CSC458H1', 'CSC469H1', 'CSC473H1'],
      },
    ],
    gradSchoolElectives: ['CSC412H1', 'CSC413H1', 'MAT337H1', 'STA347H1'],
    industryElectives: ['CSC343H1', 'CSC401H1', 'CSC413H1', 'CSC458H1'],
    notes: 'Most rigorous CS program. High demand POSt.',
  },

  'Computer Science Major': {
    name: 'Computer Science Major',
    type: 'Major',
    totalCredits: 8,
    firstYearCourses: ['CSC110Y1', 'CSC111H1', 'MAT137Y1'],
    requiredCourses: [
      'CSC110Y1', 'CSC111H1', 'CSC207H1', 'CSC209H1',
      'CSC236H1', 'CSC263H1', 'MAT137Y1',
    ],
    electiveSets: [
      {
        label: 'CS 300/400 electives',
        minCredits: 2.5,
        options: ['CSC311H1', 'CSC343H1', 'CSC369H1', 'CSC373H1', 'CSC401H1', 'CSC412H1', 'CSC413H1'],
      },
    ],
    gradSchoolElectives: ['CSC412H1', 'CSC373H1', 'MAT237Y1'],
    industryElectives: ['CSC343H1', 'CSC311H1', 'CSC413H1'],
    notes: 'More flexibility than specialist.',
  },

  'Computer Science Minor': {
    name: 'Computer Science Minor',
    type: 'Minor',
    totalCredits: 4,
    firstYearCourses: ['CSC108H1', 'CSC148H1'],
    requiredCourses: ['CSC108H1', 'CSC148H1', 'CSC207H1', 'CSC236H1'],
    electiveSets: [
      {
        label: 'CS electives',
        minCredits: 1.0,
        options: ['CSC263H1', 'CSC343H1', 'CSC311H1'],
      },
    ],
    gradSchoolElectives: ['CSC263H1', 'CSC311H1'],
    industryElectives: ['CSC343H1', 'CSC311H1'],
    notes: 'Good add-on for math or stats students.',
  },

  'Human Biology Specialist': {
    name: 'Human Biology Specialist',
    type: 'Specialist',
    totalCredits: 12,
    firstYearCourses: ['BIO120H1', 'BIO130H1', 'CHM135H1', 'CHM136H1'],
    requiredCourses: [
      'BIO120H1', 'BIO130H1', 'BIO220H1', 'BIO230H1',
      'BCH210H1', 'HMB265H1', 'PSL300H1',
    ],
    electiveSets: [
      {
        label: 'HMB upper year',
        minCredits: 3.0,
        options: ['HMB300H1', 'HMB301H1', 'HMB302H1', 'HMB321H1', 'HMB420H1', 'HMB440H1'],
      },
    ],
    gradSchoolElectives: ['HMB420H1', 'PSL301H1', 'HMB301H1'],
    industryElectives: ['HMB302H1', 'HMB321H1'],
    notes: 'For students interested in medicine or graduate studies in biomedical sciences.',
  },

  'Neuroscience Specialist': {
    name: 'Neuroscience Specialist',
    type: 'Specialist',
    totalCredits: 12,
    firstYearCourses: ['BIO120H1', 'BIO130H1', 'PSY100H1', 'CHM135H1'],
    requiredCourses: [
      'BIO120H1', 'BIO130H1', 'PSY100H1', 'BIO230H1',
      'HMB265H1', 'PSL300H1', 'BCH210H1',
    ],
    electiveSets: [
      {
        label: 'Neuroscience core',
        minCredits: 3.0,
        options: ['HMB200H1', 'HMB300H1', 'HMB420H1', 'PSL301H1', 'PSY290H1', 'PSY390H1'],
      },
    ],
    gradSchoolElectives: ['HMB420H1', 'HMB300H1', 'PSY390H1'],
    industryElectives: ['PSY290H1', 'PSL301H1'],
    notes: 'Interdisciplinary bio + psych + chemistry.',
  },

  'Psychology Specialist': {
    name: 'Psychology Specialist',
    type: 'Specialist',
    totalCredits: 10,
    firstYearCourses: ['PSY100H1'],
    requiredCourses: [
      'PSY100H1', 'PSY201H1', 'PSY202H1',
    ],
    electiveSets: [
      {
        label: 'Core breadth (pick from each category)',
        minCredits: 3.0,
        options: ['PSY220H1', 'PSY230H1', 'PSY240H1', 'PSY260H1', 'PSY270H1', 'PSY280H1', 'PSY290H1'],
      },
      {
        label: 'PSY 300/400 level',
        minCredits: 4.0,
        options: ['PSY320H1', 'PSY322H1', 'PSY330H1', 'PSY340H1', 'PSY360H1', 'PSY370H1', 'PSY380H1'],
      },
    ],
    gradSchoolElectives: ['PSY201H1', 'PSY202H1', 'PSY493H1'],
    industryElectives: ['PSY240H1', 'PSY220H1', 'PSY270H1'],
    notes: 'Research-oriented specialist. Strong stats background helpful.',
  },

  'Psychology Major': {
    name: 'Psychology Major',
    type: 'Major',
    totalCredits: 6,
    firstYearCourses: ['PSY100H1'],
    requiredCourses: ['PSY100H1', 'PSY201H1', 'PSY202H1'],
    electiveSets: [
      {
        label: 'PSY breadth',
        minCredits: 1.5,
        options: ['PSY220H1', 'PSY230H1', 'PSY240H1', 'PSY260H1', 'PSY270H1', 'PSY280H1', 'PSY290H1'],
      },
      {
        label: 'PSY 300+ electives',
        minCredits: 2.0,
        options: ['PSY320H1', 'PSY322H1', 'PSY330H1', 'PSY340H1', 'PSY360H1'],
      },
    ],
    gradSchoolElectives: ['PSY493H1', 'PSY202H1'],
    industryElectives: ['PSY240H1', 'PSY220H1'],
    notes: 'Flexible major. Combine with neuroscience or sociology.',
  },

  'Sociology Specialist': {
    name: 'Sociology Specialist',
    type: 'Specialist',
    totalCredits: 10,
    firstYearCourses: ['SOC100H1', 'SOC150H1'],
    requiredCourses: [
      'SOC100H1', 'SOC201H1', 'SOC202H1',
      'SOC203H1', 'SOC204H1', 'SOC205H1',
    ],
    electiveSets: [
      {
        label: 'SOC 300/400 electives',
        minCredits: 4.0,
        options: ['SOC301H1', 'SOC302H1', 'SOC303H1', 'SOC304H1', 'SOC310H1', 'SOC354H1', 'SOC355H1'],
      },
    ],
    gradSchoolElectives: ['SOC201H1', 'SOC202H1', 'SOC205H1'],
    industryElectives: ['SOC203H1', 'SOC204H1'],
    notes: 'Theory + methods focused. Good for law school or grad school.',
  },

  'Sociology Major': {
    name: 'Sociology Major',
    type: 'Major',
    totalCredits: 6,
    firstYearCourses: ['SOC100H1'],
    requiredCourses: ['SOC100H1', 'SOC201H1', 'SOC203H1'],
    electiveSets: [
      {
        label: 'SOC electives',
        minCredits: 3.0,
        options: ['SOC202H1', 'SOC204H1', 'SOC205H1', 'SOC301H1', 'SOC302H1', 'SOC310H1'],
      },
    ],
    gradSchoolElectives: ['SOC201H1', 'SOC202H1', 'SOC205H1'],
    industryElectives: ['SOC203H1', 'SOC204H1'],
    notes: 'Flexible. Good complement to law, politics, or social work.',
  },
}

// ── Matching Algorithm ────────────────────────────────────────

export function getProgramPlan(
  programName: string,
  completedCourses: string[],
  goals: string,
  startingYear: number = 1
): {
  programData: ProgramRequirements | null
  remainingRequired: CourseInfo[]
  recommendedElectives: CourseInfo[]
  completedCount: number
  totalRequired: number
  prereqMet: (courseCode: string) => boolean
} {
  const programData = PROGRAM_REQUIREMENTS[programName] || null
  if (!programData) {
    return {
      programData: null,
      remainingRequired: [],
      recommendedElectives: [],
      completedCount: 0,
      totalRequired: 0,
      prereqMet: () => false,
    }
  }

  const completed = new Set(completedCourses.map(c => c.toUpperCase().replace(' ', '')))

  const prereqMet = (code: string): boolean => {
    const course = COURSES[code]
    if (!course) return true
    return course.prereqs.every(p => completed.has(p))
  }

  const remainingRequired = programData.requiredCourses
    .filter(code => !completed.has(code))
    .map(code => COURSES[code])
    .filter(Boolean)

  const goalLower = goals.toLowerCase()
  let electiveCodes: string[] = []
  if (goalLower.includes('grad') || goalLower.includes('research')) {
    electiveCodes = programData.gradSchoolElectives
  } else {
    electiveCodes = programData.industryElectives
  }

  const recommendedElectives = electiveCodes
    .filter(code => !completed.has(code))
    .map(code => COURSES[code])
    .filter(Boolean)

  return {
    programData,
    remainingRequired,
    recommendedElectives,
    completedCount: programData.requiredCourses.filter(c => completed.has(c)).length,
    totalRequired: programData.requiredCourses.length,
    prereqMet,
  }
}
