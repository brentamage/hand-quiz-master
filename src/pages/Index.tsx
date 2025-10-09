import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WebcamGestureDetector from "@/components/WebcamGestureDetector";
import QuizQuestion from "@/components/QuizQuestion";
import ProgressBar from "@/components/ProgressBar";
import GestureGuide from "@/components/GestureGuide";
import ThemeToggle from "@/components/ThemeToggle";
import AnimatedBackground from "@/components/AnimatedBackground";
import { getQuestionsByDifficulty, DifficultyLevel, Question } from "@/data/quizData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Trophy, RotateCcw, CheckCircle, XCircle, Play, Sparkles, Target, Zap, Award, Star } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useSoundEffects, SoundToggle } from "@/components/SoundEffects";
import AchievementNotification, { useAchievements } from "@/components/AchievementSystem";
import BackToMenuButton from "@/components/BackToMenuButton";

type GameState = 'welcome' | 'difficulty-select' | 'playing' | 'level-complete' | 'final-results';

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
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [currentDifficultyIndex, setCurrentDifficultyIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [levelResults, setLevelResults] = useState<LevelResult[]>([]);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [levelStartTime, setLevelStartTime] = useState<number>(0);

  // Sound effects and achievements
  const soundEffects = useSoundEffects();
  const { achievements, notification, checkAchievements, clearNotification } = useAchievements();

  const currentDifficulty = DIFFICULTY_ORDER[currentDifficultyIndex];
  const currentQuestion = questions[currentQuestionIndex];

  // Reset selected option when question changes
  useEffect(() => {
    if (gameState === 'playing' && questions.length > 0) {
      setSelectedOption(answers[currentQuestionIndex]);
    }
  }, [currentQuestionIndex, gameState, answers]);

  // Trigger confetti when final results show and user passed
  useEffect(() => {
    if (gameState === 'final-results') {
      const totalScore = getTotalScore();
      const totalQuestions = getTotalQuestions();
      const percentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
      const passed = percentage >= PASSING_SCORE;

      if (passed) {
        // Fire confetti multiple times for celebration
        const duration = 3000;
        const end = Date.now() + duration;
        const colors = ['#c084fc', '#a855f7', '#9333ea', '#7c3aed', '#6366f1'];

        (function frame() {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());

        // Big burst in the center
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: colors
          });
        }, 200);
      }
    }
  }, [gameState, levelResults]);

  const startQuiz = (selectedDifficulty: DifficultyLevel) => {
    const difficultyIndex = DIFFICULTY_ORDER.indexOf(selectedDifficulty);
    const quizQuestions = getQuestionsByDifficulty(selectedDifficulty);
    setCurrentDifficultyIndex(difficultyIndex);
    setQuestions(quizQuestions);
    setAnswers(new Array(quizQuestions.length).fill(null));
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setLevelResults([]);
    setCorrectStreak(0);
    setLevelStartTime(Date.now());
    setGameState('playing');
    soundEffects.playWhoosh();
    toast.success(`${selectedDifficulty.toUpperCase()} level started!`, { duration: 2000 });
  };

  const startNextLevel = () => {
    const nextIndex = currentDifficultyIndex + 1;
    const nextDifficulty = DIFFICULTY_ORDER[nextIndex];
    const quizQuestions = getQuestionsByDifficulty(nextDifficulty);
    
    setCurrentDifficultyIndex(nextIndex);
    setQuestions(quizQuestions);
    setAnswers(new Array(quizQuestions.length).fill(null));
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setCorrectStreak(0);
    setLevelStartTime(Date.now());
    setGameState('playing');
    soundEffects.playWhoosh();
    toast.success(`${nextDifficulty.toUpperCase()} level started!`, { duration: 2000 });
  };

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = index;
    setAnswers(newAnswers);
    
    soundEffects.playClick();
    toast.success(`Option ${String.fromCharCode(65 + index)} selected`, {
      duration: 1500,
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOption(answers[currentQuestionIndex - 1]);
      toast.info("Previous question", { duration: 1000 });
    }
  };

  const calculateScore = (levelAnswers: (number | null)[], levelQuestions: Question[]) => {
    return levelAnswers.reduce((acc, answer, idx) => 
      answer === levelQuestions[idx].correctAnswer ? acc + 1 : acc, 0
    );
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Check if current answer is correct for streak tracking
      if (selectedOption !== null && selectedOption === currentQuestion.correctAnswer) {
        setCorrectStreak(prev => prev + 1);
      } else if (selectedOption !== null) {
        setCorrectStreak(0);
      }
      
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(answers[currentQuestionIndex + 1]);
      soundEffects.playWhoosh();
      toast.info("Next question", { duration: 1000 });
    } else {
      // Level completed
      const score = calculateScore(answers, questions);
      const timeSpent = Math.floor((Date.now() - levelStartTime) / 1000);
      const percentage = Math.round((score / questions.length) * 100);
      
      // Play sound based on performance
      if (percentage === 100) {
        soundEffects.playLevelComplete();
      } else if (percentage >= 70) {
        soundEffects.playSuccess();
      } else {
        soundEffects.playError();
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
        const message = newLevelResults.length >= 3 ? 'All levels completed!' : 'Quiz completed!';
        toast.success(message, { duration: 3000 });
      } else {
        // More levels to go - show level complete screen
        setGameState('level-complete');
        toast.success(`${currentDifficulty.toUpperCase()} level completed!`, { duration: 2000 });
      }
    }
  };

  const handleGestureDetected = useCallback((gesture: string) => {
    if (gameState !== 'playing') return;
    
    const gestureLower = gesture.toLowerCase().trim();
    
    if (gestureLower === "a." || gestureLower === "a") {
      handleOptionSelect(0);
    } else if (gestureLower === "b." || gestureLower === "b") {
      handleOptionSelect(1);
    } else if (gestureLower === "c." || gestureLower === "c") {
      handleOptionSelect(2);
    } else if (gestureLower === "d." || gestureLower === "d") {
      handleOptionSelect(3);
    } else if (gestureLower === "next") {
      handleNext();
    } else if (gestureLower === "previous") {
      handlePrevious();
    }
  }, [currentQuestionIndex, gameState, answers, questions]);

  const handleRestart = () => {
    setGameState('welcome');
    setCurrentDifficultyIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setQuestions([]);
    setLevelResults([]);
    toast.info("Returning to home", { duration: 1000 });
  };

  const getTotalScore = () => {
    return levelResults.reduce((acc, result) => acc + result.score, 0);
  };

  const getTotalQuestions = () => {
    return levelResults.reduce((acc, result) => acc + result.totalQuestions, 0);
  };

  const getOverallPercentage = () => {
    const total = getTotalQuestions();
    return total > 0 ? Math.round((getTotalScore() / total) * 100) : 0;
  };

  // Welcome Screen
  if (gameState === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Animated Background */}
        <AnimatedBackground />
        
        {/* Content */}
        <ThemeToggle />
        <SoundToggle />
        {notification && (
          <AchievementNotification achievement={notification} onClose={clearNotification} />
        )}
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center fade-in-up">
            <div className="mb-8">
              <Sparkles className="w-20 h-20 mx-auto mb-6 text-accent animate-pulse drop-shadow-2xl" />
            </div>
            <h1 className="text-7xl md:text-8xl font-bold mb-6 text-shimmer drop-shadow-2xl">
              Gesture Quiz
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-accent rounded-full mb-8 shadow-glow"></div>
            <p className="text-foreground text-2xl max-w-2xl mx-auto mb-12 leading-relaxed drop-shadow-lg font-medium">
              Test your knowledge using hand gestures. No mouse needed - just your hands!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => setGameState('difficulty-select')}
                size="lg"
                className="gap-3 bg-gradient-accent hover:opacity-90 px-12 py-8 text-2xl rounded-2xl transition-elegant hover:scale-105 shadow-elegant !text-black dark:!text-gray-100 backdrop-blur-sm"
              >
                <Play className="w-8 h-8 text-black dark:text-gray-100" />
                Start Quiz
              </Button>
              
              <Button
                onClick={() => navigate('/showcase')}
                size="lg"
                variant="outline"
                className="gap-3 px-12 py-8 text-xl rounded-2xl transition-elegant hover:scale-105 border-2 border-accent/50 hover:border-accent backdrop-blur-sm"
              >
                <Sparkles className="w-7 h-7 text-accent" />
                View Features
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Difficulty Selection Screen
  if (gameState === 'difficulty-select') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <BackToMenuButton />
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

  // Level Complete Screen
  if (gameState === 'level-complete') {
    const lastResult = levelResults[levelResults.length - 1];
    const percentage = Math.round((lastResult.score / lastResult.totalQuestions) * 100);

    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <BackToMenuButton />
        <ThemeToggle />
        <SoundToggle />
        {notification && (
          <AchievementNotification achievement={notification} onClose={clearNotification} />
        )}
        <div className="container mx-auto max-w-4xl">
          <div className="text-center fade-in-up">
            <Award className="w-24 h-24 mx-auto mb-6 text-accent animate-pulse" />
            <h1 className="text-6xl font-bold mb-4 text-shimmer">
              {lastResult.difficulty.charAt(0).toUpperCase() + lastResult.difficulty.slice(1)} Level Complete!
            </h1>
            <div className="h-1 w-24 mx-auto bg-gradient-accent rounded-full mb-8"></div>
            
            <div className="gradient-card rounded-3xl p-10 shadow-elegant border border-accent/20 mb-8 hover-lift">
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
    );
  }

  // Final Results Screen
  if (gameState === 'final-results') {
    const totalScore = getTotalScore();
    const totalQuestions = getTotalQuestions();
    const percentage = getOverallPercentage();
    const passed = percentage >= PASSING_SCORE;

    return (
      <div className="min-h-screen py-12 px-4">
        <BackToMenuButton />
        <ThemeToggle />
        <SoundToggle />
        {notification && (
          <AchievementNotification achievement={notification} onClose={clearNotification} />
        )}
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12 fade-in-up">
            {passed ? (
              <>
                <Trophy className="w-32 h-32 mx-auto mb-6 text-accent animate-pulse" />
                <h1 className="text-7xl md:text-8xl font-bold mb-4 bg-gradient-success bg-clip-text text-transparent">
                  Congratulations!
                </h1>
                <div className="h-1 w-32 mx-auto bg-gradient-success rounded-full mb-6"></div>
                <p className="text-muted-foreground text-2xl">
                  You've successfully completed all levels!
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-32 h-32 mx-auto mb-6 text-destructive" />
                <h1 className="text-7xl md:text-8xl font-bold mb-4 text-destructive">
                  Better Luck Next Time
                </h1>
                <div className="h-1 w-32 mx-auto bg-gradient-danger rounded-full mb-6"></div>
                <p className="text-muted-foreground text-2xl">
                  Keep practicing to improve your score!
                </p>
              </>
            )}
          </div>

          {/* Overall Score Card */}
          <div className={`gradient-card rounded-3xl p-10 shadow-elegant border mb-8 fade-in-up delay-200 hover-lift ${
            passed ? 'border-success/30' : 'border-destructive/30'
          }`}>
            <div className="text-center mb-8">
              <p className="text-muted-foreground mb-3 text-sm uppercase tracking-wider">Overall Score</p>
              <p className={`text-8xl font-bold mb-3 ${passed ? 'text-success' : 'text-destructive'}`}>
                {totalScore}/{totalQuestions}
              </p>
              <p className={`text-4xl font-semibold ${passed ? 'text-success' : 'text-destructive'}`}>
                {percentage}%
              </p>
              <p className="text-muted-foreground mt-4 text-lg">
                {passed ? `Passed (${PASSING_SCORE}% required)` : `Failed (${PASSING_SCORE}% required)`}
              </p>
            </div>

            {/* Level Breakdown */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {levelResults.map((result) => {
                const levelPercentage = Math.round((result.score / result.totalQuestions) * 100);
                return (
                  <div key={result.difficulty} className="bg-card/50 rounded-2xl p-6 border border-accent/10">
                    <div className="flex items-center gap-3 mb-4">
                      {result.difficulty === 'easy' && <Target className="w-8 h-8 text-green-500" />}
                      {result.difficulty === 'medium' && <Zap className="w-8 h-8 text-yellow-500" />}
                      {result.difficulty === 'hard' && <Trophy className="w-8 h-8 text-accent" />}
                      <h3 className="text-xl font-bold capitalize">{result.difficulty}</h3>
                    </div>
                    <p className="text-3xl font-bold text-accent mb-1">{result.score}/{result.totalQuestions}</p>
                    <p className="text-lg text-muted-foreground">{levelPercentage}%</p>
                  </div>
                );
              })}
            </div>

            {/* Detailed Review */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="h-8 w-1 bg-gradient-accent rounded-full"></div>
                Complete Review
              </h3>
              
              {levelResults.map((result) => (
                <div key={result.difficulty} className="space-y-4">
                  <h4 className="text-xl font-bold capitalize text-accent mb-4">
                    {result.difficulty} Level Questions
                  </h4>
                  {result.questions.map((question, idx) => {
                    const userAnswer = result.answers[idx];
                    const isCorrect = userAnswer === question.correctAnswer;
                    const wasAnswered = userAnswer !== null;

                    return (
                      <div key={question.id} className="bg-card/30 rounded-xl p-5 border border-accent/10 transition-elegant hover:border-accent/30 hover:bg-card/40">
                        <div className="flex items-start gap-4">
                          {isCorrect ? (
                            <CheckCircle className="w-7 h-7 text-success flex-shrink-0 mt-1" />
                          ) : (
                            <XCircle className="w-7 h-7 text-destructive flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold mb-3 text-lg">{idx + 1}. {question.question}</p>
                            {wasAnswered ? (
                              <>
                                <p className="text-sm text-muted-foreground">
                                  Your answer: <span className={isCorrect ? 'text-success' : 'text-destructive'}>
                                    {question.options[userAnswer]}
                                  </span>
                                </p>
                                {!isCorrect && (
                                  <p className="text-sm text-success">
                                    Correct answer: {question.options[question.correctAnswer]}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-yellow-500">Not answered</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex gap-4 justify-center flex-wrap">
              <Button
                onClick={handleRestart}
                size="lg"
                className="gap-3 bg-gradient-accent hover:opacity-90 px-8 py-6 text-lg rounded-xl transition-elegant hover:scale-105 shadow-elegant !text-black dark:!text-gray-100"
              >
                <RotateCcw className="w-6 h-6 text-black dark:text-gray-100" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Playing Screen
  return (
    <div className="min-h-screen py-12 px-4">
      <BackToMenuButton />
      <ThemeToggle />
      <SoundToggle />
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
            <WebcamGestureDetector onGestureDetected={handleGestureDetected} />
            <GestureGuide />
          </div>

          {/* Right Column - Quiz */}
          <div className="space-y-8 flex flex-col items-center fade-in-up delay-400">
            <ProgressBar 
              current={currentQuestionIndex + 1} 
              total={questions.length} 
            />
            
            <QuizQuestion
              question={currentQuestion.question}
              options={currentQuestion.options}
              selectedOption={selectedOption}
              onOptionSelect={handleOptionSelect}
            />

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
            Use hand gestures to select your answer, then proceed to the next question
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
