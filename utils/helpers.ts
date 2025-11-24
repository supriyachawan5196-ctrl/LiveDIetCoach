import { DailyStats } from '../types';

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const getTodayDateString = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

export const getTimeString = () => {
  const date = new Date();
  // Force 24-hour format HH:MM for consistent comparison with input type="time"
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
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

// Simple parser for custom tags [[TAG: VALUE]]
export const parseAIResponseTags = (text: string) => {
  const addCaloriesRegex = /\[\[ADD:\s*(\d+)\]\]/i;
  const setTargetRegex = /\[\[TARGET:\s*(\d+)\]\]/i;
  const addWaterRegex = /\[\[WATER:\s*(\d+)\]\]/i;
  const buttonsRegex = /\[\[BUTTONS:\s*(.*?)\]\]/i;
  const generateImageRegex = /\[\[GENERATE_IMAGE:\s*(.*?)\]\]/i;

  const addMatch = text.match(addCaloriesRegex);
  const targetMatch = text.match(setTargetRegex);
  const waterMatch = text.match(addWaterRegex);
  const buttonsMatch = text.match(buttonsRegex);
  const imageMatch = text.match(generateImageRegex);

  let buttons: string[] = [];
  if (buttonsMatch && buttonsMatch[1]) {
    // Split by comma, trim whitespace
    buttons = buttonsMatch[1].split(',').map(b => b.trim()).filter(b => b.length > 0);
  }

  const cleanText = text
    .replace(addCaloriesRegex, '')
    .replace(setTargetRegex, '')
    .replace(addWaterRegex, '')
    .replace(buttonsRegex, '')
    .replace(generateImageRegex, '')
    .trim();

  return {
    cleanText,
    caloriesToAdd: addMatch ? parseInt(addMatch[1], 10) : null,
    newTarget: targetMatch ? parseInt(targetMatch[1], 10) : null,
    waterToAdd: waterMatch ? parseInt(waterMatch[1], 10) : null,
    buttons,
    imagePrompt: imageMatch ? imageMatch[1] : null
  };
};

export const getInitialDailyStats = (): DailyStats => ({
  date: getTodayDateString(),
  caloriesConsumed: 0,
  waterIntake: 0,
  lastWaterTime: undefined,
  lastWaterReminderTime: undefined,
  meals: [],
  remindersSent: {
    wake: false,
    breakfast: false,
    lunch: false,
    snack: false,
    dinner: false,
    sleep: false
  }
});

// Calculate minutes difference between two ISO strings or current time
export const minutesSince = (isoString?: string): number => {
  if (!isoString) return 9999; // Infinite if never happened
  const past = new Date(isoString).getTime();
  const now = new Date().getTime();
  return (now - past) / (1000 * 60);
};

// Check if current time matches scheduled time (within 15 min window)
export const checkTimeMatch = (currentTimeStr: string, scheduledTimeStr?: string): boolean => {
  if (!scheduledTimeStr) return false;
  
  // Convert HH:MM strings to minutes from midnight
  const [currH, currM] = currentTimeStr.split(':').map(Number);
  const [schH, schM] = scheduledTimeStr.split(':').map(Number);
  
  const currTotal = currH * 60 + currM;
  const schTotal = schH * 60 + schM;

  // Trigger if current time is equal or up to 15 mins after scheduled time
  const diff = currTotal - schTotal;
  return diff >= 0 && diff <= 15;
};