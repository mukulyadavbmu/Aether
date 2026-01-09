# Aether Setup Instructions

## Required Software

### 1. PostgreSQL 17
Download and install from: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
- Version: 17.x
- Default password: `postgres`
- Default port: `5432`

After installation:
```powershell
# Create database
psql -U postgres
CREATE DATABASE aether;
\q
```

### 2. Redis (Optional - Free Alternatives)

**Option 1: Docker (Recommended - 100% Free)**
```powershell
docker run -d -p 6379:6379 --name aether-redis redis:latest
```

**Option 2: Skip Redis for now**
Redis is already configured to use in-memory caching as fallback. Just keep `REDIS_ENABLED="false"` in .env

**Option 3: WSL2 + Redis**
```powershell
wsl --install
wsl
sudo apt update
sudo apt install redis-server
redis-server
```

Note: Memurai Developer is only free for 10 days, so we're using alternatives.

## Backend Setup

1. Navigate to backend folder:
```powershell
cd backend
```

2. Install dependencies:
```powershell
npm install
```

3. Update .env file with your PostgreSQL credentials:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/aether?schema=public"
```

4. Run Prisma migrations:
```powershell
npx prisma migrate dev --name init
```

5. Start backend:
```powershell
npm run start:dev
```

Backend runs on: http://localhost:3000

## Mobile App Setup

1. Navigate to mobile folder:
```powershell
cd mobile
```

2. Install dependencies:
```powershell
npm install
```

3. Start Expo:
```powershell
npx expo start
```

4. Scan QR code with Expo Go app on Android phone

## Testing

Register a new account:
- Email: test@aether.com
- Password: Test123!
- Name: Test User

The app will automatically log you in after registration.
