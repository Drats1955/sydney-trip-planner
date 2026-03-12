import React, { useState, useRef } from 'react';
import { X, MapPin, Camera, Navigation, Search, Compass, ChevronRight, QrCode, Map as MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';

interface TripPlannerFlowProps {
  onPlan: (destination: string, start: string, image?: { data: string, mimeType: string }) => void;
  onClose: () => void;
  onOpenDiscovery: () => void;
}

export function TripPlannerFlow({ onPlan, onClose, onOpenDiscovery }: TripPlannerFlowProps) {
  const [step, setStep] = useState<'destination' | 'start'>('destination');
  const [destination, setDestination] = useState('');
  const [start, setStart] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImage, setPendingImage] = useState<{ data: string, mimeType: string, preview: string } | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setPendingImage({
        data: base64String,
        mimeType: file.type,
        preview: URL.createObjectURL(file)
      });
      
      // If we're in destination step and scan, we might want to just proceed
      if (step === 'destination') {
        setDestination("Identified from photo");
        setStep('start');
      } else {
        setStart("Identified from photo");
        handleComplete("Identified from photo", { data: base64String, mimeType: file.type });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGPS = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const startStr = `My current location (lat: ${latitude}, lon: ${longitude})`;
        setStart(startStr);
        handleComplete(startStr);
      },
      (error) => {
        console.error(error);
        alert("Could not get your location. Please enter your starting point manually.");
        setIsLocating(false);
      }
    );
  };

  const handleComplete = (finalStart: string, image?: { data: string, mimeType: string }) => {
    onPlan(destination, finalStart, image || (pendingImage ? { data: pendingImage.data, mimeType: pendingImage.mimeType } : undefined));
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageSelect} 
        accept="image/*" 
        className="hidden" 
      />

      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
      >
        <header className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
              <Navigation size={20} />
            </div>
            <h2 className="font-bold text-lg">Trip Planner</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-100 rounded-full text-zinc-500">
            <X size={18} />
          </button>
        </header>

        <div className="p-6 space-y-6">
          <AnimatePresence mode="wait">
            {step === 'destination' ? (
              <motion.div 
                key="dest"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="font-bold text-xl text-zinc-800">Where would you like to go?</h3>
                  <p className="text-sm text-zinc-500">Enter a name, describe it, or scan a brochure.</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Opera House or 'a quiet park'"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <Camera size={24} />
                    <span className="text-xs font-bold">Scan Brochure</span>
                  </button>
                  <button 
                    onClick={onOpenDiscovery}
                    className="flex flex-col items-center gap-2 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    <Compass size={24} />
                    <span className="text-xs font-bold">Not Sure?</span>
                  </button>
                </div>

                <button 
                  disabled={!destination.trim()}
                  onClick={() => setStep('start')}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Next Step
                  <ChevronRight size={18} />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="start"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="font-bold text-xl text-zinc-800">Where are you starting from?</h3>
                  <p className="text-sm text-zinc-500">Use your GPS, enter a stop, or scan street signs.</p>
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    placeholder="e.g. Central Station or Street Name"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleGPS}
                    disabled={isLocating}
                    className="flex flex-col items-center gap-2 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  >
                    <MapPin size={24} />
                    <span className="text-xs font-bold">{isLocating ? 'Locating...' : 'Use My GPS'}</span>
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex gap-1">
                      <MapIcon size={20} />
                      <QrCode size={20} />
                    </div>
                    <span className="text-xs font-bold">Scan Sign/QR</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setStep('destination')}
                    className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold"
                  >
                    Back
                  </button>
                  <button 
                    disabled={!start.trim()}
                    onClick={() => handleComplete(start)}
                    className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold disabled:opacity-50"
                  >
                    Plan My Trip
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
