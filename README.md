# Aether - AI-Powered Life Coach App

**Vision:** A comprehensive AI-driven coach for health, productivity, and digital well-being with real-time tracking, enforcement mechanisms, and reflective journaling.

## 🎯 Core Features

### 1. AI-Powered Health & Wellness Coach
- **Custom Workout Generator**: AI-driven daily/weekly routines with progressive overload
- **Diet & Calorie Tracker**: Text, voice, and image-based food logging with AI recognition
- **Aggressive Wake-Up System**: Camera verification or cognitive tasks to disable alarm

### 2. Advanced GPS Activity Tracker
- Real-time path tracking with speed, distance, and duration
- Pacing coach with target time feedback ("Speed up by 0.5 km/h")
- Activity history and route playback

### 3. Intrusive Productivity & Habit Builder
- Task pop-ups on phone unlock (Android)
- Countdown focus blocks with app locking
- Persistent reminders for critical habits

### 4. AI Journaling & Goal Management
- Daily 9 PM summary (text or voice) → structured hourly table
- AI-generated hierarchical goals (daily, weekly, main goal)
- Daily ratings (out of 10) with AI feedback and reviews
- Weekly summaries and proactive catch-up reminders

### 5. Digital Well-being App Limiter
- Daily time limits per app
- 2-minute emergency grace period
- Usage statistics dashboard

## 🏗️ Architecture

```
Aether/
├── mobile/          # React Native app (TypeScript)
├── backend/         # NestJS API (TypeScript)
└── docs/            # Documentation
```

### Tech Stack

**Mobile (Android-first, iOS with limitations):**
- React Native 0.76+ with TypeScript
- React Navigation, Zustand
- WatermelonDB for local storage
- react-native-maps (Mapbox)
- react-native-vision-camera

**Backend:**
- NestJS with TypeScript
- PostgreSQL + Prisma ORM
- Redis for caching and jobs
- Google Gemini API (primary) / OpenAI (fallback) for AI features
- Vision API for food recognition

**DevOps:**
- Railway/Fly.io for hosting
- GitHub Actions for CI/CD
- Sentry for monitoring

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- PostgreSQL 15+
- Redis 7+

### Installation

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure .env with database and API keys
npx prisma migrate dev
npm run dev
```

#### Mobile Setup
```bash
cd mobile
npm install
# For Android
npm run android
# For iOS (macOS only)
cd ios && pod install && cd ..
npm run ios
```

## 📱 MVP Roadmap (6-8 Weeks)

| Phase | Duration | Features |
|-------|----------|----------|
| Foundation | Week 1-2 | Auth, Dashboard, Database |
| Health Coach | Week 2-3 | Diet logging, Wake alarm |
| GPS Tracker | Week 3-4 | Live tracking, Pacing coach |
| Productivity | Week 4-5 | Tasks, Unlock overlay, Focus blocks |
| Journaling | Week 5-6 | Daily summary, AI goals, Ratings |
| App Limiter | Week 6-7 | Usage tracking, Limits, Grace period |
| Polish | Week 7-8 | Testing, Fixes, Beta release |

## 🔐 Privacy & Permissions

Aether requires extensive permissions for its intrusive features:
- Camera (wake verification, food photos)
- Location (GPS tracking)
- Usage Stats (app limiter - Android)
- Accessibility (app blocking - Android)
- Overlay (unlock popups - Android)
- Notifications

All data is encrypted in transit and at rest. Users have full control over data export and deletion.

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

This is a personal project. Contributions welcome after MVP release.

---

**Status:** 🏗️ In Development (December 2025)
