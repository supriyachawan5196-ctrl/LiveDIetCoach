export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string
  timestamp: Date;
}

export interface UserProfile {
  name: string;
  age?: number;
  height?: number; // cm
  currentWeight?: number; // kg
  targetWeight?: number; // kg
  activityLevel?: string;
  dailyCalorieTarget: number; // Default 1500 if unknown
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  caloriesConsumed: number;
  waterIntake?: number; // ml
  meals: MealLog[];
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