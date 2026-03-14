import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { OnboardingData } from '@/components/Onboarding'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildProfileSummary(profile: OnboardingData): string {
  const parts: string[] = []
  parts.push(`Name: ${profile.name}`)
  parts.push(`Year: ${profile.yearType === 'first' ? 'First year' : 'Second year+'}`)
  if (profile.yearType === 'first') {
    if (profile.admissionCategory) parts.push(`Admission: ${profile.admissionCategory}`)
    if (profile.coursesTaken?.length) parts.push(`Courses taken: ${profile.coursesTaken.join(', ')}`)
    if (profile.interests?.length) parts.push(`Interests: ${profile.interests.join(', ')}`)
    if (profile.goalsFirstYear) parts.push(`Goals: ${profile.goalsFirstYear}`)
  } else {
    const program = profile.programOfStudy && profile.programOfStudy !== '__other__'
      ? profile.programOfStudy : profile.programOther
    if (program) parts.push(`Program: ${program}`)
    if (profile.coursesCompleted?.length) parts.push(`Completed: ${profile.coursesCompleted.join(', ')}`)
    if (profile.goalsSecondYear) parts.push(`Goals: ${profile.goalsSecondYear}`)
  }
  const styleLabels: Record<string, string> = {
    lecture: 'Lecture-based', practice: 'Practice-heavy',
    'self-study': 'Self-study', collaborative: 'Collaborative',
  }
  if (profile.learningStyle) parts.push(`Learning style: ${styleLabels[profile.learningStyle] || profile.learningStyle}`)
  return parts.join('\n')
}

const SYSTEM_PROMPT = `You are UofT AI Assistant, an expert academic advisor for the University of Toronto Faculty of Arts & Science.

You have web search access. For each student:

STEP 1 - Search for their exact program requirements:
- Search "artsci.calendar.utoronto.ca [program name] requirements" 
- Search "reddit r/UofT [program name] advice courses"

STEP 2 - Build a realistic semester-by-semester course plan:
- NO sections, NO professors, NO lecture times — courses only
- Strictly respect prerequisites
- Max 5 courses per semester, ideal is 4-5
- Required courses first, then goal-based electives
- Grad school → theory heavy (analysis, algebra, proofs)
- Industry → applied (stats, CS, data science)
- Balance workload across semesters

STEP 3 - Return ONLY valid JSON, no markdown, no extra text:
{
  "welcomeMessage": "warm 2-3 sentence message with their name and one specific tip",
  "courseSchedule": [
    {
      "semester": "Fall 2026",
      "courses": [
        {
          "code": "MAT237",
          "name": "Multivariable Calculus",
          "reason": "Required for your program. Prereq MAT137 complete.",
          "type": "required"
        }
      ]
    }
  ],
  "degreeProgress": {
    "completedCredits": 2,
    "requiredCredits": 20,
    "remainingRequired": ["MAT237", "MAT246", "MAT301"],
    "nextMilestone": "Complete MAT237 and MAT246 to unlock all upper-year math"
  }
}

RULES:
- Always search before generating
- Real UofT course codes only
- Never include sections or professor names in the schedule
- Be realistic about UofT workload`

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 })

    const profile = (await req.json()) as OnboardingData
    if (!profile?.name) return NextResponse.json({ error: 'Invalid profile' }, { status: 400 })

    const summary = buildProfileSummary(profile)
    const program = profile.yearType === 'first'
      ? `${profile.admissionCategory} first year`
      : (profile.programOfStudy !== '__other__' ? profile.programOfStudy : profile.programOther)

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      tools: [{ type: 'web_search_20250305', name: 'web_search' } as never],
      messages: [{
        role: 'user',
        content: `Student profile:\n${summary}\n\nSearch for "${program}" requirements on artsci.calendar.utoronto.ca and r/UofT, then generate their full course plan as JSON.`,
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
        message: parsed.welcomeMessage || '',
        courseSchedule: parsed.courseSchedule || [],
        degreeProgress: parsed.degreeProgress || null,
      })
    } catch {
      return NextResponse.json({ message: raw, courseSchedule: [], degreeProgress: null })
    }
  } catch (error) {
    console.error('Welcome API error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
