import { Trophy, Medal, Award, Crown, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LeaderboardEntry {
  name: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  date: string;
  avatar?: string;
  country?: string;
}

const EnhancedLeaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Load leaderboard from localStorage
    const stored = localStorage.getItem('quiz-leaderboard');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const enrichedData = data.map((entry: LeaderboardEntry) => ({
          ...entry,
          avatar: generateAvatar(entry.name),
          country: getRandomCountry()
        }));
        setEntries(enrichedData.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.percentage - a.percentage).slice(0, 10));
      } catch (e) {
        console.error('Failed to load leaderboard:', e);
      }
    }
  }, []);

  // Generate avatar using DiceBear API
  const generateAvatar = (name: string) => {
    const seed = encodeURIComponent(name);
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  };

  // Get random country flag emoji
  const getRandomCountry = () => {
    const countries = ['🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇯🇵', '🇰🇷', '🇧🇷', '🇮🇳', '🇵🇭', '🇸🇬'];
    return countries[Math.floor(Math.random() * countries.length)];
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-7 h-7 text-yellow-500 animate-pulse" />;
    if (index === 1) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-7 h-7 flex items-center justify-center font-bold text-lg text-muted-foreground">{index + 1}</span>;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEntryClick = (index: number) => {
    setHighlightedIndex(index);
  };

  setTimeout(() => setHighlightedIndex(null), 2000);

  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="holographic-card rounded-2xl p-8 text-center shadow-depth"
      >
        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50 animate-pulse" />
        <p className="text-muted-foreground text-lg">No scores yet. Be the first to complete the quiz!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="holographic-card animated-gradient-border rounded-2xl p-8 shadow-depth"
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Trophy className="w-8 h-8 text-accent" />
        </motion.div>
        <h2 className="text-3xl font-bold text-shimmer">Global Leaderboard</h2>
        <Zap className="w-6 h-6 text-yellow-500 animate-pulse" />
      </div>
      
      <div className="space-y-3">
        <AnimatePresence>
          {entries.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleEntryClick(index)}
              className={`
                relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer
                ${index === 0 
                  ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]' 
                  : index === 1
                  ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-2 border-gray-400/50'
                  : index === 2
                  ? 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-2 border-amber-600/50'
                  : 'holographic-card border border-accent/10'
                }
                ${highlightedIndex === index ? 'scale-105 shadow-2xl' : 'hover:scale-[1.02]'}
              `}
            >
              {/* Rank Badge */}
              <motion.div
                className="flex-shrink-0 relative"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {getRankIcon(index)}
                {index < 3 && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(168, 85, 247, 0.7)',
                        '0 0 0 10px rgba(168, 85, 247, 0)',
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
              
              {/* Avatar */}
              <motion.div
                className="flex-shrink-0 relative"
                whileHover={{ scale: 1.1 }}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-accent/50 shadow-lg">
                  <img 
                    src={entry.avatar} 
                    alt={entry.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {index === 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
              
              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-lg truncate">{entry.name}</p>
                  <span className="text-xl">{entry.country}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {formatTime(entry.timeSpent)}
                  </span>
                </div>
              </div>
              
              {/* Score */}
              <div className="text-right">
                <motion.p
                  className={`text-3xl font-bold ${
                    entry.percentage >= 90 ? 'text-green-500' : 
                    entry.percentage >= 70 ? 'text-yellow-500' : 
                    'text-red-500'
                  }`}
                  animate={index < 3 ? {
                    scale: [1, 1.1, 1],
                    textShadow: [
                      '0 0 0px currentColor',
                      '0 0 20px currentColor',
                      '0 0 0px currentColor'
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  {entry.percentage}%
                </motion.p>
                <p className="text-sm text-muted-foreground">
                  {entry.score}/{entry.totalQuestions}
                </p>
              </div>

              {/* Sparkle effect for top 3 */}
              {index < 3 && (
                <motion.div
                  className="absolute top-2 right-2"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Zap className="w-4 h-4 text-yellow-500" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Stats Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 pt-6 border-t border-accent/20 flex justify-around text-center"
      >
        <div>
          <p className="text-2xl font-bold text-accent">{entries.length}</p>
          <p className="text-xs text-muted-foreground">Players</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-500">
            {Math.round(entries.reduce((acc, e) => acc + e.percentage, 0) / entries.length)}%
          </p>
          <p className="text-xs text-muted-foreground">Avg Score</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-yellow-500">
            {Math.max(...entries.map(e => e.percentage))}%
          </p>
          <p className="text-xs text-muted-foreground">Best Score</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedLeaderboard;
