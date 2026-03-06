import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function InstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if already installed or if user has dismissed it
    const dismissed = localStorage.getItem('svtp_install_dismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (!dismissed && !isStandalone) {
      const timer = setTimeout(() => setShow(true), 5000); // Show after 5 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('svtp_install_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-zinc-100 p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                S
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">Add Sydney Visitors Trip Planer to Home Screen</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Get quick access to Sydney transport info anytime.
                </p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-zinc-400 p-1">
              <X size={20} />
            </button>
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400 bg-zinc-50 p-2 rounded-lg">
            <span className="flex items-center gap-1">
              Tap <Share size={14} className="text-blue-500" /> then <PlusSquare size={14} /> "Add to Home Screen"
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
