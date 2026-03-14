import { NextResponse } from 'next/server'

// ... PROGRAM_CALENDAR_URLS 保持不变 ...

export async function POST(req: Request) {
  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY
    if (!openrouterKey) return NextResponse.json({ error: 'Config error' }, { status: 500 })

    const profile = await req.json()
    const { 
      name, 
      programOfStudy, 
      admissionCategory, 
      interests, 
      learningStyle, 
      coursesCompleted 
    } = profile
    
    const program = programOfStudy || admissionCategory
    const completedSet = new Set((coursesCompleted || []).map((c: string) => c.toUpperCase().replace(/\s/g, '')))

    // 1. 动态构建个性化指令 (核心改动)
    // 根据用户的兴趣和风格，动态调整 AI 的选课权重
    const personalizationPrompt = `
      USER ACADEMIC PROFILE:
      - Name: ${name}
      - Primary Interests: ${interests?.join(', ') || 'General Academic'}
      - Preferred Learning Style: ${learningStyle || 'Standard'}
      
      PLANNING GUIDELINES:
      - If interested in 'Pure Mathematics', prioritize Specialist-stream courses (e.g., MAT351, MAT357) over general electives.
      - If 'Practice-heavy', select courses with labs or projects.
      - If 'Self-study', suggest advanced seminar-style courses.
      - Ensure the plan is strictly aligned with the ${program} requirements.
      - For every course added, provide a 'reason' that explicitly connects back to the user's interests (e.g., "Perfect for your interest in Pure Math").
    `

    // 2. 调用 AI
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are an expert UofT Academic Advisor. ${personalizationPrompt}`
          },
          {
            role: 'user',
            content: `Generate a 4-year degree plan. 
            Completed courses (DO NOT INCLUDE): ${JSON.stringify(Array.from(completedSet))}.
            
            Return ONLY JSON:
            {
              "message": "A personalized greeting and tip for ${name}.",
              "courseSchedule": [
                {
                  "semester": "First Year Fall",
                  "totalWorkload": 25,
                  "courses": [
                    { "code": "...", "name": "...", "type": "...", "workload": 10, "reason": "Tailored to your interest in..." }
                  ]
                }
              ],
              "degreeProgress": { ... }
            }`
          }
        ],
      }),
    })

    const data = await response.json()
    let parsed = JSON.parse(data.choices[0].message.content)

    // 3. 后端二次清洗
    parsed.courseSchedule.forEach((sem: any) => {
        sem.courses = sem.courses.filter((c: any) => !completedSet.has(c.code.toUpperCase().replace(/\s/g, '')))
    });

    return NextResponse.json(parsed)

  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 })
  }
}
