import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isToday, isTomorrow, isYesterday, differenceInDays, addDays } from 'date-fns'
import { Session, TaskType, SessionStatus } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(time: string): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':').map(Number)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  return `${h}:${String(minutes).padStart(2, '0')} ${ampm}`
}

export function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'EEE, MMM d')
  } catch {
    return dateStr
  }
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

export function getTaskTypeLabel(type: TaskType): string {
  const labels: Record<TaskType, string> = {
    learn: 'Learn',
    practice: 'Practice',
    review: 'Review',
    quiz: 'Quiz',
    project: 'Project',
    break: 'Break',
  }
  return labels[type]
}

export function getStatusBadge(status: SessionStatus): string {
  const classes: Record<SessionStatus, string> = {
    upcoming: 'bg-blue-50 text-blue-700',
    done: 'bg-green-50 text-green-700',
    skipped: 'bg-gray-50 text-gray-600',
    rescheduled: 'bg-amber-50 text-amber-700',
    missed: 'bg-red-50 text-red-700',
  }
  return classes[status]
}

export function getStatusLabel(status: SessionStatus): string {
  const labels: Record<SessionStatus, string> = {
    upcoming: 'Upcoming',
    done: 'Done',
    skipped: 'Skipped',
    rescheduled: 'Rescheduled',
    missed: 'Missed',
  }
  return labels[status]
}

export function getDaysUntilDeadline(deadline: string): number {
  return differenceInDays(parseISO(deadline), new Date())
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export function getWeekDays(startDate: Date = new Date()): Date[] {
  const monday = new Date(startDate)
  monday.setDate(startDate.getDate() - startDate.getDay() + 1)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

export function groupSessionsByDate(sessions: Session[]): Record<string, Session[]> {
  return sessions.reduce((acc, session) => {
    if (!acc[session.date]) acc[session.date] = []
    acc[session.date].push(session)
    return acc
  }, {} as Record<string, Session[]>)
}

export function calculateCompletionRate(sessions: Session[]): number {
  const relevant = sessions.filter(s => s.status !== 'upcoming')
  if (!relevant.length) return 0
  const done = relevant.filter(s => s.status === 'done').length
  return Math.round((done / relevant.length) * 100)
}

export function calculateStreak(sessions: Session[]): number {
  const doneDates = [...new Set(
    sessions.filter(s => s.status === 'done').map(s => s.date)
  )].sort().reverse()

  if (!doneDates.length) return 0

  let streak = 0
  let current = new Date()

  for (const dateStr of doneDates) {
    const date = parseISO(dateStr)
    const diff = differenceInDays(current, date)
    if (diff <= 1) {
      streak++
      current = date
    } else {
      break
    }
  }
  return streak
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export const GOAL_COLORS = [
  '#4F46E5', '#06B6D4', '#F59E0B', '#22C55E',
  '#EF4444', '#8B5CF6', '#EC4899', '#F97316',
]

export function generateICSContent(session: Session): string {
  const startDate = session.date.replace(/-/g, '')
  const startTime = session.startTime.replace(':', '') + '00'
  const endTime = session.endTime.replace(':', '') + '00'

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SkillSync AI//EN',
    'BEGIN:VEVENT',
    `DTSTART:${startDate}T${startTime}`,
    `DTEND:${startDate}T${endTime}`,
    `SUMMARY:${session.goalTitle} - ${session.title}`,
    `DESCRIPTION:${session.description}`,
    `UID:${session.id}@skillsync.ai`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadICS(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
