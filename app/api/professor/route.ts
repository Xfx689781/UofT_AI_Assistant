import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY
    const tavilyKey = process.env.TAVILY_API_KEY
    
    const { courseCode, studentProfile } = await req.json()
    if (!courseCode) return NextResponse.json({ error: 'courseCode required' }, { status: 400 })

    // 1. 深度搜索 UofT 教授评价数据
    const searchQueries = [
      `${courseCode} UofT professor 2024 2025 reddit r/UofT`,
      `${courseCode} University of Toronto ratemyprofessors`,
      `${courseCode} syllabus UofT grading breakdown`
    ]

    const searchResults = await Promise.all(
      searchQueries.map(q => 
        fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: tavilyKey, query: q, search_depth: 'advanced', max_results: 3 })
        }).then(r => r.json())
      )
    )

    const context = searchResults.flatMap(r => r.results || []).map(r => r.content).join('\n\n')

    // 2. 核心 Prompt：强制 AI 进行性格匹配
    const systemPrompt = `
      You are a specialized UofT Academic Analyst. 
      STUDENT PROFILE:
      - Learning Style: ${studentProfile.learningStyle}
      - Interests: ${studentProfile.interests?.join(', ')}
      - Goals: ${studentProfile.goals}

      TASK:
      Analyze the professors for ${courseCode} based on the search context.
      
      CRITICAL RULES:
      1. MATCH SCORE: This MUST be personal. A "hard grader" might be a 90% match for a "challenge-seeking" student, but a 40% match for a "support-seeking" student.
      2. DIMENSIONS: Provide 0-10 scores for: teachingClarity, examPredictability, accessibility, gradingFairness, workload, engagement.
      3. VISUALIZATION: Ensure the studentCompatibility field directly mentions how the professor's style fits the student's "${studentProfile.learningStyle}" style.
    `

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze professors for ${courseCode} using this data: ${context}. Return a JSON object with: courseCode, courseName, professors[], recommendedFor, recommendationReason, studentLearningAnalysis.` }
        ]
      })
    })

    const data = await aiRes.json()
    return NextResponse.json(JSON.parse(data.choices[0].message.content))
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
