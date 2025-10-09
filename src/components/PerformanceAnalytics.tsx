import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Clock, Target, Zap, Brain, Award } from 'lucide-react';

interface PerformanceData {
  difficulty: string;
  score: number;
  totalQuestions: number;
  timeSpent?: number;
  answers: (number | null)[];
}

interface PerformanceAnalyticsProps {
  performanceData: PerformanceData[];
}

const PerformanceAnalytics = ({ performanceData }: PerformanceAnalyticsProps) => {
  const analytics = useMemo(() => {
    const totalQuestions = performanceData.reduce((acc, data) => acc + data.totalQuestions, 0);
    const totalCorrect = performanceData.reduce((acc, data) => acc + data.score, 0);
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    const difficultyStats = performanceData.map(data => ({
      name: data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1),
      accuracy: data.totalQuestions > 0 ? Math.round((data.score / data.totalQuestions) * 100) : 0,
      correct: data.score,
      incorrect: data.totalQuestions - data.score,
      total: data.totalQuestions
    }));

    const totalTime = performanceData.reduce((acc, data) => acc + (data.timeSpent || 0), 0);
    const avgTimePerQuestion = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0;

    // Calculate improvement trend
    const accuracyTrend = difficultyStats.map(stat => stat.accuracy);
    const isImproving = accuracyTrend.length >= 2 && 
      accuracyTrend[accuracyTrend.length - 1] > accuracyTrend[0];

    // Radar chart data for skill assessment
    const skillData = [
      {
        skill: 'Speed',
        value: avgTimePerQuestion < 15 ? 90 : avgTimePerQuestion < 30 ? 70 : 50
      },
      {
        skill: 'Accuracy',
        value: overallAccuracy
      },
      {
        skill: 'Consistency',
        value: Math.min(100, (totalCorrect / Math.max(1, totalQuestions - totalCorrect)) * 20)
      },
      {
        skill: 'Difficulty',
        value: performanceData.length >= 3 ? 100 : performanceData.length * 33
      },
      {
        skill: 'Completion',
        value: (performanceData.length / 3) * 100
      }
    ];

    return {
      totalQuestions,
      totalCorrect,
      overallAccuracy,
      difficultyStats,
      avgTimePerQuestion,
      totalTime,
      isImproving,
      skillData
    };
  }, [performanceData]);

  const COLORS = {
    correct: '#10b981',
    incorrect: '#ef4444',
    easy: '#22c55e',
    medium: '#eab308',
    hard: '#a855f7'
  };

  const pieData = [
    { name: 'Correct', value: analytics.totalCorrect, color: COLORS.correct },
    { name: 'Incorrect', value: analytics.totalQuestions - analytics.totalCorrect, color: COLORS.incorrect }
  ];

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="gradient-card rounded-2xl p-6 border border-accent/20 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-accent" />
            <p className="text-sm text-muted-foreground">Accuracy</p>
          </div>
          <p className="text-4xl font-bold text-accent">{analytics.overallAccuracy}%</p>
          <div className="flex items-center gap-1 mt-2">
            {analytics.isImproving ? (
              <>
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-xs text-success">Improving</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-yellow-500">Keep practicing</span>
              </>
            )}
          </div>
        </div>

        <div className="gradient-card rounded-2xl p-6 border border-accent/20 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-green-500" />
            <p className="text-sm text-muted-foreground">Correct</p>
          </div>
          <p className="text-4xl font-bold text-green-500">{analytics.totalCorrect}</p>
          <p className="text-xs text-muted-foreground mt-2">out of {analytics.totalQuestions}</p>
        </div>

        <div className="gradient-card rounded-2xl p-6 border border-accent/20 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-blue-500" />
            <p className="text-sm text-muted-foreground">Avg Time</p>
          </div>
          <p className="text-4xl font-bold text-blue-500">{analytics.avgTimePerQuestion}s</p>
          <p className="text-xs text-muted-foreground mt-2">per question</p>
        </div>

        <div className="gradient-card rounded-2xl p-6 border border-accent/20 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            <p className="text-sm text-muted-foreground">Total Time</p>
          </div>
          <p className="text-4xl font-bold text-yellow-500">{Math.floor(analytics.totalTime / 60)}m</p>
          <p className="text-xs text-muted-foreground mt-2">{analytics.totalTime % 60}s</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Accuracy by Difficulty */}
        <div className="gradient-card rounded-2xl p-6 border border-accent/20">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Brain className="w-6 h-6 text-accent" />
            Accuracy by Difficulty
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.difficultyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #a855f7',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="accuracy" fill="#a855f7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Correct vs Incorrect */}
        <div className="gradient-card rounded-2xl p-6 border border-accent/20">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-accent" />
            Performance Overview
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #a855f7',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Skill Assessment Radar */}
        <div className="gradient-card rounded-2xl p-6 border border-accent/20 md:col-span-2">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent" />
            Skill Assessment
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={analytics.skillData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="skill" stroke="#888" />
              <PolarRadiusAxis stroke="#888" />
              <Radar 
                name="Your Skills" 
                dataKey="value" 
                stroke="#a855f7" 
                fill="#a855f7" 
                fillOpacity={0.6} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #a855f7',
                  borderRadius: '8px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Timeline */}
        <div className="gradient-card rounded-2xl p-6 border border-accent/20 md:col-span-2">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-accent" />
            Progress Timeline
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.difficultyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #a855f7',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#a855f7" 
                strokeWidth={3}
                dot={{ fill: '#a855f7', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="gradient-card rounded-2xl p-6 border border-accent/20">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6 text-accent" />
          AI Insights & Recommendations
        </h3>
        <div className="space-y-3">
          {analytics.overallAccuracy >= 80 && (
            <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/30 rounded-xl">
              <Award className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-semibold text-success">Excellent Performance!</p>
                <p className="text-sm text-muted-foreground">You're mastering the material. Consider challenging yourself with harder questions.</p>
              </div>
            </div>
          )}
          
          {analytics.avgTimePerQuestion < 20 && (
            <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-500">Speed Demon!</p>
                <p className="text-sm text-muted-foreground">Your response time is impressive. You're thinking fast and accurately.</p>
              </div>
            </div>
          )}

          {analytics.isImproving && (
            <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/30 rounded-xl">
              <TrendingUp className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="font-semibold text-accent">Upward Trajectory!</p>
                <p className="text-sm text-muted-foreground">Your accuracy is improving across difficulty levels. Keep up the momentum!</p>
              </div>
            </div>
          )}

          {analytics.overallAccuracy < 60 && (
            <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <Target className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-500">Room for Growth</p>
                <p className="text-sm text-muted-foreground">Focus on understanding core concepts. Try reviewing easier material before advancing.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
