import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Home, RotateCcw, Trophy, BarChart3 } from 'lucide-react';
import EnhancedLeaderboard from '@/components/EnhancedLeaderboard';
import ThemeToggle from '@/components/ThemeToggle';
import { useSoundEffects } from '@/components/SoundEffects';
import { useEffect } from 'react';

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const soundEffects = useSoundEffects();
  
  // Get state from navigation (passed or failed)
  const passed = location.state?.passed || false;

  useEffect(() => {
    // Play appropriate sound
    if (passed) {
      soundEffects.playPerfect();
    } else {
      soundEffects.playFail();
    }
  }, [passed, soundEffects]);

  return (
    <div className="min-h-screen py-12 px-4">
      <ThemeToggle />
      
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            {passed ? (
              <Trophy className="w-16 h-16 text-yellow-500 animate-pulse" />
            ) : (
              <BarChart3 className="w-16 h-16 text-blue-500" />
            )}
            <h1 className="text-6xl font-bold text-shimmer">
              {passed ? 'Congratulations!' : 'Quiz Complete'}
            </h1>
          </div>
          <div className="h-1 w-24 mx-auto bg-gradient-accent rounded-full mb-6"></div>
          <p className="text-muted-foreground text-xl">
            {passed 
              ? 'You\'ve completed all levels! Check your ranking below.' 
              : 'Keep practicing to improve your score!'}
          </p>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <EnhancedLeaderboard />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 justify-center mt-12 flex-wrap"
        >
          <Button
            onClick={() => navigate('/')}
            size="lg"
            variant="outline"
            className="gap-2 px-8 py-6 text-lg rounded-xl transition-elegant hover:scale-105"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Button>
          
          <Button
            onClick={() => {
              navigate('/');
              // Small delay to ensure navigation completes before reloading
              setTimeout(() => window.location.reload(), 100);
            }}
            size="lg"
            className="gap-2 bg-gradient-accent hover:opacity-90 px-8 py-6 text-lg rounded-xl transition-elegant hover:scale-105 shadow-elegant !text-black dark:!text-gray-100"
          >
            <RotateCcw className="w-5 h-5 text-black dark:text-gray-100" />
            Try Again
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
