import { NextRequest, NextResponse } from 'next/server'
import { PROFESSORS, getProfessorBySlug } from '@/lib/data'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (slug) {
    const professor = getProfessorBySlug(slug)
    if (!professor) {
      return NextResponse.json({ error: 'Professor not found' }, { status: 404 })
    }
    return NextResponse.json(professor)
  }

  return NextResponse.json(PROFESSORS)
}
