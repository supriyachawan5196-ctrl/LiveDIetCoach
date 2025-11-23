import React from 'react';
import { DailyStats, UserProfile } from '../types';
import { Utensils, Flame, Target } from 'lucide-react';

interface Props {
  stats: DailyStats;
  profile: UserProfile;
}

export const Dashboard: React.FC<Props> = ({ stats, profile }) => {
  const percentage = Math.min(100, Math.round((stats.caloriesConsumed / profile.dailyCalorieTarget) * 100));
  const remaining = Math.max(0, profile.dailyCalorieTarget - stats.caloriesConsumed);
  
  // Color logic for progress bar
  let barColor = 'bg-emerald-500';
  if (percentage > 90) barColor = 'bg-yellow-500';
  if (percentage >= 100) barColor = 'bg-red-500';

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
            <div>
                <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    Supriya’s Diet Coach <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">AI</span>
                </h1>
                <p className="text-xs text-gray-500">Goal: {profile.dailyCalorieTarget} kcal/day</p>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold text-gray-800 leading-none">{remaining}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Remaining</p>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
                className={`h-full transition-all duration-700 ease-out ${barColor}`} 
                style={{ width: `${percentage}%` }}
            ></div>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-600 mix-blend-multiply">
                {stats.caloriesConsumed} / {profile.dailyCalorieTarget} kcal
            </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
             <div className="bg-orange-50 p-2 rounded-lg">
                <div className="flex justify-center text-orange-500 mb-1"><Flame size={16} /></div>
                <div className="text-xs text-gray-500">Burned</div>
                <div className="font-semibold text-gray-700 text-sm">--</div>
             </div>
             <div className="bg-blue-50 p-2 rounded-lg">
                <div className="flex justify-center text-blue-500 mb-1"><Utensils size={16} /></div>
                <div className="text-xs text-gray-500">Meals</div>
                <div className="font-semibold text-gray-700 text-sm">{stats.meals.length}</div>
             </div>
             <div className="bg-purple-50 p-2 rounded-lg">
                <div className="flex justify-center text-purple-500 mb-1"><Target size={16} /></div>
                <div className="text-xs text-gray-500">Weight</div>
                <div className="font-semibold text-gray-700 text-sm">{profile.currentWeight || '--'} kg</div>
             </div>
        </div>
      </div>
    </div>
  );
};
