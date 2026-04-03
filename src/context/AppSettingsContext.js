/**
 * AppSettingsContext - TheBetterLondon
 * Provides real-time admin-controlled app settings (maintenance mode,
 * announcement banner) to the entire component tree.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAppSettings } from '../services/appSettingsService';

const AppSettingsContext = createContext(null);

export const AppSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAppSettings((data) => {
      setSettings(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        loading,
        isMaintenanceMode: settings?.maintenanceMode?.enabled ?? false,
        maintenanceMessage: settings?.maintenanceMode?.message ?? '',
        announcement: settings?.announcement ?? null,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
};
