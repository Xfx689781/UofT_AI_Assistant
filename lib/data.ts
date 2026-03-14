export interface ProfessorRadarData {
  teachingClarity: number
  examDifficulty: number // lower = easier
  workload: number
  accessibility: number
  gradingFairness: number
  courseEngagement: number
}

export interface ProfessorYearlyRating {
  year: number
  overall: number
  teachingClarity: number
  examDifficulty: number
  workload: number
  accessibility: number
  gradingFairness: number
  courseEngagement: number
}

export interface Professor {
  id: string
  name: string
  slug: string
  department: string
  radar: ProfessorRadarData
  yearlyRatings: ProfessorYearlyRating[]
  tags: string[]
  quotes: string[]
  prediction: string
}

export const PROFESSORS: Professor[] = [
  {
    id: '1',
    name: 'Dr. Lisa Zhang',
    slug: 'lisa-zhang',
    department: 'Department of Mathematics',
    radar: {
      teachingClarity: 4.8,
      examDifficulty: 3.2,
      workload: 4.0,
      accessibility: 4.5,
      gradingFairness: 4.6,
      courseEngagement: 4.4,
    },
    yearlyRatings: [
      { year: 2022, overall: 4.2, teachingClarity: 4.5, examDifficulty: 3.5, workload: 4.0, accessibility: 4.2, gradingFairness: 4.3, courseEngagement: 4.0 },
      { year: 2023, overall: 4.4, teachingClarity: 4.6, examDifficulty: 3.3, workload: 4.0, accessibility: 4.4, gradingFairness: 4.5, courseEngagement: 4.2 },
      { year: 2024, overall: 4.5, teachingClarity: 4.7, examDifficulty: 3.2, workload: 4.0, accessibility: 4.5, gradingFairness: 4.6, courseEngagement: 4.3 },
      { year: 2025, overall: 4.6, teachingClarity: 4.8, examDifficulty: 3.2, workload: 4.0, accessibility: 4.5, gradingFairness: 4.6, courseEngagement: 4.4 },
    ],
    tags: ['#ProofHeavy', '#GoodOfficeHours', '#ClearLectures', '#FairGrading'],
    quotes: [
      'Her proofs are incredibly clear and she always has time for office hours.',
      'MAT237 with her was challenging but fair. Exams matched the problem sets well.',
      'One of the best math profs at UofT. Explains abstract concepts with great examples.',
    ],
    prediction: 'Ratings are expected to remain strong in 2026. Dr. Zhang continues to improve lecture clarity and student feedback suggests consistent quality.',
  },
  {
    id: '2',
    name: 'Dr. Marcus Chen',
    slug: 'marcus-chen',
    department: 'Department of Mathematics',
    radar: {
      teachingClarity: 4.2,
      examDifficulty: 4.5,
      workload: 4.8,
      accessibility: 3.8,
      gradingFairness: 4.0,
      courseEngagement: 4.0,
    },
    yearlyRatings: [
      { year: 2022, overall: 3.8, teachingClarity: 4.0, examDifficulty: 4.6, workload: 4.7, accessibility: 3.6, gradingFairness: 3.9, courseEngagement: 3.8 },
      { year: 2023, overall: 3.9, teachingClarity: 4.1, examDifficulty: 4.5, workload: 4.8, accessibility: 3.7, gradingFairness: 4.0, courseEngagement: 3.9 },
      { year: 2024, overall: 4.0, teachingClarity: 4.2, examDifficulty: 4.5, workload: 4.8, accessibility: 3.8, gradingFairness: 4.0, courseEngagement: 4.0 },
      { year: 2025, overall: 4.1, teachingClarity: 4.2, examDifficulty: 4.5, workload: 4.8, accessibility: 3.8, gradingFairness: 4.0, courseEngagement: 4.0 },
    ],
    tags: ['#ProofHeavy', '#HardExams', '#HeavyWorkload', '#Rigorous'],
    quotes: [
      'Very rigorous course. Be prepared to work hard but you will learn a lot.',
      'Exams are tough but he curves. Office hours are busy but he tries to help.',
      'MAT257 with Chen is a grind but worth it if you want to go to grad school.',
    ],
    prediction: '2026 may see a slight improvement in accessibility scores as more office hour slots were added. Exam difficulty is expected to stay high.',
  },
  {
    id: '3',
    name: 'Dr. Sarah Williams',
    slug: 'sarah-williams',
    department: 'Department of Mathematics',
    radar: {
      teachingClarity: 4.6,
      examDifficulty: 2.8,
      workload: 3.2,
      accessibility: 4.8,
      gradingFairness: 4.7,
      courseEngagement: 4.7,
    },
    yearlyRatings: [
      { year: 2022, overall: 4.4, teachingClarity: 4.4, examDifficulty: 3.0, workload: 3.3, accessibility: 4.6, gradingFairness: 4.5, courseEngagement: 4.5 },
      { year: 2023, overall: 4.5, teachingClarity: 4.5, examDifficulty: 2.9, workload: 3.2, accessibility: 4.7, gradingFairness: 4.6, courseEngagement: 4.6 },
      { year: 2024, overall: 4.6, teachingClarity: 4.6, examDifficulty: 2.8, workload: 3.2, accessibility: 4.8, gradingFairness: 4.7, courseEngagement: 4.6 },
      { year: 2025, overall: 4.6, teachingClarity: 4.6, examDifficulty: 2.8, workload: 3.2, accessibility: 4.8, gradingFairness: 4.7, courseEngagement: 4.7 },
    ],
    tags: ['#Approachable', '#GoodOfficeHours', '#ReasonableExams', '#Engaging'],
    quotes: [
      'So approachable! She actually remembers your name and asks how you are doing.',
      'MAT135/136 with Sarah was a great intro. Exams were fair and she explains everything.',
      'Best math prof for first year. Office hours are packed because everyone loves her.',
    ],
    prediction: 'Consistently high ratings suggest 2026 will maintain the same quality. Popular choice for MAT135/136; enroll early.',
  },
  {
    id: '4',
    name: 'Dr. James Okonkwo',
    slug: 'james-okonkwo',
    department: 'Department of Mathematics',
    radar: {
      teachingClarity: 4.0,
      examDifficulty: 4.0,
      workload: 4.2,
      accessibility: 4.2,
      gradingFairness: 4.3,
      courseEngagement: 4.1,
    },
    yearlyRatings: [
      { year: 2022, overall: 3.9, teachingClarity: 3.8, examDifficulty: 4.2, workload: 4.3, accessibility: 4.0, gradingFairness: 4.1, courseEngagement: 3.9 },
      { year: 2023, overall: 4.0, teachingClarity: 3.9, examDifficulty: 4.1, workload: 4.2, accessibility: 4.1, gradingFairness: 4.2, courseEngagement: 4.0 },
      { year: 2024, overall: 4.1, teachingClarity: 4.0, examDifficulty: 4.0, workload: 4.2, accessibility: 4.2, gradingFairness: 4.3, courseEngagement: 4.1 },
      { year: 2025, overall: 4.1, teachingClarity: 4.0, examDifficulty: 4.0, workload: 4.2, accessibility: 4.2, gradingFairness: 4.3, courseEngagement: 4.1 },
    ],
    tags: ['#BellCurve', '#MixedReviews', '#StructuredCourse', '#AppliedFocus'],
    quotes: [
      'Course is well structured. Midterms were okay, final was harder. He does curve.',
      'Good for applied math. Lectures are clear but pace is fast. Do the problem sets.',
      'Solid choice for MAT224. Not the easiest but fair if you put in the work.',
    ],
    prediction: 'Trend suggests stable ratings in 2026. Bell curve is likely to continue; expect moderate difficulty with fair grading.',
  },
  {
    id: '5',
    name: 'Dr. Elena Vasquez',
    slug: 'elena-vasquez',
    department: 'Department of Mathematics',
    radar: {
      teachingClarity: 4.7,
      examDifficulty: 3.5,
      workload: 3.8,
      accessibility: 4.6,
      gradingFairness: 4.5,
      courseEngagement: 4.8,
    },
    yearlyRatings: [
      { year: 2022, overall: 4.3, teachingClarity: 4.5, examDifficulty: 3.7, workload: 4.0, accessibility: 4.4, gradingFairness: 4.3, courseEngagement: 4.5 },
      { year: 2023, overall: 4.4, teachingClarity: 4.6, examDifficulty: 3.6, workload: 3.9, accessibility: 4.5, gradingFairness: 4.4, courseEngagement: 4.6 },
      { year: 2024, overall: 4.5, teachingClarity: 4.7, examDifficulty: 3.5, workload: 3.8, accessibility: 4.6, gradingFairness: 4.5, courseEngagement: 4.7 },
      { year: 2025, overall: 4.6, teachingClarity: 4.7, examDifficulty: 3.5, workload: 3.8, accessibility: 4.6, gradingFairness: 4.5, courseEngagement: 4.8 },
    ],
    tags: ['#Engaging', '#GoodOfficeHours', '#ProofHeavy', '#ClearLectures'],
    quotes: [
      'Her lectures are so engaging. She makes analysis actually interesting.',
      'MAT337 with Elena was a highlight. She cares about students understanding.',
      'Amazing at breaking down hard proofs. Office hours are super helpful.',
    ],
    prediction: 'Upward trend in engagement and clarity. 2026 is expected to continue this pattern; highly recommended for analysis courses.',
  },
]

export function getProfessorBySlug(slug: string): Professor | undefined {
  return PROFESSORS.find((p) => p.slug === slug)
}

export function getAllProfessorSlugs(): string[] {
  return PROFESSORS.map((p) => p.slug)
}
