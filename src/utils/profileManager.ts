/**
 * Profile Management Utilities
 * Handle profile CRUD operations and localStorage persistence
 */

import { 
  UserProfile, 
  DEFAULT_PROFILE, 
  calculateLevel, 
  calculateXPForNextLevel,
  getTitleForLevel,
  AVAILABLE_BADGES,
  Badge
} from '@/types/profile';

const PROFILE_STORAGE_KEY = 'quiz_user_profile';

/**
 * Load profile from localStorage
 */
export const loadProfile = (): UserProfile => {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      const profile = JSON.parse(stored);
      // Convert date strings back to Date objects
      profile.createdAt = new Date(profile.createdAt);
      profile.lastActive = new Date(profile.lastActive);
      profile.badges = profile.badges.map((b: Badge) => ({
        ...b,
        unlockedAt: b.unlockedAt ? new Date(b.unlockedAt) : undefined
      }));
      return profile;
    }
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
  
  // Create new profile
  return createNewProfile();
};

/**
 * Save profile to localStorage
 */
export const saveProfile = (profile: UserProfile): void => {
  try {
    profile.lastActive = new Date();
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save profile:', error);
  }
};

/**
 * Create a new profile
 */
export const createNewProfile = (): UserProfile => {
  const now = new Date();
  const profile: UserProfile = {
    ...DEFAULT_PROFILE,
    id: generateProfileId(),
    createdAt: now,
    lastActive: now
  };
  saveProfile(profile);
  return profile;
};

/**
 * Generate unique profile ID
 */
const generateProfileId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Update profile
 */
export const updateProfile = (updates: Partial<UserProfile>): UserProfile => {
  const profile = loadProfile();
  const updated = { ...profile, ...updates };
  saveProfile(updated);
  return updated;
};

/**
 * Add XP and level up if needed
 */
export const addXP = (xp: number): { 
  profile: UserProfile; 
  leveledUp: boolean; 
  newLevel?: number;
  newTitle?: string;
} => {
  const profile = loadProfile();
  const oldLevel = profile.level;
  
  profile.xp += xp;
  profile.level = calculateLevel(profile.xp);
  profile.xpToNextLevel = calculateXPForNextLevel(profile.level);
  
  const leveledUp = profile.level > oldLevel;
  
  if (leveledUp) {
    const { title, icon } = getTitleForLevel(profile.level);
    profile.title = `${icon} ${title}`;
  }
  
  saveProfile(profile);
  
  return {
    profile,
    leveledUp,
    newLevel: leveledUp ? profile.level : undefined,
    newTitle: leveledUp ? profile.title : undefined
  };
};

/**
 * Update stats after quiz completion
 */
export const updateStatsAfterQuiz = (
  score: number,
  totalQuestions: number,
  difficulty: 'easy' | 'medium' | 'hard',
  timeSpent: number,
  correctStreak: number
): UserProfile => {
  const profile = loadProfile();
  
  profile.stats.totalQuizzesTaken++;
  profile.stats.totalQuestionsAnswered += totalQuestions;
  profile.stats.correctAnswers += score;
  profile.stats.totalTimeSpent += timeSpent;
  
  // Update average score
  profile.stats.averageScore = Math.round(
    (profile.stats.correctAnswers / profile.stats.totalQuestionsAnswered) * 100
  );
  
  // Update highest score
  const quizScore = Math.round((score / totalQuestions) * 100);
  if (quizScore > profile.stats.highestScore) {
    profile.stats.highestScore = quizScore;
  }
  
  // Update perfect scores
  if (quizScore === 100) {
    profile.stats.perfectScores++;
  }
  
  // Update streak
  if (correctStreak > profile.stats.longestStreak) {
    profile.stats.longestStreak = correctStreak;
  }
  
  saveProfile(profile);
  return profile;
};

/**
 * Check and unlock badges
 */
export const checkBadges = (profile: UserProfile): Badge[] => {
  const newBadges: Badge[] = [];
  const unlockedBadgeIds = profile.badges.map(b => b.id);
  
  AVAILABLE_BADGES.forEach(badge => {
    if (unlockedBadgeIds.includes(badge.id)) return;
    
    let shouldUnlock = false;
    
    switch (badge.id) {
      case 'first-quiz':
        shouldUnlock = profile.stats.totalQuizzesTaken >= 1;
        break;
      case 'perfect-score':
        shouldUnlock = profile.stats.perfectScores >= 1;
        break;
      case 'streak-5':
        shouldUnlock = profile.stats.longestStreak >= 5;
        break;
      case 'streak-10':
        shouldUnlock = profile.stats.longestStreak >= 10;
        break;
      case 'quiz-10':
        shouldUnlock = profile.stats.totalQuizzesTaken >= 10;
        break;
      case 'quiz-50':
        shouldUnlock = profile.stats.totalQuizzesTaken >= 50;
        break;
      case 'quiz-100':
        shouldUnlock = profile.stats.totalQuizzesTaken >= 100;
        break;
      case 'night-owl': {
        const hour = new Date().getHours();
        shouldUnlock = hour >= 0 && hour < 5;
        break;
      }
      case 'early-bird': {
        const earlyHour = new Date().getHours();
        shouldUnlock = earlyHour >= 5 && earlyHour < 7;
        break;
      }
    }
    
    if (shouldUnlock) {
      const unlockedBadge = { ...badge, unlockedAt: new Date() };
      newBadges.push(unlockedBadge);
      profile.badges.push(unlockedBadge);
    }
  });
  
  if (newBadges.length > 0) {
    saveProfile(profile);
  }
  
  return newBadges;
};

/**
 * Reset profile (for testing or user request)
 */
export const resetProfile = (): UserProfile => {
  localStorage.removeItem(PROFILE_STORAGE_KEY);
  return createNewProfile();
};

/**
 * Export profile data
 */
export const exportProfile = (): string => {
  const profile = loadProfile();
  return JSON.stringify(profile, null, 2);
};

/**
 * Import profile data
 */
export const importProfile = (data: string): UserProfile | null => {
  try {
    const profile = JSON.parse(data);
    profile.createdAt = new Date(profile.createdAt);
    profile.lastActive = new Date(profile.lastActive);
    saveProfile(profile);
    return profile;
  } catch (error) {
    console.error('Failed to import profile:', error);
    return null;
  }
};

/**
 * Get profile summary for display
 */
export const getProfileSummary = (profile: UserProfile) => {
  const accuracy = profile.stats.totalQuestionsAnswered > 0
    ? Math.round((profile.stats.correctAnswers / profile.stats.totalQuestionsAnswered) * 100)
    : 0;
  
  const avgTimePerQuiz = profile.stats.totalQuizzesTaken > 0
    ? Math.round(profile.stats.totalTimeSpent / profile.stats.totalQuizzesTaken)
    : 0;
  
  return {
    level: profile.level,
    title: profile.title,
    xpProgress: Math.round((profile.xp / profile.xpToNextLevel) * 100),
    totalQuizzes: profile.stats.totalQuizzesTaken,
    accuracy,
    avgTimePerQuiz,
    badges: profile.badges.length,
    longestStreak: profile.stats.longestStreak
  };
};
