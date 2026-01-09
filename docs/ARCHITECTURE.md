# Aether - Technical Architecture

## System Overview

Aether is a full-stack mobile application combining health coaching, activity tracking, productivity enforcement, AI journaling, and digital well-being features.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP (React Native)                │
│                     Android Primary / iOS                   │
├─────────────────────────────────────────────────────────────┤
│  Coach | Tracker | Productivity | Journal | Well-being     │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API (HTTPS)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND API (NestJS)                      │
├─────────────────────────────────────────────────────────────┤
│  Auth | Health | Tracking | Tasks | Journal | Limiter      │
│                    AI Orchestration                         │
└───────┬─────────────────────────────┬───────────────────────┘
        │                             │
        ▼                             ▼
┌───────────────┐            ┌────────────────────┐
│  PostgreSQL   │            │   OpenAI API       │
│   (Prisma)    │            │   Vision API       │
└───────────────┘            └────────────────────┘
        │
        ▼
┌───────────────┐
│     Redis     │
│  (Cache/Jobs) │
└───────────────┘
```

## Technology Stack

### Mobile (React Native)
- **Framework**: React Native 0.76+
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State**: Zustand
- **Local DB**: WatermelonDB
- **Maps**: react-native-maps + Mapbox
- **Camera**: react-native-vision-camera
- **Location**: @react-native-community/geolocation

### Backend (NestJS)
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Cache**: Redis
- **Auth**: JWT + Passport
- **API Docs**: Swagger/OpenAPI

### AI & Services
- **LLM**: Google Gemini API (primary) - gemini-2.0-flash-exp
- **LLM Fallback**: OpenAI GPT-4o-mini
- **On-Device AI** (Phase 2): Gemma 2B via MediaPipe
- **Vision**: Gemini Vision (multimodal) / Google Cloud Vision
- **Nutrition**: USDA FoodData Central / Edamam
- **Maps**: Mapbox

## Database Schema

### Core Entities

**User**
- id, email, password, name, timestamps

**Profile**
- userId, age, weight, height, fitnessGoal, dailyCalorieGoal, wakeTime, sleepTime

**Meal**
- userId, timestamp, mealType, description, calories, protein, carbs, fat, imageUrl

**Activity**
- userId, startTime, endTime, distance, duration, avgSpeed, targetTime, route (GeoJSON)

**Task**
- userId, title, description, priority, deadline, completed

**JournalLog**
- userId, date, rawInput, structuredData (JSON), aiRating, aiFeedback

**Goal**
- userId, type (main/weekly/daily), title, description, targetDate, parentId, aiGenerated

**WorkoutLog**
- userId, date, workoutPlan (JSON), completedData (JSON)

**AppUsage**
- userId, date, packageName, appName, usageTime, limit

## Module Architecture

### Mobile App Modules

**Auth Module**
- Login/Register screens
- JWT token management
- Secure storage (react-native-keychain)

**Coach Module**
- Workout generator UI
- Diet logging (text/voice/image)
- Food camera
- Wake alarm with verification

**Tracker Module**
- GPS tracking
- Map view
- Speed/distance display
- Pacing coach

**Productivity Module**
- Task CRUD
- Unlock overlay (Android)
- Countdown focus blocks
- App blocker (Accessibility Service)

**Journal Module**
- Daily summary input
- Structured table display
- AI rating & feedback
- Goal tree editor

**Well-being Module**
- App usage stats
- Limit settings
- Grace period UI

### Backend API Modules

**Auth Module**
- Register/Login endpoints
- JWT strategy
- Password hashing (bcrypt)

**Health Module**
- Workout generation
- Meal logging
- Nutrition lookup
- Food image analysis

**Tracking Module**
- Activity session management
- GPS data storage
- Pacing calculations

**Productivity Module**
- Task CRUD
- Countdown sessions
- Enforcement logs

**Journal Module**
- Daily summary structuring
- AI rating & feedback
- Goal generation
- Weekly reviews

**Limiter Module**
- Usage tracking
- Limit enforcement
- Grace period logic

**AI Module**
- OpenAI integration
- Prompt engineering
- Vision API wrapper
- Context management

## Data Flow Examples

### Meal Logging with AI
1. User inputs meal (text/voice/image) → Mobile
2. Mobile sends to `/health/meal/log` → Backend
3. If image: Backend calls Vision API → Extract food items
4. Backend queries Nutrition DB → Get macros
5. Backend returns AI suggestion → Mobile
6. User confirms/corrects → Mobile
7. Final meal saved to DB
8. Mobile updates local cache

### GPS Tracking with Pacing
1. User starts activity with target time → Mobile
2. Mobile tracks GPS continuously
3. Every 5 seconds: Calculate current speed vs required speed
4. If behind: Show "Speed up by X km/h" prompt
5. On stop: Send full route + stats to `/tracking/activity/end`
6. Backend saves activity + route (GeoJSON)

### Daily Summary & Rating
1. User submits 9 PM summary (text/voice) → Mobile
2. Mobile sends to `/journal/daily-summary` → Backend
3. Backend calls AI service with prompt
4. AI structures input into hourly table (JSON)
5. AI rates day out of 10 with feedback
6. Backend saves to JournalLog
7. Backend returns structured data + rating → Mobile
8. Mobile displays in UI

## Security

- **HTTPS/TLS** for all API calls
- **JWT** tokens with expiration
- **Bcrypt** for password hashing
- **Rate limiting** on API endpoints
- **Input validation** (class-validator)
- **CORS** configured for mobile app
- **Helmet.js** for security headers

## Permissions (Mobile)

### Android (Required)
- `CAMERA` - Food photos, wake verification
- `ACCESS_FINE_LOCATION` - GPS tracking
- `ACCESS_BACKGROUND_LOCATION` - Background tracking
- `PACKAGE_USAGE_STATS` - App limiter
- `BIND_ACCESSIBILITY_SERVICE` - App blocking
- `SYSTEM_ALERT_WINDOW` - Unlock overlay
- `FOREGROUND_SERVICE` - Persistent alarms

### iOS (Limited)
- `Camera` - Food photos
- `Location (Always)` - GPS tracking
- `Notifications` - Reminders
- *Note: No app blocking or overlay support*

## Deployment

### Backend
- **Hosting**: Railway / Fly.io / Render
- **Database**: Managed PostgreSQL
- **Redis**: Upstash / Railway Redis
- **Environment**: Docker container

### Mobile
- **Android**: Google Play Console
- **iOS**: TestFlight → App Store
- **CI/CD**: GitHub Actions

## Monitoring & Analytics

- **Error Tracking**: Sentry
- **Analytics**: PostHog / Mixpanel
- **Logging**: Winston (backend)
- **Performance**: Native profiling tools

## Scalability Considerations

- **Caching**: Redis for frequently accessed data
- **Background Jobs**: BullMQ for async tasks
- **Database Indexing**: On userId, date fields
- **API Rate Limiting**: Per-user throttling
- **CDN**: For static assets (future)
