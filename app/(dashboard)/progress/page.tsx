'use client'

import { useState } from 'react'
import { format, subDays } from 'date-fns'
import {
  TrendingUp, Flame, Clock, CheckCircle2, Target, Award,
  BarChart3, Calendar,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useStore } from '@/lib/store'
import { cn, formatMinutes, calculateCompletionRate } from '@/lib/utils'

const COLORS = ['#4F46E5', '#06B6D4', '#F59E0B', '#22C55E', '#EC4899', '#8B5CF6']

function generateStudyData(sessions: any[]) {
  return Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const daySessions = sessions.filter(s => s.date === dateStr && s.status === 'done')
    return {
      date: format(date, 'MMM d'),
      minutes: daySessions.reduce((sum: number, s: any) => sum + s.durationMinutes, 0),
      sessions: daySessions.length,
    }
  })
}

function generateTaskTypeData(sessions: any[]) {
  const counts: Record<string, number> = {}
  sessions.filter(s => s.status === 'done').forEach(s => {
    counts[s.taskType] = (counts[s.taskType] || 0) + 1
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

export default function ProgressPage() {
  const { goals, sessions, progress } = useStore()
  const [selectedGoal, setSelectedGoal] = useState<string>('all')

  const filteredSessions = selectedGoal === 'all'
    ? sessions
    : sessions.filter(s => s.goalId === selectedGoal)

  const studyData = generateStudyData(filteredSessions)
  const taskTypeData = generateTaskTypeData(filteredSessions)

  const totalMinutes = selectedGoal === 'all'
    ? Object.values(progress).reduce((s, p) => s + p.totalMinutes, 0)
    : (progress[selectedGoal]?.totalMinutes || 0)

  const completedCount = selectedGoal === 'all'
    ? Object.values(progress).reduce((s, p) => s + p.completedSessions, 0)
    : (progress[selectedGoal]?.completedSessions || 0)

  const maxStreak = selectedGoal === 'all'
    ? Math.max(...Object.values(progress).map(p => p.currentStreak), 0)
    : (progress[selectedGoal]?.currentStreak || 0)

  const longestStreak = selectedGoal === 'all'
    ? Math.max(...Object.values(progress).map(p => p.longestStreak), 0)
    : (progress[selectedGoal]?.longestStreak || 0)

  const completionRate = calculateCompletionRate(filteredSessions)

  const allBadges = selectedGoal === 'all'
    ? Object.values(progress).flatMap(p => p.badges)
    : (progress[selectedGoal]?.badges || [])

  const weeklyTotal = filteredSessions
    .filter(s => {
      const date = new Date(s.date)
      const weekAgo = subDays(new Date(), 7)
      return date >= weekAgo && s.status === 'done'
    })
    .reduce((sum, s) => sum + s.durationMinutes, 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Progress</h1>
          <p className="text-gray-500 text-sm">Track your learning journey over time</p>
        </div>
        <select
          value={selectedGoal}
          onChange={e => setSelectedGoal(e.target.value)}
          className="input text-sm w-auto"
        >
          <option value="all">All goals</option>
          {goals.map(g => <option key={g.id} value={g.id}>{g.emoji} {g.title}</option>)}
        </select>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Study Time', value: formatMinutes(totalMinutes), icon: Clock, color: 'text-primary-600 bg-primary-50', sub: 'all time' },
          { label: 'This Week', value: formatMinutes(weeklyTotal), icon: Calendar, color: 'text-cyan-600 bg-cyan-50', sub: 'last 7 days' },
          { label: 'Current Streak', value: `${maxStreak} days`, icon: Flame, color: 'text-orange-500 bg-orange-50', sub: `Best: ${longestStreak} days` },
          { label: 'Sessions Done', value: completedCount, icon: CheckCircle2, color: 'text-green-600 bg-green-50', sub: `${completionRate}% rate` },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-700 font-medium mt-0.5">{stat.label}</div>
            <div className="text-xs text-gray-400">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Study minutes area chart */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary-600" />
            Study Minutes — Last 14 Days
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={studyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: 12 }}
                formatter={(v: any) => [`${v} min`, 'Study time']}
              />
              <Area type="monotone" dataKey="minutes" stroke="#4F46E5" strokeWidth={2} fill="url(#studyGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Task type breakdown */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-600" />
            Session Types
          </h3>
          {taskTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={taskTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {taskTypeData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">
              Complete sessions to see breakdown
            </div>
          )}
        </div>
      </div>

      {/* Sessions bar chart */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          Daily Sessions — Last 14 Days
        </h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={studyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={1} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: 12 }} formatter={(v: any) => [v, 'Sessions']} />
            <Bar dataKey="sessions" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Goal-by-goal breakdown */}
      {goals.length > 0 && (
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-4">Goal Breakdown</h3>
          <div className="space-y-4">
            {goals.map(goal => {
              const p = progress[goal.id]
              if (!p) return null
              const goalSessions = sessions.filter(s => s.goalId === goal.id)
              const done = goalSessions.filter(s => s.status === 'done').length
              const total = goalSessions.length
              const pct = total > 0 ? Math.round((done / total) * 100) : 0

              return (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{goal.emoji}</span>
                      <span className="font-semibold text-sm text-gray-900">{goal.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" /> {p.currentStreak}d
                      </span>
                      <span>{formatMinutes(p.totalMinutes)}</span>
                      <span className="font-bold text-gray-700">{pct}%</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: goal.color || '#4F46E5' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Badges */}
      {allBadges.length > 0 && (
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Earned Badges
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allBadges.map((badge, i) => (
              <div key={i} className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-2xl p-4 text-center">
                <div className="text-3xl mb-2">{badge.emoji}</div>
                <div className="font-bold text-sm text-amber-900">{badge.name}</div>
                <div className="text-xs text-amber-600 mt-0.5">{badge.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="card p-12 text-center">
          <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No progress data yet</h3>
          <p className="text-sm text-gray-400 mb-6">Create a learning goal and complete sessions to track your progress here.</p>
          <a href="/create-plan" className="btn-primary text-sm">Create Learning Plan</a>
        </div>
      )}
    </div>
  )
}
