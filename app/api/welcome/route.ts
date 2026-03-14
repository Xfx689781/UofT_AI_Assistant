import { NextResponse } from 'next/server'

const PROGRAM_CALENDAR_URLS: Record<string, string> = {
  'Mathematics Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1165',
  'Mathematics Major': 'https://artsci.calendar.utoronto.ca/program/asmaj1165',
  'Mathematics Minor': 'https://artsci.calendar.utoronto.ca/program/asmin1165',
  'Applied Mathematics Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1196',
  'Mathematics & Physics Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1312',
  'Statistical Sciences Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1169',
  'Statistics Major': 'https://artsci.calendar.utoronto.ca/program/asmaj1169',
  'Data Science Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1697',
  'Computer Science Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1689',
  'Computer Science Major': 'https://artsci.calendar.utoronto.ca/program/asmaj1689',
  'Computer Science Minor': 'https://artsci.calendar.utoronto.ca/program/asmin1689',
  'Psychology Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1397',
  'Psychology Major': 'https://artsci.calendar.utoronto.ca/program/asmaj1397',
  'Sociology Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1435',
  'Sociology Major': 'https://artsci.calendar.utoronto.ca/program/asmaj1435',
  'Human Biology Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1213',
  'Neuroscience Specialist': 'https://artsci.calendar.utoronto.ca/program/asspe1216',
}

export async function POST(req: Request) {
  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY
    if (!openrouterKey) return NextResponse.json({ error: 'Config error' }, { status: 500 })

    const profile = await req.json()
    const { name, programOfStudy, admissionCategory, interests, learningStyle, coursesCompleted } = profile
    
    const program = programOfStudy || admissionCategory || 'General Studies'
    const completedSet = new Set((coursesCompleted || []).map((c: string) => c.toUpperCase().replace(/\s/g, '')))

    const personalizationPrompt = `
      USER PROFILE: ${name}, ${program}, Interests: ${interests?.join(', ')}, Style: ${learningStyle}.
      RULES:
      1. MUST return exactly 5 courses per semester.
      2. If a course is not in the calendar, use a logical placeholder.
      3. Reason must be 1 sentence connecting to user interests.
      4. ALWAYS return empty arrays [] if no data is found for a field.
    `

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `You are an expert UofT Advisor. ${personalizationPrompt}` },
          { role: 'user', content: `Generate a 4-year plan. JSON format with courseSchedule[] and degreeProgress{}.` }
        ],
      }),
    })

    const rawData = await response.json()
    let parsed = JSON.parse(rawData.choices[0].message.content)

    if (!Array.isArray(parsed.courseSchedule)) parsed.courseSchedule = [];
    
    parsed.courseSchedule.forEach((sem: any) => {
        sem.courses = Array.isArray(sem.courses) ? sem.courses : [];
        sem.courses = sem.courses.filter((c: any) => !completedSet.has(c.code?.toUpperCase().replace(/\s/g, '')));
    });

    if (!parsed.degreeProgress) {
        parsed.degreeProgress = { completedCredits: 0, requiredCredits: 20, remainingRequired: [] };
    }
    if (!Array.isArray(parsed.degreeProgress.remainingRequired)) {
        parsed.degreeProgress.remainingRequired = [];
    }

    return NextResponse.json(parsed)

  } catch (error) {
    console.error("API Generation Error:", error);
    return NextResponse.json({ 
      error: 'Failed to generate plan',
      courseSchedule: [], // 返回空结构防止前端崩溃
      degreeProgress: { remainingRequired: [] }
    }, { status: 500 })
  }
}
