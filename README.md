<h1 align="center">SkillSync AI</h1>

<p align="center">
  <b>Turn your real day into a realistic learning plan.</b><br/>
  An AI-powered learning planner (PWA) that fits your goals into the time you actually have.
</p>

<p align="center">
  <a href="https://skill-sync-ai-ivory.vercel.app/"><b>🚀 Live Demo</b></a> ·
  <a href="#features">Features</a> ·
  <a href="#how-it-works">How It Works</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#getting-started">Getting Started</a>
</p>

---

## Overview

Most learning apps assume you have unlimited time. SkillSync AI doesn't. Tell it what your actual day looks like — work hours, commute, classes, sleep — pick a goal like Spanish, Python, or guitar, and it generates a realistic, milestone-based timetable that fits around your life instead of replacing it. The plan auto-reschedules when you miss a session, tracks your streaks, and syncs everything to your Google Calendar.

## Features

- **🧠 AI-Generated Study Plans** — Powered by Google Gemini, the planner builds a personalised timetable from your schedule and goals
- **📅 Google Calendar Integration** — Two-way sync keeps your learning sessions alongside the rest of your life
- **🔥 Streak Tracking** — Visual progress indicators that reward consistency
- **♻️ Auto-Rescheduling** — Missed a session? The plan adapts automatically without breaking your milestones
- **📚 Smart Resource Suggestions** — Curated learning materials surfaced based on your chosen goal
- **📲 Progressive Web App (PWA)** — Installable on mobile and desktop, with offline support
- **✉️ Email Notifications** — Powered by Brevo for daily reminders and progress updates
- **🔐 Secure Authentication** — Managed through Supabase Auth with Google sign-in

## How It Works

1. **Describe your day** — Walk through a guided setup that captures your real schedule
2. **Pick a goal** — Choose what you want to learn (language, skill, exam prep, hobby)
3. **Get your plan** — Gemini generates a milestone-based timetable tailored to the time you actually have
4. **Stay on track** — Sync to Google Calendar, get reminders, track streaks, and auto-reschedule when life happens

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS |
| **Backend & Database** | Supabase, PostgreSQL |
| **AI** | Google Gemini |
| **Integrations** | Google Calendar API, Brevo (Email) |
| **Platform** | Progressive Web App (PWA) |
| **Deployment** | Vercel |

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Parvjain15/SkillSyncAI.git
cd SkillSyncAI

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase, Gemini, Google, and Brevo keys to .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
BREVO_API_KEY=

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

The project follows a standard Next.js App Router layout:

- `app/` — Routes, layouts, and page components
- `components/` — Reusable UI components (planner, calendar widgets, dashboards)
- `lib/` — Supabase client, Gemini wrapper, Google Calendar helpers
- `public/` — Static assets, manifest, and PWA icons

## Author

**Parv Jain** — [Portfolio](https://parv.is-a.dev) · [LinkedIn](https://www.linkedin.com/in/parv-jain-424a60383) · [GitHub](https://github.com/Parvjain15)

---

<p align="center"><i>If you found this project interesting, consider giving it a ⭐</i></p>
