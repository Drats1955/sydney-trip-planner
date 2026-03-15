import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../utils/cn';
import { User, Bot, Volume2, RefreshCw } from 'lucide-react';
import { generateSpeech } from '../services/gemini';
import { playAudio } from '../utils/audio';

interface MessageProps {
  role: 'user' | 'model';
  content: string;
  image?: string;
  language?: string;
  isGreetingPlaying?: boolean;
}

export function Message({ role, content, image, language = 'en', isGreetingPlaying = false }: MessageProps) {
  const isUser = role === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleListen = async () => {
    if (isSpeaking || isGreetingPlaying) return;
    setIsSpeaking(true);
    try {
      const audioData = await generateSpeech(content, language);
      if (audioData) {
        await playAudio(audioData.data, audioData.mimeType);
        setIsSpeaking(false);
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error("Failed to play audio:", error);
      setIsSpeaking(false);
    }
  };

  return (
    <div className={cn(
      "flex w-full gap-3 mb-6",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isUser ? "bg-zinc-800 text-white" : "bg-emerald-100 text-emerald-700"
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className={cn(
        "max-w-[85%] flex flex-col gap-2",
        isUser ? "items-end" : "items-start"
      )}>
        {image && (
          <div className="rounded-2xl overflow-hidden border border-zinc-200 shadow-sm max-w-[240px]">
            <img src={image} alt="Uploaded" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
          </div>
        )}
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser 
            ? "bg-zinc-800 text-white rounded-tr-none" 
            : "bg-white border border-zinc-100 text-zinc-800 rounded-tl-none shadow-sm"
        )}>
          <div className="prose prose-sm max-w-none prose-zinc dark:prose-invert">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          {!isUser && (
            <button 
              onClick={handleListen}
              disabled={isSpeaking || isGreetingPlaying}
              className={cn(
                "mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                (isSpeaking || isGreetingPlaying) ? "text-emerald-500" : "text-zinc-400 hover:text-emerald-600"
              )}
            >
              {isGreetingPlaying ? (
                <>
                  <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  Welcome playing...
                </>
              ) : isSpeaking ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  Speaking...
                </>
              ) : (
                <>
                  <Volume2 size={12} />
                  Listen to Directions
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
