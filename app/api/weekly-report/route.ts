import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { sessions, goal, weekStart, weekEnd } = await req.json()

  const completed = sessions.filter((s: any) => s.status === 'done')
  const missed = sessions.filter((s: any) => s.status !== 'done' && s.status !== 'upcoming')
  const totalMinutes = completed.reduce((sum: number, s: any) => sum + s.durationMinutes, 0)
  const completionRate = sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0

  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('No key')

    const prompt = `Write a brief, motivating weekly progress report for a learner studying "${goal.title}".

Stats: ${completed.length} sessions completed, ${missed.length} missed, ${totalMinutes} minutes total, ${completionRate}% completion rate.
Completed topics: ${completed.map((s: any) => s.title).join(', ') || 'none'}
Missed topics: ${missed.map((s: any) => s.title).join(', ') || 'none'}

Write 2-3 sentences of personalized AI feedback. Be encouraging but honest.`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 200 },
        }),
      }
    )

    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    const aiSummary = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return NextResponse.json({
      completedSessions: completed.length,
      missedSessions: missed.length,
      totalMinutes,
      completionRate,
      aiSummary,
      topicsCompleted: completed.map((s: any) => s.title),
      topicsNeedingRevision: missed.map((s: any) => s.title),
      nextWeekFocus: ['Continue from where you left off', 'Focus on weak areas', 'Maintain your streak'],
    })
  } catch {
    return NextResponse.json({
      completedSessions: completed.length,
      missedSessions: missed.length,
      totalMinutes,
      completionRate,
      aiSummary: `You completed ${completed.length} out of ${sessions.length} sessions this week${completionRate >= 80 ? ' — excellent work!' : '. Try to catch up on missed sessions next week.'}`,
      topicsCompleted: completed.map((s: any) => s.title),
      topicsNeedingRevision: missed.map((s: any) => s.title),
      nextWeekFocus: ['Continue from where you left off', 'Focus on topics you found difficult', 'Keep your streak going'],
    })
  }
}
