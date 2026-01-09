# Aether Web Dashboard

## 🎯 Purpose
Web companion app for Aether mobile - desktop interface for analytics, settings, and monitoring.

## 🎨 Design System (Matching Frontend)
- **Theme**: Dark cyberpunk (#121212 base)
- **Primary**: Cyan #00F2FF
- **Success**: Neon Green #00FF41
- **Warning**: Orange #FF5F1F
- **Fonts**: Orbitron (headers), Mono (technical)
- **Components**: shadcn/ui + Radix UI

## 📦 Tech Stack
- React 18 + TypeScript
- Vite (dev server)
- TailwindCSS
- shadcn/ui components
- Recharts (analytics)
- Axios (API calls)

## 🚀 Features

### 1. Dashboard Overview
- Discipline score gauge (matching mobile)
- Weekly progress chart
- Active goals status
- App usage statistics
- GPS tracking summary

### 2. AI Architect View
- Journal entries timeline
- AI-generated insights
- Goal management
- Weekly reviews

### 3. Wellness Analytics
- Meal logs with nutrition charts
- Workout history
- Sleep tracking
- Body metrics trends

### 4. GPS & Performance
- Route maps (react-leaflet)
- Activity history
- Pacing analysis
- Distance/speed charts

### 5. Discipline Controls
- App limiter configuration
- Ghost Mode toggle
- Alarm settings
- Notification schedule

### 6. Settings & Sync
- User profile
- Meal times configuration
- Priority task management
- Data export

## 📁 File Structure
```
web/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   ├── ai-architect/
│   │   │   ├── wellness/
│   │   │   ├── gps/
│   │   │   ├── controls/
│   │   │   └── ui/ (shadcn)
│   │   └── lib/
│   ├── styles/
│   └── main.tsx
├── public/
├── package.json
└── vite.config.ts
```

## 🎮 Navigation
Bottom tabs (matching mobile):
- Home (Dashboard)
- AI Architect
- Wellness
- GPS
- Settings

## 🔗 Backend Integration
- Same NestJS backend (http://localhost:3000)
- JWT authentication
- Real-time sync with mobile app
- WebSocket for live updates

## 💾 Installation
```bash
cd web
npm install
npm run dev
```

## 🌐 Deployment
- Vercel/Netlify ready
- Environment variables for API_URL
- Production build optimization
