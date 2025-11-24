import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  duration?: number; // in seconds, only for images (videos use natural duration)
  title?: string;
}

interface ScreensaverProps {
  isActive: boolean;
  onExit: (showSpinWheel?: boolean) => void;
}

// Placeholder media items using Unsplash images
const placeholderMedia: MediaItem[] = [
  {
    id: '1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1920&h=1080&fit=crop',
    duration: 5,
    title: 'Nature Scene'
  },
  {
    id: '2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=1920&h=1080&fit=crop',
    duration: 5,
    title: 'Night Sky'
  },
  {
    id: '3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1920&h=1080&fit=crop',
    duration: 5,
    title: 'Ocean Wave'
  },
  {
    id: '4',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1920&h=1080&fit=crop',
    duration: 5,
    title: 'Orange Flowers'
  },
  {
    id: '5',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=1920&h=1080&fit=crop',
    duration: 5,
    title: 'Code Display'
  }
];

export const Screensaver = ({ isActive, onExit }: ScreensaverProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const currentMedia = placeholderMedia[currentIndex];

  // Update clock every second
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  // Handle media rotation
  useEffect(() => {
    if (!isActive) return;

    const duration = currentMedia.type === 'image' 
      ? (currentMedia.duration || 5) * 1000 
      : 10000; // Default 10s for videos without duration

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % placeholderMedia.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, currentIndex, currentMedia]);

  // Reset to first slide when screensaver becomes active
  useEffect(() => {
    if (isActive) {
      setCurrentIndex(0);
    }
  }, [isActive]);

  const handleClick = () => {
    // 20% chance to show spin wheel randomly
    const shouldShowSpinWheel = Math.random() < 0.2;
    onExit(shouldShowSpinWheel);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleClick}
          className="fixed inset-0 z-50 cursor-pointer bg-black"
        >
          {/* Media Content */}
          <div className="relative w-full h-full overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMedia.id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
              >
                {currentMedia.type === 'image' ? (
                  <img
                    src={currentMedia.url}
                    alt={currentMedia.title || 'Screensaver'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={currentMedia.url}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                    onEnded={() => {
                      setCurrentIndex((prev) => (prev + 1) % placeholderMedia.length);
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          </div>

          {/* Clock and Date Overlay */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute top-8 left-8 text-white"
          >
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8" />
              <div className="text-6xl font-light tracking-wide">
                {formatTime(currentTime)}
              </div>
            </div>
            <div className="text-xl font-light opacity-80 ml-11">
              {formatDate(currentTime)}
            </div>
          </motion.div>

          {/* Media Title */}
          {currentMedia.title && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute bottom-8 left-8 text-white"
            >
              <div className="text-2xl font-light">
                {currentMedia.title}
              </div>
            </motion.div>
          )}

          {/* Progress Indicators */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute bottom-8 right-8 flex gap-2"
          >
            {placeholderMedia.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/30'
                }`}
              />
            ))}
          </motion.div>

          {/* Touch to Exit Hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              repeatDelay: 5,
              delay: 2 
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="text-white/80 text-xl font-light text-center">
              <div>Touch screen to continue</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};