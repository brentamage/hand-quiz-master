import { useState, useCallback, useEffect, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import WebcamGestureDetector from "@/components/WebcamGestureDetector";
import QuizQuestion from "@/components/QuizQuestion";
import ThemeToggle from "@/components/ThemeToggle";
import ThemeSelector from "@/components/ThemeSelector";
import GestureGuide from "@/components/GestureGuide";
import ProgressBar from "@/components/ProgressBar";

// Lazy load heavy components
const AnimatedBackground = lazy(() => import("@/components/AnimatedBackground"));
const PerformanceMonitor = lazy(() => import("@/components/PerformanceMonitor"));
const CinematicIntro = lazy(() => import("@/components/CinematicIntro"));
const QuizLoadingScreen = lazy(() => import("@/components/QuizLoadingScreen"));
const TiltCard = lazy(() => import("@/components/TiltCard"));
import { getQuestionsByDifficulty, DifficultyLevel, Question } from "@/data/quizData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Trophy, RotateCcw, CheckCircle, XCircle, Play, Sparkles, Target, Zap, Award, Star } from "lucide-react";
import { toast } from "sonner";
import { useSoundEffects, SoundToggle } from "@/components/SoundEffects";
import AchievementNotification, { useAchievements } from "@/components/AchievementSystem";
import BackToMenuButton from "@/components/BackToMenuButton";
import { loadProfile, updateStatsAfterQuiz, addXP, checkBadges } from "@/utils/profileManager";
import { UserProfile } from "@/types/profile";

type GameState = 'welcome' | 'difficulty-select' | 'loading' | 'playing' | 'level-complete' | 'final-results';

const PASSING_SCORE = 70; // 70% to pass overall
const DIFFICULTY_ORDER: DifficultyLevel[] = ['easy', 'medium', 'hard'];

interface LevelResult {
  difficulty: DifficultyLevel;
  score: number;
  totalQuestions: number;
  answers: (number | null)[];
  questions: Question[];
}

const Index = () => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [currentDifficultyIndex, setCurrentDifficultyIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [levelResults, setLevelResults] = useState<LevelResult[]>([]);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [levelStartTime, setLevelStartTime] = useState<number>(0);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const [devicePerformance, setDevicePerformance] = useState<'high' | 'medium' | 'low'>('medium');
  const [showFeedback, setShowFeedback] = useState(false);
  const [loadingDifficulty, setLoadingDifficulty] = useState<DifficultyLevel>('easy');
  const webcamContainerRef = useRef<HTMLDivElement>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Sound effects and achievements
  const soundEffects = useSoundEffects();
  const { achievements, notification, checkAchievements, clearNotification } = useAchievements();

  // Load profile on mount
  useEffect(() => {
    const profile = loadProfile();
    setUserProfile(profile);
  }, []);

  const currentDifficulty = DIFFICULTY_ORDER[currentDifficultyIndex];
  const currentQuestion = questions[currentQuestionIndex];
  
  // Determine if webcam should be shown (only during playing, not on results screens)
  const showWebcam = gameState === 'playing';

  // Reset selected option and feedback when question changes
  useEffect(() => {
    if (gameState === 'playing' && questions.length > 0) {
      setSelectedOption(answers[currentQuestionIndex]);
      setShowFeedback(false);
    }
  }, [currentQuestionIndex, gameState, answers]);

  // Show final results with progress and answers
  const renderFinalResults = () => {
    const totalScore = getTotalScore();
    const totalQuestions = getTotalQuestions();
    const percentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    const passed = percentage >= PASSING_SCORE;
    const completedAllLevels = levelResults.length === 3;

    if (completedAllLevels && passed) {
      soundEffects.playLevelComplete();
    }

    return (
      <div className="min-h-screen py-12 px-4 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-yellow-500" />
            <h1 className="text-5xl font-bold mb-4">Quiz Completed!</h1>
            <div className="h-1 w-24 mx-auto bg-gradient-accent rounded-full mb-8"></div>
            
            <div className="holographic-card animated-gradient-border rounded-3xl p-10 shadow-depth mb-8 max-w-2xl mx-auto">
              <p className="text-muted-foreground text-2xl mb-4">Your Final Score</p>
              <p className="text-8xl font-bold text-accent mb-2">
                {totalScore}<span className="text-4xl text-muted-foreground">/{totalAnsweredQuestions}</span>
              </p>
              <p className={`text-4xl font-semibold ${passed ? 'text-green-500' : 'text-red-500'}`}>
                {percentage}% {passed ? '✅' : '❌'}
              </p>
              <p className="mt-4 text-xl text-muted-foreground">
                {passed ? 'Congratulations! You passed!' : 'Keep practicing to improve your score!'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const onLoadingComplete = useCallback(() => {
    const difficultyIndex = DIFFICULTY_ORDER.indexOf(loadingDifficulty);
    const quizQuestions = getQuestionsByDifficulty(loadingDifficulty);
    setCurrentDifficultyIndex(difficultyIndex);
    setQuestions(quizQuestions);
    setAnswers(new Array(quizQuestions.length).fill(null));
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setLevelResults([]);
    setCorrectStreak(0);
    setLevelStartTime(Date.now());
    setGameState('playing');
    soundEffects.playLoadingComplete();
  }, [loadingDifficulty]);

  const startQuiz = useCallback((difficulty: DifficultyLevel) => {
    setLoadingDifficulty(difficulty);
    setGameState('loading');
    soundEffects.playWhoosh();
  }, []);

  const startNextLevel = () => {
    const nextIndex = currentDifficultyIndex + 1;
    const nextDifficulty = DIFFICULTY_ORDER[nextIndex];
    setLoadingDifficulty(nextDifficulty);
    setGameState('loading');
    soundEffects.playWhoosh();
  };

  const onNextLevelLoadingComplete = () => {
    const nextIndex = DIFFICULTY_ORDER.indexOf(loadingDifficulty);
    const quizQuestions = getQuestionsByDifficulty(loadingDifficulty);
    
    setCurrentDifficultyIndex(nextIndex);
    setQuestions(quizQuestions);
    setAnswers(new Array(quizQuestions.length).fill(null));
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setCorrectStreak(0);
    setLevelStartTime(Date.now());
    setGameState('playing');
    soundEffects.playPowerUp();
  };

  const handleOptionSelect = (index: number) => {
    if (showFeedback) return; // Prevent changing answer during feedback
    
    setSelectedOption(index);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = index;
    setAnswers(newAnswers);
    
    soundEffects.playClick();
    
    // Show purple highlight first, then feedback after 1 second
    setTimeout(() => {
      setShowFeedback(true);
      
      // If this is the last question, auto-advance after showing feedback
      if (currentQuestionIndex === questions.length - 1) {
        setTimeout(() => {
          handleNext();
        }, 2000); // 2 seconds to see feedback
      } else {
        // Clear feedback after 2 seconds for other questions
        setTimeout(() => {
          setShowFeedback(false);
        }, 2000);
      }
    }, 1000); // 1 second to show purple highlight
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setShowFeedback(false);
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOption(answers[currentQuestionIndex - 1]);
    }
  };

  const calculateScore = (levelAnswers: (number | null)[], levelQuestions: Question[]) => {
    return levelAnswers.reduce((acc, answer, idx) =>
      answer !== null && answer === levelQuestions[idx].correctAnswer ? acc + 1 : acc, 0
    );
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Check if current answer is correct for streak tracking
      if (currentQuestion && selectedOption !== null && selectedOption === currentQuestion.correctAnswer) {
        setCorrectStreak(prev => {
          const newStreak = prev + 1;
          // Play streak sound on milestones
          if (newStreak === 3 || newStreak === 5 || newStreak % 10 === 0) {
            soundEffects.playStreak();
          }
          return newStreak;
        });
      } else if (selectedOption !== null) {
        setCorrectStreak(0);
      }
      
      setShowFeedback(false);
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(answers[currentQuestionIndex + 1]);
      soundEffects.playQuestionChange();
    } else {
      // Level completed
      const score = calculateScore(answers, questions);
      const timeSpent = Math.floor((Date.now() - levelStartTime) / 1000);
      const percentage = Math.round((score / questions.length) * 100);
      
      // Play sound based on performance
      if (percentage === 100) {
        soundEffects.playPerfect();
      } else if (percentage >= 70) {
        soundEffects.playLevelComplete();
      } else {
        soundEffects.playFail();
      }
      
      const levelResult: LevelResult = {
        difficulty: currentDifficulty,
        score,
        totalQuestions: questions.length,
        answers: [...answers],
        questions: [...questions]
      };
      
      const newLevelResults = [...levelResults, levelResult];
      setLevelResults(newLevelResults);
      
      // Check achievements
      checkAchievements({
        score,
        totalQuestions: questions.length,
        timeSpent,
        correctStreak,
        difficulty: currentDifficulty
      });
      
      // Check if there are more levels to complete
      const isLastLevel = currentDifficultyIndex === DIFFICULTY_ORDER.length - 1;
      
      if (isLastLevel) {
        // Completed the last level - show final results
        setGameState('final-results');
      } else {
        // More levels to go - show level complete screen
        setGameState('level-complete');
      }
    }
  };

  const handleGestureDetected = useCallback((gesture: string) => {
    // Allow gestures in playing, level-complete, and final-results states (not during loading)
    if (gameState === 'welcome' || gameState === 'difficulty-select' || gameState === 'loading') return;
    
    const gestureLower = gesture.toLowerCase().trim();
    
    // Only process answer selection gestures during 'playing' state
    if (gameState === 'playing') {
      if (gestureLower === "a." || gestureLower === "a") {
        handleOptionSelect(0);
      } else if (gestureLower === "b." || gestureLower === "b") {
        handleOptionSelect(1);
      } else if (gestureLower === "c." || gestureLower === "c") {
        handleOptionSelect(2);
      } else if (gestureLower === "d." || gestureLower === "d") {
        handleOptionSelect(3);
      } else if (gestureLower === "next") {
        // Only allow next if not on the last question OR if an answer is selected on last question
        if (currentQuestionIndex < questions.length - 1 || (currentQuestionIndex === questions.length - 1 && selectedOption !== null)) {
          handleNext();
        }
      } else if (gestureLower === "previous") {
        handlePrevious();
      }
    }
    
    // Allow navigation gestures in level-complete state
    if (gameState === 'level-complete') {
      if (gestureLower === "next") {
        startNextLevel();
      }
    }
    
    // Allow restart gesture in final-results state
    if (gameState === 'final-results') {
      if (gestureLower === "next") {
        handleRestart();
      }
    }
  }, [currentQuestionIndex, gameState, answers, questions, selectedOption]);

  const handlePerformanceDetected = useCallback((performance: 'high' | 'medium' | 'low') => {
    setDevicePerformance(performance);
  }, []);

  const handleRestart = () => {
    setGameState('welcome');
    setCurrentDifficultyIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setQuestions([]);
    setLevelResults([]);
  };

  const getTotalScore = () => {
    return levelResults.reduce((acc, result) => acc + result.score, 0);
  };

  const getTotalAnsweredQuestions = () => {
    return levelResults.reduce((acc, result) => {
      const answeredQuestions = result.answers.filter(answer => answer !== null).length;
      return acc + answeredQuestions;
    }, 0);
  };

  const getTotalQuestions = () => {
    return levelResults.reduce((acc, result) => acc + result.totalQuestions, 0);
  };

  const getOverallPercentage = () => {
    const total = getTotalAnsweredQuestions();
    return total > 0 ? Math.round((getTotalScore() / total) * 100) : 0;
  };

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-foreground text-lg">Loading...</p>
      </div>
    </div>
  );

  // Cinematic Intro
  if (showIntro) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <CinematicIntro onComplete={() => setShowIntro(false)} />
      </Suspense>
    );
  }

  // Welcome Screen
  if (gameState === 'welcome') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden"
      >
        {/* Animated Background */}
        <Suspense fallback={null}>
          <AnimatedBackground />
        </Suspense>
        
        {/* Content */}
        <ThemeToggle />
        <SoundToggle />
        <ThemeSelector />
        
        {/* Compact Profile - Top Left */}
        {userProfile && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="fixed top-6 left-6 z-50"
            onClick={() => navigate('/profile')}
          >
            <div className="flex items-center gap-2 p-2 bg-card/80 backdrop-blur-md rounded-xl border border-accent/30 hover:border-accent/60 transition-all cursor-pointer hover:bg-card/90 group shadow-elegant">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-accent/30 group-hover:ring-accent/60 transition-all">
                <div 
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(135deg, ${userProfile.avatar.primaryColor}, ${userProfile.avatar.secondaryColor})`
                  }}
                />
              </div>
              <div className="pr-2">
                <p className="text-xs font-semibold group-hover:text-accent transition-colors leading-tight">
                  {userProfile.displayName}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Lv.{userProfile.level} • {userProfile.badges.length} 🏆
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {notification && (
          <AchievementNotification achievement={notification} onClose={clearNotification} />
        )}
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <motion.div
              className="mb-8"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-20 h-20 mx-auto mb-6 text-accent animate-pulse drop-shadow-2xl" />
            </motion.div>
            <h1 className="text-7xl md:text-8xl font-bold mb-6 text-shimmer drop-shadow-2xl">
              Pose Quiz
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '128px' }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-1 mx-auto bg-gradient-accent rounded-full mb-8 shadow-glow"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-foreground text-2xl max-w-2xl mx-auto mb-12 leading-relaxed drop-shadow-lg font-medium"
            >
              Test your knowledge using body poses. No mouse needed - just strike a pose!
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <TiltCard>
                <Button
                  onClick={() => setGameState('difficulty-select')}
                  size="lg"
                  className="gap-3 bg-gradient-accent hover:opacity-90 px-12 py-8 text-2xl rounded-2xl transition-elegant hover:scale-105 shadow-elegant !text-black dark:!text-gray-100 backdrop-blur-sm holographic-shimmer"
                >
                  <Play className="w-8 h-8 text-black dark:text-gray-100" />
                  Start Quiz
                </Button>
              </TiltCard>
              
              <TiltCard>
                <Button
                  onClick={() => navigate('/showcase')}
                  size="lg"
                  variant="outline"
                  className="gap-3 px-12 py-8 text-xl rounded-2xl transition-elegant hover:scale-105 border-2 border-accent/50 hover:border-accent backdrop-blur-sm neon-border"
                >
                  <Sparkles className="w-7 h-7 text-accent" />
                  View Features
                </Button>
              </TiltCard>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Difficulty Selection Screen
  if (gameState === 'difficulty-select') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <BackToMenuButton onRestart={handleRestart} />
        <ThemeToggle />
        <SoundToggle />
        {notification && (
          <AchievementNotification achievement={notification} onClose={clearNotification} />
        )}
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 fade-in-up">
            <h1 className="text-6xl font-bold mb-4 text-shimmer">
              Choose Your Level
            </h1>
            <div className="h-1 w-24 mx-auto bg-gradient-accent rounded-full mb-6"></div>
            <p className="text-muted-foreground text-xl">
              Select a difficulty level to begin
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 fade-in-up delay-200">
            {/* Easy Level */}
            <div 
              onClick={() => startQuiz('easy')}
              className="gradient-card rounded-3xl p-8 shadow-elegant border border-accent/20 hover-lift cursor-pointer transition-elegant hover:border-accent/50 group"
            >
              <Target className="w-16 h-16 mx-auto mb-6 text-green-500 group-hover:scale-110 transition-elegant" />
              <h3 className="text-3xl font-bold mb-4 text-center">Easy</h3>
              <p className="text-muted-foreground text-center mb-6">
                Perfect for beginners. Basic AI and ML concepts.
              </p>
              <div className="text-center">
                <span className="text-sm text-muted-foreground">5 Questions</span>
              </div>
            </div>

            {/* Medium Level */}
            <div 
              onClick={() => startQuiz('medium')}
              className="gradient-card rounded-3xl p-8 shadow-elegant border border-accent/20 hover-lift cursor-pointer transition-elegant hover:border-accent/50 group"
            >
              <Zap className="w-16 h-16 mx-auto mb-6 text-yellow-500 group-hover:scale-110 transition-elegant" />
              <h3 className="text-3xl font-bold mb-4 text-center">Medium</h3>
              <p className="text-muted-foreground text-center mb-6">
                Intermediate concepts. Neural networks and algorithms.
              </p>
              <div className="text-center">
                <span className="text-sm text-muted-foreground">5 Questions</span>
              </div>
            </div>

            {/* Hard Level */}
            <div 
              onClick={() => startQuiz('hard')}
              className="gradient-card rounded-3xl p-8 shadow-elegant border border-accent/20 hover-lift cursor-pointer transition-elegant hover:border-accent/50 group"
            >
              <Trophy className="w-16 h-16 mx-auto mb-6 text-accent group-hover:scale-110 transition-elegant" />
              <h3 className="text-3xl font-bold mb-4 text-center">Hard</h3>
              <p className="text-muted-foreground text-center mb-6">
                Advanced topics. Deep learning and optimization.
              </p>
              <div className="text-center">
                <span className="text-sm text-muted-foreground">5 Questions</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => setGameState('welcome')}
              variant="secondary"
              className="gap-2 px-6 py-4 rounded-xl transition-elegant"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (gameState === 'loading') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <QuizLoadingScreen 
          difficulty={loadingDifficulty}
          onComplete={levelResults.length > 0 ? onNextLevelLoadingComplete : onLoadingComplete}
        />
      </Suspense>
    );
  }

  // Level Complete Screen
  if (gameState === 'level-complete') {
    const lastResult = levelResults[levelResults.length - 1];
    const percentage = Math.round((lastResult.score / lastResult.totalQuestions) * 100);

    return (
      <div className="min-h-screen py-12 px-4">
        <BackToMenuButton onRestart={handleRestart} />
        <ThemeToggle />
        <SoundToggle />
        {notification && (
          <AchievementNotification achievement={notification} onClose={clearNotification} />
        )}
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Webcam (stays active) */}
            <div className="space-y-8 flex flex-col items-center fade-in-up">
              {showWebcam && (
                <WebcamGestureDetector 
                  onGestureDetected={handleGestureDetected}
                  onPerformanceDetected={handlePerformanceDetected}
                />
              )}
              <GestureGuide />
            </div>

            {/* Right Column - Results */}
            <div className="text-center fade-in-up delay-200">
              <Award className="w-24 h-24 mx-auto mb-6 text-accent animate-pulse" />
              <h1 className="text-5xl font-bold mb-4 text-shimmer">
                {lastResult.difficulty.charAt(0).toUpperCase() + lastResult.difficulty.slice(1)} Level Complete!
              </h1>
              <div className="h-1 w-24 mx-auto bg-gradient-accent rounded-full mb-8"></div>
              
              <div className="holographic-card animated-gradient-border rounded-3xl p-10 shadow-depth mb-8">
                <p className="text-muted-foreground text-xl mb-4">Your Score</p>
                <p className="text-7xl font-bold text-accent mb-2">{lastResult.score}/{lastResult.totalQuestions}</p>
                <p className="text-3xl font-semibold text-primary">{percentage}%</p>
              </div>

              <p className="text-muted-foreground text-xl mb-8">
                Ready for the next challenge?
              </p>

              <Button
                onClick={startNextLevel}
                size="lg"
                className="gap-3 bg-gradient-accent hover:opacity-90 px-12 py-8 text-2xl rounded-2xl transition-elegant hover:scale-105 shadow-elegant !text-black dark:!text-gray-100"
              >
                Continue to {DIFFICULTY_ORDER[currentDifficultyIndex + 1].toUpperCase()} Level
                <ChevronRight className="w-8 h-8 text-black dark:text-gray-100" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Final Results Screen
  if (gameState === 'final-results') {
    const totalScore = getTotalScore();
    const totalAnsweredQuestions = getTotalAnsweredQuestions();
    const totalQuestions = getTotalQuestions();
    const percentage = totalAnsweredQuestions > 0 ? Math.round((totalScore / totalAnsweredQuestions) * 100) : 0;
    const passed = percentage >= PASSING_SCORE;

    return (
      <div className="min-h-screen py-12 px-4 bg-background">
        <BackToMenuButton onRestart={handleRestart} />
        <ThemeToggle />
        <SoundToggle />
        {notification && (
          <AchievementNotification achievement={notification} onClose={clearNotification} />
        )}
        
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-yellow-500" />
            <h1 className="text-5xl font-bold mb-4">Quiz Completed!</h1>
            <div className="h-1 w-24 mx-auto bg-gradient-accent rounded-full mb-8"></div>
            
            <div className="holographic-card animated-gradient-border rounded-3xl p-10 shadow-depth mb-8 max-w-2xl mx-auto">
              <p className="text-muted-foreground text-2xl mb-4">Your Final Score</p>
              <p className="text-8xl font-bold text-accent mb-2">
                {totalScore}<span className="text-4xl text-muted-foreground">/{totalAnsweredQuestions}</span>
              </p>
              <p className={`text-4xl font-semibold ${passed ? 'text-green-500' : 'text-red-500'}`}>
                {percentage}% {passed ? '✅' : '❌'}
              </p>
              <p className="mt-4 text-xl text-muted-foreground">
                {passed ? 'Congratulations! You passed!' : 'Keep practicing to improve your score!'}
              </p>
            </div>
          </div>

          {/* Level-wise breakdown */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {levelResults.map((result, index) => {
              const answeredQuestions = result.answers.filter(answer => answer !== null).length;
              const levelPercentage = answeredQuestions > 0 ? Math.round((result.score / answeredQuestions) * 100) : 0;
              return (
                <div key={index} className="bg-card rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    {result.difficulty === 'easy' && <Target className="w-8 h-8 text-green-500" />}
                    {result.difficulty === 'medium' && <Zap className="w-8 h-8 text-yellow-500" />}
                    {result.difficulty === 'hard' && <Award className="w-8 h-8 text-red-500" />}
                    <h3 className="text-xl font-bold">
                      {result.difficulty.charAt(0).toUpperCase() + result.difficulty.slice(1)} Level
                    </h3>
                  </div>
                  <p className="text-3xl font-bold mb-2">
                    {result.score} <span className="text-muted-foreground">/ {answeredQuestions}</span>
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div 
                      className="h-2.5 rounded-full bg-gradient-accent" 
                      style={{ width: `${levelPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-muted-foreground">
                    {levelPercentage}% Correct
                  </p>
                </div>
              );
            })}
          </div>

          {/* Detailed Answers */}
          <div className="bg-card rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Detailed Results</h2>
            <div className="space-y-6">
              {levelResults.map((result, levelIndex) => (
                <div key={levelIndex} className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                    {result.difficulty.charAt(0).toUpperCase() + result.difficulty.slice(1)} Level
                  </h3>
                  <div className="space-y-4">
                    {result.questions.map((question, qIndex) => {
                      const userAnswer = result.answers[qIndex];
                      const isCorrect = userAnswer === question.correctAnswer;
                      
                      return (
                        <div 
                          key={qIndex} 
                          className={`p-4 rounded-lg border ${
                            isCorrect 
                              ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20' 
                              : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20'
                          }`}
                        >
                          <p className="font-medium mb-2">
                            {qIndex + 1}. {question.question}
                          </p>
                          <div className="ml-4 space-y-1">
                            {question.options.map((option, oIndex) => (
                              <div 
                                key={oIndex}
                                className={`flex items-center ${
                                  oIndex === question.correctAnswer 
                                    ? 'text-green-600 dark:text-green-400 font-semibold' 
                                    : ''
                                } ${
                                  userAnswer === oIndex && !isCorrect 
                                    ? 'text-red-600 dark:text-red-400 line-through' 
                                    : ''
                                }`}
                              >
                                {oIndex === question.correctAnswer && (
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                {userAnswer === oIndex && !isCorrect && (
                                  <XCircle className="w-4 h-4 mr-2 text-red-500" />
                                )}
                                <span>{String.fromCharCode(65 + oIndex)}. {option}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-12">
            <Button
              onClick={handleRestart}
              variant="outline"
              className="px-8 py-6 text-lg rounded-xl"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Restart Quiz
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="px-8 py-6 text-lg bg-gradient-accent text-black dark:text-white rounded-xl"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Playing Screen
  return (
    <div className="min-h-screen py-12 px-4">
      <BackToMenuButton onRestart={handleRestart} />
      <ThemeToggle />
      <SoundToggle />
      <Suspense fallback={null}>
        <PerformanceMonitor 
          isVisible={showPerformanceMonitor}
          onToggle={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
          onPerformanceChange={setDevicePerformance}
        />
      </Suspense>
      {notification && (
        <AchievementNotification achievement={notification} onClose={clearNotification} />
      )}
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-5xl md:text-6xl font-bold text-shimmer">
              {currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)} Level
            </h1>
          </div>
          <div className="h-1 w-24 mx-auto bg-gradient-accent rounded-full mb-6"></div>
          <p className="text-muted-foreground text-lg">
            Level {currentDifficultyIndex + 1} of {DIFFICULTY_ORDER.length}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Webcam & Guide */}
          <div className="space-y-8 flex flex-col items-center fade-in-up delay-200">
            {showWebcam && (
              <WebcamGestureDetector 
                onGestureDetected={handleGestureDetected}
                onPerformanceDetected={handlePerformanceDetected}
              />
            )}
            <GestureGuide />
          </div>

          {/* Right Column - Quiz */}
          <div className="space-y-8 flex flex-col items-center fade-in-up delay-400">
            <ProgressBar 
              current={currentQuestionIndex + 1} 
              total={questions.length} 
            />
            
            {currentQuestion && (
              <QuizQuestion
                question={currentQuestion.question}
                options={currentQuestion.options}
                selectedOption={selectedOption}
                onOptionSelect={handleOptionSelect}
                correctAnswer={currentQuestion.correctAnswer}
                showFeedback={showFeedback}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-5 w-full max-w-2xl">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                variant="secondary"
                className="flex-1 gap-2 py-6 text-base rounded-xl transition-elegant hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={selectedOption === null}
                variant="default"
                className="flex-1 gap-2 py-6 text-base rounded-xl bg-gradient-accent hover:opacity-90 transition-elegant hover:scale-105 shadow-elegant disabled:opacity-50 disabled:hover:scale-100 !text-black dark:!text-gray-100"
              >
                {currentQuestionIndex === questions.length - 1 ? "Finish Level" : "Next"}
                <ChevronRight className="w-5 h-5 text-black dark:text-gray-100" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="text-center mt-16 text-base text-muted-foreground fade-in-up delay-600">
          <p className="max-w-xl mx-auto">
            Use body poses to select your answer, then proceed to the next question
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
