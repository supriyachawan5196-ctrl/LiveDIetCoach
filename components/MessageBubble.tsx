import React from 'react';
import { Message } from '../types';
import { User, Bot } from 'lucide-react';

interface Props {
  message: Message;
}

export const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';

  // Basic formatter for bullet points and bold text if markdown isn't used
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold
      const boldParts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={i} className={`${line.trim().startsWith('•') || line.trim().startsWith('-') ? 'pl-4' : ''} min-h-[1.2em]`}>
            {boldParts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j}>{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </div>
      );
    });
  };

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-500' : 'bg-emerald-600'} text-white shadow-sm`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Bubble */}
        <div className={`
          relative px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed
          ${isUser 
            ? 'bg-indigo-600 text-white rounded-tr-none' 
            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
          }
        `}>
          {message.image && (
            <div className="mb-3 rounded-lg overflow-hidden max-w-full">
              <img src={message.image} alt="User upload" className="w-full h-auto object-cover max-h-64" />
            </div>
          )}
          
          <div className="whitespace-pre-wrap font-sans">
            {formatText(message.text)}
          </div>

          <div className={`text-[10px] mt-1 text-right opacity-70 ${isUser ? 'text-indigo-100' : 'text-gray-400'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};
