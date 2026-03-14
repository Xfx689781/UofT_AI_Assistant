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

import { NextResponse } from 'next/server'

// 这里的池子是保证 AI 不会“偷懒”的核心
const SPECIALIST_POOLS: Record<string, string[]> = {
  'Mathematics Specialist': 'MAT137, MAT223, MAT224, MAT237, MAT240, MAT247, MAT351, MAT357, MAT363, MAT367',
  'Computer Science Specialist': 'CSC108, CSC148, CSC165, CSC207, CSC209, CSC236, CSC258, CSC263, CSC369, CSC373, CSC411',
  'Statistics Major': 'STA237, STA238, STA257, STA261, STA302, STA303, STA305, STA347',
}

export async function POST(req: Request) {
  try {
    const profile = await req.json()
    const { name, yearType, programOfStudy, interests, learningStyle, coursesCompleted } = profile
    
    // 1. 动态确定起始学期
    const startSemester = yearType === 'first' ? 'First Year Fall' : 'Second Year Fall'
    
    // 2. 注入专业课程池
    const pool = SPECIALIST_POOLS[programOfStudy] || 'CSC108, MAT137, ENG100, SOC100, PSY100'

    const systemPrompt = `
      You are a professional UofT Academic Advisor. 
      CURRENT CONTEXT: 
      - Starting point: ${startSemester}
      - Student Goal: ${interests?.join(', ')}
      - Rules:
        1. MUST fill 5 courses per semester.
        2. IF start is 'Second Year Fall', skip all first-year courses.
        3. Prioritize courses from this pool for ${programOfStudy}: ${pool}.
        4. Match course difficulty to student year.
        5. For every course, add a 'reason' field explaining why this matches their interest in ${interests?.join(', ')}.
    `

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a 4-year degree plan. User completed: ${JSON.stringify(coursesCompleted)}. Ensure exactly 5 courses per semester.` }
        ],
      }),
    })

    const data = await response.json()
    const parsed = JSON.parse(data.choices[0].message.content)

    return NextResponse.json(parsed)
  } catch (error) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
