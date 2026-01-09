# Getting Started with Aether

This guide will help you set up the Aether project for development.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **Redis** 7+ ([Download](https://redis.io/download))

### For Mobile Development
- **Android Studio** (for Android development) ([Download](https://developer.android.com/studio))
- **Xcode** (for iOS development, macOS only) ([Download](https://developer.apple.com/xcode/))
- **React Native CLI**: `npm install -g react-native-cli`

### API Keys (Required Later)
- **Google Gemini API key** (Recommended) - [Get one](https://aistudio.google.com/) - FREE tier: 1,500 req/day
- OpenAI API key (Alternative) - [Get one](https://platform.openai.com/api-keys)
- Mapbox access token - [Get one](https://account.mapbox.com/)
- Nutrition API key (optional: USDA/Edamam)

**AI Strategy**: We use Google Gemini API (primary) for cost-effective, fast, multimodal AI. See [AI Integration Guide](./AI_INTEGRATION.md) for details.

## Project Structure

```
Aether/
├── mobile/          # React Native app
├── backend/         # NestJS API
├── docs/            # Documentation
└── README.md
```

## Setup Instructions

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your settings:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/aether?schema=public"
REDIS_HOST="localhost"
REDIS_PORT=6379
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
OPENAI_API_KEY="sk-your-openai-api-key"
PORT=3000
```

**Setup PostgreSQL database:**

1. Create a database:
   ```bash
   createdb aether
   ```
   Or use pgAdmin / psql to create manually.

2. Run migrations:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

**Start Redis:**
```bash
redis-server
```

**Start the backend:**
```bash
npm run start:dev
```

✅ Backend should now be running at `http://localhost:3000`
📚 API docs available at `http://localhost:3000/api/docs`

### 2. Mobile Setup

Navigate to the mobile directory:
```bash
cd mobile
```

Install dependencies:
```bash
npm install
```

Create `.env` file:
```env
API_URL=http://localhost:3000
MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

#### For Android Development

1. Open Android Studio
2. Open the `mobile/android` folder
3. Let Gradle sync (first time takes a while)
4. Start an Android emulator or connect a physical device
5. Run:
   ```bash
   npm run android
   ```

#### For iOS Development (macOS only)

1. Install pods:
   ```bash
   cd ios
   pod install
   cd ..
   ```

2. Open Xcode:
   ```bash
   open ios/Aether.xcworkspace
   ```

3. Select a simulator and run:
   ```bash
   npm run ios
   ```

## Verify Installation

### Backend Health Check
Open `http://localhost:3000/api/docs` in your browser. You should see the Swagger API documentation.

### Mobile App
You should see the login screen on your emulator/device.

## Common Issues

### PostgreSQL Connection Error
- Ensure PostgreSQL is running: `pg_ctl status`
- Check DATABASE_URL in `.env`
- Test connection: `psql -U user -d aether`

### Redis Connection Error
- Ensure Redis is running: `redis-cli ping` (should return "PONG")
- Check REDIS_HOST and REDIS_PORT in `.env`

### Metro Bundler Issues (Mobile)
```bash
npm start -- --reset-cache
```

### Android Build Errors
```bash
cd mobile/android
./gradlew clean
cd ../..
```

### iOS Pod Issues
```bash
cd mobile/ios
pod deintegrate
pod install
cd ../..
```

## Development Workflow

1. **Start Backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Start Mobile:**
   ```bash
   cd mobile
   npm start        # Start Metro bundler
   npm run android  # In another terminal (Android)
   npm run ios      # In another terminal (iOS)
   ```

3. **Database Management:**
   ```bash
   cd backend
   npm run prisma:studio  # Visual DB editor
   ```

## Next Steps

- Review the [Architecture](./ARCHITECTURE.md) document
- Check the [Roadmap](./ROADMAP.md) for current progress
- Start contributing to Phase 2 features
- Join the development discussion

## Useful Commands

### Backend
```bash
npm run start:dev      # Start development server
npm run build          # Build for production
npm run prisma:migrate # Run database migrations
npm run prisma:studio  # Open Prisma Studio
npm test               # Run tests
```

### Mobile
```bash
npm run android        # Run on Android
npm run ios            # Run on iOS
npm start              # Start Metro bundler
npm test               # Run tests
npm run lint           # Lint code
```

## Getting Help

If you encounter issues:
1. Check this guide again
2. Review the error messages carefully
3. Search existing GitHub issues
4. Create a new issue with details

---

Happy coding! 🚀
