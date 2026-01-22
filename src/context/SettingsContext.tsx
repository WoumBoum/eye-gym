import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Settings, Gradients, Exercise, Profile, ExplorationState } from '../types';
import {
  loadProfiles,
  saveProfile,
  loadCurrentProfileId,
  saveCurrentProfileId,
  createProfile,
  deleteProfile as deleteProfileStorage,
  createDefaultExploration,
  checkExplorationComplete,
  DEFAULT_SETTINGS,
} from '../utils/storage';
import { updateF1, updateF2, updateF3, createDefaultGradients } from '../utils/gradients';

interface ProfileContextType {
  // Current profile
  currentProfile: Profile | null;
  profiles: Profile[];

  // Profile management
  createNewProfile: (name: string) => Profile;
  switchProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;
  renameProfile: (profileId: string, newName: string) => void;

  // Settings (from current profile)
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;

  // Gradients (from current profile)
  gradients: Gradients;
  resetGradients: () => void;

  // History (from current profile)
  history: Exercise[];
  addExercise: (exercise: Exercise) => void;
  updateGradientsFromExercise: (exercise: Exercise, canvasWidth: number, canvasHeight: number) => void;
  clearExerciseHistory: () => void;

  // Exploration (from current profile)
  exploration: ExplorationState;
  markExplorationTested: (posX: number, posY: number, ratioBucket: number, angleBucket: number) => void;

  // Tutorial
  hasSeenTutorial: boolean;
  markTutorialSeen: () => void;

  // Export/Import
  exportCurrentProfile: () => string;
  importProfile: (jsonString: string) => boolean;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(() => loadProfiles());
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(() => loadCurrentProfileId());

  // Get current profile from state
  const currentProfile = profiles.find(p => p.id === currentProfileId) || profiles[0] || null;

  // Derived state from current profile
  const settings = currentProfile?.settings || DEFAULT_SETTINGS;
  const gradients = currentProfile?.gradients || createDefaultGradients();
  const history = currentProfile?.history || [];
  const exploration = currentProfile?.exploration || createDefaultExploration();
  const hasSeenTutorial = currentProfile?.hasSeenTutorial ?? false;

  // Save profile when it changes
  // Accepts either a partial profile or a function that receives the current profile and returns updates
  const updateCurrentProfile = useCallback((
    updates: Partial<Profile> | ((current: Profile) => Partial<Profile>)
  ) => {
    if (!currentProfileId) return;

    setProfiles(prev => {
      const profile = prev.find(p => p.id === currentProfileId);
      if (!profile) return prev;

      // Resolve updates: either use directly or call with current profile
      const actualUpdates = typeof updates === 'function' ? updates(profile) : updates;

      const updatedProfile: Profile = {
        ...profile,
        ...actualUpdates,
        lastPlayedAt: Date.now(),
      };

      const newProfiles = prev.map(p => p.id === currentProfileId ? updatedProfile : p);
      // Save to localStorage
      saveProfile(updatedProfile);
      return newProfiles;
    });
  }, [currentProfileId]);

  // Profile management
  const createNewProfile = useCallback((name: string): Profile => {
    const newProfile = createProfile(name);
    setProfiles(prev => {
      const newProfiles = [...prev, newProfile];
      saveProfile(newProfile);
      return newProfiles;
    });
    setCurrentProfileId(newProfile.id);
    saveCurrentProfileId(newProfile.id);
    return newProfile;
  }, []);

  const switchProfile = useCallback((profileId: string) => {
    setCurrentProfileId(profileId);
    saveCurrentProfileId(profileId);
  }, []);

  const deleteProfile = useCallback((profileId: string) => {
    deleteProfileStorage(profileId);
    setProfiles(prev => {
      const newProfiles = prev.filter(p => p.id !== profileId);
      if (currentProfileId === profileId) {
        const newCurrent = newProfiles[0]?.id || null;
        setCurrentProfileId(newCurrent);
        saveCurrentProfileId(newCurrent);
      }
      return newProfiles;
    });
  }, [currentProfileId]);

  const renameProfile = useCallback((profileId: string, newName: string) => {
    setProfiles(prev => {
      return prev.map(p => {
        if (p.id === profileId) {
          const updated = { ...p, name: newName };
          saveProfile(updated);
          return updated;
        }
        return p;
      });
    });
  }, []);

  // Settings management
  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    updateCurrentProfile(current => ({
      settings: { ...current.settings, ...newSettings },
    }));
  }, [updateCurrentProfile]);

  const resetSettings = useCallback(() => {
    updateCurrentProfile({ settings: DEFAULT_SETTINGS });
  }, [updateCurrentProfile]);

  // Gradients management
  const resetGradients = useCallback(() => {
    updateCurrentProfile({
      gradients: createDefaultGradients(),
      exploration: createDefaultExploration(),
    });
  }, [updateCurrentProfile]);

  // History management
  const addExercise = useCallback((exercise: Exercise) => {
    updateCurrentProfile(current => ({
      history: [...current.history, exercise],
    }));
  }, [updateCurrentProfile]);

  const updateGradientsFromExercise = useCallback((
    exercise: Exercise,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const normalizedX = exercise.idealGreen.x / canvasWidth;
    const normalizedY = exercise.idealGreen.y / canvasHeight;

    updateCurrentProfile(current => {
      const newF1 = updateF1(
        current.gradients.f1,
        normalizedX,
        normalizedY,
        exercise.score,
        current.settings.sigma1,
        current.settings.learningRate
      );

      const newF2 = updateF2(
        current.gradients.f2,
        exercise.ratio,
        exercise.score,
        current.settings.sigma2,
        current.settings.learningRate
      );

      const newF3 = updateF3(
        current.gradients.f3,
        exercise.angle,
        exercise.score,
        current.settings.sigma3,
        current.settings.learningRate
      );

      return {
        gradients: { f1: newF1, f2: newF2, f3: newF3 },
      };
    });
  }, [updateCurrentProfile]);

  const clearExerciseHistory = useCallback(() => {
    updateCurrentProfile({
      history: [],
      gradients: createDefaultGradients(),
      exploration: createDefaultExploration(),
    });
  }, [updateCurrentProfile]);

  // Exploration management
  const markExplorationTested = useCallback((
    posX: number,
    posY: number,
    ratioBucket: number,
    angleBucket: number
  ) => {
    updateCurrentProfile(current => {
      const newExploration = { ...current.exploration };

      // Mark position as tested
      if (posY >= 0 && posY < newExploration.positionGrid.length &&
          posX >= 0 && posX < newExploration.positionGrid[0].length) {
        newExploration.positionGrid = newExploration.positionGrid.map((row, y) =>
          y === posY ? row.map((v, x) => x === posX ? true : v) : row
        );
      }

      // Mark ratio as tested
      if (ratioBucket >= 0 && ratioBucket < newExploration.ratioTested.length) {
        newExploration.ratioTested = newExploration.ratioTested.map((v, i) =>
          i === ratioBucket ? true : v
        );
      }

      // Mark angle as tested
      if (angleBucket >= 0 && angleBucket < newExploration.angleTested.length) {
        newExploration.angleTested = newExploration.angleTested.map((v, i) =>
          i === angleBucket ? true : v
        );
      }

      // Check if exploration is complete
      newExploration.explorationComplete = checkExplorationComplete(newExploration);

      return { exploration: newExploration };
    });
  }, [updateCurrentProfile]);

  // Tutorial management
  const markTutorialSeen = useCallback(() => {
    updateCurrentProfile({ hasSeenTutorial: true });
  }, [updateCurrentProfile]);

  // Export/Import
  const exportCurrentProfile = useCallback((): string => {
    if (!currentProfile) return '{}';
    return JSON.stringify(currentProfile, null, 2);
  }, [currentProfile]);

  const importProfile = useCallback((jsonString: string): boolean => {
    try {
      const imported = JSON.parse(jsonString) as Profile;

      if (!imported.name || !Array.isArray(imported.history)) {
        return false;
      }

      // Generate new ID
      imported.id = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      imported.name = `${imported.name} (importé)`;
      imported.settings = { ...DEFAULT_SETTINGS, ...imported.settings };
      imported.gradients = imported.gradients || createDefaultGradients();
      imported.exploration = imported.exploration || createDefaultExploration();

      saveProfile(imported);
      setProfiles(prev => [...prev, imported]);
      setCurrentProfileId(imported.id);
      saveCurrentProfileId(imported.id);

      return true;
    } catch (e) {
      console.error('Failed to import profile:', e);
      return false;
    }
  }, []);

  // Create default profile if none exists
  useEffect(() => {
    if (profiles.length === 0) {
      const defaultProfile = createProfile('Joueur 1');
      saveProfile(defaultProfile);
      setProfiles([defaultProfile]);
      setCurrentProfileId(defaultProfile.id);
      saveCurrentProfileId(defaultProfile.id);
    }
  }, [profiles.length]);

  return (
    <ProfileContext.Provider
      value={{
        currentProfile,
        profiles,
        createNewProfile,
        switchProfile,
        deleteProfile,
        renameProfile,
        settings,
        updateSettings,
        resetSettings,
        gradients,
        resetGradients,
        history,
        addExercise,
        updateGradientsFromExercise,
        clearExerciseHistory,
        exploration,
        markExplorationTested,
        hasSeenTutorial,
        markTutorialSeen,
        exportCurrentProfile,
        importProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
