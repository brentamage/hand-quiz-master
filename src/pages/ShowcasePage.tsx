import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Trophy, Volume2, Hand, BarChart3, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SoundToggle, useSoundEffects } from '@/components/SoundEffects';
import PerformanceAnalytics from '@/components/PerformanceAnalytics';
import AchievementNotification, { useAchievements } from '@/components/AchievementSystem';
import GestureTrainingMode from '@/components/GestureTrainingMode';
import BackToMenuButton from '@/components/BackToMenuButton';
import ThemeToggle from '@/components/ThemeToggle';

type ShowcaseView = 'menu' | 'sounds' | 'analytics' | 'achievements' | 'training';

const ShowcasePage = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ShowcaseView>('menu');
  const soundEffects = useSoundEffects();
  const { achievements, notification, checkAchievements, clearNotification } = useAchievements();

  // Sample data for analytics
  const samplePerformanceData = [
    {
      difficulty: 'easy',
      score: 5,
      totalQuestions: 5,
      timeSpent: 120,
      answers: [0, 1, 2, 3, 0]
    },
    {
      difficulty: 'medium',
      score: 4,
      totalQuestions: 5,
      timeSpent: 180,
      answers: [1, 2, 0, 1, null]
    },
    {
      difficulty: 'hard',
      score: 3,
      totalQuestions: 5,
      timeSpent: 240,
      answers: [2, 1, 0, null, 1]
    }
  ];

  const features = [
    {
      id: 'sounds' as ShowcaseView,
      icon: <Volume2 className="w-12 h-12" />,
      title: 'Sound Effects',
      description: 'Immersive audio feedback integrated into gameplay',
      color: 'from-blue-500 to-blue-600',
      demo: 'Test interactive sound effects'
    },
    {
      id: 'analytics' as ShowcaseView,
      icon: <BarChart3 className="w-12 h-12" />,
      title: 'Performance Analytics',
      description: 'Beautiful charts and AI-powered insights',
      color: 'from-green-500 to-green-600',
      demo: 'View detailed performance metrics'
    },
    {
      id: 'achievements' as ShowcaseView,
      icon: <Trophy className="w-12 h-12" />,
      title: 'Achievement System',
      description: 'Unlock badges with animated celebrations',
      color: 'from-amber-500 to-amber-600',
      demo: 'Trigger achievement unlocks'
    },
    {
      id: 'training' as ShowcaseView,
      icon: <Hand className="w-12 h-12" />,
      title: 'Gesture Training',
      description: 'Interactive tutorial for mastering gestures',
      color: 'from-pink-500 to-pink-600',
      demo: 'Practice hand gestures'
    }
  ];

  const renderView = () => {
    switch (currentView) {
      case 'sounds':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <Volume2 className="w-20 h-20 mx-auto mb-4 text-accent" />
              <h2 className="text-4xl font-bold mb-4">Sound Effects System</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Immersive audio feedback generated using Web Audio API
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { name: 'Success', action: soundEffects.playSuccess, color: 'success' },
                { name: 'Error', action: soundEffects.playError, color: 'destructive' },
                { name: 'Click', action: soundEffects.playClick, color: 'blue-500' },
                { name: 'Hover', action: soundEffects.playHover, color: 'cyan-500' },
                { name: 'Level Complete', action: soundEffects.playLevelComplete, color: 'amber-500' },
                { name: 'Achievement', action: soundEffects.playAchievement, color: 'purple-500' },
                { name: 'Gesture Detected', action: soundEffects.playGestureDetected, color: 'pink-500' },
                { name: 'Whoosh', action: soundEffects.playWhoosh, color: 'green-500' }
              ].map((sound, i) => (
                <Button
                  key={i}
                  onClick={sound.action}
                  size="lg"
                  className={`gap-3 py-8 text-lg rounded-xl bg-${sound.color} hover:opacity-90 transition-elegant hover:scale-105`}
                >
                  <Volume2 className="w-6 h-6" />
                  Play {sound.name}
                </Button>
              ))}
            </div>
            <div className="gradient-card rounded-2xl p-6 border border-accent/20">
              <p className="text-center text-muted-foreground">
                💡 Toggle sound on/off using the button in the top-right corner
              </p>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <BarChart3 className="w-20 h-20 mx-auto mb-4 text-accent" />
              <h2 className="text-4xl font-bold mb-4">Performance Analytics</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Comprehensive performance tracking with beautiful visualizations
              </p>
            </div>
            <PerformanceAnalytics performanceData={samplePerformanceData} />
          </div>
        );

      case 'achievements':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <Trophy className="w-20 h-20 mx-auto mb-4 text-accent" />
              <h2 className="text-4xl font-bold mb-4">Achievement System</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Unlock achievements with animated celebrations
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Button
                onClick={() => checkAchievements({ score: 1, totalQuestions: 5, timeSpent: 120, correctStreak: 1, difficulty: 'easy' })}
                size="lg"
                className="gap-3 py-8 text-lg rounded-xl bg-gradient-accent hover:opacity-90"
              >
                <Trophy className="w-6 h-6" />
                Trigger Achievement
              </Button>
              <Button
                onClick={() => soundEffects.playAchievement()}
                size="lg"
                variant="secondary"
                className="gap-3 py-8 text-lg rounded-xl"
              >
                <Volume2 className="w-6 h-6" />
                Play Achievement Sound
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`gradient-card rounded-xl p-6 border-2 transition-elegant hover-lift ${
                    achievement.unlocked ? 'border-success' : 'border-accent/20 opacity-60'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-3">{achievement.icon}</div>
                    <h3 className="font-bold mb-1">{achievement.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{achievement.description}</p>
                    <div className="w-full bg-card rounded-full h-2 mb-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {achievement.progress}/{achievement.maxProgress}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'training':
        return (
          <GestureTrainingMode
            onComplete={() => setCurrentView('menu')}
            onExit={() => setCurrentView('menu')}
          />
        );

      default:
        return (
          <div className="space-y-12">
            <div className="text-center fade-in-up">
              <Sparkles className="w-24 h-24 mx-auto mb-6 text-accent animate-pulse" />
              <h1 className="text-6xl font-bold mb-4 text-shimmer">Premium Features Showcase</h1>
              <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                Explore the stunning frontend enhancements that make this app exceptional
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  onClick={() => setCurrentView(feature.id)}
                  className="gradient-card rounded-2xl p-8 border border-accent/20 hover-lift cursor-pointer transition-elegant group fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-elegant`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <div className="flex items-center gap-2 text-accent font-semibold">
                    <Play className="w-4 h-4" />
                    <span className="text-sm">{feature.demo}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={() => navigate('/')}
                size="lg"
                className="gap-3 bg-gradient-accent hover:opacity-90 px-12 py-6 text-xl rounded-xl transition-elegant hover:scale-105"
              >
                <ArrowLeft className="w-6 h-6" />
                Back to Quiz
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
      
      {/* Top Controls */}
      <BackToMenuButton />
      <ThemeToggle />
      <SoundToggle />
      
      {/* Achievement Notification */}
      {notification && (
        <AchievementNotification
          achievement={notification}
          onClose={clearNotification}
        />
      )}

      {/* Content */}
      <div className="container mx-auto max-w-7xl relative z-10">
        {currentView !== 'menu' && currentView !== 'training' && (
          <Button
            onClick={() => setCurrentView('menu')}
            variant="ghost"
            className="mb-8 gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Features
          </Button>
        )}
        
        {renderView()}
      </div>
    </div>
  );
};

export default ShowcasePage;
