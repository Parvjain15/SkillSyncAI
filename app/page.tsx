'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Brain, Calendar, Clock, Target, Zap, BarChart3, Bell,
  ChevronRight, CheckCircle2, Star, ArrowRight, Menu, X,
  Sparkles, BookOpen, TrendingUp, Users, Shield, Smartphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Brain,
    title: 'AI Daily Routine Parser',
    description: 'Describe your day in plain English. AI extracts your busy blocks, free windows, and best focus times automatically.',
    color: 'bg-primary-50 text-primary-600',
  },
  {
    icon: Target,
    title: 'Smart Goal Planning',
    description: 'Turn any learning goal into a week-by-week roadmap with milestones, topics, and task types.',
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    icon: Calendar,
    title: 'Personalized Timetable',
    description: 'Sessions are scheduled around your real commitments — not in imaginary free time.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: TrendingUp,
    title: 'Auto-Adjust When Life Happens',
    description: 'Miss a session? The AI rebalances your entire plan automatically with one tap.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: BarChart3,
    title: 'Weekly Progress Reports',
    description: 'See streaks, completion rates, and AI-written feedback on your learning journey.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'In-app alerts, email reminders, and Google Calendar sync so you never miss a session.',
    color: 'bg-rose-50 text-rose-600',
  },
]

const steps = [
  {
    step: '01',
    title: 'Describe your day',
    description: '"I wake up at 8, have class from 10–2, gym at 6, dinner at 8, sleep around 12."',
    icon: '📅',
  },
  {
    step: '02',
    title: 'Choose your goal',
    description: 'Select from Spanish, Python, IELTS, Guitar, or any custom learning goal.',
    icon: '🎯',
  },
  {
    step: '03',
    title: 'Pick your daily time',
    description: '15 minutes, 30 minutes, or 60 minutes — whatever fits your day.',
    icon: '⏱️',
  },
  {
    step: '04',
    title: 'Get your personalized plan',
    description: 'AI builds a realistic timetable fitted around your actual schedule.',
    icon: '✨',
  },
]

const testimonials = [
  {
    name: 'Sarah K.',
    role: 'Medical Student',
    avatar: 'S',
    text: 'I told it my hospital shifts and it scheduled my Spanish learning perfectly around them. First app that actually works for my crazy schedule.',
    rating: 5,
  },
  {
    name: 'James M.',
    role: 'Software Engineer',
    avatar: 'J',
    text: 'Set up Python learning in 5 minutes. The AI put sessions right in my lunch break. 3-week streak already.',
    rating: 5,
  },
  {
    name: 'Priya N.',
    role: 'University Student',
    avatar: 'P',
    text: 'IELTS prep felt impossible with assignments. SkillSync found 45 minutes every evening I didn\'t know I had.',
    rating: 5,
  },
]

const stats = [
  { value: '50K+', label: 'Learning plans created' },
  { value: '2.4M', label: 'Sessions completed' },
  { value: '89%', label: 'Users hit their goals' },
  { value: '4.8★', label: 'Average rating' },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">SkillSync AI</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Reviews</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors px-4 py-2">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary text-sm">
                Get Started Free
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 bg-white">
              <div className="flex flex-col gap-2">
                <a href="#features" className="px-4 py-2 text-sm text-gray-600">Features</a>
                <a href="#how-it-works" className="px-4 py-2 text-sm text-gray-600">How It Works</a>
                <a href="#testimonials" className="px-4 py-2 text-sm text-gray-600">Reviews</a>
                <hr className="border-gray-100" />
                <Link href="/login" className="px-4 py-2 text-sm text-gray-600">Sign in</Link>
                <Link href="/signup" className="mx-4 btn-primary text-center text-sm">Get Started Free</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-cyan-50 -z-10" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-40 -z-10" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-cyan-100 rounded-full blur-3xl opacity-40 -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Learning Planner
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-6">
            Turn your{' '}
            <span className="text-gradient">real day</span>
            {' '}into a<br />
            realistic learning plan.
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tell SkillSync AI what your day looks like, choose what you want to learn,
            and get a personalized timetable that fits around your life — not an imaginary one.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/signup"
              className="flex items-center gap-2 btn-primary text-base px-8 py-4 rounded-2xl shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-200"
            >
              Create My Learning Plan
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="text-gray-600 font-medium hover:text-primary-600 transition-colors">
              Already have an account? Sign in
            </Link>
          </div>

          {/* Hero Visual - Mockup Card */}
          <div className="relative max-w-3xl mx-auto">
            <div className="card p-6 text-left shadow-2xl border border-gray-100">
              {/* Mock dashboard */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs text-gray-400 font-medium">GOOD EVENING</div>
                  <div className="text-lg font-bold text-gray-900">Ready to make progress? 🎯</div>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                  <span className="text-amber-600 font-bold text-sm">🔥 5-day streak</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Today's Focus", value: 'Spanish Basics', color: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
                  { label: 'Week Progress', value: '4/5 done', color: 'bg-green-50 border-green-200', text: 'text-green-700' },
                  { label: 'Total Minutes', value: '135 min', color: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
                ].map(item => (
                  <div key={item.label} className={`${item.color} border rounded-xl p-3`}>
                    <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                    <div className={`font-bold text-sm ${item.text}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Tonight — 9:00 PM</span>
                  <span className="badge-primary text-xs">Learn</span>
                </div>
                <div className="text-base font-bold text-gray-900 mb-1">Spanish: Present Tense Verbs</div>
                <div className="text-xs text-gray-500 mb-3">15 min vocabulary · 15 min grammar · 15 min practice</div>
                <div className="flex gap-2">
                  <button className="btn-primary text-xs px-4 py-2">Start Session</button>
                  <button className="btn-secondary text-xs px-4 py-2">Reschedule</button>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-3 hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="text-xs font-bold text-gray-900">7-Day Streak!</div>
                  <div className="text-xs text-gray-400">Badge earned</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-3 hidden sm:block">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">AI adjusted your plan</div>
                  <div className="text-xs text-gray-400">Moved missed session →</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge-primary mb-4">Features</div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Everything you need to actually learn
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Not just another generic planner. SkillSync AI understands your life first, then fits learning around it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(feature => (
              <div key={feature.title} className="card-hover p-6 group">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform', feature.color)}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge-primary mb-4">How It Works</div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              From your daily routine to a custom plan — in minutes
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-primary-200">
                    {step.icon}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-primary-600 mb-1">STEP {step.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed italic">"{step.description}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example output */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">See it in action</h2>
            <p className="text-primary-200 text-lg">Input → AI Analysis → Realistic Plan</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-primary-200 text-xs font-bold mb-3 uppercase tracking-wide">Your Input</div>
              <p className="text-white text-sm leading-relaxed italic">
                "I wake up at 8, have class from 10 to 2, gym at 6, dinner at 8, and sleep around midnight."
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-primary-200 text-xs font-bold mb-3 uppercase tracking-wide">AI Finds</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-white">10 AM–2 PM class (busy)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-white">6–7 PM gym (busy)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white">9–11:30 PM free (best)</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-primary-200 text-xs font-bold mb-3 uppercase tracking-wide">Suggested Slot</div>
              <div className="text-white">
                <div className="text-2xl font-black mb-1">9:00 PM</div>
                <div className="text-primary-200 text-sm mb-3">45 min · Evening · High focus</div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">Mon</span>
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">Wed</span>
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">Fri</span>
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">Sat</span>
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">Sun</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge-primary mb-4">Testimonials</div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Learners who made it work</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="card p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-6">🚀</div>
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Ready to start learning — for real?
          </h2>
          <p className="text-gray-500 text-lg mb-10">
            Join thousands of learners who built habits that actually stick by fitting learning into their real day.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 btn-primary text-base px-10 py-4 rounded-2xl shadow-lg shadow-primary-200"
          >
            Create My Free Learning Plan
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-gray-400 mt-4">No credit card required · Free forever plan available</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 gradient-bg rounded-lg flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white font-bold">SkillSync AI</span>
            </div>
            <p className="text-xs text-center max-w-md">
              SkillSync AI helps you organize learning goals and build consistency. It does not guarantee outcomes; progress depends on regular effort.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            </div>
          </div>
          <hr className="border-gray-800 my-8" />
          <p className="text-center text-xs">© {new Date().getFullYear()} SkillSync AI. Built with ❤️ for learners.</p>
        </div>
      </footer>
    </div>
  )
}
