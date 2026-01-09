# Aether - Feature Specifications

Detailed specifications for each major feature in the Aether app.

---

## 1. AI-Powered Health & Wellness Coach

### 1.1 Custom Workout Generator

**User Story**: As a user, I want personalized workout plans that adapt to my progress.

**Features**:
- Goal selection: hypertrophy, strength, endurance, weight loss
- Database of 200+ exercises with form videos
- Progressive overload logic (increases weight/reps based on past performance)
- Split routines: Push/Pull/Legs, Upper/Lower, Full Body
- Rest period recommendations

**Technical Requirements**:
- Exercise database seeded in PostgreSQL
- AI generates workout based on: goal, available equipment, experience level
- User logs completed sets/reps/weights
- Algorithm adjusts next workout based on completed data

**API Endpoints**:
- `GET /health/workout/generate` - Generate workout plan
- `POST /health/workout/log` - Log completed workout
- `GET /health/workout/history` - Get workout history

---

### 1.2 AI Diet & Calorie Tracker

**User Story**: As a user, I want to log meals easily with voice, text, or photos, and get accurate calorie counts.

**Features**:
- **Text Input**: "2 scrambled eggs with toast"
- **Voice Input**: Transcribe and parse
- **Image Input**: Take photo → AI recognizes food → estimates portions
- AI suggests food item and portion size
- User confirms or corrects
- Tracks: calories, protein, carbs, fat
- Meal reminders: initial alarm + 10-min follow-up asking "What did you eat?"

**Technical Requirements**:
- OpenAI Vision API or Google Cloud Vision for food recognition
- USDA FoodData Central or Edamam API for nutrition data
- User correction loop improves AI accuracy over time
- Daily/weekly calorie summaries

**API Endpoints**:
- `POST /health/meal/log` - Log meal (text/voice)
- `POST /health/meal/analyze-image` - Analyze food image
- `GET /health/meal/today` - Get today's meals
- `GET /health/meal/summary` - Get weekly summary

**Mobile UI**:
- Quick log button
- Camera integration
- Macro display (circular progress bars)
- Daily calorie target vs actual

---

### 1.3 Aggressive Wake-Up System

**User Story**: As a user, I need an alarm that forces me to physically get up, not just tap "snooze".

**Features**:
- Configurable alarm sound/volume (adjustable but not fully stoppable)
- Alarm only stops when:
  - **Option 1**: Camera verification - Take photo of predefined location (e.g., tree outside home)
  - **Option 2**: Cognitive task - Solve math problems or puzzles
- Alarm persists until task completed
- Volume adjustable to avoid disturbing others but still wake user

**Technical Requirements**:
- Foreground service (Android) for persistent alarm
- Wake lock to prevent device sleep
- Camera API integration
- Image comparison for location verification
- Puzzle/math problem generator

**API Endpoints**:
- `POST /health/alarm/set` - Set alarm with verification type
- `POST /health/alarm/verify` - Submit verification (photo or answer)
- `GET /health/alarm/history` - Get wake-up history

**Mobile UI**:
- Alarm setup screen with verification options
- Wake verification screen (camera or puzzle)
- History of wake times

---

## 2. Advanced GPS/Activity Tracker

### 2.1 Path & Performance Tracker

**User Story**: As a user, I want to track my running/cycling routes with real-time stats.

**Features**:
- Track: distance, duration, current speed, avg speed
- Display route on map (Mapbox)
- Save routes as GeoJSON
- Activity history with route replay
- Export routes (GPX format)

**Technical Requirements**:
- GPS location updates every 1-5 seconds
- Background location tracking
- Route stored as GeoJSON LineString
- Calculate: distance (Haversine formula), speed, elevation change (optional)

**API Endpoints**:
- `POST /tracking/activity/start` - Start new activity
- `POST /tracking/activity/update` - Send GPS points during activity
- `POST /tracking/activity/end` - End activity with final data
- `GET /tracking/activities` - Get activity history
- `GET /tracking/activity/:id` - Get specific activity with route

---

### 2.2 Real-Time Pacing Coach

**User Story**: As a user, I want to hit a target time (e.g., 5km in 30 min) with real-time feedback.

**Features**:
- Set target distance + target time
- Calculate required avg speed
- During activity: compare current speed vs required speed
- Live prompts: "Speed up by 0.5 km/h" or "On track!" or "Ahead by 2 min"
- Finish prediction: "At current pace, you'll finish in 28 min"

**Technical Requirements**:
- Calculate required speed: `target_distance / target_time`
- Every 5 seconds: compare `current_speed` vs `required_speed`
- Display delta and time prediction
- Haptic/audio feedback for prompts

**Mobile UI**:
- Target time input
- Large speed display
- Visual indicator: red (behind), yellow (on track), green (ahead)
- Audio prompts (optional)

---

## 3. Intrusive Productivity & Habit Builder

### 3.1 Task Pop-up Reminder

**User Story**: As a user, I want my critical tasks to pop up when I unlock my phone so I don't forget.

**Features**:
- When phone unlocks: Show overlay with top-priority task
- Difficult to dismiss (requires swipe or button hold)
- Dismiss options: "Mark done", "Snooze 30 min", "View all tasks"

**Technical Requirements (Android)**:
- Listen for `ACTION_USER_PRESENT` (screen unlock event)
- Display overlay with `SYSTEM_ALERT_WINDOW` permission
- Fetch top-priority task from server

**iOS Alternative**:
- Push notification on unlock (less intrusive)
- Widget with top task

**API Endpoints**:
- `GET /productivity/tasks/top-priority` - Get top task

---

### 3.2 Countdown Focus Blocks

**User Story**: As a user, I want to set a focus timer that blocks distracting apps during work.

**Features**:
- Set duration (e.g., 2 hours)
- Select apps to block (e.g., social media, games)
- During countdown: blocked apps can't be opened
- Optional: Pomodoro mode (25 min work, 5 min break)
- Notification at end of focus block

**Technical Requirements (Android)**:
- Accessibility Service to detect app launches
- If blocked app launched: Show overlay and close it
- Countdown timer with notification

**API Endpoints**:
- `POST /productivity/focus/start` - Start focus block
- `POST /productivity/focus/end` - End focus block
- `GET /productivity/focus/current` - Get current session

**Mobile UI**:
- Timer display
- App blocker settings
- Session history

---

### 3.3 Time-Based Habit Enforcement

**User Story**: As a user, I want persistent reminders for critical habits until I complete them.

**Features**:
- Set habit: "Eat breakfast at 8 AM"
- Initial alarm at 8 AM
- If not logged by 8:10 AM: Second alarm "Did you eat breakfast?"
- Prompt to log meal/habit
- Repeats until completed or user dismisses with reason

**Technical Requirements**:
- Schedule notifications
- Check completion status
- Reschedule follow-up if not done
- Log enforcement attempts

**API Endpoints**:
- `POST /productivity/habit/create` - Create habit
- `POST /productivity/habit/log` - Log habit completion
- `GET /productivity/habits` - Get all habits

---

## 4. AI Journaling & Goal Management

### 4.1 Daily Summary Input (9 PM)

**User Story**: As a user, I want to reflect on my day at 9 PM with text or voice.

**Features**:
- 9 PM reminder to submit daily summary
- Input methods: text or voice
- Prompts: "What did you do today?", "How productive were you?", "What did you eat?"
- AI extracts structured data from free-form input

**Technical Requirements**:
- Voice-to-text (native APIs)
- Send to `/journal/daily-summary`
- AI (GPT-4) parses input and extracts:
  - Hourly activities
  - Food intake
  - Work accomplished
  - Exercise/activities
  - Sleep time

**AI Prompt Example**:
```
Extract structured data from this daily summary:
"{user_input}"

Return JSON with:
- hourly_activities: [{hour: 9, activity: "Worked on project"}]
- meals: [{time: "12:30 PM", food: "Chicken salad", calories: 400}]
- productivity_score: 0-10
- notable_events: ["Finished feature X"]
```

---

### 4.2 AI Rating & Feedback

**User Story**: As a user, I want to know how productive I was today with actionable feedback.

**Features**:
- AI rates day out of 10 based on:
  - Goal completion
  - Time utilization
  - Habit adherence
  - Work output
- Feedback explains rating
- Suggestions for improvement
- If low rating: Ask "What's the issue?" and suggest solutions

**Technical Requirements**:
- AI analyzes structured daily data
- Compares against user's goals
- Generates rating + feedback
- Stores in `JournalLog`

**API Endpoints**:
- `GET /journal/rating/today` - Get today's rating
- `GET /journal/rating/week` - Get week's ratings

**Mobile UI**:
- Large rating display (7/10)
- Feedback text
- Comparison to previous days (trend graph)

---

### 4.3 AI Goal Setter & Coach

**User Story**: As a user, I want to set a main goal and have AI break it down into weekly and daily tasks.

**Features**:
- User inputs main goal: "Launch my app in 6 months"
- AI generates:
  - Weekly milestones (W1: Design mockups, W2: Backend setup, etc.)
  - Daily tasks for current week
- Goal tree is editable
- Daily check-ins: "Did you complete today's tasks?"
- Weekly review: "You completed 4/7 goals this week. Rating: 6/10."

**Technical Requirements**:
- AI prompt: Break down goal into hierarchical tasks
- Store in `Goal` table with `parentId` for hierarchy
- Track completion
- Generate weekly summaries

**AI Prompt Example**:
```
User's main goal: "{goal}"
Context: {user_profile, available_hours_per_day}

Generate:
1. Weekly milestones (list of 24 weekly goals)
2. Daily tasks for Week 1 (7 days)
3. Estimated time per task

Return JSON with goal hierarchy.
```

**API Endpoints**:
- `POST /journal/goals/generate` - Generate goal tree
- `GET /journal/goals` - Get all goals
- `PATCH /journal/goals/:id` - Update goal (user edit)
- `POST /journal/goals/:id/complete` - Mark goal complete

---

### 4.4 Weekly Review

**User Story**: As a user, I want a comprehensive weekly review every Sunday.

**Features**:
- Summary of:
  - Total work hours
  - Goals completed vs planned
  - Daily ratings (avg)
  - Food intake vs targets
  - Exercise/activity stats
- AI-generated insights: "You were most productive on Tuesday. Consider replicating that schedule."
- Charts: productivity trend, calorie intake, activity distance

**Technical Requirements**:
- Aggregate data for past 7 days
- Generate summary with GPT-4
- Store in `JournalLog` (weekly entry)

**API Endpoints**:
- `GET /journal/weekly-review` - Get this week's review

---

## 5. Digital Well-being App Limiter

### 5.1 Time-Bound App Limiter

**User Story**: As a user, I want to limit time on distracting apps to 1 hour/day.

**Features**:
- Set daily limit per app (e.g., Instagram: 60 min)
- Track usage throughout day
- When limit reached: Block app
- Display time remaining in settings

**Technical Requirements (Android)**:
- Request `PACKAGE_USAGE_STATS` permission
- Query `UsageStatsManager` for app usage
- Store daily usage in `AppUsage` table
- Accessibility Service to block app when limit hit

**API Endpoints**:
- `POST /limiter/limits` - Set app limits
- `GET /limiter/limits` - Get all limits
- `POST /limiter/usage` - Sync usage data from device
- `GET /limiter/usage/today` - Get today's usage

---

### 5.2 2-Minute Grace Period

**User Story**: As a user, I want a short grace period after hitting my limit for emergencies.

**Features**:
- After limit reached: Show "Limit reached. 2-minute grace period?"
- User confirms → 2 minutes of access
- Timer counts down
- After 2 minutes: Hard block again
- Only 1 grace period per app per day

**Technical Requirements**:
- Track grace period usage in `AppUsage`
- Timer in foreground service
- Block after 2 minutes

**Mobile UI**:
- Grace period dialog
- Countdown timer
- "Use grace period" button

---

## Technical Implementation Notes

### Permissions Summary (Android)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

### iOS Limitations
- No app blocking or overlay permissions
- Use Focus modes (user-configured)
- Push notifications for reminders
- Shortcuts automation for workflows

### AI Context Management
- Maintain conversation history per user
- Include relevant context in prompts (profile, goals, recent activity)
- Token optimization (summarize old context)
- Fallback for API failures

---

This specification is a living document and will be updated as features are implemented and refined.
