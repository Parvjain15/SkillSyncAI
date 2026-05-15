'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Bell, Calendar, Shield, LogOut, Save, Trash2, Send, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { sendDailyReminder, sendWeeklyReport } from '@/lib/email'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'calendar', label: 'Calendar Sync', icon: Calendar },
  { id: 'account', label: 'Account', icon: Shield },
]

export default function SettingsPage() {
  const router = useRouter()
  const { user, updateUser, logout, goals, sessions } = useStore()

  const [activeSection, setActiveSection] = useState('profile')

  // Profile state
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  // Reminder state
  const [inApp, setInApp] = useState(true)
  const [emailReminders, setEmailReminders] = useState(false)
  const [calendarSync, setCalendarSync] = useState(false)
  const [reminderMinutes, setReminderMinutes] = useState(15)
  const [reminderEmail, setReminderEmail] = useState(user?.email || '')
  const [sendingTest, setSendingTest] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')

  const handleSaveProfile = () => {
    updateUser({ name, email })
    toast.success('Profile updated!')
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleDeleteAllData = () => {
    if (confirm('This will delete ALL your goals, sessions, and progress. This cannot be undone. Continue?')) {
      logout()
      router.push('/')
    }
  }

  const handleSendTestEmail = async (type: 'daily' | 'weekly') => {
    if (!reminderEmail) {
      toast.error('Enter an email address first')
      return
    }
    setSendingTest(true)
    try {
      if (type === 'daily') {
        const todayStr = format(new Date(), 'yyyy-MM-dd')
        const todaySessions = sessions.filter(s => s.date === todayStr && s.status === 'upcoming')
        const result = await sendDailyReminder(reminderEmail, name, todaySessions)
        if (result.error) throw new Error(result.error)
        toast.success('Daily reminder sent! Check your inbox.')
      } else {
        const report = {
          completedSessions: 4,
          missedSessions: 1,
          totalMinutes: 120,
          completionRate: 80,
          aiSummary: 'Great week! You completed 4 out of 5 sessions. Keep the momentum going next week.',
          weekStart: format(new Date(), 'MMM d'),
          weekEnd: format(new Date(), 'MMM d, yyyy'),
        }
        const result = await sendWeeklyReport(reminderEmail, name, report)
        if (result.error) throw new Error(result.error)
        toast.success('Weekly report sent! Check your inbox.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send email')
    }
    setSendingTest(false)
  }

  const reminderToggles = [
    {
      key: 'inApp',
      label: 'In-app notifications',
      desc: 'Dashboard alerts, session reminders, and missed session warnings',
      icon: '🔔',
      value: inApp,
      toggle: () => setInApp(v => !v),
    },
    {
      key: 'email',
      label: 'Email reminders',
      desc: 'Daily session reminder + weekly progress report via Resend',
      icon: '📧',
      value: emailReminders,
      toggle: () => setEmailReminders(v => !v),
    },
    {
      key: 'calendar',
      label: 'Google Calendar sync',
      desc: 'Export sessions as .ics events to your calendar',
      icon: '📅',
      value: calendarSync,
      toggle: () => setCalendarSync(v => !v),
    },
  ]

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Settings</h1>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <aside className="hidden sm:block w-48 flex-shrink-0">
          <nav className="space-y-1">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  activeSection === s.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 space-y-5 min-w-0">
          {/* Mobile section selector */}
          <div className="sm:hidden flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                  activeSection === s.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600'
                )}
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            ))}
          </div>

          {/* ── Profile ── */}
          {activeSection === 'profile' && (
            <div className="card p-6 space-y-5 animate-fade-in">
              <h2 className="font-bold text-gray-900">Profile Information</h2>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary-200">
                  {name[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{name}</div>
                  <div className="text-sm text-gray-400">{email}</div>
                </div>
              </div>

              <div>
                <label htmlFor="s-name" className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  id="s-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="s-email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  id="s-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input"
                />
              </div>

              <button onClick={handleSaveProfile} className="btn-primary flex items-center gap-2 text-sm">
                <Save className="w-4 h-4" /> Save Profile
              </button>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeSection === 'notifications' && (
            <div className="card p-6 space-y-5 animate-fade-in">
              <h2 className="font-bold text-gray-900">Reminder Preferences</h2>

              {/* Toggle rows */}
              <div className="space-y-3">
                {reminderToggles.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={opt.toggle}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 border-2 rounded-xl transition-all text-left',
                      opt.value ? 'border-primary-300 bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                    )}
                  >
                    <span className="text-2xl flex-shrink-0">{opt.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">{opt.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                    </div>
                    <div className={cn(
                      'w-11 h-6 rounded-full transition-all relative flex-shrink-0',
                      opt.value ? 'bg-primary-600' : 'bg-gray-200'
                    )}>
                      <div className={cn(
                        'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all',
                        opt.value ? 'left-5' : 'left-0.5'
                      )} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Calendar reminder timing */}
              {calendarSync && (
                <div>
                  <label htmlFor="s-cal-time" className="block text-sm font-semibold text-gray-700 mb-2">
                    Calendar reminder timing
                  </label>
                  <select
                    id="s-cal-time"
                    value={reminderMinutes}
                    onChange={e => setReminderMinutes(Number(e.target.value))}
                    className="input text-sm w-auto"
                  >
                    {[5, 10, 15, 30, 60].map(m => (
                      <option key={m} value={m}>{m} minutes before</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Email reminder section */}
              {emailReminders && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📧</span>
                    <div>
                      <div className="font-semibold text-indigo-900 text-sm">Email Reminders (Resend)</div>
                      <div className="text-xs text-indigo-600">Powered by your Resend API key · 3,000 free emails/month</div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="s-reminder-email" className="block text-xs font-semibold text-indigo-800 mb-1.5">
                      Send reminders to
                    </label>
                    <input
                      id="s-reminder-email"
                      type="email"
                      value={reminderEmail}
                      onChange={e => setReminderEmail(e.target.value)}
                      className="input text-sm"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleSendTestEmail('daily')}
                      disabled={sendingTest}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                    >
                      {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Send test daily reminder
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendTestEmail('weekly')}
                      disabled={sendingTest}
                      className="flex items-center gap-2 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                    >
                      {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Send test weekly report
                    </button>
                  </div>

                </div>
              )}

              {/* WhatsApp */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">💬</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-green-900 text-sm">WhatsApp Support Widget</div>
                    <div className="text-xs text-green-700 mb-3">
                      The floating WhatsApp button (bottom-right) lets users message support directly. No paid API needed.
                    </div>
                    <label htmlFor="s-wa" className="block text-xs font-semibold text-green-800 mb-1.5">
                      Support number override (optional)
                    </label>
                    <input
                      id="s-wa"
                      type="tel"
                      value={whatsappNumber}
                      onChange={e => setWhatsappNumber(e.target.value)}
                      className="input text-sm"
                      placeholder="e.g. +1234567890"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
                <strong>📱 SMS reminders:</strong> Not included. Use Google Calendar or email reminders instead — they're free and more reliable.
              </div>

              <button
                type="button"
                onClick={() => toast.success('Reminder settings saved!')}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Save className="w-4 h-4" /> Save Reminder Settings
              </button>
            </div>
          )}

          {/* ── Calendar ── */}
          {activeSection === 'calendar' && (
            <div className="card p-6 space-y-5 animate-fade-in">
              <h2 className="font-bold text-gray-900">Calendar Sync</h2>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Google / Apple / Outlook Calendar</div>
                    <div className="text-xs text-gray-500">Export all sessions as a standard .ics file</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Download your full learning schedule as an .ics file and import it into any calendar app.
                  Sessions automatically include reminders at your chosen interval.
                </p>
                <a href="/calendar" className="btn-primary text-sm inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Go to Calendar &amp; Export
                </a>
              </div>

              <ul className="space-y-3">
                {[
                  'All learning sessions exported as calendar events',
                  'Choose reminder time: 5, 10, 15, 30, or 60 min before',
                  'Re-export after rescheduling to keep calendar updated',
                  'Works with Google Calendar, Apple Calendar, and Outlook',
                ].map(feature => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Account ── */}
          {activeSection === 'account' && (
            <div className="space-y-4 animate-fade-in">
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 mb-4">Account Management</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-sm text-gray-900">Your Goals</div>
                      <div className="text-xs text-gray-400">{goals.length} goal{goals.length !== 1 ? 's' : ''} saved</div>
                    </div>
                    <a href="/goals" className="text-sm text-primary-600 hover:underline">Manage →</a>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-sm text-gray-900">Data &amp; Privacy</div>
                      <div className="text-xs text-gray-400">All data stored locally in your browser</div>
                    </div>
                    <Shield className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="card p-6 border border-red-100">
                <h3 className="font-bold text-red-800 mb-1">Danger Zone</h3>
                <p className="text-sm text-gray-500 mb-4">These actions are permanent and cannot be undone.</p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-4 py-2.5 rounded-xl w-full transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Sign out of SkillSync AI
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAllData}
                    className="flex items-center gap-2 text-sm text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2.5 rounded-xl w-full transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Delete all data &amp; account
                  </button>
                </div>
              </div>

              <p className="text-center text-xs text-gray-400 py-4 leading-relaxed">
                SkillSync AI helps you organize learning goals and build consistency.<br />
                It does not guarantee outcomes; progress depends on regular effort.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
