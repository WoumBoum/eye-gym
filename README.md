# Eye Gym

A visual training application that helps users improve their spatial perception by reproducing triangle shapes. Built with React 18, TypeScript, and Vite.

## Overview

Eye Gym presents users with a reference triangle (light-colored) and asks them to complete a second triangle (dark-colored) by placing a third point. The app uses adaptive difficulty through gradient-based sampling, focusing practice on areas where the user needs improvement.

### How It Works

1. **Reference Triangle**: Three light-colored points (blue, red, green) form a model triangle
2. **Target Triangle**: Two dark-colored points (blue, red) are shown
3. **User Task**: Place the dark green point to recreate the same triangle shape
4. **Scoring**: Based on distance between user's placement and ideal position (0-100)
5. **Adaptation**: The app learns from your performance and presents more exercises in areas you find challenging

## Features

- **Adaptive Learning**: Uses gradient-based sampling to prioritize difficult parameter combinations
- **Exploration Phase**: Ensures all parameter ranges are tested before adaptive mode
- **Multiple Profiles**: Create, switch, and manage different user profiles
- **Export/Import**: Save and share profiles as JSON files
- **Timeline Evolution**: Visualize your progress over time with an interactive slider
- **Statistics Dashboard**: Heatmaps, ratio curves, and angle curves
- **PWA Support**: Install on tablets for offline use
- **Dark Mode**: Eye-friendly dark theme option
- **Keyboard Shortcuts**: Enter/Space to validate and proceed

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start with network access (for tablets)
npm run dev -- --host

# Build for production
npm run build

# Preview production build
npm run preview
```

## Installation on Tablet

1. Start the dev server with `npm run dev -- --host`
2. Connect your tablet to the same WiFi network
3. Open the network URL (e.g., `http://192.168.x.x:5173`) in your tablet browser
4. Use "Add to Home Screen" to install as a PWA

## Project Structure

```
src/
├── components/
│   ├── screens/           # Main screen components
│   │   ├── MenuScreen.tsx
│   │   ├── GameScreen.tsx
│   │   ├── StatisticsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── ProfilesScreen.tsx
│   ├── game/              # Game-specific components
│   │   ├── GameCanvas.tsx
│   │   └── ProgressBar.tsx
│   └── statistics/        # Statistics visualization
│       ├── GlobalStats.tsx
│       ├── HeatmapCanvas.tsx
│       ├── RatioCurve.tsx
│       ├── AngleCurve.tsx
│       └── TimelineEvolution.tsx
├── context/
│   └── SettingsContext.tsx  # Global state management
├── hooks/
│   ├── useCanvas.ts         # Canvas setup hook
│   └── useGameTimer.ts      # Timer management
├── utils/
│   ├── geometry.ts          # Vector math operations
│   ├── gradients.ts         # Gradient management (F1, F2, F3)
│   ├── sampling.ts          # Weighted sampling algorithms
│   ├── scoring.ts           # Score calculation
│   ├── statistics.ts        # Stats aggregation
│   └── storage.ts           # LocalStorage operations
├── types/
│   └── index.ts             # TypeScript type definitions
├── App.tsx                  # Root component
├── App.css                  # Global styles
└── main.tsx                 # Entry point
```

## Technical Details

### Gradient System

The app uses three gradient functions to sample exercise parameters:

- **F1 (Position)**: 70x50 grid controlling where triangles appear
- **F2 (Ratio)**: 15 buckets for distance ratio (0.5 to 2.0)
- **F3 (Angle)**: 24 buckets for rotation angle (0 to 2π)

After each exercise, gradients are updated:
- Low scores increase weights (more practice needed)
- High scores decrease weights (already mastered)

### Exploration Phase

Before adaptive sampling begins, the app ensures all parameter combinations are tested at least once:
- 10x7 position grid
- 15 ratio buckets
- 24 angle buckets

Progress is shown until exploration is complete.

### Scoring Algorithm

```
distance = dist(userPoint, idealPoint)
maxError = dist(darkBlue, darkRed) × 0.5
score = max(0, 100 × (1 - distance / maxError))
```

## Configuration

Settings available in the app:

| Setting | Description | Range |
|---------|-------------|-------|
| Timer | Enable/disable time limit | On/Off |
| Duration | Time per exercise | 5-30 seconds |
| Margin | Screen edge margin | 5-15% |
| Angle Delta | Max rotation difference | 0-π radians |
| Sigma 1-3 | Gradient spread parameters | Adjustable |
| Learning Rate | Gradient update speed | 0.01-0.5 |
| Dark Mode | Theme selection | On/Off |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for technical documentation.

## AI Contributors

See [CLAUDE.md](CLAUDE.md) for AI-specific instructions.

## License

MIT License - See [LICENSE](LICENSE) for details.

## Acknowledgments

- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)
- PWA support via [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
