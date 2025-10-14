import { UserProfile } from '@/types/profile';
import AvatarDisplay from './AvatarDisplay';
import { Trophy, Target, Zap, Award, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileCardProps {
  profile: UserProfile;
  compact?: boolean;
}

const ProfileCard = ({ profile, compact = false }: ProfileCardProps) => {
  const xpProgress = (profile.xp / profile.xpToNextLevel) * 100;
  const accuracy = profile.stats.totalQuestionsAnswered > 0
    ? Math.round((profile.stats.correctAnswers / profile.stats.totalQuestionsAnswered) * 100)
    : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-card/50 backdrop-blur-sm rounded-xl border border-accent/20 hover:border-accent/50 transition-all cursor-pointer hover:bg-card/70 group">
        <AvatarDisplay avatar={profile.avatar} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate group-hover:text-accent transition-colors">{profile.displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{profile.title}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-accent">Lv.{profile.level}</p>
          <p className="text-xs text-muted-foreground">{profile.badges.length} 🏆</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="holographic-card animated-gradient-border rounded-2xl p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-start gap-6">
        <AvatarDisplay avatar={profile.avatar} size="xl" />
        
        <div className="flex-1 space-y-2">
          <div>
            <h2 className="text-3xl font-bold text-shimmer">{profile.displayName}</h2>
            <p className="text-lg text-accent">{profile.title}</p>
          </div>
          
          {profile.bio && (
            <p className="text-muted-foreground">{profile.bio}</p>
          )}
          
          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Level {profile.level}</span>
              <span className="text-accent font-semibold">
                {profile.xp} / {profile.xpToNextLevel} XP
              </span>
            </div>
            <div className="h-3 bg-accent/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-accent"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-accent/10 rounded-xl p-4 text-center">
          <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
          <p className="text-2xl font-bold">{profile.stats.totalQuizzesTaken}</p>
          <p className="text-xs text-muted-foreground">Quizzes Taken</p>
        </div>

        <div className="bg-accent/10 rounded-xl p-4 text-center">
          <Target className="w-6 h-6 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold">{accuracy}%</p>
          <p className="text-xs text-muted-foreground">Accuracy</p>
        </div>

        <div className="bg-accent/10 rounded-xl p-4 text-center">
          <Zap className="w-6 h-6 mx-auto mb-2 text-orange-500" />
          <p className="text-2xl font-bold">{profile.stats.longestStreak}</p>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </div>

        <div className="bg-accent/10 rounded-xl p-4 text-center">
          <Award className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <p className="text-2xl font-bold">{profile.badges.length}</p>
          <p className="text-xs text-muted-foreground">Badges</p>
        </div>

        <div className="bg-accent/10 rounded-xl p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold">{profile.stats.highestScore}%</p>
          <p className="text-xs text-muted-foreground">Best Score</p>
        </div>

        <div className="bg-accent/10 rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-cyan-500" />
          <p className="text-2xl font-bold">
            {Math.floor(profile.stats.totalTimeSpent / 60)}m
          </p>
          <p className="text-xs text-muted-foreground">Time Spent</p>
        </div>
      </div>

      {/* Badges */}
      {profile.badges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Recent Badges
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.badges.slice(-5).reverse().map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className={`px-3 py-2 rounded-lg border-2 ${
                  badge.rarity === 'legendary' ? 'border-yellow-500 bg-yellow-500/10' :
                  badge.rarity === 'epic' ? 'border-purple-500 bg-purple-500/10' :
                  badge.rarity === 'rare' ? 'border-blue-500 bg-blue-500/10' :
                  'border-gray-500 bg-gray-500/10'
                }`}
                title={badge.description}
              >
                <span className="text-2xl">{badge.icon}</span>
                <p className="text-xs mt-1">{badge.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProfileCard;
