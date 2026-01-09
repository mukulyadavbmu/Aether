# AI Integration Strategy for Aether

This document outlines the dual-strategy AI implementation for the Aether app: **Cloud-based AI** for the backend and **On-Device AI** for the mobile app.

---

## 🎯 Overview

Aether uses AI for three primary tasks:
1. **Structured Goal Generation** - Breaking down main goals into weekly/daily tasks
2. **Data Interpretation & Rating** - Analyzing daily summaries and rating performance
3. **Proactive Coaching** - Personalized reminders and motivational feedback

---

## 🌐 Strategy 1: Cloud-Based AI (Backend)

### Recommended Provider: Google Gemini API

**Model**: `gemini-2.0-flash-exp` (Gemini 2.0 Flash)

**Why Gemini?**
- ✅ **Speed**: Optimized for fast inference (critical for real-time feedback)
- ✅ **Cost**: More affordable than GPT-4 with similar quality
- ✅ **Multimodal**: Native support for text, images, and audio out of the box
- ✅ **Structured Output**: Excellent at returning JSON responses
- ✅ **Context Window**: Large context for complex prompts with user history

**Alternative**: OpenAI GPT-4o-mini (fallback option)

### Getting Your API Key

#### Option 1: Google AI Studio (Recommended for MVP)
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **"Get API Key"**
4. Create a new API key
5. Copy the key (starts with `AIza...`)

**Free Tier**: 1,500 requests/day, 1 million tokens/month

#### Option 2: Google Cloud Console (Production)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Generative Language API"
4. Create credentials → API Key
5. Set usage limits and billing

### Configuration

Add to `backend/.env`:
```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIza_your_actual_key_here"
GEMINI_MODEL="gemini-2.0-flash-exp"
```

### Implementation (Already Done ✅)

The `AiService` in `backend/src/modules/ai/ai.service.ts` now supports:
- ✅ Gemini as primary provider
- ✅ OpenAI as fallback
- ✅ Structured JSON responses
- ✅ System instructions for consistent coaching persona
- ✅ Context injection for personalized responses

---

## 📱 Strategy 2: On-Device AI (Mobile - Free & Private)

### Recommended Model: Gemma 2B or Gemma 3 1B

**Why On-Device AI?**
- ✅ **Zero Cost**: No API bills, no monthly charges
- ✅ **Privacy**: User data never leaves the device
- ✅ **Instant**: No network latency
- ✅ **Offline**: Works without internet (critical for alarms, GPS tracker)

### What is Gemma?

Gemma is Google's open-weight model family designed for on-device deployment:
- **Gemma 2B**: 2 billion parameters (recommended for Android)
- **Gemma 3 1B**: 1 billion parameters (optimized for mobile, even faster)

### Implementation Roadmap

#### Phase 1: MVP (Cloud Only - Week 2-3)
Use cloud-based Gemini API for all AI features. Get the app working end-to-end.

#### Phase 2: Hybrid Approach (Week 8+)
Migrate specific features to on-device:
- ✅ **Wake-Up Alarm**: Generate motivational messages offline
- ✅ **Task Reminders**: Quick, low-latency prompts
- ✅ **Daily Summary Parsing**: Initial structuring on-device
- ❌ **Goal Generation**: Keep on cloud (requires more intelligence)
- ❌ **Weekly Reviews**: Keep on cloud (complex reasoning)

#### Phase 3: Full On-Device (Post-MVP)
Advanced users can opt for 100% on-device AI with larger Gemma models.

---

## 🛠️ How to Implement On-Device AI (Phase 2)

### Step 1: Choose Integration Framework

| Framework | Platform | Complexity | Recommendation |
|-----------|----------|------------|----------------|
| **MediaPipe LLM Inference API** | Android & iOS | Medium | ✅ **Recommended** - Official Google SDK |
| **TensorFlow Lite** | Android & iOS | High | Alternative for custom models |
| **ONNX Runtime** | Android & iOS | Medium | Cross-platform option |

**Recommended**: MediaPipe LLM Inference API
- Official support from Google
- Optimized for Gemma models
- Handles CPU/GPU/NPU automatically
- Simple React Native bridging

### Step 2: Download the Model

**Source**: [Kaggle Models - Gemma](https://www.kaggle.com/models/google/gemma) or [Hugging Face](https://huggingface.co/google/gemma-2b)

**What to Download**:
- Model file: `gemma-2b-it-quantized.task` (INT8 quantized, ~1.5 GB)
- Alternative: `gemma-1b-it-quantized.task` (~800 MB)

**Where to Store**:
- Option 1: Bundle with app (increases app size)
- Option 2: Download on first launch over Wi-Fi (recommended)

### Step 3: Integrate MediaPipe (React Native)

#### Install Dependencies
```bash
cd mobile
npm install @mediapipe/tasks-genai
# Or for native modules:
npm install react-native-mediapipe
```

#### Create Native Bridge (Android)

`mobile/android/app/src/main/java/com/aether/GemmaModule.kt`:
```kotlin
package com.aether

import com.facebook.react.bridge.*
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import java.io.File

class GemmaModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    private var llmInference: LlmInference? = null

    override fun getName() = "GemmaModule"

    @ReactMethod
    fun initialize(modelPath: String, promise: Promise) {
        try {
            val options = LlmInference.LlmInferenceOptions.builder()
                .setModelPath(modelPath)
                .setMaxTokens(512)
                .setTemperature(0.7f)
                .build()
            
            llmInference = LlmInference.createFromOptions(
                reactApplicationContext, options
            )
            promise.resolve("Gemma initialized")
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", e.message)
        }
    }

    @ReactMethod
    fun generateText(prompt: String, promise: Promise) {
        try {
            val response = llmInference?.generateResponse(prompt)
            promise.resolve(response)
        } catch (e: Exception) {
            promise.reject("GENERATE_ERROR", e.message)
        }
    }
}
```

#### Usage in React Native

`mobile/src/shared/services/OnDeviceAI.ts`:
```typescript
import { NativeModules } from 'react-native';

const { GemmaModule } = NativeModules;

class OnDeviceAI {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    const modelPath = '/data/local/tmp/gemma-2b.task';
    await GemmaModule.initialize(modelPath);
    this.initialized = true;
  }

  async generateWakeUpMessage(userName: string): Promise<string> {
    const prompt = `SYSTEM: You are a motivational alarm coach.
USER: Generate one energetic wake-up message for ${userName}. Max 20 words.
ASSISTANT:`;
    
    return await GemmaModule.generateText(prompt);
  }

  async parseQuickSummary(text: string): Promise<any> {
    const prompt = `SYSTEM: Extract tasks from text. Return JSON only.
USER: "${text}"
ASSISTANT: {"tasks": [`;
    
    const response = await GemmaModule.generateText(prompt);
    return JSON.parse(response);
  }
}

export default new OnDeviceAI();
```

### Step 4: Hybrid Decision Logic

`mobile/src/shared/services/AIManager.ts`:
```typescript
import OnDeviceAI from './OnDeviceAI';
import { API } from './api';

class AIManager {
  async generateGoals(mainGoal: string, deadline: string) {
    // Complex task - always use cloud
    return await API.post('/journal/goals/generate', { mainGoal, deadline });
  }

  async generateWakeUpMessage(userName: string) {
    // Simple, offline - use on-device
    try {
      return await OnDeviceAI.generateWakeUpMessage(userName);
    } catch {
      // Fallback to cloud if on-device fails
      return await API.get('/ai/wake-message');
    }
  }

  async rateDailyPerformance(data: any) {
    // Medium complexity - prefer cloud for quality
    if (navigator.onLine) {
      return await API.post('/journal/rating', data);
    } else {
      // Offline fallback
      return await OnDeviceAI.parseQuickSummary(data.summary);
    }
  }
}

export default new AIManager();
```

---

## 📊 Cost Comparison

### Cloud-Based (Gemini API)

| Usage Tier | Requests/Month | Cost |
|------------|----------------|------|
| Free | 1,500 req/day | $0 |
| Paid (after free tier) | Unlimited | ~$0.50 per 1M tokens |

**Estimated MVP Cost**: $0-5/month (1,000 active users)

### On-Device (Gemma)

| Item | Cost |
|------|------|
| Model download | $0 (free & open-weight) |
| Inference | $0 (runs locally) |
| Total | **$0** |

**Trade-off**: Higher initial development complexity, larger app size.

---

## 🎯 Core AI Functions Implementation

### 1. Structured Goal Generation

**Prompt Template** (in `ai.service.ts`):
```typescript
You are the 'Aether' AI Goal Coach. 
Break down the user's main objective into actionable steps.

Main Goal: "Launch MVP in 6 months"
Deadline: 2026-06-12

Your Task:
1. Create 4-6 Weekly Goals (milestones)
2. Break down Week 1 into 7 Daily Tasks
3. Make tasks SMART

Return ONLY valid JSON: {...}
```

**Key Technique**: 
- **Structured Output**: Force JSON responses for easy parsing
- **SMART Framework**: Ensures tasks are actionable

### 2. Daily Rating & Feedback

**Prompt Template**:
```typescript
You are the 'Aether' AI Performance Reviewer.

Today's Activities: [...]
Planned Tasks: [...]

Rate performance 1-10 and provide:
- Achievements (2-3 items)
- Improvements (1-2 items)
- If rating < 5, ask about biggest obstacle

Return JSON: {"rating": 7, "feedback": "...", ...}
```

**Key Technique**:
- **System Instructions**: Pre-define the AI's role and rules
- **Context Injection**: Include user's tasks and goals
- **Conditional Logic**: Different prompts based on rating

### 3. Proactive Coaching

**Prompt Template**:
```typescript
You are the 'Aether' AI Proactive Coach.

Missed Task: "Complete feature X"
User's Reason: "Lack of focus"
Days Missed: 2

Generate ONE sentence (max 140 chars) that is:
- Direct and motivational
- Includes specific action

Return ONLY the text, no JSON.
```

**Key Technique**:
- **Brevity Constraint**: Forces concise, actionable messages
- **Persona Consistency**: Maintains coaching tone

---

## 🔒 Security & Privacy

### API Key Security

❌ **NEVER** do this:
```typescript
// DON'T hardcode in mobile app!
const GEMINI_KEY = 'AIza...';
```

✅ **DO** this:
- Store keys in backend `.env` only
- Mobile app calls backend API
- Backend calls Gemini/OpenAI
- Use environment variables

### On-Device Privacy

✅ **Advantages**:
- User data never sent to servers
- No API keys needed in app
- Compliant with GDPR/privacy laws

⚠️ **Considerations**:
- Model file is public (not secret)
- Prompts could be extracted via reverse engineering
- Use obfuscation for sensitive prompts

---

## 📈 Performance Optimization

### Cloud-Based Tips
1. **Cache Responses**: Store recent AI responses in Redis
2. **Batch Requests**: Combine multiple prompts when possible
3. **Streaming**: Use streaming API for long responses (better UX)

### On-Device Tips
1. **Quantization**: Use INT8 quantized models (3-4x faster)
2. **Warm-up**: Initialize model on app start (not on first use)
3. **GPU Acceleration**: Enable GPU/NPU via MediaPipe
4. **Prompt Length**: Keep prompts under 500 tokens

---

## 🧪 Testing Strategy

### Cloud AI Testing
```bash
cd backend
npm run test:e2e

# Test specific AI function
curl -X POST http://localhost:3000/journal/goals/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mainGoal": "Launch app", "deadline": "2026-06-01"}'
```

### On-Device AI Testing
```typescript
// mobile/src/__tests__/OnDeviceAI.test.ts
describe('OnDeviceAI', () => {
  it('should generate wake-up message', async () => {
    const message = await OnDeviceAI.generateWakeUpMessage('Test User');
    expect(message).toBeTruthy();
    expect(message.length).toBeLessThan(100);
  });
});
```

---

## 🚀 Implementation Timeline

| Phase | Timeline | Tasks |
|-------|----------|-------|
| **Phase 1** | Week 2-3 | Implement cloud-based AI (Gemini) for all features |
| **Phase 2** | Week 5-6 | Test and refine prompts based on user feedback |
| **Phase 3** | Week 8+ | Integrate on-device AI for offline features |
| **Phase 4** | Post-MVP | Optimize hybrid strategy, A/B test quality |

---

## 📚 Resources

### Documentation
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [MediaPipe LLM Inference](https://developers.google.com/mediapipe/solutions/genai/llm_inference)
- [Gemma Models on Kaggle](https://www.kaggle.com/models/google/gemma)

### Tutorials
- [Gemini API Quickstart](https://ai.google.dev/tutorials/get_started_web)
- [On-Device AI with MediaPipe](https://developers.google.com/mediapipe/solutions/genai/llm_inference/android)

### Community
- [r/LocalLLaMA](https://reddit.com/r/LocalLLaMA) - On-device AI discussions
- [Gemini API Discord](https://discord.gg/google-ai)

---

## ✅ Action Items

### Immediate (Week 2)
- [ ] Get Gemini API key from Google AI Studio
- [ ] Add `GEMINI_API_KEY` to `backend/.env`
- [ ] Run `npm install` in backend to install `@google/generative-ai`
- [ ] Test AI service: `npm run start:dev` and check logs

### Phase 2 (Week 5-6)
- [ ] Download Gemma 2B quantized model
- [ ] Set up MediaPipe in mobile app
- [ ] Create native bridge for Android
- [ ] Test wake-up alarm with on-device AI

### Production (Week 8+)
- [ ] Set up Google Cloud project with billing
- [ ] Implement usage monitoring
- [ ] Add fallback logic for API failures
- [ ] Optimize prompts based on token usage

---

**Status**: ✅ Cloud-based AI implementation ready | 🚧 On-device AI planned for Phase 2

**Recommendation**: Start with Gemini API (cloud) for MVP, add on-device AI in Phase 2 for cost optimization and privacy.
