import { useEffect, useState } from 'react';
import { Trophy, Star, Zap, Target, Award, Crown, Flame, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementNotification = ({ achievement, onClose }: AchievementNotificationProps) => {
  useEffect(() => {
    // Trigger confetti
    const colors = {
      common: ['#94a3b8', '#cbd5e1'],
      rare: ['#3b82f6', '#60a5fa'],
      epic: ['#a855f7', '#c084fc'],
      legendary: ['#f59e0b', '#fbbf24', '#fcd34d']
    };

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors[achievement.rarity]
    });

    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  const rarityColors = {
    common: 'from-slate-500 to-slate-600',
    rare: 'from-blue-500 to-blue-600',
    epic: 'from-purple-500 to-purple-600',
    legendary: 'from-amber-500 via-yellow-500 to-amber-600'
  };

  const rarityBorder = {
    common: 'border-slate-400',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-amber-400'
  };

  return (
    <div className="fixed top-24 right-8 z-50 animate-slide-in-right">
      <div className={`bg-gradient-to-br ${rarityColors[achievement.rarity]} p-1 rounded-2xl shadow-2xl`}>
        <div className="bg-card rounded-xl p-6 border-2 ${rarityBorder[achievement.rarity]}">
          <div className="flex items-start gap-4">
            <div className="text-5xl animate-bounce">
              {achievement.icon}
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Achievement Unlocked!
              </p>
              <h3 className="text-xl font-bold mb-1 text-foreground">
                {achievement.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {achievement.description}
              </p>
              <div className="mt-2">
                <span className={`text-xs uppercase font-bold bg-gradient-to-r ${rarityColors[achievement.rarity]} bg-clip-text text-transparent`}>
                  {achievement.rarity}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AchievementSystemProps {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  correctStreak: number;
  difficulty: string;
}

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-blood',
      title: 'First Blood',
      description: 'Answer your first question correctly',
      icon: <Star className="w-8 h-8 text-blue-500" />,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      rarity: 'common'
    },
    {
      id: 'perfect-score',
      title: 'Perfectionist',
      description: 'Get 100% on any level',
      icon: <Trophy className="w-8 h-8 text-amber-500" />,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      rarity: 'rare'
    },
    {
      id: 'speed-demon',
      title: 'Speed Demon',
      description: 'Complete a level in under 60 seconds',
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      rarity: 'epic'
    },
    {
      id: 'sharpshooter',
      title: 'Sharpshooter',
      description: 'Get 5 correct answers in a row',
      icon: <Target className="w-8 h-8 text-green-500" />,
      unlocked: false,
      progress: 0,
      maxProgress: 5,
      rarity: 'rare'
    },
    {
      id: 'master',
      title: 'Quiz Master',
      description: 'Complete all difficulty levels',
      icon: <Crown className="w-8 h-8 text-purple-500" />,
      unlocked: false,
      progress: 0,
      maxProgress: 3,
      rarity: 'legendary'
    },
    {
      id: 'hot-streak',
      title: 'On Fire!',
      description: 'Get 10 correct answers in a row',
      icon: <Flame className="w-8 h-8 text-orange-500" />,
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      rarity: 'epic'
    },
    {
      id: 'gesture-guru',
      title: 'Gesture Guru',
      description: 'Complete 3 levels using only gestures',
      icon: <Sparkles className="w-8 h-8 text-pink-500" />,
      unlocked: false,
      progress: 0,
      maxProgress: 3,
      rarity: 'legendary'
    },
    {
      id: 'hard-mode',
      title: 'Challenge Accepted',
      description: 'Complete hard difficulty',
      icon: <Award className="w-8 h-8 text-red-500" />,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      rarity: 'epic'
    }
  ]);

  const [notification, setNotification] = useState<Achievement | null>(null);

  const checkAchievements = (stats: AchievementSystemProps) => {
    setAchievements(prev => {
      const updated = [...prev];
      let newUnlock: Achievement | null = null;

      // First Blood
      if (stats.score >= 1 && !updated[0].unlocked) {
        updated[0].unlocked = true;
        updated[0].progress = 1;
        newUnlock = updated[0];
      }

      // Perfect Score
      if (stats.score === stats.totalQuestions && stats.totalQuestions > 0 && !updated[1].unlocked) {
        updated[1].unlocked = true;
        updated[1].progress = 1;
        newUnlock = updated[1];
      }

      // Speed Demon
      if (stats.timeSpent < 60 && stats.totalQuestions > 0 && !updated[2].unlocked) {
        updated[2].unlocked = true;
        updated[2].progress = 1;
        newUnlock = updated[2];
      }

      // Sharpshooter
      if (stats.correctStreak >= 5 && !updated[3].unlocked) {
        updated[3].progress = Math.min(stats.correctStreak, 5);
        if (stats.correctStreak >= 5) {
          updated[3].unlocked = true;
          newUnlock = updated[3];
        }
      }

      // Hot Streak
      if (stats.correctStreak >= 10 && !updated[5].unlocked) {
        updated[5].progress = Math.min(stats.correctStreak, 10);
        if (stats.correctStreak >= 10) {
          updated[5].unlocked = true;
          newUnlock = updated[5];
        }
      }

      // Hard Mode
      if (stats.difficulty === 'hard' && stats.score > 0 && !updated[7].unlocked) {
        updated[7].unlocked = true;
        updated[7].progress = 1;
        newUnlock = updated[7];
      }

      if (newUnlock) {
        setNotification(newUnlock);
      }

      return updated;
    });
  };

  return {
    achievements,
    notification,
    checkAchievements,
    clearNotification: () => setNotification(null)
  };
};

export default AchievementNotification;
