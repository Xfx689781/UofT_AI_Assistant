# UTbot 🎓

**AI-powered course planning, professor matching and academic partner for UofT students.**

Built at [GenAI Genesis 2026](https://genai-genesis.com) hackathon · University of Toronto · March 2026

🔗 **Live:** https://uof-t-ai-assistant.vercel.app

---

## What it does

UTbot helps UofT students navigate one of the most overwhelming parts of university — figuring out what courses to take and which professor to pick.

**Course Planner** — Tell UTbot your year, program, completed courses, and goals. It generates a personalized Fall + Winter (and 3rd/4th year: all four semesters) course plan that respects prerequisites, your learning style, and your ambition level. It knows the difference between MAT137Y1 and MAT157Y1, understands Y1 vs H1 course structures, and won't put STA237 in your plan if you're still taking MAT137.

**Professor Lens** — Enter any course code and UTbot searches RMP, Reddit r/UofT, and recent timetable data to find the professor whose teaching style best matches *your* learning profile — not just the highest-rated one. A student who wants to be pushed hard gets a different recommendation than one who needs structured support.

---

## Features

- Multi-step onboarding capturing year, program, completed courses, learning style, self-assessment, and a free-text short answer the AI reads directly
- Personalized course plans for First Year, Second Year, and Third/Fourth Year (4 semesters)
- Handles Y1/H1 distinction, mutual exclusions (MAT137 vs MAT157), prerequisite chains
- Professor matching using live Tavily search + OpenRouter AI analysis
- Student archetype system (GRAD_SCHOOL_BOUND, NEEDS_SUPPORT, SELF_STUDY_LEARNER, etc.) for professor scoring
- Built-in AI chat assistant for follow-up questions

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Course Planning AI | OpenRouter (gpt-4o-mini) |
| Professor Search | Tavily API |
| Chat | Anthropic Claude API |
| Deployment | Vercel |

---

## Getting Started
```bash
git clone https://github.com/Xfx689781/UofT_AI_Assistant
cd UofT_AI_Assistant
npm install
```

Create `.env.local`:
```
ANTHROPIC_API_KEY=your_key
OPENROUTER_API_KEY=your_key
TAVILY_API_KEY=your_key
```
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Team

Built in 36 hours at GenAI Genesis 2026 · UofT.
