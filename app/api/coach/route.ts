import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  const { question, context } = await req.json()

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ answer: getMockAnswer(question) })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const goalsStr = context.goals?.length
      ? context.goals.map((g: any) => `- ${g.title} (${g.level}, ${g.timePerDay}min/day)`).join('\n')
      : 'No goals yet'

    const upcomingCount = context.sessions?.filter((s: any) => s.status === 'upcoming').length ?? 0

    const prompt = `You are Plan Coach, a friendly AI learning assistant inside SkillSync AI.

User's active goals:
${goalsStr}
Upcoming sessions: ${upcomingCount}

User says: "${question}"

Reply in 2-3 short sentences. Be specific, practical, and encouraging. If they mention missed days, time changes, difficulty, or rescheduling — give a concrete action. Keep it conversational.`

    const result = await model.generateContent(prompt)
    const answer = result.response.text()

    return NextResponse.json({ answer })
  } catch (err: any) {
    console.error('Gemini coach error:', err?.message)
    return NextResponse.json({ answer: getMockAnswer(question) })
  }
}

function getMockAnswer(q: string): string {
  const lower = q.toLowerCase()
  if (lower.includes('miss')) return "Missing sessions happens to everyone — don't stress it. I'd suggest moving the missed session to your next free evening and adding 10 extra minutes to compensate. Consistency over perfection!"
  if (lower.includes('easier') || lower.includes('easy')) return "Got it! I'll reduce the session intensity and add more review time at the start of each session. You'll build confidence faster with a gentler pace."
  if (lower.includes('harder') || lower.includes('intense')) return "Love the ambition! Increase your daily time by 15 minutes and replace one review session per week with an advanced challenge exercise. Let's push it."
  if (lower.includes('evening') || lower.includes('morning') || lower.includes('night')) return "Done! I've noted your preferred time. All upcoming sessions will be scheduled during that window — just reschedule any existing ones from the Calendar."
  if (lower.includes('20 min') || lower.includes('15 min') || lower.includes('less time')) return "No problem at all. For today, focus only on the core concept and skip the practice section — even 20 focused minutes makes a real difference."
  if (lower.includes('tip') || lower.includes('advice')) return "Biggest tip: study at the same time every day so it becomes automatic. Even 20 minutes of focused work beats an hour of distracted studying. You're on the right track!"
  if (lower.includes('explain') || lower.includes('help')) return "Happy to help! Start with the main concept, do one worked example, then try it yourself without looking. That cycle — concept → example → practice — is the fastest way to learn anything."
  return "Great question! The most important thing right now is to keep your sessions short and consistent. Small daily progress compounds dramatically over weeks. What specific part of your plan would you like to adjust?"
}
