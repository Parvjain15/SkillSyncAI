'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  User, Goal, Session, Progress, DailyRoutine, ReminderSettings,
  PlanCoachMessage, OnboardingState, Badge, ALL_BADGES,
} from './types'
import { generateId, calculateStreak } from './utils'
import { format } from 'date-fns'

interface AppState {
  // Auth
  user: User | null
  isAuthenticated: boolean

  // Data
  goals: Goal[]
  sessions: Session[]
  progress: Record<string, Progress>
  coachMessages: PlanCoachMessage[]

  // UI state
  onboarding: OnboardingState
  sidebarOpen: boolean
  notifications: AppAlert[]

  // Actions
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void

  addGoal: (goal: Goal) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void

  addSessions: (sessions: Session[]) => void
  updateSession: (id: string, updates: Partial<Session>) => void
  markSessionDone: (id: string) => void
  markSessionSkipped: (id: string) => void
  rescheduleSession: (id: string, newDate: string, newTime: string) => void

  updateProgress: (goalId: string, updates: Partial<Progress>) => void
  checkAndAwardBadges: (goalId: string) => void

  addCoachMessage: (msg: PlanCoachMessage) => void
  clearCoachMessages: () => void

  setOnboarding: (updates: Partial<OnboardingState>) => void
  resetOnboarding: () => void

  setSidebarOpen: (open: boolean) => void
  addNotification: (n: AppAlert) => void
  dismissNotification: (id: string) => void

  getTodaySessions: () => Session[]
  getMissedSessions: () => Session[]
  getGoalProgress: (goalId: string) => Progress | undefined
}

export interface AppAlert {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

const defaultOnboarding: OnboardingState = {
  step: 1,
  routine: {
    routineText: '',
    wakeTime: '07:00',
    sleepTime: '23:00',
    workClassBlocks: '',
    commuteTime: '',
    mealTimes: '',
    gymChoresFamily: '',
    existingCommitments: '',
    bestFocusTime: 'evening',
    lowEnergyTime: '',
    flexibleFreeTime: '',
    daysOff: [],
  },
  goal: '',
  goalCategory: '',
  timePerDay: 30,
  daysPerWeek: 5,
  level: 'beginner',
  deadlineType: 'none',
  preferredTime: 'evening',
  reminders: {
    inApp: true,
    email: false,
    googleCalendar: false,
    calendarReminderMinutes: 15,
    whatsapp: false,
  },
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      goals: [],
      sessions: [],
      progress: {},
      coachMessages: [],
      onboarding: defaultOnboarding,
      sidebarOpen: true,
      notifications: [],

      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false, goals: [], sessions: [], progress: {} }),

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),

      addGoal: (goal) => set((state) => ({
        goals: [goal, ...state.goals],
        progress: {
          ...state.progress,
          [goal.id]: {
            goalId: goal.id,
            completedSessions: 0,
            missedSessions: 0,
            totalMinutes: 0,
            currentStreak: 0,
            longestStreak: 0,
            weeklyScore: 0,
            badges: [],
          },
        },
      })),

      updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g),
      })),

      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id),
        sessions: state.sessions.filter(s => s.goalId !== id),
      })),

      addSessions: (sessions) => set((state) => ({
        sessions: [...state.sessions, ...sessions],
      })),

      updateSession: (id, updates) => set((state) => ({
        sessions: state.sessions.map(s => s.id === id ? { ...s, ...updates } : s),
      })),

      markSessionDone: (id) => {
        const { sessions, progress } = get()
        const session = sessions.find(s => s.id === id)
        if (!session) return

        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === id ? { ...s, status: 'done' as const } : s
          ),
        }))

        const goalProgress = progress[session.goalId]
        if (goalProgress) {
          const allDone = [...sessions.map(s =>
            s.id === id ? { ...s, status: 'done' as const } : s
          )]
          const streak = calculateStreak(allDone.filter(s => s.goalId === session.goalId))

          set((state) => ({
            progress: {
              ...state.progress,
              [session.goalId]: {
                ...goalProgress,
                completedSessions: goalProgress.completedSessions + 1,
                totalMinutes: goalProgress.totalMinutes + session.durationMinutes,
                currentStreak: streak,
                longestStreak: Math.max(goalProgress.longestStreak, streak),
                lastStudyDate: format(new Date(), 'yyyy-MM-dd'),
              },
            },
          }))
          get().checkAndAwardBadges(session.goalId)
        }
      },

      markSessionSkipped: (id) => set((state) => ({
        sessions: state.sessions.map(s =>
          s.id === id ? { ...s, status: 'skipped' as const } : s
        ),
      })),

      rescheduleSession: (id, newDate, newTime) => set((state) => ({
        sessions: state.sessions.map(s => {
          if (s.id !== id) return s
          const [h, m] = newTime.split(':').map(Number)
          const endH = h + Math.floor((m + s.durationMinutes) / 60)
          const endM = (m + s.durationMinutes) % 60
          return {
            ...s,
            date: newDate,
            startTime: newTime,
            endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
            status: 'rescheduled' as const,
          }
        }),
      })),

      updateProgress: (goalId, updates) => set((state) => ({
        progress: {
          ...state.progress,
          [goalId]: { ...state.progress[goalId], ...updates },
        },
      })),

      checkAndAwardBadges: (goalId) => {
        const { progress, sessions } = get()
        const p = progress[goalId]
        if (!p) return

        const newBadges: Badge[] = []
        const existingIds = p.badges.map(b => b.id)

        if (p.completedSessions >= 1 && !existingIds.includes('first_session')) {
          const b = ALL_BADGES.find(b => b.id === 'first_session')!
          newBadges.push({ ...b, earnedAt: new Date().toISOString() })
        }
        if (p.currentStreak >= 7 && !existingIds.includes('streak_7')) {
          const b = ALL_BADGES.find(b => b.id === 'streak_7')!
          newBadges.push({ ...b, earnedAt: new Date().toISOString() })
        }
        if (p.currentStreak >= 30 && !existingIds.includes('streak_30')) {
          const b = ALL_BADGES.find(b => b.id === 'streak_30')!
          newBadges.push({ ...b, earnedAt: new Date().toISOString() })
        }
        if (p.totalMinutes >= 100 && !existingIds.includes('hour_100')) {
          const b = ALL_BADGES.find(b => b.id === 'hour_100')!
          newBadges.push({ ...b, earnedAt: new Date().toISOString() })
        }

        // Weekend warrior
        const goalSessions = sessions.filter(s => s.goalId === goalId && s.status === 'done')
        const hasWeekend = goalSessions.some(s => {
          const d = new Date(s.date)
          return d.getDay() === 0 || d.getDay() === 6
        })
        if (hasWeekend && !existingIds.includes('weekend')) {
          const b = ALL_BADGES.find(b => b.id === 'weekend')!
          newBadges.push({ ...b, earnedAt: new Date().toISOString() })
        }

        if (newBadges.length > 0) {
          set((state) => ({
            progress: {
              ...state.progress,
              [goalId]: {
                ...p,
                badges: [...p.badges, ...newBadges],
              },
            },
          }))
        }
      },

      addCoachMessage: (msg) => set((state) => ({
        coachMessages: [...state.coachMessages, msg],
      })),

      clearCoachMessages: () => set({ coachMessages: [] }),

      setOnboarding: (updates) => set((state) => ({
        onboarding: { ...state.onboarding, ...updates },
      })),

      resetOnboarding: () => set({ onboarding: defaultOnboarding }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      addNotification: (n) => set((state) => ({
        notifications: [n, ...state.notifications].slice(0, 20),
      })),

      dismissNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => (n as any).id !== id),
      })),

      getTodaySessions: () => {
        const today = format(new Date(), 'yyyy-MM-dd')
        return get().sessions.filter(s => s.date === today)
      },

      getMissedSessions: () => {
        const today = format(new Date(), 'yyyy-MM-dd')
        return get().sessions.filter(s =>
          s.date < today && s.status === 'upcoming'
        )
      },

      getGoalProgress: (goalId) => {
        return get().progress[goalId]
      },
    }),
    {
      name: 'skillsync-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        goals: state.goals,
        sessions: state.sessions,
        progress: state.progress,
        notifications: state.notifications,
      }),
    }
  )
)
