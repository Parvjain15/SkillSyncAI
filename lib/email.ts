import { Session, Goal } from './types'

export async function sendDailyReminder(to: string, name: string, sessions: Session[]) {
  const res = await fetch('/api/send-email-reminder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'daily', to, name, sessions }),
  })
  return res.json()
}

export async function sendWeeklyReport(to: string, name: string, report: object) {
  const res = await fetch('/api/send-email-reminder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'weekly', to, name, report }),
  })
  return res.json()
}

export async function sendMissedSessionAlert(to: string, name: string, sessions: Session[]) {
  const res = await fetch('/api/send-email-reminder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'missed', to, name, sessions }),
  })
  return res.json()
}
