import React, { useState, useEffect, useRef } from 'react';
import { Message, UserProfile, DailyStats } from './types';
import { sendMessageToGemini, generateImage } from './services/geminiService';
import { generateId, getTodayDateString, getInitialDailyStats, getTimeString, parseAIResponseTags, checkTimeMatch, minutesSince } from './utils/helpers';
import { ChatInput } from './components/ChatInput';
import { MessageBubble } from './components/MessageBubble';
import { Dashboard } from './components/Dashboard';
import { Onboarding } from './components/Onboarding';

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  dailyCalorieTarget: 1500,
  isOnboardingComplete: false,
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [dailyStats, setDailyStats] = useState<DailyStats>(getInitialDailyStats());
  const [isLoading, setIsLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load from LocalStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('supriya_profile');
    const savedStats = localStorage.getItem('supriya_stats');
    const savedMessages = localStorage.getItem('supriya_messages');

    if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
    }
    
    if (savedStats) {
      const parsedStats: DailyStats = JSON.parse(savedStats);
      if (parsedStats.date === getTodayDateString()) {
        setDailyStats(parsedStats);
      } else {
        setDailyStats(getInitialDailyStats());
      }
    }

    if (savedMessages) {
        const parsedMsgs = JSON.parse(savedMessages).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
        }));
        setMessages(parsedMsgs);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('supriya_profile', JSON.stringify(profile));
    localStorage.setItem('supriya_stats', JSON.stringify(dailyStats));
    localStorage.setItem('supriya_messages', JSON.stringify(messages));
  }, [profile, dailyStats, messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // --- SMART REMINDER SYSTEM ---
  useEffect(() => {
    if (!profile.isOnboardingComplete) return;

    const checkReminders = () => {
        const nowStr = getTimeString(); // HH:MM (24h)
        const newStats = { ...dailyStats };
        let reminderTriggered = false;
        let newMessage: Message | null = null;
        let newQuickReplies: string[] = [];

        // 1. WAKE-UP
        if (checkTimeMatch(nowStr, profile.wakeTime) && !dailyStats.remindersSent.wake) {
            newMessage = {
                id: generateId(),
                role: 'model',
                text: "Good morning ☀️ — new day, new consistency. Have a glass of water.",
                timestamp: new Date()
            };
            newStats.remindersSent.wake = true;
            reminderTriggered = true;
        }

        // 2. BREAKFAST
        else if (checkTimeMatch(nowStr, profile.breakfastTime) && !dailyStats.remindersSent.breakfast) {
            newMessage = {
                id: generateId(),
                role: 'model',
                text: "Hey, it’s breakfast time. Have you eaten?",
                timestamp: new Date()
            };
            newQuickReplies = ['Yes', 'Not yet'];
            newStats.remindersSent.breakfast = true;
            reminderTriggered = true;
        }

        // 3. LUNCH
        else if (checkTimeMatch(nowStr, profile.lunchTime) && !dailyStats.remindersSent.lunch) {
            newMessage = {
                id: generateId(),
                role: 'model',
                text: "Hey, it’s lunchtime. Have you had your lunch?",
                timestamp: new Date()
            };
            newQuickReplies = ['Yes', 'Not yet'];
            newStats.remindersSent.lunch = true;
            reminderTriggered = true;
        }

        // 4. SNACK (Optional)
        else if (profile.snackTime && checkTimeMatch(nowStr, profile.snackTime) && !dailyStats.remindersSent.snack) {
            newMessage = {
                id: generateId(),
                role: 'model',
                text: "It's your snack window. Choose something light and healthy.",
                timestamp: new Date()
            };
            newQuickReplies = ['Yes, I ate', 'Not yet'];
            newStats.remindersSent.snack = true;
            reminderTriggered = true;
        }

        // 5. DINNER
        else if (checkTimeMatch(nowStr, profile.dinnerTime) && !dailyStats.remindersSent.dinner) {
            newMessage = {
                id: generateId(),
                role: 'model',
                text: "Hey, it’s dinner time. Have you had your dinner?",
                timestamp: new Date()
            };
            newQuickReplies = ['Yes', 'Not yet'];
            newStats.remindersSent.dinner = true;
            reminderTriggered = true;
        }

        // 6. SLEEP
        else if (checkTimeMatch(nowStr, profile.sleepTime) && !dailyStats.remindersSent.sleep) {
            newMessage = {
                id: generateId(),
                role: 'model',
                text: "Day complete 🌙 Good night. Tomorrow we continue strong.",
                timestamp: new Date()
            };
            newStats.remindersSent.sleep = true;
            reminderTriggered = true;
        }

        // 7. WATER LOGIC
        // Only if awake (after wake, before sleep)
        // Interval: > 90 mins since last intake AND > 60 mins since last reminder
        else {
             // Simple "is awake" check: current time is generally between wake and sleep
             // This simple comparison works if wake < sleep (not night shift). 
             // For robustness we rely on user activity mainly, but here we assume day shift for simplicity or check gaps.
             const minsSinceWater = minutesSince(dailyStats.lastWaterTime);
             const minsSinceReminder = minutesSince(dailyStats.lastWaterReminderTime);
             
             if (minsSinceWater >= 90 && minsSinceReminder >= 60) {
                 // Check if we are roughly in day time (simple heuristic or complex time compare)
                 // Here we just prevent spam.
                 newMessage = {
                    id: generateId(),
                    role: 'model',
                    text: "Hydration check 💧 — sip some water?",
                    timestamp: new Date()
                 };
                 newQuickReplies = ['Yes', 'Not yet'];
                 newStats.lastWaterReminderTime = new Date().toISOString();
                 reminderTriggered = true;
             }
        }

        if (reminderTriggered && newMessage) {
            setMessages(prev => [...prev, newMessage!]);
            setDailyStats(newStats);
            if (newQuickReplies.length > 0) {
                setQuickReplies(newQuickReplies);
            }
            
            // Optional: browser notification
            if (Notification.permission === 'granted') {
                new Notification("Live Diet Coach", { body: newMessage.text });
            }
        }
    };

    // Check every 30 seconds
    const intervalId = setInterval(checkReminders, 30000);
    return () => clearInterval(intervalId);
  }, [profile, dailyStats]);

  // Request notification permission on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
  }, []);

  const handleSendMessage = async (text: string, image?: string) => {
    // Clear quick replies when user acts
    setQuickReplies([]);

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      text,
      image,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    // Call Gemini
    const aiResponseRaw = await sendMessageToGemini(newMessages, profile, dailyStats);

    // Parse Response
    const { cleanText, caloriesToAdd, newTarget, waterToAdd, buttons, imagePrompt } = parseAIResponseTags(aiResponseRaw);

    // Update Stats
    if (newTarget) {
      setProfile(prev => ({ ...prev, dailyCalorieTarget: newTarget }));
    }

    if (caloriesToAdd) {
        setDailyStats(prev => ({
            ...prev,
            caloriesConsumed: prev.caloriesConsumed + caloriesToAdd,
            meals: [
                ...prev.meals,
                {
                    id: generateId(),
                    time: getTimeString(),
                    description: text.length > 30 ? "Meal/Snack" : text,
                    calories: caloriesToAdd
                }
            ]
        }));
    }

    if (waterToAdd) {
        setDailyStats(prev => ({
            ...prev,
            waterIntake: (prev.waterIntake || 0) + waterToAdd,
            lastWaterTime: new Date().toISOString()
        }));
    }

    // Set quick replies if any
    let finalButtons = buttons;
    if (finalButtons && finalButtons.length > 0) {
        setQuickReplies(finalButtons);
    }

    // Generate Image if prompted
    let botImage = undefined;
    let finalText = cleanText;

    if (imagePrompt) {
        try {
            const generated = await generateImage(imagePrompt);
            if (generated) {
                botImage = generated;
            } else {
                // Rule 6: If image generation fails, prompt user instead of showing broken/text-only recipe
                finalText = "Image unavailable — would you still like the recipe?";
                finalButtons = ["Yes", "No"];
                setQuickReplies(finalButtons);
            }
        } catch (e) {
             console.error("Image gen failed in app flow", e);
             finalText = "Image unavailable — would you still like the recipe?";
             finalButtons = ["Yes", "No"];
             setQuickReplies(finalButtons);
        }
    }

    const modelMsg: Message = {
      id: generateId(),
      role: 'model',
      text: finalText,
      image: botImage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);
  };

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    // Calculate BMR using Mifflin-St Jeor
    let bmr = 1500;
    if (newProfile.currentWeight && newProfile.height && newProfile.age) {
        const s = newProfile.gender === 'Female' ? -161 : 5;
        bmr = (10 * newProfile.currentWeight) + (6.25 * newProfile.height) - (5 * newProfile.age) + s;
    }
    
    // Activity Multiplier
    const multipliers: {[key: string]: number} = { 
        'Very low': 1.2, 
        'Low': 1.375, 
        'Moderate': 1.55,
        'High': 1.725
    };
    const activityMult = multipliers[newProfile.activityLevel || 'Low'] || 1.375;
    const tdee = bmr * activityMult;
    
    // Deficit for weight loss (~300-500 kcal) or surplus for gain
    let target = Math.round(tdee);
    if (newProfile.targetWeight && newProfile.currentWeight) {
        if (newProfile.targetWeight < newProfile.currentWeight) {
            target = Math.max(1200, Math.round(tdee - 400));
        } else if (newProfile.targetWeight > newProfile.currentWeight) {
            target = Math.round(tdee + 250);
        }
    }

    const finalProfile = { ...newProfile, dailyCalorieTarget: target };
    setProfile(finalProfile);

    // Initiate first chat with HostDiet Coach persona
    const initialMsg: Message = {
        id: generateId(),
        role: 'model',
        text: `Setup complete ✅\n\nI have configured your reminders based on your routine.\n• **Calorie Target:** ${target} kcal\n• **Water Goal:** ${finalProfile.waterGoal}\n\nI will remind you when it's time for meals and water. You can also send me photos of your food anytime to log them.`,
        timestamp: new Date()
    };
    setMessages([initialMsg]);
    // NO manual buttons initially - wait for trigger
    setQuickReplies([]); 
  };

  if (!profile.isOnboardingComplete) {
    return <Onboarding initialProfile={profile} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-gray-50 shadow-2xl overflow-hidden md:border-x border-gray-200">
      
      {/* Top Dashboard (Passive Display) */}
      <Dashboard stats={dailyStats} profile={profile} />

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
           <div className="flex w-full mb-4 justify-start animate-pulse">
             <div className="flex items-end gap-2">
               <div className="w-8 h-8 rounded-full bg-emerald-600/50"></div>
               <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 text-gray-400 text-sm">
                 Thinking...
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading} 
        quickReplies={quickReplies}
        onQuickReplyClick={(reply) => handleSendMessage(reply)}
      />
    </div>
  );
};

export default App;