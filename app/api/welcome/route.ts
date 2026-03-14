import { NextResponse } from 'next/server'

// 1. 定义常量池
const SPECIALIST_POOLS: Record<string, string[]> = {
  'Mathematics Specialist': ['MAT137', 'MAT223', 'MAT224', 'MAT237', 'MAT240', 'MAT247', 'MAT351', 'MAT357'],
  'Computer Science Specialist': ['CSC108', 'CSC148', 'CSC165', 'CSC207', 'CSC236', 'CSC258', 'CSC263', 'CSC373'],
  // 你可以继续添加其他专业...
}

// 2. 导出 API 处理函数
export async function POST(req: Request) {
  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY
    if (!openrouterKey) return NextResponse.json({ error: 'Config error' }, { status: 500 })

    const profile = await req.json()
    const { name, yearType, programOfStudy, interests, learningStyle, coursesCompleted } = profile
    
    const program = programOfStudy || 'General Studies'
    const completedSet = new Set((coursesCompleted || []).map((c: string) => c.toUpperCase().replace(/\s/g, '')))
    
    // 动态确定起始学期
    const startSemester = yearType === 'first' ? 'First Year Fall' : 'Second Year Fall'
    const pool = SPECIALIST_POOLS[programOfStudy] ? SPECIALIST_POOLS[programOfStudy].join(', ') : 'MAT137, CSC108, PSY100'

    const systemPrompt = `
      You are a professional UofT Academic Advisor. 
      CURRENT CONTEXT: 
      - Starting point: ${startSemester}
      - Student Goal: ${interests?.join(', ') || 'General Academic'}
      - Rules:
        1. MUST fill 5 courses per semester.
        2. IF start is 'Second Year Fall', skip all first-year courses.
        3. Prioritize courses from this pool: ${pool}.
        4. For every course, add a 'reason' connecting to student interest: ${interests?.join(', ')}.
    `

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a 4-year degree plan. User completed: ${JSON.stringify(Array.from(completedSet))}. Ensure exactly 5 courses per semester.` }
        ],
      }),
    })

    const data = await response.json()
    // 增加一步简单的 JSON 解析保护
    const rawContent = data.choices[0].message.content
    const parsed = JSON.parse(rawContent)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
