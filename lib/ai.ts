import { DailyRoutine, Goal, Session, WeekMilestone, TaskType, FocusTime } from './types'
import { generateId } from './utils'
import { format, addDays, parseISO } from 'date-fns'

// ── Mock data for offline/demo mode ────────────────────────────────────────

function getStudyTimeFromFocus(focus: FocusTime): string {
  const times: Record<FocusTime, string> = {
    morning: '07:00',
    afternoon: '14:00',
    evening: '19:00',
    night: '21:00',
  }
  return times[focus]
}

function buildSessions(
  goal: Goal,
  roadmap: WeekMilestone[],
  startDate: Date = new Date()
): Session[] {
  const sessions: Session[] = []
  const preferredTime = getStudyTimeFromFocus(goal.preferredTime)
  const [ph, pm] = preferredTime.split(':').map(Number)

  const taskCycle: TaskType[] = ['learn', 'practice', 'review', 'quiz', 'project']
  let sessionIndex = 0

  for (const milestone of roadmap) {
    for (const topic of milestone.topics) {
      // find the next available day (skip off-days crudely for now)
      const sessionDate = addDays(startDate, sessionIndex * Math.ceil(7 / goal.daysPerWeek))

      const endH = ph + Math.floor((pm + goal.timePerDay) / 60)
      const endM = (pm + goal.timePerDay) % 60

      const taskType = taskCycle[sessionIndex % taskCycle.length]

      sessions.push({
        id: generateId(),
        goalId: goal.id,
        goalTitle: goal.title,
        goalColor: goal.color,
        date: format(sessionDate, 'yyyy-MM-dd'),
        startTime: preferredTime,
        endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
        title: topic,
        description: `Week ${milestone.week}: ${milestone.title} — ${topic}`,
        taskType,
        difficulty: goal.level === 'beginner' ? 'easy' : goal.level === 'intermediate' ? 'medium' : 'hard',
        status: 'upcoming',
        durationMinutes: goal.timePerDay,
        week: milestone.week,
        resources: generateResources(goal.category, topic),
      })
      sessionIndex++
    }
  }

  return sessions
}

function generateResources(category: string, topic: string) {
  const resourceMap: Record<string, any[]> = {
    language: [
      { title: 'Duolingo Practice', url: 'https://duolingo.com', type: 'exercise', free: true },
      { title: 'SpanishDict Grammar', url: 'https://spanishdict.com', type: 'article', free: true },
      { title: 'YouTube Pronunciation Guide', url: 'https://youtube.com', type: 'video', free: true },
    ],
    coding: [
      { title: 'Python Docs', url: 'https://docs.python.org', type: 'article', free: true },
      { title: 'FreeCodeCamp Python', url: 'https://freecodecamp.org', type: 'course', free: true },
      { title: 'Practice on Replit', url: 'https://replit.com', type: 'exercise', free: true },
    ],
    ielts: [
      { title: 'British Council IELTS', url: 'https://britishcouncil.org/exam/ielts', type: 'course', free: true },
      { title: 'IELTS Practice Tests', url: 'https://ielts.org', type: 'quiz', free: true },
      { title: 'YouTube Band 9 Tips', url: 'https://youtube.com', type: 'video', free: true },
    ],
    music: [
      { title: 'JustinGuitar', url: 'https://justinguitar.com', type: 'course', free: true },
      { title: 'Ultimate Guitar Tabs', url: 'https://ultimate-guitar.com', type: 'exercise', free: true },
      { title: 'YouTube Guitar Lesson', url: 'https://youtube.com', type: 'video', free: true },
    ],
    data: [
      { title: 'Kaggle Learn', url: 'https://kaggle.com/learn', type: 'course', free: true },
      { title: 'Pandas Docs', url: 'https://pandas.pydata.org', type: 'article', free: true },
      { title: 'DataCamp Free Tracks', url: 'https://datacamp.com', type: 'course', free: true },
    ],
    networking: [
      { title: 'Cisco Learning Network', url: 'https://learningnetwork.cisco.com', type: 'course', free: true },
      { title: 'Professor Messer', url: 'https://professormesser.com', type: 'video', free: true },
      { title: 'NetworkChuck YouTube', url: 'https://youtube.com/@NetworkChuck', type: 'video', free: true },
    ],
  }

  return resourceMap[category] || [
    { title: 'Google Search', url: `https://google.com/search?q=${encodeURIComponent(topic)}`, type: 'article', free: true },
    { title: 'YouTube Tutorial', url: 'https://youtube.com', type: 'video', free: true },
  ]
}

// ── Mock roadmap generator ──────────────────────────────────────────────────

function generateMockRoadmap(goal: Goal): WeekMilestone[] {
  const roadmaps: Record<string, string[][]> = {
    language: [
      ['Alphabet & Pronunciation', 'Greetings & Introductions', 'Numbers 1-100'],
      ['Common Verbs', 'Present Tense', 'Basic Sentences'],
      ['Food & Dining Vocabulary', 'Travel Phrases', 'Question Forms'],
      ['Listening Comprehension', 'Speaking Practice', 'Writing Basics'],
      ['Conversation Drills', 'Reading Short Texts', 'Cultural Context'],
      ['Review & Consolidation', 'Mock Dialogue', 'Confidence Building'],
    ],
    coding: [
      ['Variables & Data Types', 'Control Flow', 'Functions'],
      ['Lists & Dictionaries', 'File I/O', 'Error Handling'],
      ['OOP Basics', 'Modules & Packages', 'Working with APIs'],
      ['Data Manipulation with Pandas', 'Visualization Basics', 'Mini Project'],
      ['Web Scraping', 'Automation Script', 'Code Review'],
      ['Final Project', 'Portfolio Deployment', 'Interview Prep'],
    ],
    ielts: [
      ['Listening Section 1 & 2', 'Reading Skimming', 'Academic Vocabulary'],
      ['Listening Section 3 & 4', 'Reading Scanning', 'Task 1 Writing'],
      ['Speaking Part 1', 'Reading True/False', 'Task 2 Essay Structure'],
      ['Speaking Part 2 Long Turn', 'Listening Practice Test', 'Grammar Review'],
      ['Mock Test Full', 'Speaking Part 3', 'Writing Feedback'],
      ['Final Mock Exam', 'Weak Area Revision', 'Exam Strategy'],
    ],
    music: [
      ['Basic Chords: Em, Am, D', 'Strumming Patterns', 'Finger Exercises'],
      ['Chords: G, C, F', 'Simple Songs', 'Chord Transitions'],
      ['Power Chords', 'Barre Chord Intro', 'Scale Basics'],
      ['Pentatonic Scale', 'Simple Riffs', 'Song Practice'],
      ['Lead Guitar Basics', 'Full Song Performance', 'Recording'],
      ['Improvisation Intro', 'Style & Expression', 'Final Performance'],
    ],
    data: [
      ['Python Basics & NumPy', 'Pandas DataFrames', 'Data Cleaning'],
      ['Exploratory Data Analysis', 'Matplotlib Charts', 'Seaborn Visualization'],
      ['Statistical Concepts', 'Correlation Analysis', 'Hypothesis Testing'],
      ['Machine Learning Intro', 'Scikit-learn Basics', 'Model Training'],
      ['Regression & Classification', 'Model Evaluation', 'Feature Engineering'],
      ['Capstone Project', 'Dashboard Building', 'Portfolio Presentation'],
    ],
    networking: [
      ['OSI & TCP/IP Model', 'IP Addressing', 'Subnetting Basics'],
      ['Routing Protocols', 'Switching Concepts', 'VLANs'],
      ['DNS & DHCP', 'Firewall Basics', 'NAT/PAT'],
      ['Wireless Networking', 'Network Security', 'VPN Concepts'],
      ['Troubleshooting Tools', 'Packet Analysis', 'Lab Practice'],
      ['Mock Exam', 'Exam Strategies', 'Final Review'],
    ],
    portfolio: [
      ['Portfolio Strategy', 'Tech Stack Selection', 'GitHub Setup'],
      ['Project 1: Landing Page', 'Responsive Design', 'CSS Animations'],
      ['Project 2: Web App', 'React Basics', 'API Integration'],
      ['Project 3: Backend', 'Node.js/Express', 'Database Design'],
      ['Deployment & DevOps', 'Performance Optimization', 'SEO Basics'],
      ['Final Polish', 'Custom Domain', 'Sharing & Networking'],
    ],
    custom: [
      ['Foundation Concepts', 'Core Principles', 'Getting Started'],
      ['Intermediate Skills', 'Hands-on Practice', 'Real Examples'],
      ['Advanced Topics', 'Deep Dive', 'Problem Solving'],
      ['Application & Projects', 'Real-world Practice', 'Feedback Loop'],
      ['Review & Refinement', 'Fill Gaps', 'Strengthen Weak Areas'],
      ['Final Assessment', 'Showcase Work', 'Next Steps'],
    ],
  }

  const topics = roadmaps[goal.category] || roadmaps['custom']
  const weekCount = goal.deadline
    ? Math.max(4, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)))
    : 6

  return topics.slice(0, weekCount).map((weekTopics, i) => ({
    week: i + 1,
    title: getWeekTitle(goal.category, i),
    topics: weekTopics,
    sessions: [],
  }))
}

function getWeekTitle(category: string, weekIndex: number): string {
  const titles: Record<string, string[]> = {
    language: ['Foundations', 'Grammar Core', 'Vocabulary Boost', 'Comprehension', 'Conversation', 'Mastery'],
    coding: ['Syntax Basics', 'Data Structures', 'OOP & APIs', 'Data & Viz', 'Web & Automation', 'Projects'],
    ielts: ['Listening Basics', 'Reading Skills', 'Writing Task 1', 'Speaking Prep', 'Full Mock', 'Final Prep'],
    music: ['First Chords', 'Song Basics', 'Scale Theory', 'Lead Guitar', 'Full Songs', 'Performance'],
    data: ['Python & Pandas', 'Visualization', 'Statistics', 'ML Intro', 'Advanced ML', 'Portfolio'],
    networking: ['Network Basics', 'Routing', 'Services', 'Security', 'Labs', 'Exam Prep'],
    portfolio: ['Planning', 'Project 1', 'Project 2', 'Backend', 'Deploy', 'Launch'],
    custom: ['Foundation', 'Core Skills', 'Advanced', 'Application', 'Review', 'Mastery'],
  }
  return (titles[category] || titles['custom'])[weekIndex] || `Week ${weekIndex + 1}`
}

// ── Main AI functions ───────────────────────────────────────────────────────

export async function parseRoutine(routineText: string): Promise<Partial<DailyRoutine>> {
  try {
    const res = await fetch('/api/parse-routine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routineText }),
    })
    if (res.ok) return await res.json()
  } catch {
    // fallback to mock
  }

  return {
    busyBlocks: [
      { start: '10:00', end: '14:00', label: 'Class/Work', type: 'busy' },
      { start: '18:00', end: '19:00', label: 'Gym', type: 'busy' },
      { start: '20:00', end: '20:30', label: 'Dinner', type: 'busy' },
    ],
    freeBlocks: [
      { start: '08:00', end: '09:30', label: 'Morning Free', type: 'free' },
      { start: '14:30', end: '17:30', label: 'Afternoon Free', type: 'free' },
      { start: '21:00', end: '23:00', label: 'Evening Free', type: 'focus' },
    ],
    bestStudySlots: [
      { start: '21:00', end: '21:45', label: 'Best Study Window', type: 'focus' },
    ],
    summary: 'Your best available learning window is 9:00 PM – 10:00 PM, when you\'re free and likely most focused.',
  }
}

export async function generatePlan(goal: Goal, routine: Partial<DailyRoutine>): Promise<{
  roadmap: WeekMilestone[]
  sessions: Session[]
}> {
  try {
    const res = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, routine }),
    })
    if (res.ok) return await res.json()
  } catch {
    // fallback
  }

  const roadmap = generateMockRoadmap(goal)
  const sessions = buildSessions(goal, roadmap)
  return { roadmap, sessions }
}

export async function askPlanCoach(
  question: string,
  context: { goals: Goal[]; sessions: Session[] }
): Promise<string> {
  try {
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context }),
    })
    if (res.ok) {
      const data = await res.json()
      return data.answer
    }
  } catch {
    // fallback
  }

  // Smart mock responses
  const q = question.toLowerCase()
  if (q.includes('miss')) return "No worries! Missing sessions happens to everyone. I've noted your missed sessions and will add 10 extra minutes to your next 3 sessions to catch up. You're still on track!"
  if (q.includes('easier') || q.includes('easy')) return "Got it! I'll reduce the session intensity and add more review time. Your next sessions will be shorter with more repetition to build confidence."
  if (q.includes('harder') || q.includes('intense')) return "Excellent ambition! I'll increase difficulty and add bonus challenge exercises. Expect more complex topics and less review time."
  if (q.includes('evening') || q.includes('morning') || q.includes('afternoon') || q.includes('night')) return "Perfect! I've rescheduled all your upcoming sessions to your preferred time. Your plan is now fully updated."
  if (q.includes('20 min') || q.includes('15 min') || q.includes('less time')) return "No problem! I've compressed today's session into a focused 20-minute power session covering the most important points."
  if (q.includes('explain') || q.includes('help')) return "Happy to explain! The topic for today focuses on building the core foundation. Start with the concept, practice with examples, then test yourself with a quick quiz. Take your time — understanding beats speed."
  return "Great question! Based on your current plan and progress, I recommend staying consistent with your schedule. Small daily sessions beat occasional long ones. You're doing well — keep it up!"
}

export async function generateWeeklyReport(sessions: Session[], goal: Goal) {
  const completed = sessions.filter(s => s.status === 'done')
  const missed = sessions.filter(s => s.status === 'missed' || (s.status === 'upcoming' && s.date < format(new Date(), 'yyyy-MM-dd')))
  const totalMinutes = completed.reduce((sum, s) => sum + s.durationMinutes, 0)

  return {
    completedSessions: completed.length,
    missedSessions: missed.length,
    totalMinutes,
    completionRate: sessions.length ? Math.round((completed.length / sessions.length) * 100) : 0,
    aiSummary: `You completed ${completed.length} out of ${sessions.length} ${goal.title} sessions this week. ${
      completed.length >= sessions.length * 0.8
        ? 'Excellent consistency! Keep the momentum going.'
        : 'You missed a few sessions — consider adjusting your schedule or reducing daily time.'
    }`,
    nextWeekFocus: ['Continue from where you left off', 'Focus on the topics you found difficult', 'Try to maintain your streak'],
    topicsCompleted: completed.map(s => s.title),
    topicsNeedingRevision: missed.map(s => s.title),
  }
}
