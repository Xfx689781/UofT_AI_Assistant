import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { OnboardingData } from '@/components/Onboarding'

const SYSTEM_PROMPT = `You are UofT AI Assistant, an expert academic advisor for the University of Toronto. 

When given a student profile, you must return a JSON object with exactly this structure:
{
  "welcomeMessage": "A warm, personalized 2-3 sentence welcome message mentioning their name and one specific tip",
  "courseSchedule": [
    {
      "semester": "Fall 2026",
      "courses": [
        {
          "code": "MAT237",
          "name": "Multivariable Calculus",
          "reason": "Required for your Math Specialist and builds on MAT137"
        }
      ]
    }
  ],
  "degreeProgress": {
    "completedCredits": 2,
    "requiredCredits": 20,
    "completedCourses": ["MAT137", "CSC108"],
    "remainingRequired": ["MAT237", "MAT246", "MAT301"],
    "nextMilestone": "Complete MAT237 and MAT246 to unlock upper year Math courses"
  }
}

Rules:
- Use REAL UofT course codes (MAT, STA, CSC, PHY, ECO etc.)
- Generate 4-5 courses per semester
- Plan enough semesters to complete their degree (typically 6-8 semesters for a specialist, 4-6 for a major)
- Respect prerequisites: MAT137 before MAT237, MAT137+MAT138 before MAT240, etc.
- For first year students: plan their remaining university years
- For second year+ students: plan from next semester onwards based on completed courses
- Tailor recommendations to their goals (grad school = more theory, industry = more applied/CS)
- Return ONLY valid JSON, no markdown, no extra text`

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
    const program = profile.programOfStudy && profile.programOfStudy !== '__other__'
      ? profile.programOfStudy
      : profile.programOther
    if (program) parts.push(`Program: ${program}`)
    if (profile.programType) parts.push(`Type: ${profile.programType}`)
    if (profile.coursesCompleted?.length) parts.push(`Courses completed: ${profile.coursesCompleted.join(', ')}`)
    if (profile.goalsSecondYear) parts.push(`Goals: ${profile.goalsSecondYear}`)
  }
  
  const styleLabels: Record<string, string> = {
    lecture: 'Lecture-based',
    practice: 'Practice-heavy',
    'self-study': 'Self-study',
    collaborative: 'Collaborative',
  }
  if (profile.learningStyle) {
    parts.push(`Learning style: ${styleLabels[profile.learningStyle] || profile.learningStyle}`)
  }
  
  return parts.join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 })
    }

    const profile = (await req.json()) as OnboardingData
    if (!profile?.name) {
      return NextResponse.json({ error: 'Invalid profile' }, { status: 400 })
    }

    const summary = buildProfileSummary(profile)
    const anthropic = new Anthropic({ apiKey })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Student profile:\n${summary}\n\nGenerate the welcome message and full course schedule:`,
        },
      ],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    const raw = textBlock && 'text' in textBlock ? textBlock.text.trim() : ''

    try {
      const parsed = JSON.parse(raw)
      return NextResponse.json({
        message: parsed.welcomeMessage || '',
        courseSchedule: parsed.courseSchedule || [],
        degreeProgress: parsed.degreeProgress || null,
      })
    } catch {
      // fallback if JSON parsing fails
      return NextResponse.json({ message: raw, courseSchedule: [], degreeProgress: null })
    }
  } catch (error) {
    console.error('Welcome API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate welcome' },
      { status: 500 }
    )
  }
}
