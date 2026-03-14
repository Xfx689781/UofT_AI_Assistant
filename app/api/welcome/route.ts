import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { OnboardingData } from '@/components/Onboarding'

const SYSTEM_PROMPT = `You are UofT AI Assistant. Generate a short, warm, personalized welcome message (2-4 sentences) for a University of Toronto student based on their onboarding profile. Mention their name, their year/path (first year or program), and one specific tip or encouragement tailored to their goals and learning style. Be concise and friendly. Do not use markdown or bullet points.`

function buildProfileSummary(profile: OnboardingData): string {
  const parts: string[] = []
  parts.push(`Name: ${profile.name}`)
  parts.push(`Year: ${profile.yearType === 'first' ? 'First year' : 'Second year or beyond'}`)
  if (profile.yearType === 'first') {
    if (profile.admissionCategory) parts.push(`Admission category: ${profile.admissionCategory}`)
    if (profile.coursesTaken?.length) parts.push(`Courses taken so far: ${profile.coursesTaken.join(', ')}`)
    if (profile.interests?.length) parts.push(`Interests: ${profile.interests.join(', ')}`)
    if (profile.goalsFirstYear) parts.push(`Goals: ${profile.goalsFirstYear}`)
  } else {
    const program = profile.programOfStudy && profile.programOfStudy !== '__other__' ? profile.programOfStudy : profile.programOther
    if (program) parts.push(`Program: ${program}`)
    if (profile.programType) parts.push(`Type: ${profile.programType}`)
    if (profile.coursesCompleted?.length) parts.push(`Courses completed: ${profile.coursesCompleted.join(', ')}`)
    if (profile.goalsSecondYear) parts.push(`Goals: ${profile.goalsSecondYear}`)
  }
  if (profile.learningStyle) {
    const styleLabels: Record<string, string> = {
      lecture: 'Lecture-based',
      practice: 'Practice-heavy',
      'self-study': 'Self-study',
      collaborative: 'Collaborative',
    }
    parts.push(`Learning style: ${styleLabels[profile.learningStyle] || profile.learningStyle}`)
  }
  return parts.join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const profile = (await req.json()) as OnboardingData
    if (!profile?.name) {
      return NextResponse.json({ error: 'Invalid profile' }, { status: 400 })
    }

    const summary = buildProfileSummary(profile)
    const anthropic = new Anthropic({ apiKey })
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Student profile:\n${summary}\n\nGenerate the welcome message:`,
        },
      ],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    const message = textBlock && 'text' in textBlock ? textBlock.text.trim() : ''

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Welcome API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate welcome' },
      { status: 500 }
    )
  }
}
