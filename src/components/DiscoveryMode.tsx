import React, { useState } from 'react';
import { Palmtree, Landmark, ShoppingBag, Coffee, Map as MapIcon, X, ChevronRight, Compass, MapPin, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';

interface DiscoveryModeProps {
  onSelect: (query: string) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { 
    id: 'beaches', 
    name: 'Beaches', 
    icon: <Palmtree className="text-orange-500" />, 
    items: ['Bondi Beach', 'Manly Beach', 'Coogee Beach', 'Cronulla Beach', 'Palm Beach'] 
  },
  { 
    id: 'landmarks', 
    name: 'Landmarks', 
    icon: <Landmark className="text-blue-500" />, 
    items: ['Sydney Opera House', 'Sydney Harbour Bridge', 'Circular Quay', 'Darling Harbour', 'The Rocks'] 
  },
  { 
    id: 'shopping', 
    name: 'Shopping', 
    icon: <ShoppingBag className="text-pink-500" />, 
    items: ['Queen Victoria Building', 'Pitt Street Mall', 'Westfield Sydney', 'Paddington Markets', 'Chatswood Chase'] 
  },
  { 
    id: 'culture', 
    name: 'Parks & Nature', 
    icon: <Compass className="text-emerald-500" />, 
    items: ['Royal Botanic Garden', 'Taronga Zoo', 'Hyde Park', 'Centennial Park', 'Blue Mountains'] 
  },
];

export function DiscoveryMode({ onSelect, onClose }: DiscoveryModeProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const handleItemClick = (item: string) => {
    onSelect(`I want to go to ${item}. How do I get there?`);
    onClose();
  };

  const startLocating = () => {
    setShowLocationPrompt(false);
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onSelect(`I am at latitude ${latitude}, longitude ${longitude}. What are some interesting places nearby and how do I get to them using Sydney transport?`);
        setIsLocating(false);
        onClose();
      },
      (error) => {
        console.error(error);
        alert("Could not get your location. Please check your browser permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleFindNearby = () => {
    setShowLocationPrompt(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-white flex flex-col"
    >
      <header className="px-4 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Compass className="text-emerald-600" size={24} />
          <h2 className="font-bold text-xl">Where to?</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-zinc-100 rounded-full text-zinc-500">
          <X size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {!showMap ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={handleFindNearby}
                disabled={isLocating}
                className="w-full bg-blue-600 text-white p-5 rounded-3xl flex items-center justify-between shadow-lg shadow-blue-100 disabled:opacity-70"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl">
                    {isLocating ? <RefreshCw className="animate-spin" size={24} /> : <MapPin size={24} />}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg">Find Nearby</p>
                    <p className="text-blue-100 text-xs">Discover places around you</p>
                  </div>
                </div>
                <ChevronRight size={20} />
              </button>

              <button 
                onClick={() => setShowMap(true)}
                className="w-full bg-emerald-600 text-white p-5 rounded-3xl flex items-center justify-between shadow-lg shadow-emerald-100"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <MapIcon size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg">Choose from Map</p>
                    <p className="text-emerald-100 text-xs">See Sydney and pick a spot</p>
                  </div>
                </div>
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                  className={cn(
                    "p-4 rounded-3xl border transition-all text-left flex flex-col gap-3",
                    selectedCategory === cat.id 
                      ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500" 
                      : "border-zinc-100 bg-zinc-50"
                  )}
                >
                  <div className="bg-white p-2 rounded-xl w-fit shadow-sm">
                    {cat.icon}
                  </div>
                  <span className="font-bold text-zinc-800">{cat.name}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {selectedCategory && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6 bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-3xl text-center space-y-4"
                >
                  <div className="bg-white p-3 rounded-full w-fit mx-auto shadow-sm">
                    {CATEGORIES.find(c => c.id === selectedCategory)?.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-emerald-900">
                      Explore {CATEGORIES.find(c => c.id === selectedCategory)?.name}!
                    </h3>
                    <p className="text-sm text-emerald-700 mt-1">
                      Open the map to see all the best spots. Just tap where you want to go!
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowMap(true)}
                    className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                  >
                    <MapIcon size={20} />
                    Open Map & Pick a Spot
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="h-full flex flex-col gap-4">
            <div className="flex-1 bg-zinc-100 rounded-3xl overflow-hidden relative border-2 border-emerald-500">
              <iframe
                title="Sydney Map"
                width="100%"
                height="100%"
                frameBorder="0"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106030.5644144421!2d151.10444383125!3d-33.84735665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b129838f39a743f%3A0x3017ad17b086030!2sSydney%20NSW!5e0!3m2!1sen!2sau!4v1709460000000!5m2!1sen!2sau"
                allowFullScreen
              ></iframe>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-zinc-200">
                <p className="text-sm font-medium text-zinc-800 mb-2">Find a place you like on the map, then tell me where it is!</p>
                <button 
                  onClick={() => setShowMap(false)}
                  className="w-full py-2 bg-zinc-800 text-white rounded-xl text-sm font-bold"
                >
                  Go Back to Categories
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showLocationPrompt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <MapPin size={28} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-bold text-xl">Share Location?</h3>
                <p className="text-sm text-zinc-500">
                  Sydney Visitors Trip Planer needs your location to find the best transport options and nearby spots for you.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button 
                  onClick={startLocating}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  Allow Location
                </button>
                <button 
                  onClick={() => setShowLocationPrompt(false)}
                  className="w-full py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                >
                  Not Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="p-4 border-t border-zinc-100 bg-zinc-50 text-center shrink-0">
        <p className="text-xs text-zinc-400">Tap a place to get transport directions instantly.</p>
      </footer>
    </motion.div>
  );
}
