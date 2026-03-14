import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.AIzaSyAQUogN8m9Qz1hmWenO68xFlgWLn9_CkzI);

export async function POST(req: Request) {
  try {
    const profile = await req.json();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      User is a UofT student. Profile: ${JSON.stringify(profile)}.
      
      Tasks:
      1. Write a welcome message (message). Analyze their current academic standing based on courses completed and grades. Mention specific hard courses like MAT157 or CSC165 if they did well.
      2. Generate a 2-semester Course Plan (courseSchedule) following UofT degree requirements for their program.
      3. Estimate degreeProgress (completed vs 20.0 required).
      
      Output JSON format:
      {
        "message": "...",
        "courseSchedule": [{ "semester": "Fall 2026", "courses": [{ "code": "...", "name": "...", "reason": "...", "type": "required" }] }],
        "degreeProgress": { "completedCredits": number, "requiredCredits": 20, "remainingRequired": string[], "nextMilestone": string }
      }
    `;

    const result = await model.generateContent(prompt);
    return NextResponse.json(JSON.parse(result.response.text()));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
