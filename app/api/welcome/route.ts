import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    const profile = await req.json()
    if (!profile?.name) return NextResponse.json({ error: 'Invalid profile' }, { status: 400 })

    const program = profile.programOfStudy && profile.programOfStudy !== '__other__'
      ? profile.programOfStudy : profile.programOther || profile.admissionCategory

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' } as never],
      system: `You are a UofT academic advisor. Search artsci.calendar.utoronto.ca for program requirements and return ONLY valid JSON, no markdown.`,
      messages: [{
        role: 'user',
        content: `Student: ${profile.name}, Program: ${program}, Completed: ${JSON.stringify(profile.coursesCompleted || profile.coursesTaken || [])}, Goals: ${profile.goalsSecondYear || profile.goalsFirstYear}, Learning style: ${profile.learningStyle}

Search for "${program}" requirements on artsci.calendar.utoronto.ca then return ONLY this JSON:
{
  "message": "warm 2-3 sentence welcome mentioning name and one tip",
  "courseSchedule": [
    {
      "semester": "Fall 2026",
      "courses": [
        { "code": "MAT237", "name": "Multivariable Calculus", "reason": "Required, prereqs met", "type": "required" }
      ]
    }
  ],
  "degreeProgress": {
    "completedCredits": 2,
    "requiredCredits": 20,
    "remainingRequired": ["MAT237", "MAT246"],
    "nextMilestone": "Complete MAT237 to unlock upper-year math"
  }
}`,
      }],
    })

    let raw = ''
    for (const block of response.content) {
      if (block.type === 'text') raw = block.text.trim()
    }

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ message: raw, courseSchedule: [], degreeProgress: null })

    try {
      const parsed = JSON.parse(jsonMatch[0])
      return NextResponse.json({
        message: parsed.message || '',
        courseSchedule: parsed.courseSchedule || [],
        degreeProgress: parsed.degreeProgress || null,
      })
    } catch {
      return NextResponse.json({ message: raw, courseSchedule: [], degreeProgress: null })
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
