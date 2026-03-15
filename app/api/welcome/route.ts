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
    const studyHours = profile.studyHoursPerWeek || '10-20h'
    const examPref = profile.examPreference || ''

    const completedSet = new Set(completed.map((c: string) => c.toUpperCase().replace(/\s/g, '')))

    const hasMat157 = completedSet.has('MAT157Y1') || completedSet.has('MAT157')
    const hasMat137 = completedSet.has('MAT137Y1') || completedSet.has('MAT137')
    const hasMat237 = completedSet.has('MAT237Y1') || completedSet.has('MAT237')
    const hasMat240 = completedSet.has('MAT240H1') || completedSet.has('MAT240')
    const isHighCapacity = studyHours === '20-30h' || studyHours === '30h+' || hasMat157
    const isGradSchool = goals.toLowerCase().includes('grad') || goals.toLowerCase().includes('research') || goals.toLowerCase().includes('theoretical')
    const isIndustry = goals.toLowerCase().includes('industry') || goals.toLowerCase().includes('job')
    const isMath = program.toLowerCase().includes('math') || interests.includes('Pure Mathematics')
    const isCS = program.toLowerCase().includes('computer') || interests.includes('Computer Science')
    const isStats = program.toLowerCase().includes('stat') || program.toLowerCase().includes('data') || interests.includes('Statistics')
    const isLifeSci = program.toLowerCase().includes('bio') || program.toLowerCase().includes('neuro') || interests.includes('Biology')
    const isPsych = program.toLowerCase().includes('psych') || interests.includes('Psychology')
    const isSpecialist = program.toLowerCase().includes('specialist')
    const yearLabel = yearType === 'first' ? 'First Year' : yearType === 'second' ? 'Second Year' : 'Third/Fourth Year'

    const recommendationLogic = [
      hasMat157 && isSpecialist && isGradSchool ? 'PUSH HARD: MAT257 MAT240 MAT267 STA257 MAT315 MAT327 this student can handle it' : '',
      hasMat157 && !isGradSchool ? 'MAT257 MAT240 STA257 cross into CS or Stats' : '',
      hasMat137 && !hasMat237 && isMath ? 'MAT237 MAT246 MAT240 are immediate next steps' : '',
      isCS && !isHighCapacity ? 'CSC263 CSC209 CSC369 CSC343 based on prereqs' : '',
      isCS && isHighCapacity ? 'CSC263 CSC369 CSC373 CSC311 consider MAT337 for theory depth' : '',
      isStats && hasMat137 ? 'STA237 or STA257 then MAT237 then STA302 STA347' : '',
      isLifeSci ? 'Program requirements first then quantitative electives relevant to field' : '',
      isPsych ? 'Program requirements PSY stats courses maybe STA237 if quantitative' : '',
    ].filter(Boolean).join('; ')

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
            content: 'You are a brilliant UofT upperclassman giving direct opinionated course advice. Strong students get hard courses. Weak students get manageable ones. Be specific and ambitious. CRITICAL course names: MAT237Y1=Multivariable Calculus, MAT246H1=Abstract Mathematics, MAT240H1=Algebra I, MAT247H1=Algebra II, MAT257Y1=Analysis II, MAT267H1=Advanced ODEs, MAT301H1=Groups and Symmetries, MAT315H1=Number Theory, MAT327H1=Topology, MAT334H1=Complex Variables, MAT337H1=Real Analysis, MAT347Y1=Groups Rings and Fields, MAT354H1=Complex Analysis I, MAT357H1=Foundations of Real Analysis, STA257H1=Probability and Statistics I, STA261H1=Probability and Statistics II, STA347H1=Probability, CSC263H1=Data Structures and Analysis, CSC311H1=Machine Learning, CSC373H1=Algorithm Design, CSC369H1=Operating Systems. PREREQUISITES: MAT257Y1 needs MAT157Y1. MAT267H1 needs MAT157Y1 and MAT240H1. MAT240H1 needs MAT137Y1. MAT247H1 needs MAT240H1. MAT237Y1 needs MAT137Y1. MAT327H1 needs MAT257Y1. MAT347Y1 needs MAT247H1. MAT337H1 needs MAT237Y1 and MAT246H1. STA257H1 needs MAT137Y1. STA347H1 needs MAT237Y1 and STA238H1. CSC263H1 needs CSC207H1 and CSC236H1. CSC311H1 needs CSC207H1 and MAT237Y1 and STA238H1.',
          },
          {
            role: 'user',
            content: `Recommend courses for this UofT student.

PROFILE:
- Name: ${profile.name}
- Program: ${program} (${isSpecialist ? 'Specialist' : 'Major/Minor'})
- Year: ${yearLabel}
- Completed: ${JSON.stringify(completed)}
- Goals: ${goals}
- Learning style: ${learningStyle}
- Study hours: ${studyHours}
- Exam preference: ${examPref}
- Interests: ${JSON.stringify(interests)}

DERIVED:
- Capability: ${isHighCapacity ? 'HIGH' : 'MODERATE'}
- Math track: ${hasMat157 ? 'MAT157 hard track' : hasMat137 ? 'MAT137 standard' : 'No calc yet'}
- Has MAT237: ${hasMat237}, Has MAT240: ${hasMat240}
- Grad school: ${isGradSchool}, Industry: ${isIndustry}
- Math: ${isMath}, CS: ${isCS}, Stats: ${isStats}, LifeSci: ${isLifeSci}, Psych: ${isPsych}

RECOMMENDATION LOGIC: ${recommendationLogic}

Recommend 6-10 courses not already completed. Cross-disciplinary picks valuable. Include 1-2 outside main field if it serves their goals.

Return ONLY this JSON:
{
  "message": "2-3 sentences to ${profile.name} acknowledging their background with one direct piece of advice",
  "courseRecommendations": [
    {
      "code": "MAT257Y1",
      "name": "Analysis II",
      "priority": "essential",
      "reason": "You have MAT157 this is your immediate next step. Rigorous multivariable analysis covering differential forms analysis on manifolds Stokes theorem and multilinear algebra. Non-negotiable for grad school in math.",
      "coreTopics": ["Differential forms", "Analysis on manifolds", "Stokes theorem", "Multilinear algebra", "Inverse and implicit function theorems"],
      "prereqsMet": true,
      "difficulty": "hard",
      "workload": 15,
      "crossDiscipline": false
    }
  ],
  "degreeProgress": {
    "completedCredits": ${completed.length * 0.5},
    "requiredCredits": 20,
    "remainingRequired": ["MAT257Y1", "MAT347Y1"],
    "nextMilestone": "specific milestone for this student"
  },
  "advisorNote": "Direct honest paragraph of advice for this specific student"
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
