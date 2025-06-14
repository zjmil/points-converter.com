import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useMultiStepSettings = (onMultiStepEnabledChange) => {
  const [storedSettings, setStoredSettings] = useLocalStorage('points-converter-settings', {
    customDollarValues: {},
    multiStepEnabled: false
  });

  // Initialize from localStorage on mount
  useEffect(() => {
    if (onMultiStepEnabledChange) {
      onMultiStepEnabledChange(storedSettings.multiStepEnabled);
    }
  }, [onMultiStepEnabledChange, storedSettings.multiStepEnabled]);

  const updateMultiStepEnabled = (enabled) => {
    setStoredSettings(prev => ({ ...prev, multiStepEnabled: enabled }));
    if (onMultiStepEnabledChange) {
      onMultiStepEnabledChange(enabled);
    }
  };

  return {
    multiStepEnabled: storedSettings.multiStepEnabled,
    updateMultiStepEnabled
  };
};