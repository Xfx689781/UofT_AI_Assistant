import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are UofT AI Assistant, helping University of Toronto students with course selection and professor analysis. You have access to UofT course data, Rate My Professors insights, and Reddit r/UofT discussions. Be specific, honest, and helpful. When discussing professors, analyze teaching style, exam patterns, and student fit.`

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
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

    const anthropic = new Anthropic({ apiKey })
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: m.content,
      })),
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    const text = textBlock && 'text' in textBlock ? textBlock.text : ''

    return NextResponse.json({ content: text })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get AI response' },
      { status: 500 }
    )
  }
}
