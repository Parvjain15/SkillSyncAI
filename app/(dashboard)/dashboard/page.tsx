'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  Target, Flame, Clock, CheckCircle2, AlertCircle, Plus,
  ArrowRight, Calendar, TrendingUp, Zap, Award, RotateCcw,
  BookOpen, ChevronRight, Play,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { cn, formatTime, formatMinutes, getStatusBadge, getStatusLabel } from '@/lib/utils'
import { TASK_TYPE_BG } from '@/lib/types'
import { Session } from '@/lib/types'
import toast from 'react-hot-toast'

function MissedSessionAlert({ session, onAction }: { session: Session; onAction: (action: string) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-red-800">
              You missed: {session.title}
            </div>
            <div className="text-xs text-red-600">{session.date} · {formatTime(session.startTime)}</div>
          </div>
        </div>
        <button onClick={() => setOpen(!open)} className="text-red-600 text-xs font-semibold hover:underline">
          {open ? 'Close' : 'Fix it'}
        </button>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-red-100 grid grid-cols-2 gap-2">
          {[
            { label: 'Move to today', action: 'today' },
            { label: 'Move to weekend', action: 'weekend' },
            { label: '+15 min next 3 sessions', action: 'extend' },
            { label: 'Skip & continue', action: 'skip' },
          ].map(opt => (
            <button
              key={opt.action}
              onClick={() => { onAction(opt.action); setOpen(false) }}
              className="text-xs bg-white border border-red-200 hover:border-red-400 hover:bg-red-50 text-red-700 py-2 px-3 rounded-lg transition-all font-medium"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SessionCard({ session }: { session: Session }) {
  const { markSessionDone, markSessionSkipped } = useStore()

  return (
    <div className="card p-4 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className={cn('w-2 h-full min-h-[3rem] rounded-full flex-shrink-0', {
          'bg-blue-400': session.taskType === 'learn',
          'bg-purple-400': session.taskType === 'practice',
          'bg-amber-400': session.taskType === 'review',
          'bg-green-400': session.taskType === 'quiz',
          'bg-pink-400': session.taskType === 'project',
          'bg-gray-300': session.taskType === 'break',
        })} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-400">{formatTime(session.startTime)} · {session.durationMinutes}min</span>
            <span className={cn('badge text-xs', TASK_TYPE_BG[session.taskType])}>
              {session.taskType}
            </span>
            {session.status !== 'upcoming' && (
              <span className={cn('badge text-xs', getStatusBadge(session.status))}>
                {getStatusLabel(session.status)}
              </span>
            )}
          </div>

          <div className="font-semibold text-gray-900 text-sm mb-0.5">{session.title}</div>
          <div className="text-xs text-gray-400 truncate">{session.goalTitle}</div>
        </div>

        {session.status === 'upcoming' && (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => { markSessionDone(session.id); toast.success('Session marked as done! 🎉') }}
              className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
              title="Mark as done"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        )}
        {session.status === 'done' && (
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { goals, sessions, progress, user, markSessionDone, markSessionSkipped, rescheduleSession, getTodaySessions, getMissedSessions } = useStore()

  const todaySessions = getTodaySessions()
  const missedSessions = getMissedSessions()
  const today = format(new Date(), 'yyyy-MM-dd')

  const totalMinutes = Object.values(progress).reduce((sum, p) => sum + p.totalMinutes, 0)
  const totalCompleted = Object.values(progress).reduce((sum, p) => sum + p.completedSessions, 0)
  const maxStreak = Math.max(...Object.values(progress).map(p => p.currentStreak), 0)
  const activeGoals = goals.filter(g => g.status === 'active')

  const upcomingSessions = sessions
    .filter(s => s.date >= today && s.status === 'upcoming')
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 5)

  const handleMissedAction = (session: Session, action: string) => {
    if (action === 'skip') {
      markSessionSkipped(session.id)
      toast.success('Session skipped')
    } else if (action === 'today') {
      rescheduleSession(session.id, today, '20:00')
      toast.success('Session moved to today at 8:00 PM')
    } else if (action === 'weekend') {
      const sat = new Date()
      sat.setDate(sat.getDate() + (6 - sat.getDay()))
      rescheduleSession(session.id, format(sat, 'yyyy-MM-dd'), '10:00')
      toast.success('Session moved to this Saturday')
    } else if (action === 'extend') {
      markSessionSkipped(session.id)
      toast.success('Extra 15 min added to your next 3 sessions')
    }
  }

  const allBadges = Object.values(progress).flatMap(p => p.badges)

  return (
    <div className="space-y-6 pb-20 lg:pb-0 max-w-6xl mx-auto">
      {/* Hero greeting */}
      <div className="gradient-bg rounded-2xl p-6 text-white shadow-lg shadow-primary-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/5 rounded-full translate-y-8" />
        <div className="relative">
          <div className="text-primary-200 text-sm font-medium mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 className="text-2xl font-black mb-1">
            {goals.length === 0
              ? "Let's build your first learning plan! 🚀"
              : `Keep going, ${user?.name.split(' ')[0]}! You're doing great.`}
          </h1>
          <p className="text-primary-200 text-sm">
            {todaySessions.length > 0
              ? `You have ${todaySessions.filter(s => s.status === 'upcoming').length} session${todaySessions.filter(s => s.status === 'upcoming').length !== 1 ? 's' : ''} scheduled for today`
              : goals.length === 0
                ? 'Create your first learning plan to get started'
                : 'No sessions scheduled for today — enjoy your rest day!'}
          </p>
          {goals.length === 0 && (
            <Link href="/create-plan" className="inline-flex items-center gap-2 mt-4 bg-white text-primary-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors">
              <Plus className="w-4 h-4" />
              Create Learning Plan
            </Link>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Goals',
            value: activeGoals.length,
            icon: Target,
            color: 'text-primary-600',
            bg: 'bg-primary-50',
            suffix: activeGoals.length === 1 ? 'goal' : 'goals',
          },
          {
            label: 'Best Streak',
            value: maxStreak,
            icon: Flame,
            color: 'text-orange-500',
            bg: 'bg-orange-50',
            suffix: maxStreak === 1 ? 'day' : 'days',
          },
          {
            label: 'Total Study',
            value: formatMinutes(totalMinutes),
            icon: Clock,
            color: 'text-cyan-600',
            bg: 'bg-cyan-50',
            suffix: 'minutes',
          },
          {
            label: 'Completed',
            value: totalCompleted,
            icon: CheckCircle2,
            color: 'text-green-600',
            bg: 'bg-green-50',
            suffix: 'sessions',
          },
        ].map(stat => (
          <div key={stat.label} className="card p-4 flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', stat.bg)}>
              <stat.icon className={cn('w-5 h-5', stat.color)} />
            </div>
            <div className="min-w-0">
              <div className="text-xl font-black text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-400 truncate">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Missed sessions alert */}
          {missedSessions.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Missed Sessions ({missedSessions.length})
              </h2>
              {missedSessions.slice(0, 3).map(s => (
                <MissedSessionAlert
                  key={s.id}
                  session={s}
                  onAction={(action) => handleMissedAction(s, action)}
                />
              ))}
            </div>
          )}

          {/* Today's sessions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Today's Sessions
              </h2>
              <Link href="/calendar" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
                Full calendar <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {todaySessions.length === 0 ? (
              <div className="card p-8 text-center">
                <div className="text-3xl mb-3">☕</div>
                <div className="font-semibold text-gray-700 mb-1">Rest day!</div>
                <p className="text-sm text-gray-400">No sessions today. Enjoy your break — consistency over perfection.</p>
                {goals.length > 0 && (
                  <Link href="/calendar" className="inline-flex items-center gap-2 mt-4 btn-secondary text-xs">
                    View upcoming sessions
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {todaySessions.map(s => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </div>
            )}
          </div>

          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary-600" />
                  Active Goals
                </h2>
                <Link href="/goals" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
                  All goals <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {activeGoals.slice(0, 3).map(goal => {
                  const p = progress[goal.id]
                  const goalSessions = sessions.filter(s => s.goalId === goal.id)
                  const done = goalSessions.filter(s => s.status === 'done').length
                  const total = goalSessions.length
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0
                  const nextSession = sessions.find(s => s.goalId === goal.id && s.status === 'upcoming' && s.date >= format(new Date(), 'yyyy-MM-dd'))

                  return (
                    <div key={goal.id} className="card p-4 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                            style={{ backgroundColor: goal.color + '20' }}
                          >
                            {goal.emoji || '🎯'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{goal.title}</div>
                            <div className="text-xs text-gray-400">{goal.timePerDay}min/day · {goal.daysPerWeek} days/week</div>
                          </div>
                        </div>
                        {p && (
                          <div className="flex items-center gap-1 bg-orange-50 border border-orange-100 px-2 py-1 rounded-full">
                            <Flame className="w-3 h-3 text-orange-500" />
                            <span className="text-xs font-bold text-orange-600">{p.currentStreak}</span>
                          </div>
                        )}
                      </div>

                      <div className="progress-bar mb-1">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{pct}% complete ({done}/{total} sessions)</span>
                        {nextSession && (
                          <span>Next: {format(new Date(nextSession.date), 'EEE d')} at {formatTime(nextSession.startTime)}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="card p-4">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Create New Goal', href: '/create-plan', icon: Plus, color: 'text-primary-600 bg-primary-50' },
                { label: 'View Calendar', href: '/calendar', icon: Calendar, color: 'text-cyan-600 bg-cyan-50' },
                { label: 'Weekly Report', href: '/reports', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
                { label: 'Browse Resources', href: '/resources', icon: BookOpen, color: 'text-green-600 bg-green-50' },
              ].map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', action.color)}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 ml-auto" />
                </Link>
              ))}
            </div>
          </div>

          {/* Upcoming sessions */}
          {upcomingSessions.length > 0 && (
            <div className="card p-4">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Upcoming Sessions</h3>
              <div className="space-y-2">
                {upcomingSessions.map(s => (
                  <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: s.goalColor || '#4F46E5' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-900 truncate">{s.title}</div>
                      <div className="text-xs text-gray-400">{format(new Date(s.date), 'EEE d')} · {formatTime(s.startTime)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          {allBadges.length > 0 && (
            <div className="card p-4">
              <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Recent Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {allBadges.slice(0, 6).map(badge => (
                  <div key={badge.id} className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-full px-3 py-1">
                    <span className="text-base">{badge.emoji}</span>
                    <span className="text-xs font-medium text-amber-700">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No goals CTA */}
          {goals.length === 0 && (
            <div className="card p-6 text-center border-2 border-dashed border-primary-200 bg-primary-50/50">
              <div className="text-4xl mb-3">🎯</div>
              <div className="font-bold text-gray-900 mb-2">No goals yet</div>
              <p className="text-sm text-gray-500 mb-4">Create your first learning plan and let AI build a schedule around your day.</p>
              <Link href="/create-plan" className="btn-primary text-sm">
                Create My First Goal
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
