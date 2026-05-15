'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2, Bot, Sparkles } from 'lucide-react'
import { useStore } from '@/lib/store'
import { askPlanCoach } from '@/lib/ai'
import { PlanCoachMessage } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const QUICK_PROMPTS = [
  "I missed 3 days, fix my schedule",
  "I only have 20 minutes today",
  "Make my plan easier",
  "Move all sessions to evening",
  "Give me extra practice",
  "What should I focus on this week?",
]

export default function PlanCoach({ onClose }: { onClose: () => void }) {
  const { goals, sessions, coachMessages, addCoachMessage, clearCoachMessages } = useStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [coachMessages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: PlanCoachMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    }
    addCoachMessage(userMsg)
    setInput('')
    setLoading(true)

    try {
      const answer = await askPlanCoach(text, { goals, sessions })
      const assistantMsg: PlanCoachMessage = {
        role: 'assistant',
        content: answer,
        timestamp: new Date().toISOString(),
      }
      addCoachMessage(assistantMsg)
    } catch {
      addCoachMessage({
        role: 'assistant',
        content: "I'm having trouble connecting right now. Try again in a moment!",
        timestamp: new Date().toISOString(),
      })
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 sm:bg-transparent" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:w-96 h-[85vh] sm:h-[600px] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-in border border-gray-100">
        {/* Header */}
        <div className="gradient-bg px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-black text-white">Plan Coach</div>
            <div className="text-primary-200 text-xs">AI-powered schedule assistant</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearCoachMessages}
              className="text-primary-200 hover:text-white text-xs transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
            >
              Clear
            </button>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {/* Welcome */}
          {coachMessages.length === 0 && (
            <div className="flex gap-3">
              <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[80%] border border-gray-100">
                <p className="text-sm text-gray-700">
                  Hi! I'm your Plan Coach. I can help you:
                </p>
                <ul className="text-sm text-gray-500 mt-2 space-y-1">
                  <li>• Fix your schedule after missed days</li>
                  <li>• Adjust difficulty up or down</li>
                  <li>• Reschedule sessions</li>
                  <li>• Explain today's topic</li>
                  <li>• Give you extra practice ideas</li>
                </ul>
                <p className="text-sm text-gray-700 mt-2">What can I help you with?</p>
              </div>
            </div>
          )}

          {coachMessages.map((msg, i) => (
            <div
              key={i}
              className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center flex-shrink-0 mt-auto">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={cn(
                'rounded-2xl p-3 text-sm max-w-[80%] shadow-sm',
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-none'
                  : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
              )}>
                {msg.content}
                <div className={cn('text-[10px] mt-1', msg.role === 'user' ? 'text-primary-200' : 'text-gray-300')}>
                  {format(new Date(msg.timestamp), 'h:mm a')}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm border border-gray-100">
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Quick prompts */}
        {coachMessages.length === 0 && (
          <div className="px-4 py-2 bg-white border-t border-gray-100">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {QUICK_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="whitespace-nowrap px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs rounded-full border border-primary-100 transition-all font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Ask your Plan Coach..."
              className="input flex-1 text-sm py-2.5"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="btn-primary p-2.5 rounded-xl flex-shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
