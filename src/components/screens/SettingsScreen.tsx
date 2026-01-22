import { useSettings } from '../../context/SettingsContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Language } from '../../types';

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
  const { t } = useTranslation();

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

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ language: e.target.value as Language });
  };

  const handleResetSettings = () => {
    if (confirm(t.resetSettingsConfirm)) {
      resetSettings();
    }
  };

  const handleResetGradients = () => {
    if (confirm(t.resetGradientsConfirm)) {
      resetGradients();
    }
  };

  const handleClearHistory = () => {
    if (confirm(t.clearHistoryConfirm)) {
      clearExerciseHistory();
    }
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <button className="btn btn-secondary btn-back" onClick={onBack}>
          {t.back}
        </button>
        <h1 className="screen-title">{t.settingsTitle}</h1>
      </div>

      <div className="screen-content">
        <div className="settings-section">
          <h2 className="settings-section-title">{t.appearance}</h2>

          <div className="setting-row">
            <div>
              <div className="setting-label">{t.language}</div>
            </div>
            <div className="setting-control">
              <select
                className="language-select"
                value={settings.language}
                onChange={handleLanguageChange}
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>

          <div className="setting-row">
            <div>
              <div className="setting-label">{t.darkMode}</div>
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
              <div className="setting-label">{t.pointSize}</div>
              <div className="setting-value">{settings.pointSize} {t.px}</div>
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
          <h2 className="settings-section-title">{t.game}</h2>

          <div className="setting-row">
            <div>
              <div className="setting-label">{t.enableTimer}</div>
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
                <div className="setting-label">{t.exerciseDuration}</div>
                <div className="setting-value">{settings.exerciseDuration} {t.seconds}</div>
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
              <div className="setting-label">{t.maxAngleDelta}</div>
              <div className="setting-value">{radToDeg(settings.maxAngleDelta)}{t.degree}</div>
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
              <div className="setting-label">{t.screenMargin}</div>
              <div className="setting-value">{settings.marginPercent}{t.percent}</div>
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
          <h2 className="settings-section-title">{t.adaptiveLearning}</h2>

          <div className="setting-row">
            <div>
              <div className="setting-label">{t.sigmaPosition}</div>
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
              <div className="setting-label">{t.sigmaRatio}</div>
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
              <div className="setting-label">{t.sigmaAngle}</div>
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
              <div className="setting-label">{t.learningRate}</div>
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
            {t.resetSettings}
          </button>
          <button className="btn btn-secondary" onClick={handleResetGradients}>
            {t.resetLearning}
          </button>
          <button className="btn btn-danger" onClick={handleClearHistory}>
            {t.clearHistory}
          </button>
        </div>
      </div>
    </div>
  );
}
