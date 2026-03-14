import { NextResponse } from 'next/server'

const PROGRAM_CALENDAR_URLS: Record<string, string> = {
  'Mathematics Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1165',
  'Mathematics Major': 'https://artsci.calendar.utoronto.ca/program/asmaj1165',
  'Mathematics Minor': 'https://artsci.calendar.utoronto.ca/program/asmin1165',
  'Applied Mathematics Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1196',
  'Mathematics & Physics Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1312',
  'Statistical Sciences Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1169',
  'Statistics Major': 'https://artsci.calendar.utoronto.ca/program/asmaj1169',
  'Data Science Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1697',
  'Computer Science Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1689',
  'Computer Science Major': 'https://artsci.calendar.utoronto.ca/program/asmaj1689',
  'Computer Science Minor': 'https://artsci.calendar.utoronto.ca/program/asmin1689',
  'Psychology Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1397',
  'Psychology Major': 'https://artsci.calendar.utoronto.ca/program/asmaj1397',
  'Sociology Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1435',
  'Sociology Major': 'https://artsci.calendar.utoronto.ca/program/asmaj1435',
  'Human Biology Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1213',
  'Neuroscience Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1216',
}

export async function POST(req: Request) {
  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY
    if (!openrouterKey) return NextResponse.json({ error: 'Config error' }, { status: 500 })

    const profile = await req.json()
    const program = profile.programOfStudy || profile.admissionCategory
    const completed = profile.coursesCompleted || []
    const completedSet = new Set(completed.map((c: string) => c.toUpperCase().replace(/\s/g, '')))

    // 1. 获取课程上下文 (这里简化处理，保持你原有的逻辑)
    // ... (你的 Tavily 调用逻辑)

    // 2. 生成计划 (重点优化 Prompt)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o', // 使用更强的模型
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are an expert UofT Academic Advisor.
            CRITICAL RULES:
            1. You MUST generate 5 courses for EVERY semester.
            2. If you don't know the exact elective code, suggest a placeholder like "Breadth Requirement 1 (e.g., SOC100H1)".
            3. Prioritize: Core requirements -> Prerequisites -> Breadth Requirements.
            4. Output strictly in the requested JSON format.`
          },
          {
            role: 'user',
            content: `Generate a full 4-year degree plan for ${profile.name} in ${program}.
            Completed courses (DO NOT INCLUDE): ${JSON.stringify(completed)}.
            
            Format your response exactly as this JSON:
            {
              "message": "A 2-sentence encouraging summary.",
              "courseSchedule": [
                {
                  "semester": "First Year Fall",
                  "totalWorkload": 25,
                  "courses": [
                    { "code": "COURSE1", "name": "Name", "type": "CORE", "workload": 10, "reason": "..." },
                    { "code": "COURSE2", "name": "Name", "type": "CORE", "workload": 10, "reason": "..." },
                    { "code": "COURSE3", "name": "Name", "type": "BREADTH", "workload": 5, "reason": "..." },
                    { "code": "COURSE4", "name": "Name", "type": "ELECTIVE", "workload": 5, "reason": "..." },
                    { "code": "COURSE5", "name": "Name", "type": "ELECTIVE", "workload": 5, "reason": "..." }
                  ]
                }
              ],
              "degreeProgress": { "completedCredits": 0, "requiredCredits": 20, "remainingRequired": [], "nextMilestone": "" }
            }`
          }
        ],
      }),
    })

    const data = await response.json()
    const parsed = JSON.parse(data.choices[0].message.content)

    // 3. 后端二次清洗：确保没有任何已完成课程残留
    parsed.courseSchedule.forEach((sem: any) => {
        sem.courses = sem.courses.filter((c: any) => !completedSet.has(c.code.toUpperCase().replace(/\s/g, '')))
    });

    return NextResponse.json(parsed)

  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 })
  }
}
