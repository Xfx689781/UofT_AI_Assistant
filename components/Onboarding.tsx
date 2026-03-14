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
    const interests = profile.interests || []
    const learningStyle = profile.learningStyle || ''
    const studyHours = profile.studyHoursPerWeek || '10–20h'
    const examPref = profile.examPreference || ''

    const completedSet = new Set(completed.map((c: string) => c.toUpperCase().replace(/\s/g, '')))

    // Infer student capability level from completed courses
    const hardCourses = ['MAT157Y1', 'MAT257Y1', 'MAT240H1', 'MAT247H1', 'CSC265H1', 'MAT267H1']
    const mediumCourses = ['MAT137Y1', 'MAT237Y1', 'MAT246H1', 'CSC236H1', 'CSC263H1', 'STA347H1']
    const completedHard = completed.filter(c => hardCourses.some(h => h.startsWith(c.toUpperCase().replace(/\s/g, '').replace('H1','').replace('Y1',''))))
    const completedMedium = completed.filter(c => mediumCourses.some(h => h.startsWith(c.toUpperCase().replace(/\s/g, '').replace('H1','').replace('Y1',''))))

    const isHighCapacity = studyHours === '20–30h' || studyHours === '30h+' || completedHard.length > 0
    const isGradSchool = goals.toLowerCase().includes('grad') || goals.toLowerCase().includes('research') || goals.toLowerCase().includes('theoretical')
    const isIndustry = goals.toLowerCase().includes('industry') || goals.toLowerCase().includes('job')
    const isMath = program.toLowerCase().includes('math') || interests.includes('Pure Mathematics')
    const isCS = program.toLowerCase().includes('computer') || interests.includes('Computer Science')
    const isStats = program.toLowerCase().includes('stat') || program.toLowerCase().includes('data') || interests.includes('Statistics')
    const isLifeSci = program.toLowerCase().includes('bio') || program.toLowerCase().includes('neuro') || interests.includes('Biology')
    const isPsych = program.toLowerCase().includes('psych') || interests.includes('Psychology')
    const isSpecialist = program.toLowerCase().includes('specialist')
    const hasMat157 = completedSet.has('MAT157Y1') || completedSet.has('MAT157')
    const hasMat137 = completedSet.has('MAT137Y1') || completedSet.has('MAT137')
    const hasMat237 = completedSet.has('MAT237Y1') || completedSet.has('MAT237')
    const hasMat240 = completedSet.has('MAT240H1') || completedSet.has('MAT240')
    const hasCSC148 = completedSet.has('CSC148H1') || completedSet.has('CSC148')
    const hasCSC207 = completedSet.has('CSC207H1') || completedSet.has('CSC207')

    const yearLabel = yearType === 'first' ? 'First Year' : yearType === 'second' ? 'Second Year' : 'Third/Fourth Year'

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
            content: `You are a brilliant UofT upperclassman giving course advice to a fellow student. You are direct, opinionated, and academically ambitious. You give REAL advice based on the student's actual ability level and goals.

PHILOSOPHY:
- Strong students get HARD courses. Weak students get manageable courses. No padding.
- Cross-disciplinary breadth is important — a math specialist should know some CS/Stats, a CS student should know some math theory
- You recommend what will genuinely build the student's intellectual foundation, not just what's "on the checklist"
- Be specific about WHY each course matters for this exact student
- Don't recommend courses they've already taken

COURSE ACCURACY RULES (CRITICAL):
- MAT237Y1 = Multivariable Calculus (NOT Mathematical Reasoning, NOT Probability Theory)
- MAT246H1 = Abstract Mathematics (proof techniques, logic, sets)
- MAT240H1 = Algebra I (abstract linear algebra with proofs)
- MAT247H1 = Algebra II (modules, canonical forms)
- MAT257Y1 = Analysis II (multivariable analysis on manifolds, rigorous)
- MAT267H1 = Advanced ODEs (rigorous ODEs for specialist track)
- MAT301H1 = Groups and Symmetries (group theory)
- MAT327H1 = Introduction to Topology
- MAT334H1 = Complex Variables
- MAT337H1 = Introduction to Real Analysis
- MAT347Y1 = Groups, Rings and Fields
- MAT354H1 = Complex Analysis I
- MAT357H1 = Foundations of Real Analysis (measure theory)
- MAT363H1 = Introduction to Differential Geometry
- MAT315H1 = Introduction to Number Theory
- MAT344H1 = Introduction to Combinatorics
- STA257H1 = Probability and Statistics I (rigorous, for stat specialist)
- STA261H1 = Probability and Statistics II
- STA347H1 = Probability (rigorous probability theory)
- STA302H1 = Methods of Data Analysis I (regression)
- CSC236H1 = Introduction to Theory of Computation
- CSC258H1 = Computer Organization (digital logic, assembly)
- CSC263H1 = Data Structures and Analysis
- CSC311H1 = Introduction to Machine Learning
- CSC373H1 = Algorithm Design
- CSC369H1 = Operating Systems

PREREQUISITE RULES:
- MAT257Y1 → needs MAT157Y1
- MAT267H1 → needs MAT157Y1 + MAT240H1
- MAT240H1 → needs MAT137Y1
- MAT247H1 → needs MAT240H1
- MAT237Y1 → needs MAT137Y1
- MAT327H1 → needs MAT257Y1
- MAT347Y1 → needs MAT247H1
- MAT337H1 → needs MAT237Y1 + MAT246H1
- MAT354H1 → needs MAT257Y1
- MAT357H1 → needs MAT257Y1
- STA257H1 → needs MAT137Y1
- STA261H1 → needs STA257H1
- STA347H1 → needs MAT237Y1 + STA238H1
- CSC263H1 → needs CSC207H1 + CSC236H1
- CSC311H1 → needs CSC207H1 + MAT237Y1 + STA238H1
- CSC373H1 → needs CSC263H1
- CSC369H1 → needs CSC209H1 + CSC263H1`,
          },
          {
            role: 'user',
            content: `Give course recommendations for this UofT student.

STUDENT:
- Name: ${profile.name}
- Program: ${program}
- Year: ${yearLabel}
- Completed: ${JSON.stringify(completed)}
- Goals: ${goals}
- Learning style: ${learningStyle}
- Study hours: ${studyHours}
- Exam preference: ${examPref}
- Interests: ${JSON.stringify(interests)}

DERIVED PROFILE:
- Capability: ${isHighCapacity ? 'HIGH — can handle hard courses' : 'MODERATE — standard load'}
- Math track: ${hasMat157 ? 'MAT157 track (specialist/hard)' : hasMat137 ? 'MAT137 track (standard)' : 'No calc yet'}
- Has MAT237: ${hasMat237}
- Has MAT240: ${hasMat240}
- Is specialist: ${isSpecialist}
- Grad school bound: ${isGradSchool}
- Industry focused: ${isIndustry}
- Math student: ${isMath}
- CS student: ${isCS}
- Stats student: ${isStats}
- Life sci student: ${isLifeSci}
- Psych student: ${isPsych}

Based on this profile, recommend 6-10 courses this student should take NEXT (courses they haven't taken yet, with prereqs met).

For a STRONG student (MAT157 done, specialist, grad school):
→ Push them toward MAT257, MAT240, MAT267, MAT315, MAT327, STA257, CSC236
→ Cross-disciplinary: if math specialist, also recommend 1-2 stats/CS courses

For a MODERATE student (MAT137 track, major):
→ MAT237, MAT246, MAT240, STA237, then upper-year based on prereqs

For a LIFE SCI / PSYCH student:
→ Their program requirements first, then quantitative electives that serve their field
→ Don't push pure math theory on them unless they asked for it

For a CS student:
→ CSC263, CSC369, CSC373, CSC311, CSC343
→ If strong math background, add MAT337 or STA347

Be OPINIONATED. If a student has MAT157 and is a math specialist aiming for grad school, tell them to take MAT257 + MAT240 + STA257 + MAT267 next — don't be shy.

Return ONLY this JSON:
{
  "message": "2-3 sentences directly addressing ${profile.name} by name — acknowledge their specific background (e.g. 'Since you've completed MAT157 and are aiming for grad school...'), give one concrete piece of advice",
  "courseRecommendations": [
    {
      "code": "MAT257Y1",
      "name": "Analysis II",
      "priority": "essential",
      "reason": "You have MAT157 — this is your next natural step. Covers multivariable analysis rigorously: differential forms, analysis on manifolds, Stokes theorem, multilinear algebra. Essential for any serious math graduate program.",
      "coreTopics": ["Differential forms", "Analysis on manifolds", "Stokes theorem", "Multilinear algebra", "Inverse function theorem"],
      "prereqsMet": true,
      "difficulty": "hard",
      "workload": 15,
      "crossDiscipline": false
    }
  ],
  "degreeProgress": {
    "completedCredits": ${completed.length * 0.5},
    "requiredCredits": 20,
    "remainingRequired": ["key remaining required courses as codes"],
    "nextMilestone": "specific milestone for this student"
  },
  "advisorNote": "One paragraph of direct advice — be specific, be honest, be ambitious for this student"
}`,
          },
        ],
      }),
    })

    const data = await response.json()
    if (data.error) return NextResponse.json({ error: data.error.message || 'OpenRouter error' }, { status: 500 })

    const raw = data.choices?.[0]?.message?.content?.trim() || ''
    try {
      const parsed = JSON.parse(raw)

      // Filter out completed courses
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
