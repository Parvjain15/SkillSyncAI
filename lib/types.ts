export type TaskType = 'learn' | 'practice' | 'review' | 'quiz' | 'project' | 'break'
export type SessionStatus = 'upcoming' | 'done' | 'skipped' | 'rescheduled' | 'missed'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type FocusTime = 'morning' | 'afternoon' | 'evening' | 'night'
export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived'

export interface TimeBlock {
  start: string
  end: string
  label: string
  type: 'busy' | 'free' | 'focus' | 'low-energy'
}

export interface DailyRoutine {
  id?: string
  routineText: string
  wakeTime: string
  sleepTime: string
  workClassBlocks: string
  commuteTime: string
  mealTimes: string
  gymChoresFamily: string
  existingCommitments: string
  bestFocusTime: FocusTime
  lowEnergyTime: string
  flexibleFreeTime: string
  daysOff: string[]
  busyBlocks?: TimeBlock[]
  freeBlocks?: TimeBlock[]
  bestStudySlots?: TimeBlock[]
  summary?: string
}

export interface Goal {
  id: string
  title: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  timePerDay: number
  daysPerWeek: number
  deadline?: string
  preferredTime: FocusTime
  status: GoalStatus
  createdAt: string
  color?: string
  emoji?: string
  roadmap?: WeekMilestone[]
}

export interface WeekMilestone {
  week: number
  title: string
  topics: string[]
  sessions: Session[]
}

export interface Session {
  id: string
  goalId: string
  goalTitle: string
  goalColor?: string
  date: string
  startTime: string
  endTime: string
  title: string
  description: string
  taskType: TaskType
  difficulty: Difficulty
  status: SessionStatus
  resources?: Resource[]
  calendarEventId?: string
  durationMinutes: number
  week?: number
}

export interface Resource {
  title: string
  url: string
  type: 'video' | 'article' | 'exercise' | 'flashcard' | 'quiz' | 'project' | 'course'
  free: boolean
}

export interface Progress {
  userId?: string
  goalId: string
  completedSessions: number
  missedSessions: number
  totalMinutes: number
  currentStreak: number
  longestStreak: number
  weeklyScore: number
  lastStudyDate?: string
  badges: Badge[]
}

export interface Badge {
  id: string
  name: string
  description: string
  emoji: string
  earnedAt: string
}

export interface WeeklyReport {
  goalId: string
  weekStart: string
  weekEnd: string
  completedSessions: number
  missedSessions: number
  totalMinutes: number
  completionRate: number
  currentStreak: number
  topicsCompleted: string[]
  topicsNeedingRevision: string[]
  aiSummary: string
  nextWeekFocus: string[]
}

export interface ReminderSettings {
  inApp: boolean
  email: boolean
  emailAddress?: string
  googleCalendar: boolean
  calendarReminderMinutes: number
  whatsapp: boolean
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  routine?: DailyRoutine
  reminderSettings?: ReminderSettings
  createdAt: string
}

export interface PlanCoachMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface OnboardingState {
  step: number
  routine: Partial<DailyRoutine>
  goal: string
  goalCategory: string
  timePerDay: number
  customTime?: number
  daysPerWeek: number
  level: 'beginner' | 'intermediate' | 'advanced'
  deadline?: string
  deadlineType: 'none' | 'date' | 'exam' | 'project'
  preferredTime: FocusTime
  reminders: ReminderSettings
}

export const GOAL_CATEGORIES = [
  { id: 'language', label: 'Learn Spanish', emoji: '🇪🇸', color: '#EF4444' },
  { id: 'coding', label: 'Learn Python', emoji: '🐍', color: '#3B82F6' },
  { id: 'ielts', label: 'Prepare for IELTS', emoji: '📝', color: '#8B5CF6' },
  { id: 'music', label: 'Learn Guitar', emoji: '🎸', color: '#F59E0B' },
  { id: 'networking', label: 'Networking Exam', emoji: '🌐', color: '#06B6D4' },
  { id: 'portfolio', label: 'Build a Portfolio', emoji: '💼', color: '#EC4899' },
  { id: 'data', label: 'Learn Data Analysis', emoji: '📊', color: '#10B981' },
  { id: 'custom', label: 'Custom Goal', emoji: '🎯', color: '#6366F1' },
]

export const TASK_TYPE_COLORS: Record<TaskType, string> = {
  learn: '#3B82F6',
  practice: '#7C3AED',
  review: '#D97706',
  quiz: '#16A34A',
  project: '#DB2777',
  break: '#94A3B8',
}

export const TASK_TYPE_BG: Record<TaskType, string> = {
  learn: 'bg-blue-100 text-blue-700',
  practice: 'bg-purple-100 text-purple-700',
  review: 'bg-amber-100 text-amber-700',
  quiz: 'bg-green-100 text-green-700',
  project: 'bg-pink-100 text-pink-700',
  break: 'bg-gray-100 text-gray-600',
}

export const ALL_BADGES: Omit<Badge, 'earnedAt'>[] = [
  { id: 'first_session', name: 'First Step', description: 'Completed your first session', emoji: '🌟' },
  { id: 'streak_7', name: '7-Day Streak', description: 'Studied 7 days in a row', emoji: '🔥' },
  { id: 'streak_30', name: '30-Day Learner', description: 'Studied 30 days in a row', emoji: '🏆' },
  { id: 'comeback', name: 'Comeback Kid', description: 'Returned after missing 3+ days', emoji: '💪' },
  { id: 'consistency', name: 'Consistency Master', description: '90% weekly completion for 4 weeks', emoji: '⭐' },
  { id: 'weekend', name: 'Weekend Warrior', description: 'Studied both Saturday and Sunday', emoji: '🦸' },
  { id: 'hour_100', name: '100 Minutes Club', description: 'Studied 100+ total minutes', emoji: '⏰' },
]
