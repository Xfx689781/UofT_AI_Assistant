'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  'Recommend courses for my program',
  'Analyze a professor',
  'Check my degree progress',
]

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm the UofT AI Assistant. Ask me about course recommendations, professor analysis, or degree progress.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMessage: Message = { role: 'user', content: trimmed }
    setMessages((m) => [...m, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')

      setMessages((m) => [
        ...m,
        { role: 'assistant', content: data.content || 'No response.' },
      ])
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : 'Something went wrong.'}`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-col h-full bg-[#121922] border border-[#1e2a3a] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1e2a3a] bg-[#002A5C]/30">
        <h3 className="font-semibold text-white">AI Assistant</h3>
        <p className="text-xs text-[#8b9aad]">Course & professor insights</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-[#0066CC] text-white'
                  : 'bg-[#1e2a3a] text-[#e8ecf1]'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1e2a3a] rounded-lg px-4 py-2">
              <span className="text-[#8b9aad] text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-2 border-t border-[#1e2a3a]">
        <div className="flex flex-wrap gap-2 mb-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full bg-[#002A5C]/50 text-[#8b9aad] hover:bg-[#0066CC]/30 hover:text-white border border-[#1e2a3a] transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about courses or professors..."
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#0a0e14] border border-[#1e2a3a] text-white placeholder-[#6b7a8d] focus:outline-none focus:ring-2 focus:ring-[#0066CC] text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-lg bg-[#0066CC] text-white font-medium hover:bg-[#0080e6] disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
