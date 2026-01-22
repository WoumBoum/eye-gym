import {
  Settings,
  Profile,
  ExplorationState,
  PROFILES_KEY,
  CURRENT_PROFILE_KEY,
  EXPLORATION_GRID_WIDTH,
  EXPLORATION_GRID_HEIGHT,
  EXPLORATION_RATIO_BUCKETS,
  EXPLORATION_ANGLE_BUCKETS,
} from '../types';
import { createDefaultGradients } from './gradients';

// Default settings
export const DEFAULT_SETTINGS: Settings = {
  exerciseDuration: 10,
  timerEnabled: false,
  marginPercent: 10,
  maxAngleDelta: Math.PI,
  sigma1: 5,
  sigma2: 2,
  sigma3: 3,
  learningRate: 0.1,
  darkMode: false,
  pointSize: 18,
  language: 'en',
};

// Create default exploration state
export function createDefaultExploration(): ExplorationState {
  const positionGrid: boolean[][] = [];
  for (let y = 0; y < EXPLORATION_GRID_HEIGHT; y++) {
    positionGrid[y] = new Array(EXPLORATION_GRID_WIDTH).fill(false);
  }

  return {
    positionGrid,
    ratioTested: new Array(EXPLORATION_RATIO_BUCKETS).fill(false),
    angleTested: new Array(EXPLORATION_ANGLE_BUCKETS).fill(false),
    explorationComplete: false,
  };
}

// Create a new profile
export function createProfile(name: string): Profile {
  return {
    id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    createdAt: Date.now(),
    lastPlayedAt: Date.now(),
    settings: { ...DEFAULT_SETTINGS },
    gradients: createDefaultGradients(),
    history: [],
    exploration: createDefaultExploration(),
  };
}

// Load all profiles from localStorage
export function loadProfiles(): Profile[] {
  try {
    const stored = localStorage.getItem(PROFILES_KEY);
    if (stored) {
      const profiles = JSON.parse(stored);
      // Ensure all profiles have exploration state (migration)
      return profiles.map((p: Profile) => ({
        ...p,
        exploration: p.exploration || createDefaultExploration(),
      }));
    }
  } catch (e) {
    console.error('Failed to load profiles:', e);
  }
  return [];
}

// Save all profiles to localStorage
export function saveProfiles(profiles: Profile[]): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save profiles:', e);
  }
}

// Load current profile ID
export function loadCurrentProfileId(): string | null {
  try {
    return localStorage.getItem(CURRENT_PROFILE_KEY);
  } catch (e) {
    console.error('Failed to load current profile ID:', e);
  }
  return null;
}

// Save current profile ID
export function saveCurrentProfileId(profileId: string | null): void {
  try {
    if (profileId) {
      localStorage.setItem(CURRENT_PROFILE_KEY, profileId);
    } else {
      localStorage.removeItem(CURRENT_PROFILE_KEY);
    }
  } catch (e) {
    console.error('Failed to save current profile ID:', e);
  }
}

// Get current profile
export function getCurrentProfile(): Profile | null {
  const profiles = loadProfiles();
  const currentId = loadCurrentProfileId();

  if (currentId) {
    const profile = profiles.find(p => p.id === currentId);
    if (profile) return profile;
  }

  // Return first profile if exists
  return profiles.length > 0 ? profiles[0] : null;
}

// Save a single profile (updates it in the profiles array)
export function saveProfile(profile: Profile): void {
  const profiles = loadProfiles();
  const index = profiles.findIndex(p => p.id === profile.id);

  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }

  saveProfiles(profiles);
}

// Delete a profile
export function deleteProfile(profileId: string): void {
  const profiles = loadProfiles();
  const filtered = profiles.filter(p => p.id !== profileId);
  saveProfiles(filtered);

  // If deleted current profile, switch to another
  const currentId = loadCurrentProfileId();
  if (currentId === profileId) {
    saveCurrentProfileId(filtered.length > 0 ? filtered[0].id : null);
  }
}

// Export profile to JSON string
export function exportProfileToJSON(profile: Profile): string {
  return JSON.stringify(profile, null, 2);
}

// Import profile from JSON string
export function importProfileFromJSON(jsonString: string): Profile | null {
  try {
    const profile = JSON.parse(jsonString) as Profile;

    // Validate required fields
    if (!profile.id || !profile.name || !profile.history) {
      throw new Error('Invalid profile format');
    }

    // Generate new ID to avoid conflicts
    profile.id = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Ensure exploration state exists
    if (!profile.exploration) {
      profile.exploration = createDefaultExploration();
    }

    // Ensure settings have all fields
    profile.settings = { ...DEFAULT_SETTINGS, ...profile.settings };

    // Ensure gradients exist
    if (!profile.gradients) {
      profile.gradients = createDefaultGradients();
    }

    return profile;
  } catch (e) {
    console.error('Failed to import profile:', e);
    return null;
  }
}

// Check if exploration is complete
export function checkExplorationComplete(exploration: ExplorationState): boolean {
  // Check positions
  for (const row of exploration.positionGrid) {
    if (row.some(v => !v)) return false;
  }

  // Check ratios
  if (exploration.ratioTested.some(v => !v)) return false;

  // Check angles
  if (exploration.angleTested.some(v => !v)) return false;

  return true;
}

// Get exploration progress (0-1)
export function getExplorationProgress(exploration: ExplorationState): {
  position: number;
  ratio: number;
  angle: number;
  total: number;
} {
  const totalPositions = EXPLORATION_GRID_WIDTH * EXPLORATION_GRID_HEIGHT;
  let testedPositions = 0;
  for (const row of exploration.positionGrid) {
    testedPositions += row.filter(v => v).length;
  }

  const testedRatios = exploration.ratioTested.filter(v => v).length;
  const testedAngles = exploration.angleTested.filter(v => v).length;

  return {
    position: testedPositions / totalPositions,
    ratio: testedRatios / EXPLORATION_RATIO_BUCKETS,
    angle: testedAngles / EXPLORATION_ANGLE_BUCKETS,
    total:
      (testedPositions + testedRatios + testedAngles) /
      (totalPositions + EXPLORATION_RATIO_BUCKETS + EXPLORATION_ANGLE_BUCKETS),
  };
}
