import { useSettings } from '../../context/SettingsContext';

interface SettingsScreenProps {
  onBack: () => void;
}

// Convert radians to degrees for display
function radToDeg(rad: number): number {
  return Math.round((rad * 180) / Math.PI);
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const {
    settings,
    updateSettings,
    resetSettings,
    resetGradients,
    clearExerciseHistory,
  } = useSettings();

  const handleTimerEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ timerEnabled: e.target.checked });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ exerciseDuration: parseInt(e.target.value, 10) });
  };

  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ marginPercent: parseInt(e.target.value, 10) });
  };

  const handleMaxAngleDeltaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Slider value is in degrees (0-180), convert to radians
    const degrees = parseInt(e.target.value, 10);
    updateSettings({ maxAngleDelta: (degrees * Math.PI) / 180 });
  };

  const handleSigma1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ sigma1: parseFloat(e.target.value) });
  };

  const handleSigma2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ sigma2: parseFloat(e.target.value) });
  };

  const handleSigma3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ sigma3: parseFloat(e.target.value) });
  };

  const handleLearningRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ learningRate: parseFloat(e.target.value) });
  };

  const handleDarkModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ darkMode: e.target.checked });
  };

  const handlePointSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ pointSize: parseInt(e.target.value, 10) });
  };

  const handleResetSettings = () => {
    if (confirm('Réinitialiser tous les paramètres aux valeurs par défaut ?')) {
      resetSettings();
    }
  };

  const handleResetGradients = () => {
    if (confirm('Réinitialiser les gradients d\'apprentissage ? L\'adaptation sera perdue.')) {
      resetGradients();
    }
  };

  const handleClearHistory = () => {
    if (confirm('Effacer tout l\'historique des exercices ? Cette action est irréversible.')) {
      clearExerciseHistory();
    }
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <button className="btn btn-secondary btn-back" onClick={onBack}>
          Retour
        </button>
        <h1 className="screen-title">Paramètres</h1>
      </div>

      <div className="screen-content">
        <div className="settings-section">
          <h2 className="settings-section-title">Apparence</h2>

          <div className="setting-row">
            <div>
              <div className="setting-label">Mode sombre</div>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={handleDarkModeChange}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-row">
            <div>
              <div className="setting-label">Taille des points</div>
              <div className="setting-value">{settings.pointSize} px</div>
            </div>
            <div className="setting-control">
              <input
                type="range"
                className="slider"
                min="4"
                max="32"
                step="2"
                value={settings.pointSize}
                onChange={handlePointSizeChange}
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="settings-section-title">Jeu</h2>

          <div className="setting-row">
            <div>
              <div className="setting-label">Activer le chronomètre</div>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.timerEnabled}
                  onChange={handleTimerEnabledChange}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {settings.timerEnabled && (
            <div className="setting-row">
              <div>
                <div className="setting-label">Durée par exercice</div>
                <div className="setting-value">{settings.exerciseDuration} secondes</div>
              </div>
              <div className="setting-control">
                <input
                  type="range"
                  className="slider"
                  min="5"
                  max="30"
                  step="1"
                  value={settings.exerciseDuration}
                  onChange={handleDurationChange}
                />
              </div>
            </div>
          )}

          <div className="setting-row">
            <div>
              <div className="setting-label">Delta d'angle max</div>
              <div className="setting-value">{radToDeg(settings.maxAngleDelta)}°</div>
            </div>
            <div className="setting-control">
              <input
                type="range"
                className="slider"
                min="0"
                max="180"
                step="15"
                value={radToDeg(settings.maxAngleDelta)}
                onChange={handleMaxAngleDeltaChange}
              />
            </div>
          </div>

          <div className="setting-row">
            <div>
              <div className="setting-label">Marge de l'écran</div>
              <div className="setting-value">{settings.marginPercent}%</div>
            </div>
            <div className="setting-control">
              <input
                type="range"
                className="slider"
                min="5"
                max="15"
                step="1"
                value={settings.marginPercent}
                onChange={handleMarginChange}
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="settings-section-title">Apprentissage adaptatif</h2>

          <div className="setting-row">
            <div>
              <div className="setting-label">Sigma Position (F1)</div>
              <div className="setting-value">{settings.sigma1}</div>
            </div>
            <div className="setting-control">
              <input
                type="range"
                className="slider"
                min="1"
                max="15"
                step="1"
                value={settings.sigma1}
                onChange={handleSigma1Change}
              />
            </div>
          </div>

          <div className="setting-row">
            <div>
              <div className="setting-label">Sigma Ratio (F2)</div>
              <div className="setting-value">{settings.sigma2}</div>
            </div>
            <div className="setting-control">
              <input
                type="range"
                className="slider"
                min="1"
                max="5"
                step="0.5"
                value={settings.sigma2}
                onChange={handleSigma2Change}
              />
            </div>
          </div>

          <div className="setting-row">
            <div>
              <div className="setting-label">Sigma Angle (F3)</div>
              <div className="setting-value">{settings.sigma3}</div>
            </div>
            <div className="setting-control">
              <input
                type="range"
                className="slider"
                min="1"
                max="6"
                step="0.5"
                value={settings.sigma3}
                onChange={handleSigma3Change}
              />
            </div>
          </div>

          <div className="setting-row">
            <div>
              <div className="setting-label">Vitesse d'apprentissage</div>
              <div className="setting-value">{settings.learningRate}</div>
            </div>
            <div className="setting-control">
              <input
                type="range"
                className="slider"
                min="0.01"
                max="0.3"
                step="0.01"
                value={settings.learningRate}
                onChange={handleLearningRateChange}
              />
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn btn-secondary" onClick={handleResetSettings}>
            Réinitialiser les paramètres
          </button>
          <button className="btn btn-secondary" onClick={handleResetGradients}>
            Réinitialiser l'apprentissage
          </button>
          <button className="btn btn-danger" onClick={handleClearHistory}>
            Effacer l'historique
          </button>
        </div>
      </div>
    </div>
  );
}
