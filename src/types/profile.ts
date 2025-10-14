/**
 * User Profile and Avatar Types
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  condition: string;
}

export interface Avatar {
  style: 'robot' | 'geometric' | 'gradient' | 'pixel' | 'abstract';
  primaryColor: string;
  secondaryColor: string;
  pattern: 'solid' | 'stripes' | 'dots' | 'waves' | 'grid';
  accessory?: 'glasses' | 'hat' | 'crown' | 'headphones' | 'none';
  background: 'solid' | 'gradient' | 'pattern';
}

export interface UserStats {
  totalQuizzesTaken: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  averageScore: number;
  highestScore: number;
  perfectScores: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeSpent: number; // in seconds
  gestureAccuracy: number;
  averageResponseTime: number; // in milliseconds
  favoriteTopics: string[];
  strongTopics: string[];
  weakTopics: string[];
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: Avatar;
  title: string;
  bio: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  badges: Badge[];
  stats: UserStats;
  achievements: string[];
  createdAt: Date;
  lastActive: Date;
  preferences: {
    showCalibration: boolean;
    soundEnabled: boolean;
    theme: 'light' | 'dark';
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

export const DEFAULT_AVATAR: Avatar = {
  style: 'geometric',
  primaryColor: '#a855f7',
  secondaryColor: '#ec4899',
  pattern: 'solid',
  accessory: 'none',
  background: 'gradient'
};

export const DEFAULT_PROFILE: Omit<UserProfile, 'id' | 'createdAt' | 'lastActive'> = {
  username: 'Guest',
  displayName: 'New Learner',
  avatar: DEFAULT_AVATAR,
  title: 'AI Novice',
  bio: 'Just started my AI learning journey!',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  badges: [],
  stats: {
    totalQuizzesTaken: 0,
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    averageScore: 0,
    highestScore: 0,
    perfectScores: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalTimeSpent: 0,
    gestureAccuracy: 0,
    averageResponseTime: 0,
    favoriteTopics: [],
    strongTopics: [],
    weakTopics: []
  },
  achievements: [],
  preferences: {
    showCalibration: true,
    soundEnabled: true,
    theme: 'dark',
    difficulty: 'easy'
  }
};

// Avatar color presets
export const AVATAR_COLORS = {
  purple: '#a855f7',
  pink: '#ec4899',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
  orange: '#f97316',
  indigo: '#6366f1',
  teal: '#14b8a6'
};

// Title progression
export const TITLES = [
  { level: 1, title: 'AI Novice', icon: '🌱' },
  { level: 5, title: 'ML Apprentice', icon: '📚' },
  { level: 10, title: 'Neural Explorer', icon: '🔍' },
  { level: 15, title: 'Algorithm Adept', icon: '⚡' },
  { level: 20, title: 'Data Scientist', icon: '📊' },
  { level: 25, title: 'ML Engineer', icon: '🔧' },
  { level: 30, title: 'AI Specialist', icon: '🎯' },
  { level: 40, title: 'Deep Learning Expert', icon: '🧠' },
  { level: 50, title: 'AI Master', icon: '🏆' },
  { level: 75, title: 'Neural Network Guru', icon: '🌟' },
  { level: 100, title: 'AI Legend', icon: '👑' }
];

// XP calculation
export const calculateXP = (score: number, difficulty: 'easy' | 'medium' | 'hard'): number => {
  const baseXP = score * 10;
  const multiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
  return Math.round(baseXP * multiplier);
};

export const calculateLevel = (xp: number): number => {
  // Level formula: level = floor(sqrt(xp / 50))
  return Math.floor(Math.sqrt(xp / 50)) + 1;
};

export const calculateXPForNextLevel = (level: number): number => {
  // XP needed for next level
  return Math.pow(level, 2) * 50;
};

export const getTitleForLevel = (level: number): { title: string; icon: string } => {
  const titles = [...TITLES].reverse();
  const title = titles.find(t => level >= t.level) || TITLES[0];
  return { title: title.title, icon: title.icon };
};

// Badge definitions
export const AVAILABLE_BADGES: Badge[] = [
  {
    id: 'first-quiz',
    name: 'First Steps',
    description: 'Complete your first quiz',
    icon: '🎯',
    rarity: 'common',
    condition: 'Complete 1 quiz'
  },
  {
    id: 'perfect-score',
    name: 'Perfectionist',
    description: 'Get 100% on any quiz',
    icon: '💯',
    rarity: 'rare',
    condition: 'Score 100% on a quiz'
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete a quiz in under 2 minutes',
    icon: '⚡',
    rarity: 'rare',
    condition: 'Complete quiz < 2 minutes'
  },
  {
    id: 'streak-5',
    name: 'On Fire',
    description: 'Get 5 correct answers in a row',
    icon: '🔥',
    rarity: 'common',
    condition: '5 answer streak'
  },
  {
    id: 'streak-10',
    name: 'Unstoppable',
    description: 'Get 10 correct answers in a row',
    icon: '💥',
    rarity: 'epic',
    condition: '10 answer streak'
  },
  {
    id: 'all-difficulties',
    name: 'Well Rounded',
    description: 'Complete all difficulty levels',
    icon: '🎓',
    rarity: 'epic',
    condition: 'Complete Easy, Medium, Hard'
  },
  {
    id: 'gesture-master',
    name: 'Gesture Master',
    description: '100% gesture accuracy',
    icon: '👋',
    rarity: 'legendary',
    condition: '100% gesture accuracy'
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete a quiz between 12am-5am',
    icon: '🦉',
    rarity: 'rare',
    condition: 'Quiz between 12am-5am'
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete a quiz between 5am-7am',
    icon: '🐦',
    rarity: 'rare',
    condition: 'Quiz between 5am-7am'
  },
  {
    id: 'comeback-kid',
    name: 'Comeback Kid',
    description: 'Pass after failing first attempt',
    icon: '💪',
    rarity: 'epic',
    condition: 'Pass after previous fail'
  },
  {
    id: 'quiz-10',
    name: 'Dedicated Learner',
    description: 'Complete 10 quizzes',
    icon: '📚',
    rarity: 'common',
    condition: 'Complete 10 quizzes'
  },
  {
    id: 'quiz-50',
    name: 'Knowledge Seeker',
    description: 'Complete 50 quizzes',
    icon: '🔍',
    rarity: 'rare',
    condition: 'Complete 50 quizzes'
  },
  {
    id: 'quiz-100',
    name: 'Quiz Legend',
    description: 'Complete 100 quizzes',
    icon: '👑',
    rarity: 'legendary',
    condition: 'Complete 100 quizzes'
  }
];
