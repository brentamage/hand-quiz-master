import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Target, Trophy } from 'lucide-react';

interface QuizLoadingScreenProps {
  onComplete: () => void;
  difficulty: 'easy' | 'medium' | 'hard';
}

const QuizLoadingScreen = ({ onComplete, difficulty }: QuizLoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'initializing' | 'loading' | 'ready'>('initializing');

  const difficultyConfig = {
    easy: {
      icon: Target,
      color: 'text-green-500',
      bgColor: 'bg-green-500',
      label: 'Easy',
      description: 'Basic AI & ML Concepts'
    },
    medium: {
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500',
      label: 'Medium',
      description: 'Neural Networks & Algorithms'
    },
    hard: {
      icon: Trophy,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500',
      label: 'Hard',
      description: 'Deep Learning & Optimization'
    }
  };

  const config = difficultyConfig[difficulty];
  const Icon = config.icon;

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Stage transitions
    const timers = [
      setTimeout(() => setStage('loading'), 500),
      setTimeout(() => setStage('ready'), 2000),
      setTimeout(() => onComplete(), 3000)
    ];

    return () => {
      clearInterval(progressInterval);
      timers.forEach(clearTimeout);
    };
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
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-500 rounded-full"
              initial={{
                x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1920,
                y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1080,
                opacity: 0
              }}
              animate={{
                y: [null, typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1080],
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

        {/* Main content */}
        <div className="relative z-10 text-center space-y-8 px-4">
          {/* Icon with glow effect */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 20 
            }}
            className="relative mx-auto w-32 h-32 flex items-center justify-center"
          >
            {/* Glowing orb */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className={`absolute inset-0 ${config.bgColor} rounded-full blur-3xl`}
            />
            
            {/* Rotating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full"
            />
            
            <Icon className={`w-20 h-20 ${config.color} relative z-10`} />
          </motion.div>

          {/* Difficulty label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h2 className={`text-6xl font-bold ${config.color}`}>
              {config.label}
            </h2>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '150px' }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className={`h-1 ${config.bgColor} mx-auto rounded-full`}
            />
            <p className="text-xl text-purple-300 font-light tracking-wide">
              {config.description}
            </p>
          </motion.div>

          {/* Loading stages */}
          <AnimatePresence mode="wait">
            {stage === 'initializing' && (
              <motion.div
                key="initializing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-purple-400 text-lg"
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center justify-center gap-2"
                >
                  <Brain className="w-5 h-5" />
                  <span>Initializing AI Model...</span>
                </motion.div>
              </motion.div>
            )}
            
            {stage === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-purple-400 text-lg"
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>Loading Questions...</span>
                </motion.div>
              </motion.div>
            )}
            
            {stage === 'ready' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-green-400 text-xl font-semibold"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  ✓ Ready to Start!
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress bar */}
          <div className="w-80 mx-auto space-y-2">
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${config.bgColor} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <motion.p
              className="text-purple-300 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {progress}%
            </motion.p>
          </div>

          {/* Floating particles around icon */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 ${config.bgColor} rounded-full`}
              style={{
                left: '50%',
                top: '30%',
              }}
              animate={{
                x: [0, Math.cos(i * Math.PI / 3) * 80],
                y: [0, Math.sin(i * Math.PI / 3) * 80],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>

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

export default QuizLoadingScreen;
