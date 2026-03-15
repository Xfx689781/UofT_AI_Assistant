import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'API Key missing' }, { status: 500 })

    const body = await req.json()
    // 关键改动：接收前端传来的 studentProfile
    const { messages, studentProfile } = body as { 
      messages: { role: string; content: string }[],
      studentProfile: any 
    }

    // 将用户画像动态注入系统提示词
    const DYNAMIC_SYSTEM_PROMPT = `
      You are UofT AI Assistant. 
      USER CONTEXT:
      - Name: ${studentProfile?.name || 'Student'}
      - Program: ${studentProfile?.programOfStudy}
      - Completed Courses: ${JSON.stringify(studentProfile?.coursesCompleted)}
      - Learning Style: ${studentProfile?.learningStyle}
      - Goals: ${studentProfile?.goals}
      
      INSTRUCTIONS:
      Use this context to provide personalized advice. If they ask for recommendations, 
      refer to their completed courses and interests. Be concise and use a supportive tone.
    `

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: DYNAMIC_SYSTEM_PROMPT },
          ...messages
        ],
      }),
    })

    const data = await response.json()
    const text = data.choices[0]?.message?.content || ''
    return NextResponse.json({ content: text })
  } catch (error) {
    return NextResponse.json({ error: 'Chat Error' }, { status: 500 })
  }
}
