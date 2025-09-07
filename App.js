import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { enableScreens } from 'react-native-screens';
import Navigator from './src/navigation/Navigator';
import { UserPreferences } from './src/context/UserPreferences';
import { WatchlistProvider } from './src/context/WatchlistContext';
import AppInitializationService from './src/services/AppInitializationService';

// Enable screens for better navigation performance
enableScreens();

export default function App() {
  useEffect(() => {
    // Initialize app services on startup
    AppInitializationService.initialize();

    // Handle app state changes for cache management
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background') {
        AppInitializationService.handleAppBackground();
      } else if (nextAppState === 'active') {
        AppInitializationService.handleAppForeground();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <UserPreferences>
      <WatchlistProvider>
        <Navigator />
      </WatchlistProvider>
    </UserPreferences>
  );
}