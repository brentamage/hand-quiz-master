import { Trophy, Medal, Award } from "lucide-react";
import { useEffect, useState } from "react";

interface LeaderboardEntry {
  name: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  date: string;
}

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Load leaderboard from localStorage
    const stored = localStorage.getItem('quiz-leaderboard');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setEntries(data.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.percentage - a.percentage).slice(0, 10));
      } catch (e) {
        console.error('Failed to load leaderboard:', e);
      }
    }
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{index + 1}</span>;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (entries.length === 0) {
    return (
      <div className="gradient-card rounded-2xl p-8 text-center">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground text-lg">No scores yet. Be the first to complete the quiz!</p>
      </div>
    );
  }

  return (
    <div className="gradient-card rounded-2xl p-8 shadow-elegant border border-accent/20">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-accent" />
        <h2 className="text-3xl font-bold">Leaderboard</h2>
      </div>
      
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div
            key={index}
            className={`flex items-center gap-4 p-4 rounded-xl transition-elegant hover:scale-[1.02] ${
              index === 0 
                ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/30' 
                : 'bg-card/50 border border-accent/10'
            }`}
          >
            <div className="flex-shrink-0">
              {getRankIcon(index)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg truncate">{entry.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(entry.date).toLocaleDateString()}
              </p>
            </div>
            
            <div className="text-right">
              <p className={`text-2xl font-bold ${
                entry.percentage >= 90 ? 'text-green-500' : 
                entry.percentage >= 70 ? 'text-yellow-500' : 
                'text-red-500'
              }`}>
                {entry.percentage}%
              </p>
              <p className="text-sm text-muted-foreground">
                {entry.score}/{entry.totalQuestions} • {formatTime(entry.timeSpent)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to add entry to leaderboard
export const addToLeaderboard = (name: string, score: number, totalQuestions: number, timeSpent: number) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  const entry: LeaderboardEntry = {
    name,
    score,
    totalQuestions,
    percentage,
    timeSpent,
    date: new Date().toISOString()
  };

  const stored = localStorage.getItem('quiz-leaderboard');
  let entries: LeaderboardEntry[] = [];
  
  if (stored) {
    try {
      entries = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse leaderboard:', e);
    }
  }
  
  entries.push(entry);
  entries.sort((a, b) => b.percentage - a.percentage);
  entries = entries.slice(0, 10); // Keep top 10
  
  localStorage.setItem('quiz-leaderboard', JSON.stringify(entries));
};

export default Leaderboard;
