# UofT AI Assistant

A Next.js 14 app that helps University of Toronto students with **course selection** and **professor analysis**. It uses Claude (Anthropic) for conversational AI and mock UofT professor data for ratings and insights.

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Claude API** (Anthropic SDK) for AI chat
- **Recharts** for data visualization (radar charts, line charts)

## Features

- **Onboarding** – Collect program, year, completed courses, learning style, and goals (stored in `localStorage`).
- **Dashboard** – Welcome message, quick actions (recommend courses, analyze professor, degree progress), and an AI chat panel.
- **Professor profiles** – Per-professor pages with:
  - 6-dimension radar chart (Teaching Clarity, Exam Difficulty, Workload, Accessibility, Grading Fairness, Course Engagement)
  - Historical trend chart (2022–2025)
  - AI-generated prediction for the next year
  - Tags and sample student quotes (synthesized)
- **API routes**
  - `POST /api/chat` – Chat with Claude (UofT-focused system prompt).
  - `GET /api/professor` – Professor list or single professor by `?slug=...`.

## Project structure

```
/app
  page.tsx              # Onboarding (redirects if already onboarded)
  dashboard/page.tsx     # Main dashboard + chat
  professor/[name]/page.tsx  # Professor profile
  api/chat/route.ts      # Claude chat endpoint
  api/professor/route.ts # Professor data endpoint
/components
  Onboarding.tsx
  Chat.tsx
  ProfessorCard.tsx
  RadarChart.tsx
/lib
  claude.ts             # Claude client helpers
  data.ts               # Mock professor data (5 UofT math professors)
```

## Setup

1. **Clone and install**

   ```bash
   cd uoft-ai-assistant
   npm install
   ```

2. **Environment**

   Create `.env.local` in the project root:

   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

   Get an API key from [Anthropic](https://console.anthropic.com/).

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Complete onboarding, then use the dashboard and professor pages.

## Design

- **Theme:** Dark background (`#0a0e14`), UofT blue (`#002A5C`, `#0066CC`), gold accents (`#FFD700`).
- **Data:** Mock data for 5 UofT math professors in `lib/data.ts`. Replace with real data or your own API when ready.

## Scripts

- `npm run dev` – Development server
- `npm run build` – Production build
- `npm run start` – Run production server
- `npm run lint` – Run ESLint

## License

MIT.
