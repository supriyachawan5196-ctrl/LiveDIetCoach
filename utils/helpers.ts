import { DailyStats } from '../types';

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const getTodayDateString = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

export const getTimeString = () => {
  const date = new Date();
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix for Gemini API (it just wants the base64 data usually, 
        // but for <img src> we need the prefix. We will store with prefix for UI 
        // and strip it for API).
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const stripBase64Prefix = (base64WithPrefix: string): string => {
  return base64WithPrefix.split(',')[1] || base64WithPrefix;
};

// Simple parser for our custom tags [[TAG: VALUE]]
export const parseAIResponseTags = (text: string) => {
  const addCaloriesRegex = /\[\[ADD:\s*(\d+)\]\]/i;
  const setTargetRegex = /\[\[TARGET:\s*(\d+)\]\]/i;

  const addMatch = text.match(addCaloriesRegex);
  const targetMatch = text.match(setTargetRegex);

  const cleanText = text
    .replace(addCaloriesRegex, '')
    .replace(setTargetRegex, '')
    .trim();

  return {
    cleanText,
    caloriesToAdd: addMatch ? parseInt(addMatch[1], 10) : null,
    newTarget: targetMatch ? parseInt(targetMatch[1], 10) : null,
  };
};

export const getInitialDailyStats = (): DailyStats => ({
  date: getTodayDateString(),
  caloriesConsumed: 0,
  waterIntake: 0,
  meals: []
});