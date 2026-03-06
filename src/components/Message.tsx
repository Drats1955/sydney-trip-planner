import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../utils/cn';
import { User, Bot } from 'lucide-react';

interface MessageProps {
  role: 'user' | 'model';
  content: string;
  image?: string;
}

export function Message({ role, content, image }: MessageProps) {
  const isUser = role === 'user';

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
        </div>
      </div>
    </div>
  );
}
