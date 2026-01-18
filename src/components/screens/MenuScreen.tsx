import { Screen } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { getExplorationProgress } from '../../utils/storage';

interface MenuScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function MenuScreen({ onNavigate }: MenuScreenProps) {
  const { currentProfile, exploration } = useSettings();
  const explorationProgress = getExplorationProgress(exploration);

  return (
    <div className="screen menu-screen">
      <h1 className="menu-title">Eye Gym</h1>
      <p className="menu-subtitle">Entraînement visuel</p>

      {currentProfile && (
        <div className="menu-profile-badge" onClick={() => onNavigate('profiles')}>
          <span className="profile-name">{currentProfile.name}</span>
          <span className="profile-exercise-count">{currentProfile.history.length} exercices</span>
          {!exploration.explorationComplete && (
            <span className="profile-exploration">
              Exploration: {Math.round(explorationProgress.total * 100)}%
            </span>
          )}
        </div>
      )}

      <div className="menu-buttons">
        <button className="btn btn-primary" onClick={() => onNavigate('game')}>
          Jouer
        </button>
        <button className="btn btn-secondary" onClick={() => onNavigate('statistics')}>
          Statistiques
        </button>
        <button className="btn btn-secondary" onClick={() => onNavigate('settings')}>
          Paramètres
        </button>
        <button className="btn btn-secondary" onClick={() => onNavigate('profiles')}>
          Profils
        </button>
      </div>
    </div>
  );
}
