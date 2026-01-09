# Development Roadmap

## Phase 1: Foundation (Weeks 1-2) ✅ COMPLETED

### Backend
- [x] Project scaffolding
- [x] Database schema (Prisma)
- [x] Auth module (register, login, JWT)
- [x] Module structure (health, tracking, productivity, journal, limiter, ai)
- [x] Swagger API docs setup

### Mobile
- [x] React Native project setup
- [x] Navigation structure
- [x] Auth screens (Login, Register)
- [x] Module scaffolding (coach, tracker, tasks, journal, dashboard)
- [x] State management (Zustand)

## Phase 2: Health Coach Core (Weeks 2-3) 🚧 IN PROGRESS

### Backend
- [ ] Nutrition database integration (USDA/Edamam)
- [ ] Meal logging API
- [ ] Food image analysis with Vision API
- [ ] AI food recognition pipeline
- [ ] Workout generator (template-based)
- [ ] Meal alarm scheduling logic

### Mobile
- [ ] Diet logging UI (text input)
- [ ] Voice input for meals
- [ ] Food camera integration
- [ ] AI suggestion & confirmation flow
- [ ] Calorie display & macros
- [ ] Aggressive wake-up alarm
- [ ] Camera verification for alarm
- [ ] Workout display screen

## Phase 3: GPS Tracker & Pacing (Weeks 3-4)

### Backend
- [ ] Activity session management
- [ ] GPS data ingestion & storage
- [ ] Route storage (GeoJSON)
- [ ] Pacing calculation logic
- [ ] Activity history API

### Mobile
- [ ] Map integration (Mapbox)
- [ ] Live GPS tracking
- [ ] Speed, distance, duration display
- [ ] Target time setting
- [ ] Real-time pacing prompts
- [ ] Route visualization
- [ ] Activity history view

## Phase 4: Productivity & Enforcement (Weeks 4-5)

### Backend
- [ ] Task CRUD APIs
- [ ] Countdown session management
- [ ] Enforcement logs
- [ ] Reminder scheduling

### Mobile
- [ ] Task list UI with CRUD
- [ ] Task priority & deadlines
- [ ] Android unlock overlay
- [ ] Countdown timer with app blocking
- [ ] Accessibility service for app blocking
- [ ] Persistent notifications
- [ ] iOS alternative (notifications only)

## Phase 5: Journaling & Goals (Weeks 5-6)

### Backend
- [ ] AI daily summary structuring (GPT-4)
- [ ] Hourly table extraction
- [ ] Rating algorithm (out of 10)
- [ ] AI feedback generation
- [ ] Goal tree generation
- [ ] Weekly review generation
- [ ] Proactive reminder logic

### Mobile
- [ ] Daily summary input (text & voice)
- [ ] Structured table display
- [ ] AI rating display
- [ ] Feedback UI
- [ ] Goal tree editor
- [ ] Weekly review screen
- [ ] 9 PM reminder

## Phase 6: App Limiter (Weeks 6-7)

### Backend
- [ ] Usage tracking API
- [ ] Limit policy management
- [ ] Grace period logic

### Mobile (Android)
- [ ] Usage Stats integration
- [ ] App limit settings UI
- [ ] App blocking mechanism
- [ ] 2-minute grace period
- [ ] Usage stats dashboard
- [ ] Override workflow

## Phase 7: Polish & Testing (Weeks 7-8)

### Backend
- [ ] Error handling & validation
- [ ] Performance optimization
- [ ] Rate limiting
- [ ] Logging & monitoring
- [ ] Security hardening
- [ ] API testing

### Mobile
- [ ] Onboarding flow
- [ ] Permission requests (camera, location, usage, accessibility)
- [ ] Settings & preferences
- [ ] Notification customization
- [ ] Performance optimization
- [ ] Offline handling
- [ ] E2E testing
- [ ] Beta deployment (TestFlight/Play Console)

## Post-MVP Features (Phase 8+)

- [ ] iOS full parity (workarounds improvement)
- [ ] Social features (challenges, leaderboards)
- [ ] Advanced workout progression AI
- [ ] Wearable integration (Apple Watch, Fitbit)
- [ ] Offline-first sync
- [ ] Multi-language support
- [ ] Voice AI coach (conversational)
- [ ] Sleep tracking
- [ ] Habit streaks & gamification
- [ ] Data export & backup
- [ ] Premium features & monetization

## Technical Debt

- [ ] Add comprehensive unit tests
- [ ] Add integration tests
- [ ] Improve error handling
- [ ] Add request/response logging
- [ ] Set up CI/CD pipeline
- [ ] Add performance monitoring
- [ ] Optimize bundle size (mobile)
- [ ] Add analytics tracking

## Notes

- Android is the primary platform for MVP
- iOS features limited to non-intrusive alternatives
- AI features require OpenAI API key
- Food image analysis requires Vision API setup
