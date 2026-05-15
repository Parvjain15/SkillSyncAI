'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  Plus, Target, Flame, Clock, TrendingUp, MoreVertical,
  Pause, Play, Trash2, Edit3, CheckCircle2, Calendar, Award,
  AlertCircle, ChevronRight,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { cn, formatMinutes, getDaysUntilDeadline } from '@/lib/utils'
import { Goal, GoalStatus } from '@/lib/types'
import toast from 'react-hot-toast'

function GoalCard({ goal }: { goal: Goal }) {
  const { sessions, progress, updateGoal, deleteGoal } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const p = progress[goal.id]
  const goalSessions = sessions.filter(s => s.goalId === goal.id)
  const done = goalSessions.filter(s => s.status === 'done').length
  const total = goalSessions.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const nextSession = sessions
    .filter(s => s.goalId === goal.id && s.status === 'upcoming' && s.date >= format(new Date(), 'yyyy-MM-dd'))
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  const daysLeft = goal.deadline ? getDaysUntilDeadline(goal.deadline) : null

  const toggleStatus = () => {
    const newStatus: GoalStatus = goal.status === 'active' ? 'paused' : 'active'
    updateGoal(goal.id, { status: newStatus })
    toast.success(newStatus === 'active' ? 'Goal resumed!' : 'Goal paused')
    setMenuOpen(false)
  }

  const handleDelete = () => {
    if (confirm(`Delete "${goal.title}"? This cannot be undone.`)) {
      deleteGoal(goal.id)
      toast.success('Goal deleted')
    }
    setMenuOpen(false)
  }

  return (
    <div className={cn(
      'card p-5 hover:shadow-md transition-all relative',
      goal.status === 'paused' && 'opacity-70'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
            style={{ backgroundColor: goal.color + '20', border: `2px solid ${goal.color}40` }}
          >
            {goal.emoji || '🎯'}
          </div>
          <div>
            <h3 className="font-black text-gray-900">{goal.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn(
                'badge text-xs',
                goal.status === 'active' ? 'bg-green-50 text-green-700' :
                goal.status === 'paused' ? 'bg-amber-50 text-amber-700' :
                'bg-gray-50 text-gray-600'
              )}>
                {goal.status}
              </span>
              <span className="text-xs text-gray-400 capitalize">{goal.level}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-44 card shadow-xl z-10 overflow-hidden">
              <button
                onClick={toggleStatus}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {goal.status === 'active'
                  ? <><Pause className="w-4 h-4" /> Pause goal</>
                  : <><Play className="w-4 h-4" /> Resume goal</>
                }
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete goal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Daily', value: `${goal.timePerDay}m`, icon: Clock },
          { label: 'Per week', value: `${goal.daysPerWeek} days`, icon: Calendar },
          { label: 'Streak', value: p?.currentStreak || 0, icon: Flame, suffix: 'd' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
            <stat.icon className="w-3.5 h-3.5 text-gray-400 mx-auto mb-1" />
            <div className="font-bold text-gray-900 text-sm">{stat.value}{stat.suffix || ''}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span>{done}/{total} sessions</span>
          <span className="font-semibold text-gray-700">{pct}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          {nextSession ? (
            <div className="text-xs text-gray-500">
              Next: <span className="font-medium text-gray-700">
                {format(new Date(nextSession.date), 'EEE d MMM')} at {nextSession.startTime}
              </span>
            </div>
          ) : goal.status === 'active' ? (
            <div className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> No upcoming sessions
            </div>
          ) : null}

          {daysLeft !== null && daysLeft > 0 && (
            <div className={cn('text-xs mt-0.5', daysLeft < 7 ? 'text-red-600 font-semibold' : 'text-gray-400')}>
              {daysLeft} days until deadline
            </div>
          )}
        </div>

        {p && p.badges.length > 0 && (
          <div className="flex gap-1">
            {p.badges.slice(0, 3).map(b => (
              <span key={b.id} className="text-lg" title={b.name}>{b.emoji}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function GoalsPage() {
  const { goals, sessions, progress } = useStore()
  const [filter, setFilter] = useState<GoalStatus | 'all'>('all')

  const filtered = filter === 'all' ? goals : goals.filter(g => g.status === filter)

  const totalMinutes = Object.values(progress).reduce((s, p) => s + p.totalMinutes, 0)
  const totalCompleted = Object.values(progress).reduce((s, p) => s + p.completedSessions, 0)
  const allBadges = Object.values(progress).flatMap(p => p.badges)

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Goals</h1>
          <p className="text-gray-500 text-sm">{goals.length} goal{goals.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link href="/create-plan" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Goal
        </Link>
      </div>

      {/* Summary stats */}
      {goals.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Goals', value: goals.length, icon: Target, color: 'text-primary-600 bg-primary-50' },
            { label: 'Active', value: goals.filter(g => g.status === 'active').length, icon: Play, color: 'text-green-600 bg-green-50' },
            { label: 'Total Study', value: formatMinutes(totalMinutes), icon: Clock, color: 'text-cyan-600 bg-cyan-50' },
            { label: 'Badges', value: allBadges.length, icon: Award, color: 'text-amber-600 bg-amber-50' },
          ].map(s => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', s.color)}>
                <s.icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="font-black text-gray-900 text-lg">{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      {goals.length > 0 && (
        <div className="flex gap-2">
          {(['all', 'active', 'paused', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize',
                filter === f
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-200'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Goals grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {goals.length === 0 ? 'No goals yet' : 'No goals match this filter'}
          </h3>
          <p className="text-gray-500 mb-6">
            {goals.length === 0
              ? 'Create your first learning goal and let AI build your personalized plan.'
              : 'Try a different filter or create a new goal.'}
          </p>
          <Link href="/create-plan" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Goal
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  )
}
