# CLAUDE.md - AI Agent Instructions

This file provides context for AI coding agents (Claude Code, Cursor, GitHub Copilot, etc.) working on this repository.

## Project Overview

**Eye Gym** is a visual training app where users reproduce triangle shapes. The app uses adaptive difficulty through gradient-based sampling.

**Tech Stack**: React 18, TypeScript, Vite, CSS (no UI library), PWA

**Language**: French UI, English code/comments

## Quick Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run dev -- --host  # Start with network access
npm run build        # Production build (runs tsc first)
npm run preview      # Preview production build
```

## Architecture Overview

### State Management

- **Context API** via `src/context/SettingsContext.tsx`
- No Redux/Zustand - keep it simple
- All profile data flows through `useSettings()` hook

### Key Data Structures

```typescript
// Core types in src/types/index.ts

Point { x: number, y: number }

Exercise {
  id, timestamp,
  modelBlue, modelRed, modelGreen,  // Reference triangle
  darkBlue, darkRed, idealGreen,    // Target triangle
  userGreen,                         // User's answer
  ratio, angle, score, distance,
  positionBucketX, positionBucketY, ratioBucket, angleBucket
}

Profile {
  id, name, createdAt, lastPlayedAt,
  settings: Settings,
  gradients: Gradients,
  history: Exercise[],
  exploration: ExplorationState
}

Gradients {
  f1: GradientF1,  // 70x50 position grid
  f2: GradientF2,  // 15 ratio buckets (0.5-2.0)
  f3: GradientF3   // 24 angle buckets (0-2π)
}
```

### File Organization

| Directory | Purpose |
|-----------|---------|
| `src/components/screens/` | Full-page screen components |
| `src/components/game/` | Game UI components (Canvas, ProgressBar) |
| `src/components/statistics/` | Charts and visualizations |
| `src/context/` | React Context providers |
| `src/hooks/` | Custom React hooks |
| `src/utils/` | Pure utility functions |
| `src/types/` | TypeScript type definitions |

## Key Algorithms

### Exercise Generation (`src/components/screens/GameScreen.tsx`)

1. Sample position from F1 gradient (or exploration grid if incomplete)
2. Sample ratio from F2 gradient
3. Sample angle from F3 gradient
4. Generate model triangle at random position
5. Place dark blue/red based on sampled parameters
6. Calculate ideal green position using `calculateThirdPoint()`
7. Validate all points within screen margins (retry up to 100 times)

### Scoring (`src/utils/scoring.ts`)

```typescript
distance = dist(userGreen, idealGreen)
maxError = dist(darkBlue, darkRed) * 0.5
score = max(0, 100 * (1 - distance / maxError))
```

### Gradient Updates (`src/utils/gradients.ts`)

After each exercise:
- Apply Gaussian influence based on sigma parameters
- Score < 70: increase weight (needs practice)
- Score >= 70: decrease weight (mastered)
- Normalize weights to sum to 1

### Sampling (`src/utils/sampling.ts`)

- **Temperature**: Based on recent 10 scores average
- High temp (good performance) → explore weak areas
- Low temp (struggling) → consolidate strengths
- Exploration phase prioritizes untested buckets

## Common Tasks

### Adding a New Setting

1. Add to `Settings` interface in `src/types/index.ts`
2. Add default value in `DEFAULT_SETTINGS` in `src/utils/storage.ts`
3. Add UI control in `src/components/screens/SettingsScreen.tsx`
4. Use via `const { settings } = useSettings()`

### Adding a New Screen

1. Create component in `src/components/screens/NewScreen.tsx`
2. Add to `Screen` type in `src/types/index.ts`
3. Add case in `App.tsx` switch statement
4. Add navigation button in `MenuScreen.tsx`

### Adding a New Statistics View

1. Create component in `src/components/statistics/`
2. Add data generator in `src/utils/statistics.ts`
3. Add tab in `StatisticsScreen.tsx`

### Modifying Game Logic

- Exercise generation: `GameScreen.tsx` → `generateExercise()`
- Point calculations: `src/utils/geometry.ts`
- Scoring: `src/utils/scoring.ts`
- Canvas rendering: `src/components/game/GameCanvas.tsx`

## Code Style

- **Components**: Functional with hooks, named exports
- **Hooks**: `use` prefix, return objects not arrays
- **Utils**: Pure functions, no side effects
- **Types**: Interfaces over type aliases, explicit exports
- **CSS**: BEM-like classes, CSS variables for theming
- **No** class components, HOCs, or render props

## Testing Checklist

Before submitting changes:

1. `npm run build` passes (TypeScript + Vite)
2. Test on desktop browser
3. Test touch interactions (or use Chrome DevTools device mode)
4. Verify dark mode works
5. Check localStorage persistence (refresh page)
6. Test keyboard shortcuts (Enter/Space)

## Common Pitfalls

- **Canvas sizing**: Always use `ResizeObserver`, not window resize events
- **Touch events**: Use `onPointerDown`/`onPointerMove` for unified handling
- **State updates**: Profile changes go through `updateCurrentProfile()`
- **Gradients**: Must be normalized (sum to 1) after updates
- **Exploration**: Check `exploration.explorationComplete` before weighted sampling

## Performance Considerations

- Canvas redraws only on state changes (not animation frames)
- Gradient calculations are O(grid_size), keep grids reasonable
- History is stored entirely in localStorage (consider pagination for large histories)
- Statistics are computed via `useMemo` with history as dependency

## Internationalization

Currently French-only. If adding i18n:
- UI strings are hardcoded in components
- Date formatting uses `toLocaleDateString('fr-FR')`
- Numbers use standard formatting

## PWA Notes

- Configured in `vite.config.js` via `vite-plugin-pwa`
- Icons in `public/` directory
- Manifest auto-generated
- Service worker uses workbox (generateSW mode)

## Debugging Tips

```typescript
// Check current profile state
console.log(JSON.stringify(currentProfile, null, 2));

// Visualize gradients
console.table(gradients.f1.weights);

// Export profile for inspection
const json = exportCurrentProfile();
console.log(json);
```

## Questions?

If unclear about implementation details, check:
1. Type definitions in `src/types/index.ts`
2. Existing similar code in the codebase
3. Context provider in `src/context/SettingsContext.tsx`
