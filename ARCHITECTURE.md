# Architecture Documentation

This document describes the technical architecture of Eye Gym.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Application                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Screens   │  │    Game     │  │ Statistics  │              │
│  │  Components │  │ Components  │  │ Components  │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│                    ┌─────▼─────┐                                 │
│                    │  Context  │                                 │
│                    │ (State)   │                                 │
│                    └─────┬─────┘                                 │
│                          │                                       │
│         ┌────────────────┼────────────────┐                      │
│         │                │                │                      │
│   ┌─────▼─────┐   ┌──────▼──────┐  ┌──────▼──────┐              │
│   │  Hooks    │   │   Utils     │  │   Types     │              │
│   └───────────┘   └─────────────┘  └─────────────┘              │
│                          │                                       │
│                    ┌─────▼─────┐                                 │
│                    │LocalStorage│                                │
│                    └───────────┘                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### State Management

All application state flows through `SettingsContext`:

```
User Action
    │
    ▼
Component (e.g., GameScreen)
    │
    ▼
useSettings() hook
    │
    ▼
SettingsContext
    │
    ├──▶ Update local state
    │
    └──▶ Persist to localStorage
```

### Exercise Flow

```
1. generateExercise()
   │
   ├─▶ Check exploration state
   │   └─▶ If incomplete: prioritize untested buckets
   │   └─▶ If complete: use weighted sampling
   │
   ├─▶ samplePositionWithExploration()
   ├─▶ sampleRatioWithExploration()
   ├─▶ sampleAngleWithExploration()
   │
   ├─▶ Generate model triangle
   ├─▶ Generate target triangle
   ├─▶ Calculate ideal green position
   │
   └─▶ Validate all points within bounds
       └─▶ Retry up to 100 times if invalid

2. User places point
   │
   ▼
3. validateExercise()
   │
   ├─▶ calculateScore()
   ├─▶ addExercise() to history
   ├─▶ updateGradientsFromExercise()
   └─▶ markExplorationTested()

4. Show feedback
   │
   ▼
5. User clicks "Next"
   │
   ▼
   Back to step 1
```

## Component Architecture

### Screen Components

Each screen is a full-page component:

```
src/components/screens/
├── MenuScreen.tsx      # Navigation hub
├── GameScreen.tsx      # Main game logic
├── StatisticsScreen.tsx # Stats tabs
├── SettingsScreen.tsx  # Configuration
└── ProfilesScreen.tsx  # Profile management
```

### Game Components

```
GameScreen
├── GameCanvas         # Renders 6 points, handles input
└── ProgressBar        # Timer visualization
```

### Statistics Components

```
StatisticsScreen
├── GlobalStats        # Summary cards
├── HeatmapCanvas      # 2D position performance
├── RatioCurve         # Score vs ratio chart
├── AngleCurve         # Score vs angle chart
└── TimelineEvolution  # Time slider with charts
```

## Data Structures

### Profile (Root Entity)

```typescript
Profile {
  id: string              // Unique identifier
  name: string            // Display name
  createdAt: number       // Timestamp
  lastPlayedAt: number    // Timestamp
  settings: Settings      // User preferences
  gradients: Gradients    // Adaptive difficulty state
  history: Exercise[]     // All completed exercises
  exploration: ExplorationState  // Exploration tracking
}
```

### Gradients (Adaptive Difficulty)

```
F1: Position Grid (70×50)
┌─────────────────────────────────────┐
│ Each cell contains a weight (0-1)   │
│ Higher weight = more likely to be   │
│ selected for next exercise          │
└─────────────────────────────────────┘

F2: Ratio Buckets (15)
[0.5] [0.6] [0.7] ... [1.9] [2.0]
  │     │     │         │     │
  └─────┴─────┴─────────┴─────┘
        Each bucket has a weight

F3: Angle Buckets (24)
    0°   15°  30° ... 345°
  [   ] [   ] [   ] ... [   ]
  Each 15° slice has a weight
```

### Exercise Record

```typescript
Exercise {
  // Identity
  id: string
  timestamp: number

  // Model triangle (reference)
  modelBlue: Point
  modelRed: Point
  modelGreen: Point

  // Target triangle
  darkBlue: Point
  darkRed: Point
  idealGreen: Point

  // User's answer
  userGreen: Point | null

  // Parameters used
  ratio: number          // Distance ratio
  angle: number          // Rotation angle
  positionBucketX: number
  positionBucketY: number
  ratioBucket: number
  angleBucket: number

  // Result
  score: number          // 0-100
  distance: number       // Pixels from ideal
}
```

## Algorithms

### Triangle Reproduction

Given model triangle (A, B, C) and target base (A', B'):

```
1. Calculate vector AB = B - A
2. Calculate vector AB' = B' - A'
3. Find rotation angle θ = angle(AB') - angle(AB)
4. Find scale factor s = |AB'| / |AB|
5. Apply to AC:
   AC' = rotate(AC, θ) * s
6. Ideal C' = A' + AC'
```

Implementation in `src/utils/geometry.ts`:

```typescript
function calculateThirdPoint(
  darkBlue: Point,
  darkRed: Point,
  modelBlue: Point,
  modelRed: Point,
  modelGreen: Point
): Point
```

### Scoring

```
maxError = dist(darkBlue, darkRed) × 0.5
error = dist(userGreen, idealGreen)
score = max(0, 100 × (1 - error / maxError))
```

Score ranges:
- 90-100: Excellent (dark green)
- 70-89: Good (light green)
- 40-69: Okay (orange)
- 0-39: Needs work (red)

### Gradient Updates

After each exercise:

```python
for each cell in gradient:
    influence = exp(-distance² / σ²)
    if score >= 70:
        weight *= (1 - influence × learningRate)  # Decrease
    else:
        weight *= (1 + influence × learningRate)  # Increase

normalize(weights)  # Sum to 1
```

### Temperature-Based Sampling

```python
temperature = 0.5 + (avg_recent_scores / 100) × 1.5

# Apply temperature to weights
adjusted = [w^(1/temperature) for w in weights]
normalized = [w / sum(adjusted) for w in adjusted]

# Sample from normalized distribution
bucket = weighted_random_choice(normalized)
```

High temperature (high scores) → flatter distribution → explore weak areas
Low temperature (low scores) → sharper distribution → focus on strengths

## Storage

### LocalStorage Keys

```
gym_des_yeux_v3_profiles      # Array of Profile objects
gym_des_yeux_v3_current_profile  # Current profile ID
```

### Data Persistence

- Profiles saved on every change
- No debouncing (immediate persistence)
- Full profile object stored (including history)

### Export Format

JSON export includes complete profile:

```json
{
  "id": "profile_1234",
  "name": "Player 1",
  "settings": { ... },
  "gradients": { ... },
  "history": [ ... ],
  "exploration": { ... }
}
```

## PWA Architecture

```
┌─────────────────────────────────────┐
│           Browser/App               │
├─────────────────────────────────────┤
│         Service Worker              │
│  ┌─────────────────────────────┐    │
│  │   Workbox (precache)        │    │
│  │   - index.html              │    │
│  │   - assets/*.js             │    │
│  │   - assets/*.css            │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│         Web App Manifest            │
│  - name, icons, theme               │
│  - display: standalone              │
└─────────────────────────────────────┘
```

Configuration in `vite.config.js`:
- `generateSW` mode (automatic)
- Precaches all build assets
- Manifest generated from config

## Canvas Rendering

### GameCanvas Architecture

```
GameCanvas
├── Container (div with ResizeObserver)
└── Canvas (2D context)
    ├── Clear background
    ├── Draw model triangle lines
    ├── Draw target triangle lines (partial)
    ├── Draw ideal green (feedback only)
    ├── Draw 6 points as circles
    └── Draw user point (if placed)
```

### Coordinate System

- Origin: top-left
- X: increases rightward
- Y: increases downward
- Points stored in pixel coordinates
- Normalized for storage/comparison when needed

## Performance Considerations

### Rendering

- Canvas redraws only when state changes
- No requestAnimationFrame loop
- Points drawn as filled circles (fast)

### State Updates

- React batches state updates
- Context updates trigger re-render of consumers
- useMemo for expensive computations (statistics)

### Storage

- Synchronous localStorage access
- No compression (JSON.stringify)
- Full profile on each save

### Memory

- History grows unbounded
- Consider pagination for large histories (future improvement)
- Gradients are fixed size (70×50 + 15 + 24 numbers)

## Future Considerations

### Scalability

- Add IndexedDB for large histories
- Implement history pagination
- Add data compression

### Features

- Multiplayer/leaderboards
- Cloud sync
- More exercise types
- Accessibility improvements

### Technical Debt

- Add unit tests
- Add E2E tests
- Improve mobile touch handling
- Add error boundaries
