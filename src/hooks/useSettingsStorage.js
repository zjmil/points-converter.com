import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useSettingsStorage = (onCustomDollarValuesChange, onMultiStepEnabledChange) => {
  const [storedSettings, setStoredSettings] = useLocalStorage('points-converter-settings', {
    customDollarValues: {},
    multiStepEnabled: false
  });

  // Initialize from localStorage on mount
  useEffect(() => {
    if (storedSettings.customDollarValues && Object.keys(storedSettings.customDollarValues).length > 0) {
      onCustomDollarValuesChange(storedSettings.customDollarValues);
    }
    if (onMultiStepEnabledChange) {
      onMultiStepEnabledChange(storedSettings.multiStepEnabled);
    }
  }, [onCustomDollarValuesChange, onMultiStepEnabledChange, storedSettings]);

  const updateCustomDollarValues = (newCustomValues) => {
    onCustomDollarValuesChange(newCustomValues);
    setStoredSettings(prev => ({ ...prev, customDollarValues: newCustomValues }));
  };

  const updateMultiStepEnabled = (enabled) => {
    setStoredSettings(prev => ({ ...prev, multiStepEnabled: enabled }));
    onMultiStepEnabledChange(enabled);
  };

  const resetAllToDefaults = () => {
    const emptyValues = {};
    onCustomDollarValuesChange(emptyValues);
    setStoredSettings(prev => ({ ...prev, customDollarValues: emptyValues }));
  };

  return {
    storedSettings,
    updateCustomDollarValues,
    updateMultiStepEnabled,
    resetAllToDefaults
  };
};