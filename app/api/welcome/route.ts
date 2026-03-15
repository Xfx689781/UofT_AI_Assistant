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

    // Normalize completed set — strip spaces and uppercase
    const completedSet = new Set(
      completed.flatMap((c: string) => {
        const norm = c.toUpperCase().replace(/\s/g, '')
        // Also store without suffix for flexible matching e.g. MAT137 matches MAT137Y1
        const base = norm.replace(/(H1|H2|Y1|Y2)$/, '')
        return [norm, base]
      })
    )

    const has = (code: string) => {
      const norm = code.toUpperCase().replace(/\s/g, '')
      const base = norm.replace(/(H1|H2|Y1|Y2)$/, '')
      return completedSet.has(norm) || completedSet.has(base)
    }

    const hasMat157 = has('MAT157Y1')
    const hasMat137 = has('MAT137Y1')
    const hasMat135 = has('MAT135H1')
    const hasMat237 = has('MAT237Y1')
    const hasMat240 = has('MAT240H1')
    const hasMat246 = has('MAT246H1')
    const hasMat247 = has('MAT247H1')
    const hasMat257 = has('MAT257Y1')
    const hasMat327 = has('MAT327H1')
    const hasMat337 = has('MAT337H1')
    const hasMat347 = has('MAT347Y1')
    const hasMat357 = has('MAT357H1')
    const hasCSC148 = has('CSC148H1')
    const hasCSC165 = has('CSC165H1')
    const hasCSC207 = has('CSC207H1')
    const hasCSC209 = has('CSC209H1')
    const hasCSC236 = has('CSC236H1')
    const hasCSC240 = has('CSC240H1')
    const hasCSC258 = has('CSC258H1')
    const hasCSC263 = has('CSC263H1')
    const hasCSC311 = has('CSC311H1')
    const hasSTA130 = has('STA130H1')
    const hasSTA237 = has('STA237H1')
    const hasSTA238 = has('STA238H1')
    const hasSTA257 = has('STA257H1')
    const hasSTA302 = has('STA302H1')
    const hasMat223 = has('MAT223H1')

    const isHighCapacity = studyHours === '20-30h' || studyHours === '30h+'
    const isGradSchool = goals.toLowerCase().includes('grad') || goals.toLowerCase().includes('research')
    const isMath = program.toLowerCase().includes('math') || interests.includes('Pure Mathematics')
    const isCS = program.toLowerCase().includes('computer') || interests.includes('Computer Science')
    const isStats = program.toLowerCase().includes('stat') || program.toLowerCase().includes('data') || interests.includes('Statistics')
    const isLifeSci = program.toLowerCase().includes('bio') || program.toLowerCase().includes('neuro') || interests.includes('Biology')
    const isPhysics = program.toLowerCase().includes('physics') || interests.includes('Physics')
    const isEcon = program.toLowerCase().includes('econ') || interests.includes('Economics')
    const isSpecialist = program.toLowerCase().includes('specialist')
    const isMathSpecialist = program.toLowerCase().includes('mathematics specialist') || program.toLowerCase().includes('math specialist')
    const isCSSpecialist = program.toLowerCase().includes('computer science specialist')

    const shortLower = shortAnswer.toLowerCase()
    const wantsMat157 = shortLower.includes('157') || shortLower.includes('challenge') || shortLower.includes('ambitious') || shortLower.includes('push myself')
    const wantsMinimalMath = shortLower.includes('minimize math') || shortLower.includes('just need to pass') || shortLower.includes('hate math') || shortLower.includes('math is secondary')
    const wantsAccelerate = shortLower.includes('accelerate') || shortLower.includes('ahead of schedule') || shortLower.includes('as many as possible')
    const isVeryConfident = selfAssessment === 'strong' && (isHighCapacity || isGradSchool)

    const yearLabel = yearType === 'first' ? 'First Year' : yearType === 'second' ? 'Second Year' : 'Third or Fourth Year'

    // Semester labels
    const s1 = yearType === 'first' ? 'First Year Fall' : yearType === 'second' ? 'Second Year Fall' : 'Third Year Fall'
    const s2 = yearType === 'first' ? 'First Year Winter' : yearType === 'second' ? 'Second Year Winter' : 'Third Year Winter'
    const s3 = 'Fourth Year Fall'
    const s4 = 'Fourth Year Winter'

    // Build unlocked courses based on completed
    const unlocked: string[] = []
    if (hasMat137 || hasMat157) {
      if (!has('MAT240H1')) unlocked.push('MAT240H1')
      if (!has('MAT246H1') && hasMat223) unlocked.push('MAT246H1')
      if (!has('MAT237Y1')) unlocked.push('MAT237Y1')
      if (!has('STA237H1') && hasSTA130) unlocked.push('STA237H1')
    }
    if (hasMat157) {
      if (!has('MAT257Y1') && hasMat247) unlocked.push('MAT257Y1')
      if (!has('MAT267H1') && hasMat240) unlocked.push('MAT267H1')
    }
    if (hasMat247) {
      if (!has('MAT257Y1') && hasMat157) unlocked.push('MAT257Y1')
    }
    if (hasMat257) {
      if (!has('MAT327H1')) unlocked.push('MAT327H1')
      if (!has('MAT354H1')) unlocked.push('MAT354H1')
      if (!has('MAT357H1')) unlocked.push('MAT357H1')
      if (!has('MAT347Y1')) unlocked.push('MAT347Y1')
    }
    if (hasMat337) unlocked.push(...['MAT338H1'].filter(c => !has(c)))
    if (hasMat347) unlocked.push(...['MAT415H1', 'MAT445H1', 'MAT448H1'].filter(c => !has(c)))
    if (hasMat357) unlocked.push(...['MAT457H1'].filter(c => !has(c)))
    if (hasCSC148 && hasCSC165) {
      if (!hasCSC207) unlocked.push('CSC207H1')
      if (!has('CSC236H1')) unlocked.push('CSC236H1')
    }
    if (hasCSC148 && hasCSC240) {
      if (!hasCSC207) unlocked.push('CSC207H1')
    }
    if (hasCSC207 && hasCSC236) {
      if (!hasCSC263) unlocked.push('CSC263H1')
    }
    if (hasCSC263) {
      unlocked.push(...['CSC373H1', 'CSC384H1', 'CSC343H1', 'CSC473H1'].filter(c => !has(c)))
    }
    if (hasCSC311) {
      unlocked.push(...['CSC412H1', 'CSC413H1'].filter(c => !has(c)))
    }
    if (hasSTA237) unlocked.push(...['STA238H1'].filter(c => !has(c)))
    if (hasSTA302) unlocked.push(...['STA303H1', 'STA365H1', 'STA437H1', 'STA457H1', 'STA410H1'].filter(c => !has(c)))

    const selfCtx = selfAssessment === 'shaky'
      ? yearType === 'first'
        ? 'SHAKY FIRST YEAR: Prefer MAT135+MAT136 over MAT137Y1. Light load.'
        : 'SHAKY UPPER YEAR: Do NOT go back to first-year courses. Keep load manageable, max 4 per semester. Fill missing prereqs at current level only.'
      : selfAssessment === 'strong'
        ? yearType === 'first'
          ? 'STRONG FIRST YEAR: Consider MAT157Y1 for math-focused students. MAT240H1 alongside MAT157Y1 for very ambitious. CSC240H1 for theory CS. Read short answer carefully.'
          : yearType === 'second'
            ? 'STRONG SECOND YEAR: Push harder combinations. Strong math: MAT257Y1+MAT267H1 together. Strong CS: CSC265H1 over CSC263H1. Be aggressive.'
            : 'STRONG THIRD/FOURTH YEAR: Be very ambitious. Include 400-level MAT/CSC/STA courses wherever prereqs are met. Do not hold back. Student wants to be pushed.'
        : 'SOLID: Standard progression.'

    const futureMap: Record<string, string> = {
      'ml-ai': 'Priority courses: CSC311H1 -> CSC412H1 + CSC413H1 + CSC486H1. Also: STA302H1 + STA347H1 + STA314H1 + CSC384H1.',
      'systems': 'Priority: CSC369H1 + CSC458H1 + CSC209H1. Upper: CSC469H1.',
      'theory-cs': 'Priority: CSC373H1 + CSC448H1 + CSC463H1 + CSC473H1. Also MAT344H1 + APM461H1.',
      'vision-graphics': 'Priority: CSC420H1 + CSC317H1. Needs MAT237Y1 + MAT223H1.',
      'nlp': 'Priority: CSC401H1 + CSC485H1 + CSC311H1.',
      'pure-math': 'Priority: MAT347Y1 + MAT327H1 + MAT354H1 + MAT357H1. Upper: MAT415H1 + MAT425H1 + MAT445H1 + MAT448H1 + MAT454H1 + MAT457H1 + MAT458H1.',
      'analysis': 'Priority: MAT337H1 + MAT354H1 + MAT357H1. Upper: MAT457H1 + MAT458H1 + APM346H1 + APM446H1.',
      'algebra': 'Priority: MAT347Y1 + MAT301H1 + MAT315H1. Upper: MAT401H1 + MAT415H1 + MAT445H1 + MAT448H1.',
      'stats-data': 'Priority: STA302H1 + STA303H1 + STA347H1. Upper: STA437H1 + STA410H1 + STA457H1 + STA447H1 + STA314H1 + STA414H1.',
      'quant-finance': 'Priority: STA347H1 + STA261H1 + MAT337H1 + ECO358H1.',
      'bio-research': 'Priority: BIO230H1 + BIO240H1 + STA237H1 + STA238H1.',
      'neuro': 'Priority: PSY270H1 + PSY230H1 + STA237H1.',
      'physics-research': 'Priority: PHY254H1 + PHY256H1 + PHY350H1 + PHY354H1.',
      'grad-math': 'Priority: MAT347Y1 + MAT327H1 + MAT354H1 + MAT357H1. Then: MAT415H1 + MAT425H1 + MAT445H1 + MAT448H1 + MAT454H1 + MAT457H1 + MAT458H1 + MAT475H1.',
      'grad-cs': 'Priority: CSC311H1 + CSC373H1 + CSC412H1 + CSC413H1 + CSC494H1.',
      'industry-swe': 'Priority: CSC343H1 + CSC369H1 + CSC209H1. Then: CSC458H1 + CSC309H1.',
      'other': 'Balanced breadth across interests.',
    }
    const futureCtx = futureDirection ? 'FUTURE DIRECTION — ' + futureDirection + ': ' + (futureMap[futureDirection] || '') : ''

    const systemPrompt = `You are an expert UofT academic advisor. Your job is to build a realistic, personalized, ambitious course plan.

CRITICAL RULES:
1. Y1 courses (ending in Y1) span full year. Put them in Fall semester JSON only. NEVER put them in Winter.
2. Calculus path — pick exactly ONE: (a) MAT137Y1 alone, OR (b) MAT157Y1 alone, OR (c) MAT135H1 Fall + MAT136H1 Winter. Never mix.
3. NEVER include courses from the completed list.
4. NEVER include a course whose prerequisites are not in the completed list.
5. CSC110Y1 + CSC111H1 are ONLY for CS stream first-year students (admitted directly to CS).
6. STA237H1 needs MAT137Y1 already completed. STA257H1 needs MAT137Y1 or MAT157Y1 already completed.

SEMESTER REQUIREMENTS:
- First/Second year: return exactly 2 semesters with 4-5 courses each (8-10 total).
- Third/Fourth year: return exactly 4 semesters: "${s1}", "${s2}", "${s3}", "${s4}" — with 3-5 courses each (14-20 total).

AMBITION:
- selfAssessment=strong means push hard. Include 400-level courses. Do not be conservative.
- For third/fourth year strong students: MAT415H1, MAT425H1, MAT445H1, MAT448H1, MAT454H1, MAT457H1, MAT458H1, STA447H1, STA414H1, CSC494H1 are all fair game if prereqs met.
- Short answer overrides everything. If student mentions specific courses, include them.

BREADTH: Every plan needs 1-2 courses outside main department unless student explicitly says not to.`

    const completedStr = completed.length > 0 ? JSON.stringify(completed) : 'none'
    const unlockedStr = unlocked.length > 0 ? unlocked.slice(0, 20).join(', ') : 'check prereqs manually'

    const userPrompt = `Build a course plan for ${profile.name}.

PROGRAM: ${program} (${isSpecialist ? 'Specialist' : 'Major/Minor'})
YEAR: ${yearLabel}
GOALS: ${goals || 'not specified'}
LEARNING STYLE: ${learningStyle}
STUDY HOURS/WEEK: ${studyHours}
INTERESTS: ${JSON.stringify(interests)}

COMPLETED COURSES (do NOT include any of these):
${completedStr}

COURSES UNLOCKED BY COMPLETED PREREQS (prioritize these):
${unlockedStr}

SELF-ASSESSMENT: ${selfCtx}

${futureCtx}

STUDENT IN THEIR OWN WORDS (most important — let this override the templates):
"${shortAnswer}"

KEY FLAGS:
- Has MAT157: ${hasMat157} | Has MAT137: ${hasMat137} | Has MAT135 only: ${hasMat135 && !hasMat137 && !hasMat157}
- Has MAT237: ${hasMat237} | Has MAT257: ${hasMat257} | Has MAT240: ${hasMat240} | Has MAT246: ${hasMat246} | Has MAT247: ${hasMat247}
- Has MAT327: ${hasMat327} | Has MAT337: ${hasMat337} | Has MAT347: ${hasMat347} | Has MAT357: ${hasMat357}
- Has CSC148: ${hasCSC148} | Has CSC165: ${hasCSC165} | Has CSC240: ${hasCSC240} | Has CSC207: ${hasCSC207} | Has CSC209: ${hasCSC209}
- Has CSC236: ${hasCSC236} | Has CSC258: ${hasCSC258} | Has CSC263: ${hasCSC263} | Has CSC311: ${hasCSC311}
- Has STA130: ${hasSTA130} | Has STA237: ${hasSTA237} | Has STA238: ${hasSTA238} | Has STA257: ${hasSTA257} | Has STA302: ${hasSTA302}
- Is Math Specialist: ${isMathSpecialist} | Is CS Specialist: ${isCSSpecialist}
- Very confident: ${isVeryConfident} | Grad school: ${isGradSchool} | High capacity: ${isHighCapacity}
- Wants MAT157: ${wantsMat157} | Wants minimal math: ${wantsMinimalMath} | Wants accelerate: ${wantsAccelerate}
- Math: ${isMath} | CS: ${isCS} | Stats: ${isStats} | Physics: ${isPhysics} | LifeSci: ${isLifeSci} | Econ: ${isEcon}

${yearType === 'third+' ? `THIRD/FOURTH YEAR INSTRUCTIONS:
You MUST return 4 semesters: "${s1}", "${s2}", "${s3}", "${s4}".
There are NO fixed course requirements at this stage. Base everything on:
1. What is unlocked by completed courses
2. The future direction: ${futureDirection || 'not specified'}
3. The student short answer
4. Self-assessment: ${selfAssessment}
Be creative and ambitious. Strong students should see 400-level courses.` : ''}

Return ONLY valid JSON in this exact format:
{
  "message": "2-3 sentences to ${profile.name} referencing their own words and explaining key decisions made",
  "courseSchedule": [
    {
      "semester": "${s1}",
      "courses": [
        {
          "code": "COURSE_CODE",
          "name": "Course Name",
          "reason": "personalized reason for this student",
          "type": "required",
          "coreTopics": ["topic1", "topic2", "topic3"],
          "whyNow": "why this semester specifically"
        }
      ]
    }${yearType === 'third+' ? `,
    { "semester": "${s2}", "courses": [] },
    { "semester": "${s3}", "courses": [] },
    { "semester": "${s4}", "courses": [] }` : `,
    { "semester": "${s2}", "courses": [] }`}
  ],
  "degreeProgress": {
    "completedCredits": ${completed.length * 0.5},
    "requiredCredits": 20,
    "remainingRequired": ["list key remaining courses"],
    "nextMilestone": "concrete next milestone"
  },
  "advisorNote": "One honest paragraph about the philosophy of this plan and what comes after"
}`

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

      const schedule: SemItem[] = parsed.courseSchedule || []

      // Minimal code-level enforcement: only remove completed courses and fix Y1 duplication
      // Do NOT aggressively filter — trust the AI, only patch obvious errors

      // 1. Remove completed courses
      const step1 = schedule.map((sem: SemItem) => ({
        ...sem,
        courses: sem.courses.filter((c: CourseItem) => {
          const norm = c.code.toUpperCase().replace(/\s/g, '')
          const base = norm.replace(/(H1|H2|Y1|Y2)$/, '')
          return !completedSet.has(norm) && !completedSet.has(base)
        }),
      }))

      // 2. Find calculus path in plan
      const allPlanCodes = step1.flatMap((s: SemItem) => s.courses.map((c: CourseItem) => c.code.toUpperCase().replace(/\s/g, '')))
      const planHas137 = allPlanCodes.includes('MAT137Y1')
      const planHas157 = allPlanCodes.includes('MAT157Y1')

      // 3. Remove mutual exclusions only for calculus
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

      // 4. Deduplicate Y1 courses (only keep first occurrence across all semesters)
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

      // 5. Add Y1 courses to Winter semesters for display continuity
      const fallSemesters = step3.filter((s: SemItem) => s.semester.toLowerCase().includes('fall'))
      const finalSchedule = step3.map((sem: SemItem, idx: number) => {
        if (!sem.semester.toLowerCase().includes('winter')) return sem
        // Find the fall semester that precedes this winter
        const precedingFall = idx > 0 ? step3[idx - 1] : fallSemesters[0]
        if (!precedingFall) return sem
        const y1Continuations = precedingFall.courses
          .filter((c: CourseItem) => c.code.toUpperCase().endsWith('Y1'))
          .map((c: CourseItem) => ({
            ...c,
            whyNow: 'Full year course — continues from Fall semester.',
          }))
        const alreadyPresent = sem.courses.some((c: CourseItem) =>
          y1Continuations.some((y: CourseItem) => y.code === c.code)
        )
        if (alreadyPresent || y1Continuations.length === 0) return sem
        return { ...sem, courses: [...y1Continuations, ...sem.courses] }
      })

      // 6. If filtering wiped everything, return raw AI output as fallback
      const hasContent = finalSchedule.some((s: SemItem) => s.courses.length > 0)
      const outputSchedule = hasContent ? finalSchedule : schedule

      return NextResponse.json({
        message: parsed.message || '',
        courseSchedule: outputSchedule,
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
