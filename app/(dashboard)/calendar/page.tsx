'use client'

import { useState } from 'react'
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, parseISO, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, Download, RefreshCw } from 'lucide-react'
import { useStore } from '@/lib/store'
import { cn, formatTime, getStatusBadge, generateICSContent, downloadICS } from '@/lib/utils'
import { TASK_TYPE_BG } from '@/lib/types'
import { Session, TaskType } from '@/lib/types'
import toast from 'react-hot-toast'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 6 AM to 11 PM

function SessionPill({ session, onClick }: { session: Session; onClick: () => void }) {
  const typeColors: Record<TaskType, string> = {
    learn: 'bg-blue-100 border-blue-300 text-blue-800',
    practice: 'bg-purple-100 border-purple-300 text-purple-800',
    review: 'bg-amber-100 border-amber-300 text-amber-800',
    quiz: 'bg-green-100 border-green-300 text-green-800',
    project: 'bg-pink-100 border-pink-300 text-pink-800',
    break: 'bg-gray-100 border-gray-300 text-gray-600',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-2 py-1.5 rounded-lg border text-xs font-medium mb-1 transition-all hover:opacity-90 hover:shadow-sm',
        typeColors[session.taskType],
        session.status === 'done' && 'opacity-60',
        session.status === 'missed' && 'border-red-300 bg-red-50 text-red-700'
      )}
    >
      <div className="font-semibold truncate">{session.title}</div>
      <div className="opacity-70 truncate">{formatTime(session.startTime)} · {session.durationMinutes}m</div>
    </button>
  )
}

function SessionDetail({ session, onClose }: { session: Session; onClose: () => void }) {
  const { markSessionDone, markSessionSkipped, rescheduleSession } = useStore()
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')

  const handleDownloadICS = () => {
    const content = generateICSContent(session)
    downloadICS(content, `${session.title.replace(/\s/g, '_')}.ics`)
    toast.success('Calendar event downloaded!')
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Type badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className={cn('badge', TASK_TYPE_BG[session.taskType])}>{session.taskType}</span>
          <span className={cn('badge', getStatusBadge(session.status))}>{session.status}</span>
        </div>

        <h3 className="text-lg font-black text-gray-900 mb-1">{session.title}</h3>
        <p className="text-sm text-gray-500 mb-4">{session.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Date', value: format(parseISO(session.date), 'EEE, MMM d') },
            { label: 'Time', value: `${formatTime(session.startTime)} – ${formatTime(session.endTime)}` },
            { label: 'Duration', value: `${session.durationMinutes} minutes` },
            { label: 'Difficulty', value: session.difficulty },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400">{item.label}</div>
              <div className="font-semibold text-sm text-gray-800 capitalize">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Resources */}
        {session.resources && session.resources.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Resources</div>
            <div className="space-y-1">
              {session.resources.slice(0, 3).map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
                >
                  📚 {r.title}
                  {r.free && <span className="badge-success text-xs">Free</span>}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Reschedule */}
        {session.status === 'upcoming' && (
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <div className="text-xs font-semibold text-gray-500 mb-2">Reschedule</div>
            <div className="flex gap-2">
              <input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} className="input text-xs flex-1" />
              <input type="time" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} className="input text-xs w-28" />
            </div>
            {rescheduleDate && rescheduleTime && (
              <button
                onClick={() => {
                  rescheduleSession(session.id, rescheduleDate, rescheduleTime)
                  toast.success('Session rescheduled!')
                  onClose()
                }}
                className="btn-secondary text-xs w-full mt-2 py-2"
              >
                Confirm Reschedule
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {session.status === 'upcoming' && (
            <>
              <button
                onClick={() => { markSessionDone(session.id); toast.success('Session marked done! 🎉'); onClose() }}
                className="btn-primary text-xs flex-1 py-2"
              >
                Mark as Done ✓
              </button>
              <button
                onClick={() => { markSessionSkipped(session.id); onClose() }}
                className="btn-ghost text-xs py-2 px-3 border border-gray-200"
              >
                Skip
              </button>
            </>
          )}
          <button onClick={handleDownloadICS} className="btn-ghost text-xs py-2 px-3 border border-gray-200 flex items-center gap-1">
            <Download className="w-3 h-3" /> .ics
          </button>
          <button onClick={onClose} className="btn-ghost text-xs py-2 px-3">Close</button>
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const { sessions, goals } = useStore()
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [view, setView] = useState<'week' | 'month'>('week')
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [filterGoal, setFilterGoal] = useState<string>('all')

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const filteredSessions = filterGoal === 'all'
    ? sessions
    : sessions.filter(s => s.goalId === filterGoal)

  const getSessionsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return filteredSessions
      .filter(s => s.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const exportAllICS = () => {
    const icsContent = sessions.map(generateICSContent).join('\n')
    downloadICS(icsContent, 'skillsync_schedule.ics')
    toast.success('Full schedule exported!')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Calendar</h1>
          <p className="text-gray-500 text-sm">Your learning schedule at a glance</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Goal filter */}
          <select
            value={filterGoal}
            onChange={e => setFilterGoal(e.target.value)}
            className="input text-sm py-2 w-auto pr-8"
          >
            <option value="all">All goals</option>
            {goals.map(g => (
              <option key={g.id} value={g.id}>{g.emoji} {g.title}</option>
            ))}
          </select>

          <button
            onClick={exportAllICS}
            className="btn-secondary text-sm flex items-center gap-2 py-2"
          >
            <Download className="w-4 h-4" /> Export .ics
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { color: 'bg-blue-200', label: 'Learn' },
          { color: 'bg-purple-200', label: 'Practice' },
          { color: 'bg-amber-200', label: 'Review' },
          { color: 'bg-green-200', label: 'Quiz' },
          { color: 'bg-pink-200', label: 'Project' },
          { color: 'bg-gray-200', label: 'Break' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={cn('w-3 h-3 rounded-sm', item.color)} />
            <span className="text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Week Navigation */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setWeekStart(w => subWeeks(w, 1))} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="text-center">
            <div className="font-black text-gray-900">
              {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </div>
            <button
              onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
              className="text-xs text-primary-600 hover:underline flex items-center gap-1 mx-auto"
            >
              <RefreshCw className="w-3 h-3" /> Current week
            </button>
          </div>

          <button onClick={() => setWeekStart(w => addWeeks(w, 1))} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Week grid */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const daySessions = getSessionsForDay(day)
            const isCurrentDay = isToday(day)

            return (
              <div key={day.toISOString()} className="min-h-[120px]">
                {/* Day header */}
                <div className={cn(
                  'text-center mb-2 p-1.5 rounded-xl',
                  isCurrentDay ? 'bg-primary-600 text-white' : 'text-gray-500'
                )}>
                  <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                  <div className={cn('text-sm font-black', isCurrentDay ? 'text-white' : 'text-gray-900')}>
                    {format(day, 'd')}
                  </div>
                </div>

                {/* Sessions */}
                <div className="space-y-1">
                  {daySessions.length === 0 ? (
                    <div className="text-center py-4 text-xs text-gray-200">—</div>
                  ) : (
                    daySessions.map(session => (
                      <SessionPill
                        key={session.id}
                        session={session}
                        onClick={() => setSelectedSession(session)}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly summary */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {weekDays.map(day => {
            const daySessions = getSessionsForDay(day)
            const done = daySessions.filter(s => s.status === 'done').length
            const total = daySessions.length
            return (
              <div key={day.toISOString()} className="card p-3 text-center">
                <div className="text-xs font-bold text-gray-600">{format(day, 'EEE')}</div>
                <div className="text-sm font-black text-gray-900 mt-1">
                  {total === 0 ? '—' : `${done}/${total}`}
                </div>
                {total > 0 && (
                  <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full transition-all"
                      style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {sessions.length === 0 && (
        <div className="card p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No sessions scheduled</h3>
          <p className="text-sm text-gray-400 mb-6">Create a learning plan to see your schedule here.</p>
          <a href="/create-plan" className="btn-primary text-sm">Create Learning Plan</a>
        </div>
      )}

      {/* Session detail modal */}
      {selectedSession && (
        <SessionDetail session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}
    </div>
  )
}
