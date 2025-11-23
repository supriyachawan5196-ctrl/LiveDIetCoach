import React, { useState, useEffect, useRef } from 'react';
import { Message, UserProfile, DailyStats, MealLog } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { generateId, getTodayDateString, getInitialDailyStats, getTimeString, parseAIResponseTags } from './utils/helpers';
import { ChatInput } from './components/ChatInput';
import { MessageBubble } from './components/MessageBubble';
import { Dashboard } from './components/Dashboard';

const DEFAULT_PROFILE: UserProfile = {
  name: "Supriya",
  dailyCalorieTarget: 1500, // Default start
};

const WELCOME_MESSAGE: Message = {
  id: 'init-1',
  role: 'model',
  text: "Namaste Supriya! 🙏 I am your personal diet coach.\n\nLet's start your healthy journey today. To help you better, could you tell me your **Age, Height, and Current Weight**?",
  timestamp: new Date()
};

const App: React.FC = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [dailyStats, setDailyStats] = useState<DailyStats>(getInitialDailyStats());
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load from LocalStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('supriya_profile');
    const savedStats = localStorage.getItem('supriya_stats');
    const savedMessages = localStorage.getItem('supriya_messages');

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    
    // Handle daily stats reset if new day
    if (savedStats) {
      const parsedStats: DailyStats = JSON.parse(savedStats);
      if (parsedStats.date === getTodayDateString()) {
        setDailyStats(parsedStats);
      } else {
        setDailyStats(getInitialDailyStats());
      }
    }

    if (savedMessages) {
        // Hydrate dates back from strings
        const parsedMsgs = JSON.parse(savedMessages).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
        }));
        setMessages(parsedMsgs);
    } else {
        setMessages([WELCOME_MESSAGE]);
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

  const handleSendMessage = async (text: string, image?: string) => {
    // 1. Add User Message
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

    // 2. Call Gemini
    const aiResponseRaw = await sendMessageToGemini(newMessages, profile, dailyStats);

    // 3. Parse Response for Hidden Tags
    const { cleanText, caloriesToAdd, newTarget } = parseAIResponseTags(aiResponseRaw);

    // 4. Update Stats if needed
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
                    description: text.length > 30 ? "Meal/Snack" : text, // Simple description logic
                    calories: caloriesToAdd
                }
            ]
        }));
    }

    // 5. Add Model Message
    const modelMsg: Message = {
      id: generateId(),
      role: 'model',
      text: cleanText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-gray-50 shadow-2xl overflow-hidden md:border-x border-gray-200">
      
      {/* Top Dashboard */}
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
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;
