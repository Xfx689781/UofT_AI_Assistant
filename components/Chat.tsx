'use client'

import { useState, useEffect, useRef } from 'react'
import { OnboardingData } from './Onboarding'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Chat({ studentProfile }: { studentProfile: OnboardingData | null }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          studentProfile: studentProfile 
        }),
      })

      const data = await res.json()
      if (data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
      }
    } catch (err) {
      console.error("Chat error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#121922] border border-[#1e2a3a] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#1e2a3a] bg-[#1a2332]">
        <h3 className="text-white font-bold flex items-center gap-2">UofT AI Advisor</h3>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-[#0066CC] text-white' : 'bg-[#1e2a3a] text-[#c8d4e0]'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-[#8b9aad] text-xs animate-pulse">Thinking...</div>}
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-[#0a0e14]">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="w-full bg-[#1a2332] border border-[#1e2a3a] rounded-lg px-3 py-2 text-white text-sm outline-none"
        />
      </form>
    </div>
  )
}
