import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are UofT AI Assistant, helping University of Toronto students with course selection and professor analysis. You have access to UofT course data, Rate My Professors insights, and Reddit r/UofT discussions. Be specific, honest, and helpful. When discussing professors, analyze teaching style, exam patterns, and student fit.`

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { messages } = body as { messages: { role: string; content: string }[] }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages array is required' },
        { status: 400 }
      )
    }

    // 调用 OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://your-site-domain.com', // 可选：用于OpenRouter统计
        'X-Title': 'UofT AI Assistant',                 // 可选
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet', // 在 OpenRouter 中指定你想要的 Claude 模型
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to communicate with OpenRouter')
    }

    const data = await response.json()
    const text = data.choices[0].message.content

    return NextResponse.json({ content: text })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get AI response' },
      { status: 500 }
    )
  }
}
