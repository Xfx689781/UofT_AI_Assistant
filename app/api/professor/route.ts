import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.AIzaSyAQUogN8m9Qz1hmWenO68xFlgWLn9_CkzI);

export async function POST(req: Request) {
  try {
    const { courseCode, studentProfile } = await req.json();

    const searchRes = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: `${courseCode} UofT professors reddit ratemyprofessors 2024 2025`,
        search_depth: "advanced",
        include_answer: true
      })
    });
    const { results } = await searchRes.json();
    
    const context = results.map((r: any) => `Source: ${r.url}\nContent: ${r.content}`).join('\n\n');

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `
      You are a specialized Academic Advisor for the University of Toronto. 
      Analyze the provided search context about professors for ${courseCode}.
      
      Student Profile: ${JSON.stringify(studentProfile)}
      
      Instructions:
      1. Identify at least 2 professors teaching ${courseCode}.
      2. Quantify their traits into scores (1-10) based on student feedback in the context.
      3. Use the student's past grades (e.g., MAT157, MAT240) to determine the 'recommendedFor' professor.
      4. DO NOT hallucinate. If no info is found, return an error message.
      
      Return the data in this EXACT JSON structure:
      {
        "courseCode": string,
        "courseName": string,
        "recommendedFor": string (Professor Name),
        "recommendationReason": string (Personalized based on student history),
        "professors": [
          {
            "name": string,
            "rmpRating": number,
            "rmpDifficulty": number,
            "numRatings": number,
            "dimensions": { "teachingClarity": 1-10, "examPredictability": 1-10, "accessibility": 1-10, "gradingFairness": 1-10, "workload": 1-10, "engagement": 1-10 },
            "examStyle": string,
            "teachingStyle": string,
            "bestFor": string,
            "warnings": string,
            "tags": string[],
            "recentQuotes": string[],
            "enrollmentTrend": "rising" | "stable" | "dropping"
          }
        ]
      }

      Context Data:
      ${context}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    return NextResponse.json(JSON.parse(responseText));
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Analysis failed: " + error.message }, { status: 500 });
  }
}
