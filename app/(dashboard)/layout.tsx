'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Plus, Target, Calendar, TrendingUp,
  BookOpen, BarChart3, Settings, LogOut, Bell, Menu, X,
  Sparkles, ChevronRight, MessageSquare,
} from 'lucide-react'
import { useStore, AppAlert } from '@/lib/store'
import { cn, getGreeting } from '@/lib/utils'
import { signOut } from '@/lib/supabase'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import PlanCoach from '@/components/PlanCoach'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/create-plan', label: 'Create Plan', icon: Plus },
  { href: '/goals', label: 'My Goals', icon: Target },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/resources', label: 'Resources', icon: BookOpen },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout, sidebarOpen, setSidebarOpen, notifications } = useStore()
  const [coachOpen, setCoachOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) return null

  const unreadCount = notifications.filter(n => !(n as any).read).length

  const handleLogout = async () => {
    await signOut().catch(() => {})
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-white border-r border-gray-100 transition-all duration-300',
        sidebarOpen ? 'w-60' : 'w-16'
      )}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 flex-shrink-0 gradient-bg rounded-xl flex items-center justify-center shadow-md shadow-primary-200">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="font-black text-gray-900 text-sm leading-none">SkillSync</div>
              <div className="text-primary-600 text-xs font-semibold">AI Planner</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  active ? 'sidebar-link-active' : 'sidebar-link',
                  !sidebarOpen && 'justify-center px-2'
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', active ? 'text-primary-600' : 'text-gray-500')} />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
                {sidebarOpen && item.href === '/create-plan' && (
                  <span className="ml-auto w-5 h-5 gradient-bg rounded-full flex items-center justify-center">
                    <Plus className="w-3 h-3 text-white" />
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* AI Coach button */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => setCoachOpen(true)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-primary-50 to-cyan-50 border border-primary-100 hover:border-primary-300 transition-all text-sm font-medium text-primary-700',
              !sidebarOpen && 'justify-center px-2'
            )}
            title={!sidebarOpen ? 'Plan Coach' : undefined}
          >
            <MessageSquare className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Plan Coach</span>}
          </button>
        </div>

        {/* User + logout */}
        <div className="p-3 border-t border-gray-100">
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user.name[0].toUpperCase()}
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{user.name}</div>
                <div className="text-xs text-gray-400 truncate">{user.email}</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all',
              !sidebarOpen && 'justify-center px-2'
            )}
            title={!sidebarOpen ? 'Sign out' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && 'Sign out'}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:border-primary-300 hover:text-primary-600 transition-all"
        >
          <ChevronRight className={cn('w-3 h-3 text-gray-500 transition-transform', !sidebarOpen && 'rotate-180')} />
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative z-10 w-72 bg-white flex flex-col h-full shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <div className="font-black text-gray-900 text-sm">SkillSync AI</div>
                </div>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {navItems.map(item => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={active ? 'sidebar-link-active' : 'sidebar-link'}
                  >
                    <item.icon className={cn('w-5 h-5', active ? 'text-primary-600' : 'text-gray-500')} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="p-3 border-t border-gray-100">
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-red-600 w-full">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className={cn('flex-1 flex flex-col min-h-screen transition-all duration-300', sidebarOpen ? 'lg:ml-60' : 'lg:ml-16')}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="text-sm font-bold text-gray-900 hidden sm:block">
                {getGreeting()}, {user.name.split(' ')[0]}! 👋
              </div>
              <div className="text-xs text-gray-400 hidden sm:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 card shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900">Notifications</span>
                    <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n: AppAlert) => (
                        <div key={n.id} className="px-4 py-3 hover:bg-gray-50">
                          <div className="text-sm font-medium text-gray-900">{n.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Plan Coach mobile */}
            <button
              onClick={() => setCoachOpen(true)}
              className="p-2 rounded-xl hover:bg-primary-50 text-primary-600 transition-colors"
              title="Plan Coach"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            {/* Avatar */}
            <Link href="/settings">
              <div className="w-9 h-9 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
                {user.name[0].toUpperCase()}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 pb-safe">
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.slice(0, 5).map(item => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all',
                    active ? 'text-primary-600' : 'text-gray-400'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Plan Coach Panel */}
      {coachOpen && <PlanCoach onClose={() => setCoachOpen(false)} />}

      {/* WhatsApp Widget */}
      <WhatsAppWidget />
    </div>
  )
}
