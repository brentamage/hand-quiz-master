export interface LeaderboardEntry {
  name: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  date: string;
}

const LEADERBOARD_KEY = 'quiz-leaderboard';
const MAX_ENTRIES = 100; // Keep top 100 scores

export const saveToLeaderboard = (entry: Omit<LeaderboardEntry, 'date'>): void => {
  try {
    // Get existing leaderboard
    const existing = getLeaderboard();
    
    // Add new entry with current date
    const newEntry: LeaderboardEntry = {
      ...entry,
      date: new Date().toISOString()
    };
    
    // Add to leaderboard
    existing.push(newEntry);
    
    // Sort by percentage (descending), then by score (descending)
    existing.sort((a, b) => {
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }
      return b.score - a.score;
    });
    
    // Keep only top entries
    const topEntries = existing.slice(0, MAX_ENTRIES);
    
    // Save to localStorage
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topEntries));
    
    console.log('Score saved to leaderboard:', newEntry);
  } catch (error) {
    console.error('Failed to save to leaderboard:', error);
  }
};

export const getLeaderboard = (): LeaderboardEntry[] => {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
  }
  return [];
};

export const clearLeaderboard = (): void => {
  localStorage.removeItem(LEADERBOARD_KEY);
};

export const getUserRank = (percentage: number, score: number): number => {
  const leaderboard = getLeaderboard();
  
  // Find where this score would rank
  let rank = 1;
  for (const entry of leaderboard) {
    if (percentage > entry.percentage || (percentage === entry.percentage && score > entry.score)) {
      break;
    }
    rank++;
  }
  
  return rank;
};
