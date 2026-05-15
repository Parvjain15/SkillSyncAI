import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Goal, Session, WeekMilestone, TaskType } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { format, addDays } from 'date-fns'

function getStudyStartTime(preferredTime: string): string {
  const map: Record<string, string> = {
    morning: '07:00',
    afternoon: '14:00',
    evening: '19:00',
    night: '21:00',
  }
  return map[preferredTime] || '19:00'
}

function buildSessionsFromRoadmap(goal: Goal, roadmap: WeekMilestone[]): Session[] {
  const sessions: Session[] = []
  const startTime = getStudyStartTime(goal.preferredTime)
  const [ph, pm] = startTime.split(':').map(Number)
  const taskCycle: TaskType[] = ['learn', 'practice', 'review', 'quiz', 'project']
  const startDate = new Date()
  let dayOffset = 0

  for (const milestone of roadmap) {
    for (const topic of milestone.topics) {
      const sessionDate = addDays(startDate, dayOffset * Math.ceil(7 / goal.daysPerWeek))
      const totalEndMin = pm + goal.timePerDay
      const endH = ph + Math.floor(totalEndMin / 60)
      const endM = totalEndMin % 60

      sessions.push({
        id: generateId(),
        goalId: goal.id,
        goalTitle: goal.title,
        goalColor: goal.color,
        date: format(sessionDate, 'yyyy-MM-dd'),
        startTime,
        endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
        title: topic,
        description: `Week ${milestone.week}: ${milestone.title}`,
        taskType: taskCycle[dayOffset % taskCycle.length],
        difficulty: goal.level === 'advanced' ? 'hard' : goal.level === 'intermediate' ? 'medium' : 'easy',
        status: 'upcoming',
        durationMinutes: goal.timePerDay,
        week: milestone.week,
      })
      dayOffset++
    }
  }
  return sessions
}

function getFallbackRoadmap(goal: Goal): WeekMilestone[] {
  const weekCount = goal.deadline
    ? Math.max(4, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)))
    : 6

  const templates: Record<string, { title: string; topics: string[] }[]> = {
    language: [
      { title: 'Foundations', topics: ['Alphabet & Pronunciation', 'Greetings & Introductions', 'Numbers 1–100'] },
      { title: 'Grammar Core', topics: ['Common Verbs', 'Present Tense', 'Basic Sentences'] },
      { title: 'Vocabulary Boost', topics: ['Food & Dining', 'Travel Phrases', 'Question Forms'] },
      { title: 'Comprehension', topics: ['Listening Practice', 'Reading Short Texts', 'Writing Basics'] },
      { title: 'Conversation', topics: ['Conversation Drills', 'Cultural Context', 'Speaking Confidence'] },
      { title: 'Mastery', topics: ['Review & Consolidation', 'Mock Dialogue', 'Final Practice'] },
    ],
    coding: [
      { title: 'Syntax Basics', topics: ['Variables & Data Types', 'Control Flow', 'Functions'] },
      { title: 'Data Structures', topics: ['Lists & Dictionaries', 'File I/O', 'Error Handling'] },
      { title: 'OOP & APIs', topics: ['Classes & Objects', 'Modules & Packages', 'Working with APIs'] },
      { title: 'Data & Viz', topics: ['Pandas Basics', 'Matplotlib Charts', 'Mini Project'] },
      { title: 'Web & Automation', topics: ['Web Scraping', 'Automation Script', 'Code Review'] },
      { title: 'Projects', topics: ['Final Project', 'Portfolio Deployment', 'Interview Prep'] },
    ],
    ielts: [
      { title: 'Listening Basics', topics: ['Section 1 & 2 Practice', 'Note-Taking Skills', 'Academic Vocabulary'] },
      { title: 'Reading Skills', topics: ['Skimming & Scanning', 'True/False/Not Given', 'Matching Headings'] },
      { title: 'Writing Task 1', topics: ['Graph Description', 'Process Diagrams', 'Comparison Writing'] },
      { title: 'Writing Task 2', topics: ['Essay Structure', 'Argument Development', 'Conclusion Writing'] },
      { title: 'Speaking Prep', topics: ['Part 1 Fluency', 'Part 2 Long Turn', 'Part 3 Discussion'] },
      { title: 'Final Prep', topics: ['Full Mock Test', 'Weak Area Revision', 'Exam Day Strategy'] },
    ],
    music: [
      { title: 'First Chords', topics: ['Em, Am, D Chords', 'Strumming Patterns', 'Finger Exercises'] },
      { title: 'Song Basics', topics: ['G, C, F Chords', 'Simple Songs', 'Smooth Transitions'] },
      { title: 'Scale Theory', topics: ['Major Scale', 'Pentatonic Scale', 'Power Chords'] },
      { title: 'Lead Guitar', topics: ['Simple Riffs', 'Barre Chord Intro', 'Song Practice'] },
      { title: 'Full Songs', topics: ['Complete Song Performance', 'Improvisation Intro', 'Recording Yourself'] },
      { title: 'Performance', topics: ['Style & Expression', 'Final Song', 'Confidence Building'] },
    ],
    data: [
      { title: 'Python & Pandas', topics: ['NumPy Basics', 'DataFrames', 'Data Cleaning'] },
      { title: 'Visualization', topics: ['Matplotlib Charts', 'Seaborn Plots', 'EDA Workflow'] },
      { title: 'Statistics', topics: ['Descriptive Stats', 'Correlation', 'Hypothesis Testing'] },
      { title: 'ML Intro', topics: ['Scikit-learn Basics', 'Train/Test Split', 'Linear Regression'] },
      { title: 'Advanced ML', topics: ['Classification Models', 'Model Evaluation', 'Feature Engineering'] },
      { title: 'Portfolio', topics: ['Capstone Project', 'Dashboard Building', 'Presentation'] },
    ],
    networking: [
      { title: 'Network Basics', topics: ['OSI & TCP/IP Model', 'IP Addressing', 'Subnetting'] },
      { title: 'Routing', topics: ['Routing Protocols', 'Switching', 'VLANs'] },
      { title: 'Services', topics: ['DNS & DHCP', 'Firewall Basics', 'NAT/PAT'] },
      { title: 'Security', topics: ['Network Security', 'VPN Concepts', 'Wireless Security'] },
      { title: 'Labs', topics: ['Packet Tracer Lab', 'Troubleshooting Tools', 'Packet Analysis'] },
      { title: 'Exam Prep', topics: ['Mock Exam', 'Weak Area Drill', 'Exam Strategy'] },
    ],
  }

  const weeks = templates[goal.category] || Array.from({ length: weekCount }, (_, i) => ({
    title: `Week ${i + 1}`,
    topics: ['Core Concept', 'Practice Exercise', 'Review & Quiz'],
  }))

  return weeks.slice(0, weekCount).map((w, i) => ({
    week: i + 1,
    title: w.title,
    topics: w.topics,
    sessions: [],
  }))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const goal: Goal = body.goal

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    const roadmap = getFallbackRoadmap(goal)
    return NextResponse.json({ roadmap, sessions: buildSessionsFromRoadmap(goal, roadmap) })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const weeks = goal.deadline
      ? Math.max(4, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)))
      : 6

    const prompt = `Create a ${weeks}-week learning roadmap for: "${goal.title}"

Level: ${goal.level} | Daily time: ${goal.timePerDay} min | Days/week: ${goal.daysPerWeek}

Return ONLY valid JSON (no markdown, no explanation):
{
  "roadmap": [
    { "week": 1, "title": "Week Theme Name", "topics": ["Topic 1", "Topic 2", "Topic 3"] }
  ]
}

Rules:
- Exactly ${weeks} week objects
- Each week has 3–4 specific, actionable topic strings
- Topics should progress logically from basics to advanced
- Be concrete (e.g. "Present Tense Verbs" not "Grammar")`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const parsed = JSON.parse(jsonMatch[0])
    const sessions = buildSessionsFromRoadmap(goal, parsed.roadmap)
    return NextResponse.json({ roadmap: parsed.roadmap, sessions })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Gemini generate-plan error:', msg)
    const roadmap = getFallbackRoadmap(goal)
    return NextResponse.json({ roadmap, sessions: buildSessionsFromRoadmap(goal, roadmap) })
  }
}
