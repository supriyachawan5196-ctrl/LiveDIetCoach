import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ChevronRight, Check, AlertCircle } from 'lucide-react';

interface Props {
  initialProfile: UserProfile;
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<Props> = ({ initialProfile, onComplete }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<UserProfile>(initialProfile);
  const [error, setError] = useState<string | null>(null);

  const updateField = (key: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (error) setError(null);
  };

  const nextStep = () => {
    setError(null);
    setStep(prev => prev + 1);
  };

  const validateStep = () => {
    switch (step) {
        case 1: // Basic Profile
            if (!formData.name || !formData.age || !formData.gender || 
                !formData.currentWeight || !formData.targetWeight || 
                !formData.height || !formData.activityLevel) {
                setError("Please fill in all fields.");
                return false;
            }
            return true;
        case 2: // Routine
            if (!formData.wakeTime || !formData.breakfastTime || !formData.lunchTime || 
                !formData.dinnerTime || !formData.sleepTime) {
                setError("Please set all required times.");
                return false;
            }
            // Basic validation for logical order
            // (Simplified for UX, can be stricter if needed)
            return true;
        case 3: // Water
            if (!formData.waterGoal) {
                setError("Please enter a water goal.");
                return false;
            }
            return true;
        case 4: // Health
            if (!formData.medicalConditions || formData.medicalConditions.length === 0) {
                setError("Please select at least one option (or None).");
                return false;
            }
            if (formData.medicalConditions.includes('Other') && !formData.otherHealthIssues) {
                setError("Please specify your 'Other' health issues.");
                return false;
            }
            return true;
        case 5: // Diet
            if (!formData.dietaryPreference) {
                setError("Please select a dietary preference.");
                return false;
            }
            return true;
        default:
            return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
        nextStep();
    }
  };

  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-6">
      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-4xl">
        🩺
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">HostDiet Coach</h1>
        <p className="text-gray-600">Strict but caring professional nutrition & health coaching.</p>
      </div>
      <button 
        onClick={nextStep}
        className="w-full max-w-xs bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2"
      >
        Start Setup <ChevronRight size={18} />
      </button>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">1. Basic Profile</h2>
      <div className="space-y-3">
        <input 
          type="text" 
          placeholder="Name (What should I call you?)"
          value={formData.name} 
          onChange={e => updateField('name', e.target.value)}
          className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
        />
        <div className="grid grid-cols-2 gap-3">
            <input 
              type="number" 
              placeholder="Age"
              value={formData.age || ''} 
              onChange={e => updateField('age', parseInt(e.target.value))}
              className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
            />
            <select 
                value={formData.gender || ''}
                onChange={e => updateField('gender', e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
                <option value="" disabled>Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <input 
              type="number" 
              placeholder="Height (cm)"
              value={formData.height || ''} 
              onChange={e => updateField('height', parseInt(e.target.value))}
              className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
            />
            <div className="hidden"></div> 
        </div>
        <div className="grid grid-cols-2 gap-3">
            <input 
              type="number" 
              placeholder="Current Weight (kg)"
              value={formData.currentWeight || ''} 
              onChange={e => updateField('currentWeight', parseInt(e.target.value))}
              className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
            />
            <input 
              type="number" 
              placeholder="Target Weight (kg)"
              value={formData.targetWeight || ''} 
              onChange={e => updateField('targetWeight', parseInt(e.target.value))}
              className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
            />
        </div>
        <div>
            <label className="text-sm text-gray-500 mb-1 block">Activity Level</label>
            <div className="grid grid-cols-2 gap-2">
                {['Very low', 'Low', 'Moderate', 'High'].map(opt => (
                    <button
                        key={opt}
                        onClick={() => updateField('activityLevel', opt)}
                        className={`p-2 rounded border text-sm ${formData.activityLevel === opt ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200'}`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">2. Daily Routine</h2>
      <p className="text-sm text-gray-500">Please enter exact times.</p>
      
      <div className="space-y-3">
         {[
            { label: 'Wake Up', key: 'wakeTime' },
            { label: 'Breakfast', key: 'breakfastTime' },
            { label: 'Lunch', key: 'lunchTime' },
            { label: 'Evening Snack (Optional)', key: 'snackTime' },
            { label: 'Dinner', key: 'dinnerTime' },
            { label: 'Sleep', key: 'sleepTime' },
         ].map(field => (
            <div key={field.key} className="flex items-center justify-between">
                <label className="text-sm text-gray-600 w-1/3">{field.label}</label>
                <input 
                    type="time" 
                    value={(formData[field.key as keyof UserProfile] as string) || ''}
                    onChange={e => updateField(field.key as keyof UserProfile, e.target.value)}
                    className="w-2/3 p-2 bg-gray-50 rounded border border-gray-200"
                />
            </div>
         ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">3. Water Goal</h2>
      <div>
        <label className="block text-sm text-gray-500 mb-2">How much water do you want to drink daily?</label>
        <input 
            type="text" 
            placeholder="e.g. 8 glasses or 3 liters"
            value={formData.waterGoal || ''}
            onChange={e => updateField('waterGoal', e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
        />
        <div className="flex gap-2 mt-2">
            {['8 glasses', '10 glasses', '2 liters', '3 liters'].map(s => (
                <button 
                    key={s} 
                    onClick={() => updateField('waterGoal', s)}
                    className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                >
                    {s}
                </button>
            ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const conditions = [
        'PCOS / PCOD', 'Thyroid', 'Diabetes / Prediabetes', 
        'High blood pressure', 'High cholesterol', 'Joint pain / Knee pain',
        'Acidity / GERD', 'Gut issues / IBS / Constipation', 'Obesity / Overweight',
        'None', 'Other'
    ];

    const toggle = (cond: string) => {
        let current = formData.medicalConditions || [];
        if (cond === 'None') {
            current = ['None'];
        } else {
            current = current.filter(c => c !== 'None'); // Remove None if adding others
            if (current.includes(cond)) {
                current = current.filter(c => c !== cond);
            } else {
                current = [...current, cond];
            }
        }
        updateField('medicalConditions', current);
    };

    return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">4. Health Issues</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {conditions.map(cond => {
                const isSelected = (formData.medicalConditions || []).includes(cond);
                return (
                    <button 
                        key={cond}
                        onClick={() => toggle(cond)}
                        className={`w-full p-3 rounded-lg border text-left flex justify-between items-center ${isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white'}`}
                    >
                        {cond}
                        {isSelected && <Check size={16} />}
                    </button>
                );
            })}
          </div>
          {(formData.medicalConditions || []).includes('Other') && (
            <textarea
                placeholder="Please type your other health issue(s) in detail."
                value={formData.otherHealthIssues || ''}
                onChange={e => updateField('otherHealthIssues', e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm"
                rows={3}
            />
          )}
        </div>
    );
  };

  const renderStep5 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">5. Dietary Preference</h2>
      
      <div>
        <label className="block text-sm text-gray-500 mb-2">Preference</label>
        <div className="grid grid-cols-2 gap-2">
            {['Veg', 'Non-veg', 'Eggetarian', 'Vegan', 'Jain'].map(opt => (
                <button 
                    key={opt}
                    onClick={() => updateField('dietaryPreference', opt)}
                    className={`p-3 rounded-lg border ${formData.dietaryPreference === opt ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white'}`}
                >
                    {opt}
                </button>
            ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-500 mb-2 mt-4">Allergies / Avoid (Optional)</label>
        <textarea
            placeholder="e.g. Peanuts, Gluten, Dairy..."
            value={formData.allergies || ''}
            onChange={e => updateField('allergies', e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
            rows={2}
        />
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">6. Confirm Details</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm text-gray-700">
        <p><strong>Name:</strong> {formData.name}</p>
        <p><strong>Goal:</strong> {formData.currentWeight}kg → {formData.targetWeight}kg</p>
        <p><strong>Routine:</strong> Wake {formData.wakeTime}, Sleep {formData.sleepTime}</p>
        <p><strong>Water:</strong> {formData.waterGoal}</p>
        <p><strong>Health:</strong> {formData.medicalConditions?.join(', ')}</p>
      </div>

      <div className="text-center">
        <p className="text-gray-600 mb-4">Do you want me to set reminders based on these times?</p>
        <button 
            onClick={() => onComplete({...formData, isOnboardingComplete: true})}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition"
        >
            Yes, Set Reminders
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white">
        {step > 0 && (
            <div className="px-6 pt-6">
                <div className="h-1 bg-gray-100 rounded-full w-full mb-6">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{width: `${(step/6)*100}%`}}></div>
                </div>
            </div>
        )}
        
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
            {step === 0 && renderWelcome()}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
            {step === 6 && renderConfirmation()}

            {step > 0 && step < 6 && (
                <>
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 mt-4">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    <button 
                        onClick={handleNext}
                        className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium mt-6 hover:bg-emerald-700 transition"
                    >
                        Next
                    </button>
                </>
            )}
        </div>
    </div>
  );
};
