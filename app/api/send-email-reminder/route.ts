import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

function dailyReminderHTML(name: string, sessions: any[]) {
  const sessionRows = sessions.map(s => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
        <div style="font-weight:600;color:#0f172a;font-size:14px;">${s.title}</div>
        <div style="color:#64748b;font-size:12px;margin-top:2px;">${s.goalTitle} · ${s.startTime} · ${s.durationMinutes} min</div>
      </td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#4f46e5,#06b6d4);border-radius:20px 20px 0 0;padding:32px;text-align:center;">
          <div style="font-size:28px;margin-bottom:8px;">✨</div>
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;">Time to learn!</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Your daily session reminder from SkillSync AI</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#fff;padding:32px;border-radius:0 0 20px 20px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <p style="color:#0f172a;font-size:16px;margin:0 0 8px;">Hey <strong>${name}</strong> 👋</p>
          <p style="color:#64748b;font-size:14px;margin:0 0 24px;line-height:1.6;">
            You have ${sessions.length} learning session${sessions.length !== 1 ? 's' : ''} scheduled today. Keep the momentum going!
          </p>

          <div style="background:#f8fafc;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
            <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">TODAY'S SESSIONS</div>
            <table width="100%" cellpadding="0" cellspacing="0">${sessionRows}</table>
          </div>

          <div style="text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
               style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:14px;box-shadow:0 4px 16px rgba(79,70,229,0.3);">
              Open Dashboard →
            </a>
          </div>

          <p style="color:#94a3b8;font-size:12px;text-align:center;margin:24px 0 0;line-height:1.6;">
            SkillSync AI helps you organize learning goals and build consistency.<br>
            It does not guarantee outcomes; progress depends on regular effort.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function weeklyReportHTML(name: string, report: any) {
  const pct = report.completionRate || 0
  const barWidth = Math.round(pct * 1.8) // scale to 180px max

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#4f46e5,#06b6d4);border-radius:20px 20px 0 0;padding:32px;text-align:center;">
          <div style="font-size:28px;margin-bottom:8px;">📊</div>
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;">Weekly Progress Report</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">${report.weekStart} – ${report.weekEnd}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#fff;padding:32px;border-radius:0 0 20px 20px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <p style="color:#0f172a;font-size:16px;margin:0 0 4px;">Hey <strong>${name}</strong> 👋</p>
          <p style="color:#64748b;font-size:14px;margin:0 0 24px;">Here's how your learning week went:</p>

          <!-- Stats grid -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              ${[
                { label: 'Completed', value: report.completedSessions, color: '#22c55e' },
                { label: 'Missed', value: report.missedSessions, color: '#ef4444' },
                { label: 'Minutes', value: report.totalMinutes, color: '#4f46e5' },
                { label: 'Rate', value: `${pct}%`, color: '#f59e0b' },
              ].map(s => `
                <td style="width:25%;padding:4px;" align="center">
                  <div style="background:#f8fafc;border-radius:12px;padding:16px 8px;text-align:center;">
                    <div style="font-size:22px;font-weight:900;color:${s.color};">${s.value}</div>
                    <div style="font-size:11px;color:#64748b;margin-top:2px;">${s.label}</div>
                  </div>
                </td>
              `).join('')}
            </tr>
          </table>

          <!-- Progress bar -->
          <div style="background:#f1f5f9;border-radius:999px;height:8px;margin-bottom:24px;overflow:hidden;">
            <div style="background:linear-gradient(90deg,#4f46e5,#06b6d4);height:8px;width:${barWidth}px;border-radius:999px;"></div>
          </div>

          <!-- AI Feedback -->
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
            <div style="font-size:11px;font-weight:700;color:#3b82f6;text-transform:uppercase;margin-bottom:8px;">✨ AI Feedback</div>
            <p style="color:#1e40af;font-size:14px;margin:0;line-height:1.6;">${report.aiSummary}</p>
          </div>

          <!-- CTA -->
          <div style="text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/progress"
               style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:14px;box-shadow:0 4px 16px rgba(79,70,229,0.3);">
              View Full Progress →
            </a>
          </div>

          <p style="color:#94a3b8;font-size:12px;text-align:center;margin:24px 0 0;">
            SkillSync AI · Unsubscribe from reminders in Settings
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function missedSessionHTML(name: string, sessions: any[]) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" style="max-width:560px;width:100%;">
        <tr><td style="background:#fff;border-radius:20px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);border-top:4px solid #ef4444;">
          <div style="font-size:32px;text-align:center;margin-bottom:16px;">⚠️</div>
          <h2 style="color:#0f172a;text-align:center;margin:0 0 8px;font-size:20px;">Missed ${sessions.length} session${sessions.length !== 1 ? 's' : ''}</h2>
          <p style="color:#64748b;text-align:center;font-size:14px;margin:0 0 24px;">
            Hey ${name}, you missed some learning sessions. Don't worry — get back on track!
          </p>
          <div style="text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
               style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 28px;border-radius:12px;font-weight:700;font-size:14px;">
              Reschedule Now →
            </a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, to, name, sessions, report } = body

    if (!to || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let subject = ''
    let html = ''

    switch (type) {
      case 'daily':
        subject = `📚 Your learning sessions for today — SkillSync AI`
        html = dailyReminderHTML(name, sessions || [])
        break
      case 'weekly':
        subject = `📊 Your weekly progress report — SkillSync AI`
        html = weeklyReportHTML(name, report || {})
        break
      case 'missed':
        subject = `⚠️ You missed ${sessions?.length || 'some'} sessions — get back on track!`
        html = missedSessionHTML(name, sessions || [])
        break
      default:
        return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: `SkillSync AI <${FROM}>`,
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err: any) {
    console.error('Email route error:', err)
    return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 })
  }
}
