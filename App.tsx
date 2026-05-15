import React, { useEffect } from 'react';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { GameProvider } from './src/contexts/GameContext';
import AppNavigator from './src/navigation/AppNavigator';
import { soundManager } from './src/utils/soundManager';

export default function App() {
  useEffect(() => {
    soundManager.init();
  }, []);

  return (
    <SettingsProvider>
      <GameProvider>
        <AppNavigator />
      </GameProvider>
    </SettingsProvider>
  );
}
