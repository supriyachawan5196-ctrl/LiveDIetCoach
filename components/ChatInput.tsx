import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { blobToBase64 } from '../utils/helpers';

interface Props {
  onSendMessage: (text: string, image?: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<Props> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if ((!text.trim() && !selectedImage) || isLoading) return;
    onSendMessage(text, selectedImage || undefined);
    setText('');
    setSelectedImage(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Simple client-side resize/compression could go here if needed
        const base64 = await blobToBase64(file);
        setSelectedImage(base64);
      } catch (err) {
        console.error("Error reading file", err);
      }
    }
    // Reset value so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  return (
    <div className="bg-white border-t border-gray-200 p-2 md:p-4 sticky bottom-0 w-full z-20 pb-safe">
      {/* Image Preview */}
      {selectedImage && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200 w-fit">
            <div className="relative h-16 w-16 rounded overflow-hidden">
                <img src={selectedImage} alt="Preview" className="h-full w-full object-cover" />
            </div>
            <button 
                onClick={() => setSelectedImage(null)}
                className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition"
            >
                <X size={14} className="text-gray-600" />
            </button>
        </div>
      )}

      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-gray-500 hover:text-emerald-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          title="Add photo"
          disabled={isLoading}
        >
          <ImageIcon size={24} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 max-h-32 bg-gray-100 text-gray-800 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none overflow-y-auto"
          rows={1}
          disabled={isLoading}
        />

        <button
          onClick={handleSend}
          disabled={isLoading || (!text.trim() && !selectedImage)}
          className={`p-3 rounded-full flex-shrink-0 transition-all shadow-md ${
            isLoading || (!text.trim() && !selectedImage)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 active:scale-95'
          }`}
        >
          {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
        </button>
      </div>
    </div>
  );
};
