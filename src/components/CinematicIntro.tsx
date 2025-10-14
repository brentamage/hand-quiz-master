import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Hand, Zap } from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
}

const CinematicIntro = ({ onComplete }: CinematicIntroProps) => {
  const [stage, setStage] = useState<'logo' | 'title' | 'subtitle' | 'complete'>('logo');

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage('title'), 1500),
      setTimeout(() => setStage('subtitle'), 3000),
      setTimeout(() => {
        setStage('complete');
        onComplete();
      }, 5000)
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center overflow-hidden"
      >
        {/* Animated background particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-500 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Logo Stage */}
        <AnimatePresence>
          {stage === 'logo' && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: 'spring', 
                stiffness: 200, 
                damping: 20 
              }}
              className="relative"
            >
              {/* Glowing orb */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute inset-0 bg-purple-500 rounded-full blur-3xl"
              />
              
              {/* Icon particles forming */}
              <motion.div className="relative">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: Math.cos(i * Math.PI / 4) * 100,
                      y: Math.sin(i * Math.PI / 4) * 100,
                      opacity: 0
                    }}
                    animate={{ 
                      x: 0,
                      y: 0,
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.1
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </motion.div>
                ))}
                
                <Hand className="w-32 h-32 text-purple-400 relative z-10" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title Stage */}
        <AnimatePresence>
          {(stage === 'title' || stage === 'subtitle') && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="text-center space-y-8"
            >
              {/* Glitch effect title */}
              <div className="relative">
                <motion.h1
                  className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600"
                  animate={{
                    textShadow: [
                      '0 0 20px rgba(168, 85, 247, 0.5)',
                      '0 0 40px rgba(168, 85, 247, 0.8)',
                      '0 0 20px rgba(168, 85, 247, 0.5)',
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  Gesture Quiz
                </motion.h1>
                
                {/* Glitch layers */}
                <motion.h1
                  className="absolute inset-0 text-8xl font-bold text-red-500 opacity-70 mix-blend-screen"
                  animate={{
                    x: [-2, 2, -2],
                    opacity: [0, 0.7, 0]
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  Gesture Quiz
                </motion.h1>
                
                <motion.h1
                  className="absolute inset-0 text-8xl font-bold text-cyan-500 opacity-70 mix-blend-screen"
                  animate={{
                    x: [2, -2, 2],
                    opacity: [0, 0.7, 0]
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    delay: 0.1
                  }}
                >
                  Gesture Quiz
                </motion.h1>
              </div>

              {/* Animated line */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '200px' }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto"
              />

              {/* Subtitle with typing effect */}
              {stage === 'subtitle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <TypewriterText text="Control with your hands" />
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: 'spring' }}
                    className="flex items-center justify-center gap-4 text-purple-400"
                  >
                    <Zap className="w-6 h-6" />
                    <span className="text-xl">AI Powered</span>
                    <Zap className="w-6 h-6" />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan lines effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(168, 85, 247, 0.03) 2px, rgba(168, 85, 247, 0.03) 4px)'
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

// Typewriter effect component
const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <motion.p
      className="text-2xl text-purple-300 font-light tracking-wider"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-0.5 h-6 bg-purple-400 ml-1"
      />
    </motion.p>
  );
};

export default CinematicIntro;
