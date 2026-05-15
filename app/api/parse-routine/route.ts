import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  const { routineText } = await req.json()

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json(getDefaultRoutine())

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Analyze this daily routine and extract schedule information.

Routine: "${routineText}"

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "busyBlocks": [{"start": "HH:MM", "end": "HH:MM", "label": "string", "type": "busy"}],
  "freeBlocks": [{"start": "HH:MM", "end": "HH:MM", "label": "string", "type": "free"}],
  "bestStudySlots": [{"start": "HH:MM", "end": "HH:MM", "label": "Best Study Window", "type": "focus"}],
  "summary": "One sentence about the best study time based on this routine"
}

Use 24-hour HH:MM format. Identify all commitments (work, class, gym, meals) as busy blocks. Free time as free blocks. Pick the best 45–60 min quiet window as the study slot.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return NextResponse.json(JSON.parse(jsonMatch[0]))
    }
    throw new Error('No JSON found in response')
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Gemini parse-routine error:', msg)
    return NextResponse.json(getDefaultRoutine())
  }
}

function getDefaultRoutine() {
  return {
    busyBlocks: [
      { start: '09:00', end: '17:00', label: 'Work / School', type: 'busy' },
      { start: '19:00', end: '19:30', label: 'Dinner', type: 'busy' },
    ],
    freeBlocks: [
      { start: '07:00', end: '09:00', label: 'Morning', type: 'free' },
      { start: '20:00', end: '22:30', label: 'Evening', type: 'focus' },
    ],
    bestStudySlots: [
      { start: '20:00', end: '20:45', label: 'Best Study Window', type: 'focus' },
    ],
    summary: 'Your best study window appears to be in the evening — quiet time when you can focus without interruption.',
  }
}
