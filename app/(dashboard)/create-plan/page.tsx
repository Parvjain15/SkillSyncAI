'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, ArrowLeft, Check, Loader2, Brain, Sparkles,
  Clock, Calendar, BarChart3, Bell, CheckCircle2,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { generatePlan, parseRoutine } from '@/lib/ai'
import { cn, generateId, GOAL_COLORS } from '@/lib/utils'
import { FocusTime, GOAL_CATEGORIES, Goal } from '@/lib/types'
import { format, addMonths } from 'date-fns'
import toast from 'react-hot-toast'

const STEPS = [
  { id: 1, label: 'Your Day', icon: '📅' },
  { id: 2, label: 'Your Goal', icon: '🎯' },
  { id: 3, label: 'Daily Time', icon: '⏱️' },
  { id: 4, label: 'Days & Deadline', icon: '📆' },
  { id: 5, label: 'Your Level', icon: '📊' },
  { id: 6, label: 'Reminders', icon: '🔔' },
  { id: 7, label: 'AI Plan', icon: '✨' },
]

const TIME_OPTIONS = [
  { value: 15, label: '15 min/day', description: 'Quick daily habit', icon: '⚡' },
  { value: 30, label: '30 min/day', description: 'Steady progress', icon: '🌱' },
  { value: 45, label: '45 min/day', description: 'Solid commitment', icon: '💪' },
  { value: 60, label: '60 min/day', description: 'Serious learning', icon: '🚀' },
  { value: 0, label: 'Custom', description: 'Set your own time', icon: '✏️' },
]

const DAYS_OPTIONS = [3, 4, 5, 6, 7]

const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner', description: 'Starting from scratch', icon: '🌱', color: 'bg-green-50 border-green-200 text-green-700' },
  { value: 'intermediate', label: 'Intermediate', description: 'Have some experience', icon: '⚡', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { value: 'advanced', label: 'Advanced', description: 'Looking to master it', icon: '🔥', color: 'bg-red-50 border-red-200 text-red-700' },
]

const FOCUS_OPTIONS: { value: FocusTime; label: string; time: string; icon: string }[] = [
  { value: 'morning', label: 'Morning', time: '6–10 AM', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon', time: '12–5 PM', icon: '☀️' },
  { value: 'evening', label: 'Evening', time: '6–9 PM', icon: '🌆' },
  { value: 'night', label: 'Night', time: '9 PM–12 AM', icon: '🌙' },
]

export default function CreatePlanPage() {
  const router = useRouter()
  const { user, addGoal, addSessions, addNotification } = useStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<any>(null)

  // Form state
  const [routineText, setRoutineText] = useState('')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [sleepTime, setSleepTime] = useState('23:00')
  const [workBlocks, setWorkBlocks] = useState('')
  const [bestFocus, setBestFocus] = useState<FocusTime>('evening')
  const [parsedRoutine, setParsedRoutine] = useState<any>(null)

  const [selectedGoalCategory, setSelectedGoalCategory] = useState('')
  const [customGoal, setCustomGoal] = useState('')
  const [goalColor, setGoalColor] = useState(GOAL_COLORS[0])

  const [timePerDay, setTimePerDay] = useState(30)
  const [customTime, setCustomTime] = useState(20)
  const [showCustomTime, setShowCustomTime] = useState(false)

  const [daysPerWeek, setDaysPerWeek] = useState(5)
  const [deadlineType, setDeadlineType] = useState<'none' | 'date' | 'exam' | 'project'>('none')
  const [deadline, setDeadline] = useState('')

  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')

  const [inAppReminders, setInAppReminders] = useState(true)
  const [emailReminders, setEmailReminders] = useState(false)
  const [calendarSync, setCalendarSync] = useState(false)

  const goalTitle = selectedGoalCategory === 'custom'
    ? (customGoal || 'Custom Goal')
    : GOAL_CATEGORIES.find(g => g.id === selectedGoalCategory)?.label || ''

  const goalEmoji = GOAL_CATEGORIES.find(g => g.id === selectedGoalCategory)?.emoji || '🎯'

  const handleNext = async () => {
    if (step === 1) {
      // Parse routine with AI
      setLoading(true)
      try {
        const parsed = await parseRoutine(routineText || `Wake up at ${wakeTime}, ${workBlocks || 'work/class during the day'}, sleep at ${sleepTime}. Best focus time: ${bestFocus}.`)
        setParsedRoutine(parsed)
        toast.success('Routine analyzed! Great.')
      } catch {
        toast.error('Could not parse routine, continuing with defaults.')
      }
      setLoading(false)
    }

    if (step === 7) {
      // Generate plan is handled separately
      return
    }

    if (step < 7) setStep(s => s + 1)
  }

  const handleGeneratePlan = async () => {
    if (!selectedGoalCategory) {
      toast.error('Please select a goal first')
      return
    }

    setGenerating(true)

    const goalCategoryData = GOAL_CATEGORIES.find(g => g.id === selectedGoalCategory)
    const goal: Goal = {
      id: generateId(),
      title: goalTitle,
      category: selectedGoalCategory,
      level,
      timePerDay: showCustomTime ? customTime : timePerDay,
      daysPerWeek,
      deadline: deadlineType !== 'none' ? deadline : undefined,
      preferredTime: bestFocus,
      status: 'active',
      createdAt: new Date().toISOString(),
      color: goalCategoryData?.color || goalColor,
      emoji: goalEmoji,
    }

    try {
      const plan = await generatePlan(goal, {
        routineText,
        wakeTime,
        sleepTime,
        workClassBlocks: workBlocks,
        bestFocusTime: bestFocus,
        ...parsedRoutine,
      })
      setGeneratedPlan({ ...plan, goal })
      toast.success('Your learning plan is ready! 🎉')
    } catch {
      toast.error('Failed to generate plan. Please try again.')
    }
    setGenerating(false)
  }

  const handleSavePlan = () => {
    if (!generatedPlan) return

    addGoal(generatedPlan.goal)
    addSessions(generatedPlan.sessions)
    addNotification({
      id: generateId(),
      title: '🎉 New learning plan created!',
      message: `"${goalTitle}" plan is ready with ${generatedPlan.sessions.length} sessions.`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
    })

    toast.success('Plan saved! Let\'s start learning.')
    router.push('/dashboard')
  }

  const canProceed = () => {
    if (step === 1) return true
    if (step === 2) return selectedGoalCategory !== ''
    if (step === 3) return timePerDay > 0 || customTime > 0
    if (step === 4) return daysPerWeek > 0
    if (step === 5) return level !== undefined
    if (step === 6) return true
    return true
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 lg:pb-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Create Learning Plan</h1>
        <p className="text-gray-500 text-sm">Answer a few questions so AI can build your personalized plan.</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto scrollbar-hide pb-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            <button
              onClick={() => step > s.id && setStep(s.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                step === s.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : step > s.id
                    ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400'
              )}
            >
              {step > s.id ? <Check className="w-3 h-3" /> : <span>{s.icon}</span>}
              {s.label}
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn('w-6 h-0.5 rounded-full flex-shrink-0', step > s.id ? 'bg-green-300' : 'bg-gray-100')} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="card p-6 sm:p-8 shadow-sm">
        {/* Step 1: Daily Routine */}
        {step === 1 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📅</span>
                <h2 className="text-xl font-black text-gray-900">What does your day look like?</h2>
              </div>
              <p className="text-gray-500 text-sm">Describe your routine in plain English. AI will find the best study slots for you.</p>
            </div>

            <textarea
              value={routineText}
              onChange={e => setRoutineText(e.target.value)}
              className="textarea h-28"
              placeholder="Example: I wake up at 8 AM, have university from 10 AM to 2 PM, work from 4 PM to 8 PM, eat dinner around 9 PM, and I usually feel most focused at night."
            />

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wide">Or fill structured fields (optional)</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Wake-up time</label>
                  <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className="input text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sleep time</label>
                  <input type="time" value={sleepTime} onChange={e => setSleepTime(e.target.value)} className="input text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Work / Class hours</label>
                  <input
                    type="text"
                    value={workBlocks}
                    onChange={e => setWorkBlocks(e.target.value)}
                    className="input text-sm"
                    placeholder="e.g. University 10am-2pm, Work 4pm-8pm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Best focus time</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {FOCUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setBestFocus(opt.value)}
                    className={cn(
                      'border-2 rounded-xl p-3 text-center transition-all',
                      bestFocus === opt.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-100 hover:border-primary-200 hover:bg-primary-50/50'
                    )}
                  >
                    <div className="text-2xl mb-1">{opt.icon}</div>
                    <div className="text-xs font-bold text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-400">{opt.time}</div>
                  </button>
                ))}
              </div>
            </div>

            {parsedRoutine?.summary && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-green-800 mb-1">AI Analysis</div>
                    <div className="text-xs text-green-700">{parsedRoutine.summary}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎯</span>
                <h2 className="text-xl font-black text-gray-900">What do you want to learn?</h2>
              </div>
              <p className="text-gray-500 text-sm">Pick a goal or describe your own.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {GOAL_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedGoalCategory(cat.id)}
                  className={cn(
                    'border-2 rounded-xl p-4 text-center transition-all',
                    selectedGoalCategory === cat.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                  )}
                >
                  <div className="text-2xl mb-2">{cat.emoji}</div>
                  <div className="text-xs font-semibold text-gray-800">{cat.label}</div>
                </button>
              ))}
            </div>

            {selectedGoalCategory === 'custom' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Describe your goal</label>
                <input
                  type="text"
                  value={customGoal}
                  onChange={e => setCustomGoal(e.target.value)}
                  className="input"
                  placeholder="e.g. Prepare for AWS certification, Learn digital marketing..."
                />
              </div>
            )}

            {selectedGoalCategory && (
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-center gap-3">
                <span className="text-3xl">{goalEmoji}</span>
                <div>
                  <div className="font-bold text-primary-900">Selected: {goalTitle}</div>
                  <div className="text-xs text-primary-600">AI will create a detailed roadmap for this goal</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Daily time */}
        {step === 3 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⏱️</span>
                <h2 className="text-xl font-black text-gray-900">How much time can you give daily?</h2>
              </div>
              <p className="text-gray-500 text-sm">Even 15 minutes a day compounds into huge progress over time.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TIME_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (opt.value === 0) {
                      setShowCustomTime(true)
                      setTimePerDay(0)
                    } else {
                      setShowCustomTime(false)
                      setTimePerDay(opt.value)
                    }
                  }}
                  className={cn(
                    'border-2 rounded-xl p-5 text-center transition-all',
                    (timePerDay === opt.value && !showCustomTime) || (opt.value === 0 && showCustomTime)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                  )}
                >
                  <div className="text-3xl mb-2">{opt.icon}</div>
                  <div className="font-bold text-gray-900 text-base">{opt.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{opt.description}</div>
                </button>
              ))}
            </div>

            {showCustomTime && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Custom time (minutes)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={180}
                    step={5}
                    value={customTime}
                    onChange={e => setCustomTime(Number(e.target.value))}
                    className="flex-1 accent-primary-600"
                  />
                  <div className="w-20 text-center bg-primary-50 border border-primary-200 rounded-xl py-2 font-bold text-primary-700">
                    {customTime} min
                  </div>
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>💡 Tip:</strong> Start with less time than you think you need. Consistency beats intensity.
              {' '}30 minutes/day = 182+ hours per year!
            </div>
          </div>
        )}

        {/* Step 4: Days & Deadline */}
        {step === 4 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📆</span>
                <h2 className="text-xl font-black text-gray-900">Days per week & deadline</h2>
              </div>
              <p className="text-gray-500 text-sm">Choose how many days you'll study and whether you have a target date.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Days per week</label>
              <div className="flex gap-3 flex-wrap">
                {DAYS_OPTIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setDaysPerWeek(d)}
                    className={cn(
                      'w-14 h-14 border-2 rounded-xl font-bold text-sm transition-all',
                      daysPerWeek === d
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-100 text-gray-600 hover:border-primary-200'
                    )}
                  >
                    {d}
                    <div className="text-xs font-normal">{d === 7 ? 'every day' : 'days'}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Do you have a deadline?</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: 'none', label: 'No deadline', icon: '♾️' },
                  { value: 'date', label: 'Pick a date', icon: '📅' },
                  { value: 'exam', label: 'Exam date', icon: '📝' },
                  { value: 'project', label: 'Project deadline', icon: '🏁' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDeadlineType(opt.value as any)}
                    className={cn(
                      'border-2 rounded-xl p-3 text-center transition-all',
                      deadlineType === opt.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-100 hover:border-primary-200'
                    )}
                  >
                    <div className="text-2xl mb-1">{opt.icon}</div>
                    <div className="text-xs font-semibold text-gray-700">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {deadlineType !== 'none' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {deadlineType === 'exam' ? 'Exam date' : deadlineType === 'project' ? 'Project deadline' : 'Target date'}
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="input"
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 5: Level */}
        {step === 5 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📊</span>
                <h2 className="text-xl font-black text-gray-900">What's your current level?</h2>
              </div>
              <p className="text-gray-500 text-sm">This helps AI calibrate difficulty and pace your sessions correctly.</p>
            </div>

            <div className="space-y-3">
              {LEVEL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setLevel(opt.value as any)}
                  className={cn(
                    'w-full flex items-center gap-4 p-5 border-2 rounded-xl text-left transition-all',
                    level === opt.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  )}
                >
                  <span className="text-3xl">{opt.icon}</span>
                  <div>
                    <div className="font-bold text-gray-900">{opt.label}</div>
                    <div className="text-sm text-gray-500">{opt.description}</div>
                  </div>
                  {level === opt.value && (
                    <CheckCircle2 className="w-5 h-5 text-primary-600 ml-auto flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Reminders */}
        {step === 6 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔔</span>
                <h2 className="text-xl font-black text-gray-900">How should we remind you?</h2>
              </div>
              <p className="text-gray-500 text-sm">Choose how you want to be reminded about your sessions.</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: 'inApp', label: 'In-app notifications', icon: '🔔',
                  desc: 'Session alerts on your dashboard', value: inAppReminders,
                  toggle: () => setInAppReminders(!inAppReminders)
                },
                {
                  key: 'email', label: 'Email reminders', icon: '📧',
                  desc: 'Daily session reminder + weekly progress report', value: emailReminders,
                  toggle: () => setEmailReminders(!emailReminders)
                },
                {
                  key: 'calendar', label: 'Google Calendar sync', icon: '📅',
                  desc: 'Sync sessions to your calendar with reminders', value: calendarSync,
                  toggle: () => setCalendarSync(!calendarSync)
                },
              ].map(opt => (
                <div
                  key={opt.key}
                  onClick={opt.toggle}
                  className={cn(
                    'flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all',
                    opt.value ? 'border-primary-300 bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                  )}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm">{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.desc}</div>
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
                </div>
              ))}
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">💬</span>
                <div>
                  <div className="text-sm font-semibold text-gray-800 mb-1">WhatsApp Support</div>
                  <p className="text-xs text-gray-500">Need help with your plan? Use the WhatsApp button (bottom right) to message our support. No automated SMS needed.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: AI Plan Review */}
        {step === 7 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">✨</span>
                <h2 className="text-xl font-black text-gray-900">Your AI Learning Plan</h2>
              </div>
              <p className="text-gray-500 text-sm">Review your personalized plan before saving it.</p>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-br from-primary-50 to-cyan-50 border border-primary-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{goalEmoji}</span>
                <div>
                  <div className="font-black text-gray-900 text-lg">{goalTitle}</div>
                  <div className="text-sm text-gray-500 capitalize">{level} level</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Daily time', value: `${showCustomTime ? customTime : timePerDay} min` },
                  { label: 'Days/week', value: `${daysPerWeek} days` },
                  { label: 'Deadline', value: deadlineType === 'none' ? 'Open-ended' : (deadline || 'Not set') },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-xl p-3 text-center">
                    <div className="font-bold text-gray-900 text-sm">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {!generatedPlan ? (
              <button
                onClick={handleGeneratePlan}
                disabled={generating}
                className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-base"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI is building your plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate My Personalized Plan
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-800 text-sm">Plan Generated!</span>
                  </div>
                  <div className="text-sm text-green-700">
                    {generatedPlan.sessions.length} sessions scheduled across {generatedPlan.roadmap.length} weeks.
                  </div>
                </div>

                {/* Roadmap preview */}
                <div>
                  <div className="text-sm font-bold text-gray-700 mb-3">Weekly Roadmap</div>
                  <div className="space-y-2">
                    {generatedPlan.roadmap.slice(0, 4).map((week: any) => (
                      <div key={week.week} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          W{week.week}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{week.title}</div>
                          <div className="text-xs text-gray-500">{week.topics.join(' · ')}</div>
                        </div>
                      </div>
                    ))}
                    {generatedPlan.roadmap.length > 4 && (
                      <div className="text-xs text-gray-400 text-center py-2">
                        + {generatedPlan.roadmap.length - 4} more weeks...
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSavePlan}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Save Plan & Start Learning
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            className={cn(
              'flex items-center gap-2 text-sm font-medium transition-colors',
              step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {step < 7 && (
            <button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
              ) : (
                <>{step === 6 ? 'Review Plan' : 'Continue'} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
