import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const profile = await req.json()
    const { name, programOfStudy, coursesCompleted, interests } = profile

    const systemPrompt = `
      You are a UofT Degree Planner. 
      Student has completed: ${JSON.stringify(coursesCompleted)}.
      Interests: ${interests?.join(', ')}.
      
      TASK: Generate a full ACADEMIC YEAR (Fall + Winter) course plan.
      
      LOGIC RULES:
      1. PREREQUISITES: Do NOT suggest CSC263 unless student has CSC236. Check UofT calendar logic.
      2. WORKLOAD: Balance heavy math/CS courses with bird courses (electives).
      3. FORMAT: Return JSON.
    `

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Plan the next 2 semesters for ${name} in ${programOfStudy}. 
            Return: { 
              "message": "...", 
              "courseRecommendations": [
                { "semester": "Fall", "courses": [...] },
                { "semester": "Winter", "courses": [...] }
              ],
              "degreeProgress": { "completedCredits": 3.5, "requiredCredits": 20, "remainingRequired": ["MAT237", "CSC209"], "nextMilestone": "Finish POSt" },
              "advisorNote": "..."
            }` 
          }
        ]
      })
    })

    const data = await response.json()
    return NextResponse.json(JSON.parse(data.choices[0].message.content))
  } catch (error) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
