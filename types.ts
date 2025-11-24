export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string
  timestamp: Date;
}

export interface UserProfile {
  name: string;
  isOnboardingComplete: boolean;

  // Step 1: Basic Profile
  age?: number;
  gender?: 'Male' | 'Female' | 'Other'; 
  height?: number; // cm
  currentWeight?: number; // kg
  targetWeight?: number; // kg
  activityLevel?: 'Very low' | 'Low' | 'Moderate' | 'High';

  // Step 2: Routine
  wakeTime?: string;
  breakfastTime?: string;
  lunchTime?: string;
  snackTime?: string; // Optional evening snack
  dinnerTime?: string;
  sleepTime?: string;

  // Step 3: Water
  waterGoal?: string; // "8 glasses" or "3 liters"

  // Step 4: Health
  medicalConditions?: string[]; // Specific list from prompt
  otherHealthIssues?: string; // Text details if 'Other' selected

  // Step 5: Diet
  dietaryPreference?: string; // Veg, Non-veg, etc.
  allergies?: string;

  dailyCalorieTarget: number; // Calculated
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  caloriesConsumed: number;
  waterIntake: number; // ml or count
  lastWaterTime?: string; // ISO String
  lastWaterReminderTime?: string; // ISO String for bot reminder cooldown
  meals: MealLog[];
  remindersSent: {
    wake: boolean;
    breakfast: boolean;
    lunch: boolean;
    snack: boolean;
    dinner: boolean;
    sleep: boolean;
  };
}

export interface MealLog {
  id: string;
  time: string;
  description: string;
  calories: number;
}

export interface AppState {
  profile: UserProfile;
  stats: DailyStats;
}
