# Aether Backend - Firebase/Cloud Deployment Guide

## 🚀 Deployment Strategy

**Current Stack:**
- Backend: NestJS (TypeScript)
- Database: PostgreSQL
- AI: Google Gemini
- Mobile: React Native (Expo)

**Deployment Target:**
- Backend: **Google Cloud Run** (serverless, auto-scaling)
- Database: **Neon PostgreSQL** (free cloud hosting)
- File Storage: **Google Cloud Storage** (vector memory)
- Mobile: **Expo EAS** (over-the-air updates)

---

## 📋 Prerequisites

1. **Google Cloud Account** (includes Firebase)
   - Go to: https://console.cloud.google.com
   - Enable billing (free tier available)

2. **Install Google Cloud CLI**
   ```bash
   # Download from: https://cloud.google.com/sdk/docs/install
   gcloud init
   gcloud auth login
   ```

3. **Neon PostgreSQL Account**
   - Sign up: https://neon.tech (free tier: 3 projects, 500 MB)
   - Alternative: Supabase.com (free tier: 500 MB, 2 projects)

4. **Expo Account**
   - Sign up: https://expo.dev
   - Install EAS CLI: `npm install -g eas-cli`

---

## 🗄️ Part 1: Database Migration (PostgreSQL to Neon)

### Step 1: Create Neon Database

1. Go to https://neon.tech/
2. Create new project: "aether-prod"
3. Copy connection string (looks like):
   ```
   postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Update Backend Environment

**File: `backend/.env.production`** (create new file)
```env
# Database (Neon PostgreSQL)
DATABASE_URL="your-neon-connection-string-here"

# Redis (disable for now, add later if needed)
REDIS_ENABLED="false"

# JWT
JWT_SECRET="your-super-secret-jwt-key-production-change-this"
JWT_EXPIRES_IN="7d"

# AI Provider
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIzaSyAfbMx7_5rjcePOUCpptoeVajeqFPvoXic"
GEMINI_MODEL="gemini-2.0-flash-exp"

# App
NODE_ENV="production"
PORT=8080
```

### Step 3: Migrate Database Schema

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Push schema to Neon (creates tables)
npx prisma db push --schema=./prisma/schema.prisma

# Optional: Seed initial data
npx prisma db seed
```

---

## 🐳 Part 2: Deploy Backend to Google Cloud Run

### Step 1: Create Dockerfile

**File: `backend/Dockerfile`**
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 8080

# Start application
CMD ["node", "dist/main.js"]
```

### Step 2: Create .dockerignore

**File: `backend/.dockerignore`**
```
node_modules
dist
.env
.env.local
.git
.gitignore
README.md
npm-debug.log
```

### Step 3: Deploy to Cloud Run

```bash
cd backend

# Set your Google Cloud project ID
gcloud config set project YOUR_PROJECT_ID

# Build and deploy
gcloud run deploy aether-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-env-vars DATABASE_URL="your-neon-connection-string" \
  --set-env-vars GEMINI_API_KEY="your-gemini-key" \
  --set-env-vars JWT_SECRET="your-jwt-secret" \
  --max-instances 10 \
  --min-instances 0 \
  --memory 512Mi \
  --cpu 1
```

**Output will give you a URL like:**
```
https://aether-backend-xxx-uc.a.run.app
```

### Step 4: Test Deployment

```bash
# Test health endpoint
curl https://aether-backend-xxx-uc.a.run.app/health

# Should return: {"status":"ok","timestamp":"..."}
```

---

## 📦 Part 3: Update Mobile App

### Step 1: Update API URL

**File: `mobile/src/config/api.ts`**
```typescript
// Production API (Cloud Run URL)
export const API_URL = 'https://aether-backend-xxx-uc.a.run.app';

// For local development (comment out in production)
// export const API_URL = 'http://10.105.179.92:3000';
```

### Step 2: Publish to Expo

```bash
cd mobile

# Login to Expo
npx expo login

# Configure EAS
npx eas build:configure

# Publish update (over-the-air)
npx eas update --branch production --message "Initial production release"

# Build standalone app (Android APK)
npx eas build --platform android --profile production
```

### Step 3: Share App

**Option A: Expo Go (Development)**
- Share QR code from `npx expo start`
- Users scan with Expo Go app

**Option B: Standalone APK (Production)**
- Download APK from EAS build
- Share APK file with users
- Users install on Android (enable "Install from Unknown Sources")

**Option C: Google Play Store**
```bash
# Build production APK
npx eas build --platform android --profile production

# Submit to Play Store
npx eas submit --platform android
```

---

## ☁️ Part 4: Firebase Storage (Vector Memory)

### Step 1: Enable Firebase Storage

```bash
# Install Firebase SDK
cd backend
npm install firebase-admin

# Initialize Firebase
firebase init storage
```

### Step 2: Update Vector Memory Service

**File: `backend/src/shared/vector-memory/vector-memory.service.ts`**

Add Firebase Storage integration:
```typescript
import * as admin from 'firebase-admin';

// Initialize Firebase (add to constructor)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: 'your-project.appspot.com',
  });
}

// Replace file system storage with Firebase Storage
private async saveEntry(entry: MemoryEntry) {
  const bucket = admin.storage().bucket();
  const file = bucket.file(`vector-memory/${entry.userId}.json`);

  const existingMemories = await this.getUserMemories(entry.userId);
  existingMemories.push(entry);

  await file.save(JSON.stringify(existingMemories, null, 2), {
    contentType: 'application/json',
  });
}
```

---

## 💰 Cost Breakdown (Free Tier)

**Google Cloud Run:**
- ✅ 2M requests/month FREE
- ✅ 360,000 GB-seconds compute FREE
- ✅ 180,000 vCPU-seconds FREE

**Neon PostgreSQL:**
- ✅ 3 projects FREE
- ✅ 500 MB storage per project
- ✅ 100 hours compute/month

**Firebase Storage:**
- ✅ 5 GB storage FREE
- ✅ 1 GB download/day FREE

**Expo EAS:**
- ✅ Unlimited OTA updates
- 💵 $29/month for builds (or use free tier: 30 builds/month)

**Total:** ~$0-29/month depending on build needs

---

## 🔄 Continuous Deployment Workflow

### For Backend Updates:

```bash
cd backend

# Make your changes
git add .
git commit -m "Update feature X"

# Redeploy to Cloud Run
gcloud run deploy aether-backend \
  --source . \
  --platform managed \
  --region us-central1
```

### For Mobile Updates:

```bash
cd mobile

# Make your changes
git add .
git commit -m "Update feature Y"

# Publish OTA update (users get it automatically)
npx eas update --branch production --message "Bug fixes"
```

**No laptop needed after deployment!** Updates can be done from any computer with Git + gcloud CLI.

---

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Enable CORS only for your app domain
- [ ] Set up Cloud Run authentication if needed
- [ ] Use environment variables (never commit secrets)
- [ ] Enable Firestore security rules
- [ ] Set up Cloud Armor (DDoS protection)
- [ ] Monitor with Google Cloud Logging

---

## 🐛 Troubleshooting

**Issue: "Connection refused" on mobile**
- Check Cloud Run URL is correct in `mobile/src/config/api.ts`
- Verify Cloud Run service is running: `gcloud run services list`

**Issue: "Database connection error"**
- Verify DATABASE_URL in Cloud Run environment variables
- Check Neon database is active (not paused)

**Issue: "Build failed"**
- Check Docker logs: `gcloud builds log [BUILD_ID]`
- Verify all dependencies in package.json

**Issue: "App not updating"**
- Clear Expo cache: `npx expo start --clear`
- Republish: `npx eas update --branch production`

---

## 📊 Monitoring

**Cloud Run Dashboard:**
```bash
gcloud run services describe aether-backend --region us-central1
```

**Logs:**
```bash
gcloud run logs read aether-backend --region us-central1
```

**Database:**
- Neon dashboard: https://console.neon.tech
- View queries, connections, storage usage

---

## 🎯 Summary

1. **Database**: Migrate to Neon PostgreSQL (5 min)
2. **Backend**: Deploy to Cloud Run with Docker (10 min)
3. **Mobile**: Update API URL and publish to Expo (5 min)
4. **Storage**: Optional - move vector memory to Firebase Storage (10 min)

**Total Setup Time: ~30 minutes**

After deployment, your app runs 24/7 without your laptop. You only need your laptop to push code updates!
