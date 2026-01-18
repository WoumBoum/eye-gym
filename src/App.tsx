import { useState, useEffect } from 'react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { MenuScreen } from './components/screens/MenuScreen';
import { GameScreen } from './components/screens/GameScreen';
import { StatisticsScreen } from './components/screens/StatisticsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { ProfilesScreen } from './components/screens/ProfilesScreen';
import { Screen } from './types';
import './App.css';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const { settings } = useSettings();

  // Apply dark mode class to body
  useEffect(() => {
    if (settings.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [settings.darkMode]);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  switch (currentScreen) {
    case 'menu':
      return <MenuScreen onNavigate={navigateTo} />;
    case 'game':
      return <GameScreen onBack={() => navigateTo('menu')} />;
    case 'statistics':
      return <StatisticsScreen onBack={() => navigateTo('menu')} />;
    case 'settings':
      return <SettingsScreen onBack={() => navigateTo('menu')} />;
    case 'profiles':
      return <ProfilesScreen onBack={() => navigateTo('menu')} />;
    default:
      return <MenuScreen onNavigate={navigateTo} />;
  }
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
