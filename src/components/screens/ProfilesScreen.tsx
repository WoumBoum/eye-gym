import { useState, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useTranslation } from '../../hooks/useTranslation';
import { getExplorationProgress } from '../../utils/storage';

interface ProfilesScreenProps {
  onBack: () => void;
}

export function ProfilesScreen({ onBack }: ProfilesScreenProps) {
  const {
    currentProfile,
    profiles,
    createNewProfile,
    switchProfile,
    deleteProfile,
    renameProfile,
    exportCurrentProfile,
    importProfile,
  } = useSettings();
  const { t } = useTranslation();

  const [newProfileName, setNewProfileName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      createNewProfile(newProfileName.trim());
      setNewProfileName('');
    }
  };

  const handleExport = () => {
    const json = exportCurrentProfile();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eye_gym_${currentProfile?.name || 'profile'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importProfile(content);
      if (!success) {
        alert(t.importError);
      }
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      renameProfile(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleDeleteProfile = (id: string, name: string) => {
    if (profiles.length <= 1) {
      alert(t.minProfileError);
      return;
    }
    if (confirm(t.deleteProfileConfirm.replace('{name}', name))) {
      deleteProfile(id);
    }
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <button className="btn btn-secondary btn-back" onClick={onBack}>
          {t.back}
        </button>
        <h1 className="screen-title">{t.profilesTitle}</h1>
      </div>

      <div className="screen-content">
        {/* Current profile info */}
        {currentProfile && (
          <div className="profile-current">
            <h2 className="settings-section-title">{t.activeProfile}</h2>
            <div className="profile-card active">
              <div className="profile-info">
                <div className="profile-name">{currentProfile.name}</div>
                <div className="profile-stats">
                  {currentProfile.history.length} {t.exercises}
                  {!currentProfile.exploration.explorationComplete && (
                    <span className="exploration-badge">
                      {t.exploration} {Math.round(getExplorationProgress(currentProfile.exploration).total * 100)}%
                    </span>
                  )}
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleExport}>
                {t.export}
              </button>
            </div>
          </div>
        )}

        {/* All profiles */}
        <div className="settings-section">
          <h2 className="settings-section-title">{t.allProfiles}</h2>

          {profiles.map(profile => (
            <div
              key={profile.id}
              className={`profile-card ${profile.id === currentProfile?.id ? 'active' : ''}`}
            >
              {editingId === profile.id ? (
                <div className="profile-edit">
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                    autoFocus
                  />
                  <button className="btn btn-primary" onClick={handleSaveEdit}>
                    OK
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="profile-info"
                    onClick={() => switchProfile(profile.id)}
                  >
                    <div className="profile-name">
                      {profile.name}
                      {profile.id === currentProfile?.id && <span className="current-badge">{t.active}</span>}
                    </div>
                    <div className="profile-stats">
                      {profile.history.length} {t.exercises}
                    </div>
                  </div>
                  <div className="profile-actions">
                    <button
                      className="btn-icon-small"
                      onClick={() => handleStartEdit(profile.id, profile.name)}
                      title={t.rename}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon-small"
                      onClick={() => handleDeleteProfile(profile.id, profile.name)}
                      title={t.delete}
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Create new profile */}
        <div className="settings-section">
          <h2 className="settings-section-title">{t.newProfile}</h2>
          <div className="new-profile-form">
            <input
              type="text"
              placeholder={t.profileNamePlaceholder}
              value={newProfileName}
              onChange={e => setNewProfileName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateProfile()}
            />
            <button
              className="btn btn-primary"
              onClick={handleCreateProfile}
              disabled={!newProfileName.trim()}
            >
              {t.create}
            </button>
          </div>
        </div>

        {/* Import */}
        <div className="settings-section">
          <h2 className="settings-section-title">{t.importSection}</h2>
          <button className="btn btn-secondary" onClick={handleImportClick}>
            {t.importProfile}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
        </div>
      </div>
    </div>
  );
}
