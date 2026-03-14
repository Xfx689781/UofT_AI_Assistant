import Anthropic from '@anthropic-ai/sdk'

const systemPrompt = `You are UofT AI Assistant, helping University of Toronto students with course selection and professor analysis. You have access to UofT course data, Rate My Professors insights, and Reddit r/UofT discussions. Be specific, honest, and helpful. When discussing professors, analyze teaching style, exam patterns, and student fit.`

export async function streamClaudeResponse(
  messages: { role: 'user' | 'assistant'; content: string }[],
  apiKey: string
): Promise<AsyncIterable<Anthropic.MessageStreamEvent>> {
  const anthropic = new Anthropic({ apiKey })
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  })
  return stream
}

export async function getClaudeResponse(
  messages: { role: 'user' | 'assistant'; content: string }[],
  apiKey: string
): Promise<string> {
  const anthropic = new Anthropic({ apiKey })
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  })
  const textBlock = response.content.find((block) => block.type === 'text')
  return textBlock && 'text' in textBlock ? textBlock.text : ''
}
