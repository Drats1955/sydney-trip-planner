import React, { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Info, Train, Bus, Navigation, RefreshCw, Image as ImageIcon, X, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message } from './components/Message';
import { InstallPrompt } from './components/InstallPrompt';
import { DiscoveryMode } from './components/DiscoveryMode';
import { useLanguage } from './hooks/useLanguage';
import { getChatResponse, generateGreetingAudio } from './services/gemini';
import { cn } from './utils/cn';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  image?: string;
}

export default function App() {
  const { language, greeting } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [hasPlayedGreeting, setHasPlayedGreeting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string, preview: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (greeting) {
      setMessages([{ role: 'model', content: greeting }]);
    }
  }, [greeting]);

  useEffect(() => {
    if (language && !hasPlayedGreeting) {
      const playGreeting = async () => {
        try {
          const audioBase64 = await generateGreetingAudio(language);
          if (audioBase64) {
            const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
            await audio.play();
            setHasPlayedGreeting(true);
          }
        } catch (error) {
          console.warn("Audio greeting autoplay blocked or failed:", error);
        }
      };
      playGreeting();
    }
  }, [language, hasPlayedGreeting]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setSelectedImage({
        data: base64String,
        mimeType: file.type,
        preview: URL.createObjectURL(file)
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (text?: string) => {
    const userMessage = text || input.trim();
    if ((!userMessage && !selectedImage) || isLoading) return;

    const currentImage = selectedImage;
    setInput('');
    setSelectedImage(null);
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage || (currentImage ? "Analyzed image" : ""), 
      image: currentImage?.preview 
    }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => {
        const parts: any[] = [{ text: m.content }];
        return { role: m.role, parts };
      });
      
      const response = await getChatResponse(
        userMessage || "Please analyze this image and tell me about the transport options for this location or brochure.", 
        history, 
        language, 
        currentImage ? { data: currentImage.data, mimeType: currentImage.mimeType } : undefined
      );
      
      setMessages(prev => [...prev, { role: 'model', content: response || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting to the transport network. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { icon: <Compass size={18} />, label: "Not Sure?", action: () => setShowDiscovery(true) },
    { icon: <ImageIcon size={18} />, label: "Take Photo or Scan", action: () => fileInputRef.current?.click() },
    { icon: <Navigation size={18} />, label: "Trip Plan", action: () => handleSend("How do I get from Bondi Beach to Circular Quay?") },
  ];

  return (
    <div className="flex flex-col h-screen bg-zinc-50 font-sans text-zinc-900 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Train size={20} />
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 font-medium block -mb-0.5">CSA Alex Taylor's</span>
            <h1 className="font-bold text-lg leading-tight">Sydney Visitors Trip Planer</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Sydney Transit AI</p>
          </div>
        </div>
        <button className="text-zinc-400 p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <Info size={20} />
        </button>
      </header>

      {/* Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 scroll-smooth"
      >
        <div className="max-w-2xl mx-auto">
          {messages.map((msg, idx) => (
            <Message key={idx} role={msg.role} content={msg.content} image={msg.image} />
          ))}
          {isLoading && (
            <div className="flex gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 animate-pulse">
                <RefreshCw size={16} className="animate-spin" />
              </div>
              <div className="bg-white border border-zinc-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer / Input */}
      <footer className="bg-white border-t border-zinc-200 p-4 shrink-0">
        <div className="max-w-2xl mx-auto">
          {/* Quick Actions */}
          {messages.length < 5 && !selectedImage && (
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.action}
                  className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-2 rounded-2xl text-[10px] font-bold transition-colors border border-zinc-200/50 text-left leading-tight min-h-[44px]"
                >
                  <div className="shrink-0">{action.icon}</div>
                  <span className="max-w-[70px] break-words">{action.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Image Preview */}
          <AnimatePresence>
            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="relative inline-block mb-3"
              >
                <img 
                  src={selectedImage.preview} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded-xl border-2 border-emerald-500 shadow-md"
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-zinc-800 text-white rounded-full p-1 shadow-lg"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-zinc-100 text-zinc-500 rounded-2xl hover:bg-zinc-200 transition-colors"
              title="Upload image or brochure"
            >
              <ImageIcon size={20} />
            </button>
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={selectedImage ? "Describe the image..." : "Ask about Sydney transport..."}
                className="w-full bg-zinc-100 border-none rounded-2xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className={cn(
                  "absolute right-2 p-2 rounded-xl transition-all",
                  (input.trim() || selectedImage) ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-400"
                )}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showDiscovery && (
          <DiscoveryMode 
            onSelect={handleSend} 
            onClose={() => setShowDiscovery(false)} 
          />
        )}
      </AnimatePresence>

      <InstallPrompt />
    </div>
  );
}
