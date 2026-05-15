'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Plus, BookOpen } from 'lucide-react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

// ── Resource data keyed by goal category ────────────────────────────────────

const RESOURCE_LIBRARY: Record<string, any[]> = {
  language: [
    { title: 'Duolingo', type: 'exercise', desc: 'Daily vocabulary & grammar practice', url: 'https://duolingo.com', icon: '🦜', free: true },
    { title: 'SpanishDict', type: 'article', desc: 'Grammar rules & full dictionary', url: 'https://spanishdict.com', icon: '📖', free: true },
    { title: 'Clozemaster', type: 'exercise', desc: 'Sentence-completion for fluency', url: 'https://clozemaster.com', icon: '🧩', free: true },
    { title: 'Anki Flashcards', type: 'flashcard', desc: 'Spaced repetition for vocabulary', url: 'https://apps.ankiweb.net', icon: '🃏', free: true },
    { title: 'LanguageTransfer', type: 'course', desc: 'Free audio courses for Spanish', url: 'https://languagetransfer.org', icon: '🎧', free: true },
    { title: 'Forvo Pronunciation', type: 'exercise', desc: 'Native speaker pronunciation guide', url: 'https://forvo.com', icon: '🗣️', free: true },
  ],
  coding: [
    { title: 'FreeCodeCamp', type: 'course', desc: 'Full Python / JS curriculum, free', url: 'https://freecodecamp.org', icon: '🔥', free: true },
    { title: 'Python Docs', type: 'article', desc: 'Official Python documentation', url: 'https://docs.python.org/3/', icon: '🐍', free: true },
    { title: 'Replit', type: 'exercise', desc: 'Code online — no setup needed', url: 'https://replit.com', icon: '💻', free: true },
    { title: 'CS50 Harvard', type: 'course', desc: 'Free computer science intro', url: 'https://cs50.harvard.edu', icon: '🎓', free: true },
    { title: 'LeetCode', type: 'quiz', desc: 'Coding challenges & practice problems', url: 'https://leetcode.com', icon: '⚡', free: true },
    { title: 'Python Tutor', type: 'exercise', desc: 'Visualize code execution step-by-step', url: 'https://pythontutor.com', icon: '👁️', free: true },
  ],
  ielts: [
    { title: 'British Council IELTS', type: 'course', desc: 'Official IELTS preparation material', url: 'https://britishcouncil.org/exam/ielts', icon: '🇬🇧', free: true },
    { title: 'IELTS.org Practice Tests', type: 'quiz', desc: 'Official sample tests and answers', url: 'https://ielts.org', icon: '📝', free: true },
    { title: 'E2 Language', type: 'course', desc: 'Free IELTS tips, live classes & practice', url: 'https://e2language.com', icon: '📊', free: true },
    { title: 'IELTS Advantage', type: 'article', desc: 'Band 7+ writing task guides', url: 'https://ielts-advantage.com', icon: '✍️', free: true },
    { title: 'BBC Learning English', type: 'video', desc: 'Listening comprehension & vocabulary', url: 'https://bbc.co.uk/learningenglish', icon: '📺', free: true },
    { title: 'Magoosh IELTS Blog', type: 'article', desc: 'Free tips, strategies, and walkthroughs', url: 'https://magoosh.com/ielts', icon: '🎯', free: true },
  ],
  music: [
    { title: 'JustinGuitar', type: 'course', desc: 'Best free beginner guitar course online', url: 'https://justinguitar.com', icon: '🎸', free: true },
    { title: 'Ultimate Guitar', type: 'exercise', desc: 'Tabs, chords & backing tracks', url: 'https://ultimate-guitar.com', icon: '🎵', free: true },
    { title: 'Musictheory.net', type: 'course', desc: 'Free interactive music theory lessons', url: 'https://musictheory.net', icon: '🎼', free: true },
    { title: 'Chordify', type: 'exercise', desc: 'Automatic chord detection for any song', url: 'https://chordify.net', icon: '🎹', free: true },
    { title: 'GuitarTuna', type: 'exercise', desc: 'Free tuner + ear training + metronome', url: 'https://yousician.com/guitartuna', icon: '🔧', free: true },
    { title: 'Teoria Music', type: 'exercise', desc: 'Music theory drills & ear training', url: 'https://teoria.com', icon: '📐', free: true },
  ],
  data: [
    { title: 'Kaggle Learn', type: 'course', desc: 'Free data science micro-courses with notebooks', url: 'https://kaggle.com/learn', icon: '🏆', free: true },
    { title: 'Pandas Documentation', type: 'article', desc: 'Official Pandas reference & tutorials', url: 'https://pandas.pydata.org/docs', icon: '🐼', free: true },
    { title: 'Towards Data Science', type: 'article', desc: 'Practical data science articles & guides', url: 'https://towardsdatascience.com', icon: '📊', free: true },
    { title: 'Google Colab', type: 'exercise', desc: 'Free cloud Python notebook environment', url: 'https://colab.research.google.com', icon: '☁️', free: true },
    { title: 'StatQuest with Josh Starmer', type: 'video', desc: 'ML & stats concepts explained simply', url: 'https://youtube.com/@statquest', icon: '📈', free: true },
    { title: 'DataCamp Free Tracks', type: 'course', desc: 'Free intro courses to pandas, Python & SQL', url: 'https://datacamp.com', icon: '🎓', free: true },
  ],
  networking: [
    { title: 'Professor Messer', type: 'video', desc: 'Free CompTIA A+, Network+, Security+ study', url: 'https://professormesser.com', icon: '🌐', free: true },
    { title: 'NetworkChuck', type: 'video', desc: 'Fun, hands-on networking video tutorials', url: 'https://youtube.com/@NetworkChuck', icon: '📡', free: true },
    { title: 'Cisco Learning Network', type: 'course', desc: 'Official Cisco CCNA training paths', url: 'https://learningnetwork.cisco.com', icon: '🔌', free: true },
    { title: 'Cisco Packet Tracer', type: 'exercise', desc: 'Free network simulation & lab tool', url: 'https://netacad.com/courses/packet-tracer', icon: '🖥️', free: true },
    { title: 'Subnetting Practice', type: 'exercise', desc: 'Drill subnetting until it clicks', url: 'https://subnettingpractice.com', icon: '🔢', free: true },
    { title: 'CertificationKits Blog', type: 'article', desc: 'CCNA study guides & lab walkthroughs', url: 'https://certificationkits.com/cisco/articles', icon: '📋', free: true },
  ],
  portfolio: [
    { title: 'GitHub Pages', type: 'exercise', desc: 'Free hosting for portfolio projects', url: 'https://pages.github.com', icon: '🐙', free: true },
    { title: 'Dribbble', type: 'article', desc: 'Design inspiration for UI/portfolio', url: 'https://dribbble.com', icon: '🎨', free: true },
    { title: 'Vercel', type: 'exercise', desc: 'Free Next.js / React deployment', url: 'https://vercel.com', icon: '▲', free: true },
    { title: 'MDN Web Docs', type: 'article', desc: 'Authoritative HTML, CSS, JS reference', url: 'https://developer.mozilla.org', icon: '📚', free: true },
    { title: 'FreeCodeCamp Projects', type: 'project', desc: 'Guided project challenges for portfolio', url: 'https://freecodecamp.org/learn', icon: '🏗️', free: true },
    { title: 'Netlify Drop', type: 'exercise', desc: 'Drag-and-drop static site deployment', url: 'https://app.netlify.com/drop', icon: '🚀', free: true },
  ],
  fitness: [
    { title: 'Jefit Workout Planner', type: 'exercise', desc: 'Free strength training logs & plans', url: 'https://jefit.com', icon: '🏋️', free: true },
    { title: 'Muscle & Strength', type: 'article', desc: 'Beginner to advanced lifting programs', url: 'https://muscleandstrength.com', icon: '💪', free: true },
    { title: 'AthleanX YouTube', type: 'video', desc: 'Science-based strength & muscle tutorials', url: 'https://youtube.com/@athleanx', icon: '📺', free: true },
    { title: 'ExRx.net', type: 'article', desc: 'Exercise library with form guides & standards', url: 'https://exrx.net', icon: '📋', free: true },
    { title: 'Symmetric Strength', type: 'exercise', desc: 'Track & compare your lifting benchmarks', url: 'https://symmetricstrength.com', icon: '📊', free: true },
    { title: 'RP Hypertrophy App (Free)', type: 'course', desc: 'Evidence-based hypertrophy & strength tips', url: 'https://rpstrength.com', icon: '🔬', free: true },
  ],
  custom: [
    { title: 'Anki Flashcards', type: 'flashcard', desc: 'Spaced repetition for any subject', url: 'https://apps.ankiweb.net', icon: '🃏', free: true },
    { title: 'Notion', type: 'exercise', desc: 'Note-taking, study planning & outlines', url: 'https://notion.so', icon: '📒', free: true },
    { title: 'YouTube', type: 'video', desc: 'Free tutorials for almost any topic', url: 'https://youtube.com', icon: '📺', free: true },
    { title: 'Coursera (Audit)', type: 'course', desc: 'Free audit of top university courses', url: 'https://coursera.org', icon: '🎓', free: true },
    { title: 'MIT OpenCourseWare', type: 'course', desc: 'Free MIT course materials & lectures', url: 'https://ocw.mit.edu', icon: '🏫', free: true },
    { title: 'Pomofocus Timer', type: 'exercise', desc: 'Pomodoro focus timer for study sessions', url: 'https://pomofocus.io', icon: '🍅', free: true },
  ],
}

const TYPE_COLORS: Record<string, string> = {
  video:     'bg-red-50 text-red-700',
  article:   'bg-blue-50 text-blue-700',
  exercise:  'bg-purple-50 text-purple-700',
  course:    'bg-green-50 text-green-700',
  quiz:      'bg-amber-50 text-amber-700',
  flashcard: 'bg-pink-50 text-pink-700',
  project:   'bg-cyan-50 text-cyan-700',
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const { goals } = useStore()

  const activeGoals = goals.filter(g => g.status === 'active')

  // Build tab list from user's goals; fall back to a General tab if they have none
  const tabs = activeGoals.length > 0
    ? activeGoals.map(g => ({ id: g.id, label: g.title, emoji: g.emoji || '🎯', category: g.category, color: g.color }))
    : [{ id: 'general', label: 'General', emoji: '📚', category: 'custom', color: '#4F46E5' }]

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'general')

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0]
  const resources = RESOURCE_LIBRARY[currentTab?.category] || RESOURCE_LIBRARY['custom']

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Learning Resources</h1>
          <p className="text-gray-500 text-sm">
            {activeGoals.length > 0
              ? 'Curated free resources for each of your active goals'
              : 'Free resources to get you started — create a goal for personalised picks'}
          </p>
        </div>
        {activeGoals.length > 0 && (
          <Link href="/create-plan" className="btn-secondary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Goal
          </Link>
        )}
      </div>

      {/* Goal tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2',
              activeTab === tab.id
                ? 'text-white shadow-sm border-transparent'
                : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
            )}
            style={activeTab === tab.id ? { backgroundColor: tab.color, borderColor: tab.color } : {}}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section label */}
      {currentTab && (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm"
            style={{ backgroundColor: (currentTab.color || '#4F46E5') + '20' }}
          >
            {currentTab.emoji}
          </div>
          <div>
            <div className="font-bold text-gray-900">{currentTab.label}</div>
            <div className="text-xs text-gray-400">{resources.length} free resources</div>
          </div>
        </div>
      )}

      {/* Resources grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource, i) => (
          <a
            key={i}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-hover p-5 flex flex-col gap-3 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{resource.icon}</span>
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {resource.title}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className={cn('badge text-xs', TYPE_COLORS[resource.type] || 'bg-gray-50 text-gray-600')}>
                      {resource.type}
                    </span>
                    {resource.free && (
                      <span className="badge text-xs bg-green-50 text-green-700">Free</span>
                    )}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-primary-400 transition-colors flex-shrink-0 mt-0.5" />
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">{resource.desc}</p>
          </a>
        ))}
      </div>

      {/* Session resources tip */}
      <div className="card p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-0.5">Topic-specific resources in your sessions</h3>
          <p className="text-sm text-gray-500 mb-3">
            Each session card on the Calendar includes resources tailored to that exact topic — open any session to see them.
          </p>
          <Link href="/calendar" className="btn-secondary text-sm inline-flex items-center gap-2">
            <ExternalLink className="w-4 h-4" /> Open Calendar
          </Link>
        </div>
      </div>

      {/* Empty state — no goals */}
      {activeGoals.length === 0 && (
        <div className="card p-8 text-center border-2 border-dashed border-primary-100 bg-primary-50/30">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="font-bold text-gray-900 mb-2">Create a goal for personalised resources</h3>
          <p className="text-sm text-gray-500 mb-4">
            Once you add a learning goal, this page will show resources specifically chosen for that topic.
          </p>
          <Link href="/create-plan" className="btn-primary text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Learning Plan
          </Link>
        </div>
      )}
    </div>
  )
}
