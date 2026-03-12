import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../utils/cn';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export function TransportStatus() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStatus = async () => {
    if (!GEMINI_API_KEY) return;
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "What is the current status of Sydney Trains, Light Rail, and Ferries? Are there any major delays or trackwork today? Provide a very brief summary (max 3 sentences).",
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      setStatus(response.text || "All services running normally.");
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch transport status:", error);
      setStatus("Could not fetch live status. Check transportnsw.info for details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const hasDelays = status?.toLowerCase().includes('delay') || status?.toLowerCase().includes('trackwork') || status?.toLowerCase().includes('disruption');

  return (
    <div className="px-4 mb-2">
      <div className={cn(
        "bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm",
        hasDelays ? "border-orange-200" : "border-zinc-100"
      )}>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-xl",
              isLoading ? "bg-zinc-100 text-zinc-400" : 
              hasDelays ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"
            )}>
              {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 
               hasDelays ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <div>
              <p className="font-bold text-xs text-zinc-800">Live Network Status</p>
              <p className="text-[10px] text-zinc-500">
                {isLoading ? "Checking..." : hasDelays ? "Minor delays or trackwork reported" : "All systems normal"}
              </p>
            </div>
          </div>
          {isExpanded ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4"
            >
              <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                <p className="text-xs text-zinc-700 leading-relaxed italic">
                  "{status}"
                </p>
                {lastUpdated && (
                  <p className="text-[9px] text-zinc-400 mt-2 flex items-center gap-1">
                    <Info size={10} />
                    Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); fetchStatus(); }}
                className="mt-3 w-full py-2 text-[10px] font-bold text-zinc-500 hover:text-emerald-600 flex items-center justify-center gap-1 transition-colors"
              >
                <RefreshCw size={12} />
                Refresh Status
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
