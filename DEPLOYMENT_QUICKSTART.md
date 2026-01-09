# 🚀 Quick Deployment Guide (15 Minutes)

## Prerequisites Setup (5 min)

### 1. Create Neon PostgreSQL Database
```bash
# Go to https://neon.tech/ and sign up
# Create new project: "aether-prod"
# Copy your connection string (looks like):
# postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 2. Install Google Cloud CLI
```powershell
# Download from: https://cloud.google.com/sdk/docs/install-windows
# After installation, run:
gcloud init
gcloud auth login

# Set your project (create one if needed)
gcloud projects create aether-prod-2025 --name="Aether Production"
gcloud config set project aether-prod-2025

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## Deploy Backend (5 min)

### 1. Update Production Environment
```powershell
cd backend

# Copy example file
Copy-Item .env.production.example .env.production

# Edit .env.production with your values:
# - DATABASE_URL: Your Neon connection string
# - JWT_SECRET: Generate with: openssl rand -base64 32
# - GEMINI_API_KEY: Your existing key
```

### 2. Deploy to Cloud Run
```powershell
cd backend

# Deploy (will build and deploy in one command)
gcloud run deploy aether-backend `
  --source . `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars NODE_ENV=production `
  --set-env-vars "DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require" `
  --set-env-vars "GEMINI_API_KEY=AIzaSyAfbMx7_5rjcePOUCpptoeVajeqFPvoXic" `
  --set-env-vars "JWT_SECRET=your-generated-secret-here" `
  --set-env-vars "AI_PROVIDER=gemini" `
  --set-env-vars "GEMINI_MODEL=gemini-2.0-flash-exp" `
  --max-instances 10 `
  --min-instances 0 `
  --memory 512Mi `
  --cpu 1 `
  --port 8080 `
  --timeout 300

# Save the URL from output (e.g., https://aether-backend-xxx-uc.a.run.app)
```

### 3. Initialize Database
```powershell
# Set DATABASE_URL temporarily
$env:DATABASE_URL="your-neon-connection-string"

# Push schema to Neon
npx prisma db push

# Done! Database is ready
```

## Update Mobile App (3 min)

### 1. Update API URL
```powershell
cd mobile

# Edit src/config/api.ts
# Replace API_URL with your Cloud Run URL
```

Or create new config file:
```typescript
// mobile/src/config/api.ts
export const API_URL = 'https://aether-backend-xxx-uc.a.run.app';
```

### 2. Test Locally First
```powershell
cd mobile
npx expo start

# Scan QR code and test login/features
```

### 3. Publish to Expo (Optional)
```powershell
# Install EAS CLI
npm install -g eas-cli

# Login
npx expo login

# Configure
npx eas build:configure

# Update eas.json with your Cloud Run URL
# (Already created - just update the URL)

# Publish OTA update
npx eas update --branch production --message "Production release"

# Build standalone APK (optional)
npx eas build --platform android --profile production
```

## Verify Deployment (2 min)

### 1. Test Backend
```powershell
# Test health endpoint
curl https://aether-backend-xxx-uc.a.run.app/health

# Should return: {"status":"ok"}
```

### 2. Test Mobile
```
1. Open Expo Go app
2. Scan QR code from 'npx expo start'
3. Try to login
4. Should connect to Cloud Run backend
```

## You're Done! 🎉

**Your app is now live 24/7 without your laptop!**

### What's Running:
- ✅ Backend: https://aether-backend-xxx-uc.a.run.app (always on)
- ✅ Database: Neon PostgreSQL (cloud-hosted)
- ✅ Mobile: Expo Go (development) or APK (production)

### Future Updates:

**Backend changes:**
```powershell
cd backend
git add .
git commit -m "Update feature"
gcloud run deploy aether-backend --source . --region us-central1
```

**Mobile changes:**
```powershell
cd mobile
git add .
git commit -m "Update UI"
npx eas update --branch production --message "Bug fixes"
```

**No laptop needed!** Update from any computer with Git + gcloud CLI.

## Costs

- Google Cloud Run: **FREE** (2M requests/month)
- Neon PostgreSQL: **FREE** (500 MB, 100 hours compute)
- Expo Publishing: **FREE** (unlimited OTA updates)
- Total: **$0/month** 🚀

## Support

- Cloud Run logs: `gcloud run logs read aether-backend --region us-central1`
- Neon dashboard: https://console.neon.tech
- Expo dashboard: https://expo.dev

---

**Next Steps:**
1. Share your app URL with friends
2. Build Android APK for distribution
3. Add custom domain (optional)
4. Set up monitoring/alerts
