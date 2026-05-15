'use client'

import { useState } from 'react'
import { format, subWeeks, startOfWeek, endOfWeek } from 'date-fns'
import { FileText, TrendingUp, AlertCircle, Star, ChevronDown, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { cn, calculateCompletionRate, formatMinutes, calculateStreak } from '@/lib/utils'
import { generateWeeklyReport } from '@/lib/ai'
import toast from 'react-hot-toast'

export default function ReportsPage() {
  const { goals, sessions, progress } = useStore()
  const [selectedGoal, setSelectedGoal] = useState(goals[0]?.id || '')
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)

  const weekStart = startOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

  const handleGenerateReport = async () => {
    if (!selectedGoal) {
      toast.error('Select a goal first')
      return
    }
    const goal = goals.find(g => g.id === selectedGoal)
    if (!goal) return

    setLoading(true)
    const weekStartStr = format(weekStart, 'yyyy-MM-dd')
    const weekEndStr = format(weekEnd, 'yyyy-MM-dd')

    const weekSessions = sessions.filter(s =>
      s.goalId === selectedGoal &&
      s.date >= weekStartStr &&
      s.date <= weekEndStr
    )

    const result = await generateWeeklyReport(weekSessions, goal)
    setReport({ ...result, weekStart: weekStartStr, weekEnd: weekEndStr, goal })
    setLoading(false)
  }

  const p = progress[selectedGoal]
  const goal = goals.find(g => g.id === selectedGoal)

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Weekly Reports</h1>
        <p className="text-gray-500 text-sm">AI-generated progress analysis for each week</p>
      </div>

      {/* Controls */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Goal</label>
            <select
              value={selectedGoal}
              onChange={e => { setSelectedGoal(e.target.value); setReport(null) }}
              className="input text-sm"
            >
              {goals.length === 0
                ? <option value="">No goals yet</option>
                : goals.map(g => <option key={g.id} value={g.id}>{g.emoji} {g.title}</option>)
              }
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Week</label>
            <div className="flex gap-2">
              <button onClick={() => { setWeekOffset(w => w + 1); setReport(null) }} className="btn-ghost border border-gray-200 px-3 py-2 text-sm">←</button>
              <div className="flex-1 input text-sm text-center py-2">
                {weekOffset === 0 ? 'This week' : weekOffset === 1 ? 'Last week' : `${weekOffset} weeks ago`}
              </div>
              <button onClick={() => { setWeekOffset(w => Math.max(0, w - 1)); setReport(null) }} disabled={weekOffset === 0} className="btn-ghost border border-gray-200 px-3 py-2 text-sm disabled:opacity-40">→</button>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
            </div>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={loading || !selectedGoal}
            className="btn-primary flex items-center gap-2 text-sm py-2.5 whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Generate Report
          </button>
        </div>
      </div>

      {/* Report */}
      {report && (
        <div className="space-y-5 animate-fade-in">
          {/* Header */}
          <div className="gradient-bg text-white rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{report.goal.emoji}</span>
              <div>
                <div className="font-black text-xl">{report.goal.title}</div>
                <div className="text-primary-200 text-sm">
                  Week of {format(new Date(report.weekStart), 'MMM d')} – {format(new Date(report.weekEnd), 'MMM d, yyyy')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Completed', value: report.completedSessions },
                { label: 'Missed', value: report.missedSessions },
                { label: 'Minutes', value: report.totalMinutes },
                { label: 'Rate', value: `${report.completionRate}%` },
              ].map(s => (
                <div key={s.label} className="bg-white/15 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black">{s.value}</div>
                  <div className="text-primary-200 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div className="card p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">AI Feedback</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{report.aiSummary}</p>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Completed topics */}
            <div className="card p-4">
              <h4 className="font-bold text-green-700 text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Completed
              </h4>
              {report.topicsCompleted.length === 0 ? (
                <p className="text-xs text-gray-400">No sessions completed this week</p>
              ) : (
                <ul className="space-y-1">
                  {report.topicsCompleted.slice(0, 5).map((t: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Needs revision */}
            <div className="card p-4">
              <h4 className="font-bold text-red-700 text-sm mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Needs Catch-up
              </h4>
              {report.topicsNeedingRevision.length === 0 ? (
                <p className="text-xs text-green-600 font-medium">All topics covered! 🎉</p>
              ) : (
                <ul className="space-y-1">
                  {report.topicsNeedingRevision.slice(0, 5).map((t: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Next week focus */}
            <div className="card p-4">
              <h4 className="font-bold text-primary-700 text-sm mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" /> Next Week Focus
              </h4>
              <ul className="space-y-1">
                {report.nextWeekFocus.map((f: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Streak info */}
          {p && (
            <div className="card p-4 flex items-center gap-4">
              <div className="text-4xl">🔥</div>
              <div>
                <div className="font-black text-gray-900 text-lg">
                  {p.currentStreak} day streak
                </div>
                <div className="text-sm text-gray-500">
                  Longest streak: {p.longestStreak} days · Total study time: {formatMinutes(p.totalMinutes)}
                </div>
              </div>
              {p.currentStreak > 0 && (
                <div className="ml-auto text-right">
                  <div className="text-xs text-gray-400">Keep it going!</div>
                  <div className="text-xs font-bold text-orange-500">🔥 Don't break the chain</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!report && goals.length === 0 && (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No goals yet</h3>
          <p className="text-sm text-gray-400 mb-6">Create a learning goal first, then come back to generate weekly reports.</p>
          <a href="/create-plan" className="btn-primary text-sm">Create Learning Plan</a>
        </div>
      )}

      {!report && goals.length > 0 && (
        <div className="card p-10 text-center border-2 border-dashed border-gray-100">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Select a goal and week, then click "Generate Report" to see your AI-powered analysis.</p>
        </div>
      )}
    </div>
  )
}
