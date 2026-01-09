# Aether Backend API

NestJS backend for Aether AI Life Coach.

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   - `DATABASE_URL`: PostgreSQL connection string
   - `REDIS_HOST` and `REDIS_PORT`: Redis connection
   - `JWT_SECRET`: Secret key for JWT tokens
   - `AI_PROVIDER`: Set to "gemini" (recommended) or "openai"
   - `GEMINI_API_KEY`: Google Gemini API key ([Get it here](https://aistudio.google.com/))
   - `OPENAI_API_KEY`: OpenAI API key (optional fallback)

3. **Setup database:**
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

4. **Start development server:**
   ```bash
   npm run start:dev
   ```

   API will be available at `http://localhost:3000`
   Swagger docs at `http://localhost:3000/api/docs`

## Database Management

**Run migrations:**
```bash
npm run prisma:migrate
```

**Open Prisma Studio (DB GUI):**
```bash
npm run prisma:studio
```

**Reset database:**
```bash
npx prisma migrate reset
```

## Project Structure

```
backend/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── auth/         # Authentication & JWT
│   │   ├── health/       # Workout & diet
│   │   ├── tracking/     # GPS activities
│   │   ├── productivity/ # Tasks & focus blocks
│   │   ├── journal/      # Daily logs & goals
│   │   ├── limiter/      # App usage limits
│   │   └── ai/           # AI services (OpenAI)
│   ├── shared/           # Shared services
│   │   └── prisma/       # Database service
│   ├── app.module.ts     # Root module
│   └── main.ts           # Entry point
├── prisma/
│   └── schema.prisma     # Database schema
└── package.json
```

## API Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Health
- `GET /health/workout/generate` - Generate workout
- `POST /health/meal/log` - Log meal
- `POST /health/meal/analyze-image` - Analyze food image

### Tracking
- `POST /tracking/activity/start` - Start activity
- `POST /tracking/activity/end` - End activity
- `GET /tracking/activities` - Get history

### Productivity
- `GET /productivity/tasks` - Get tasks
- `POST /productivity/tasks` - Create task
- `PATCH /productivity/tasks/:id` - Update task
- `DELETE /productivity/tasks/:id` - Delete task

### Journal
- `POST /journal/daily-summary` - Submit summary
- `GET /journal/rating/today` - Get rating
- `GET /journal/goals` - Get goals
- `POST /journal/goals/generate` - Generate goals

### Limiter
- `GET /limiter/usage` - Get usage stats
- `POST /limiter/limits` - Set limits

## Testing

```bash
npm test
npm run test:watch
npm run test:cov
```

## Deployment

1. Build:
   ```bash
   npm run build
   ```

2. Start production:
   ```bash
   npm run start:prod
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection | Yes |
| REDIS_HOST | Redis host | Yes |
| REDIS_PORT | Redis port | Yes |
| JWT_SECRET | JWT signing key | Yes |
| AI_PROVIDER | AI provider: "gemini" or "openai" | Yes |
| GEMINI_API_KEY | Google Gemini API key | Yes (if using Gemini) |
| OPENAI_API_KEY | OpenAI API key | Yes (if using OpenAI) |
| PORT | Server port | No (default: 3000) |
