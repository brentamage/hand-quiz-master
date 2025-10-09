import { useState, useCallback, useEffect } from "react";
import WebcamGestureDetector from "@/components/WebcamGestureDetector";
import QuizQuestion from "@/components/QuizQuestion";
import ProgressBar from "@/components/ProgressBar";
import GestureGuide from "@/components/GestureGuide";
import { quizQuestions } from "@/data/quizData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Trophy, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = quizQuestions[currentQuestionIndex];

  // Reset selected option when question changes
  useEffect(() => {
    setSelectedOption(answers[currentQuestionIndex]);
  }, [currentQuestionIndex, answers]);

  const handleGestureDetected = useCallback((gesture: string) => {
    const gestureLower = gesture.toLowerCase().trim();
    
    console.log("Gesture detected:", gesture); // Debug log to see actual class names
    
    // Map your Teachable Machine class names to actions
    // Model classes: A., B., C., D., NEXT, PREVIOUS
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
  }, [currentQuestionIndex]);

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = index;
    setAnswers(newAnswers);
    
    toast.success(`Option ${String.fromCharCode(65 + index)} selected`, {
      duration: 1500,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(answers[currentQuestionIndex + 1]);
      toast.info("Next question", { duration: 1000 });
    } else {
      // Quiz completed - show results
      setQuizCompleted(true);
      const score = answers.reduce((acc, answer, idx) => 
        answer === quizQuestions[idx].correctAnswer ? acc + 1 : acc, 0
      );
      toast.success(`Quiz completed! Score: ${score}/${quizQuestions.length}`, {
        duration: 3000,
      });
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setAnswers(new Array(quizQuestions.length).fill(null));
    setQuizCompleted(false);
    toast.info("Quiz restarted", { duration: 1000 });
  };

  const calculateScore = () => {
    return answers.reduce((acc, answer, idx) => 
      answer === quizQuestions[idx].correctAnswer ? acc + 1 : acc, 0
    );
  };

  const getScorePercentage = () => {
    return Math.round((calculateScore() / quizQuestions.length) * 100);
  };

  // Results Screen
  if (quizCompleted) {
    const score = calculateScore();
    const percentage = getScorePercentage();
    const passed = percentage >= 60;

    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Quiz Results
            </h1>
          </div>

          {/* Results Card */}
          <div className="gradient-card rounded-2xl p-8 card-shadow border border-accent/20 mb-8">
            <div className="text-center mb-8">
              <Trophy className={`w-24 h-24 mx-auto mb-4 ${passed ? 'text-green-500' : 'text-yellow-500'}`} />
              <h2 className="text-4xl font-bold mb-2">{passed ? 'Congratulations!' : 'Good Effort!'}</h2>
              <p className="text-muted-foreground text-lg">
                {passed ? 'You passed the quiz!' : 'Keep practicing to improve your score!'}
              </p>
            </div>

            {/* Score Display */}
            <div className="bg-card/50 rounded-xl p-6 mb-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Your Score</p>
                <p className="text-6xl font-bold text-accent mb-2">{score}/{quizQuestions.length}</p>
                <p className="text-2xl font-semibold text-primary">{percentage}%</p>
              </div>
            </div>

            {/* Question Review */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Question Review</h3>
              {quizQuestions.map((question, idx) => {
                const userAnswer = answers[idx];
                const isCorrect = userAnswer === question.correctAnswer;
                const wasAnswered = userAnswer !== null;

                return (
                  <div key={question.id} className="bg-card/30 rounded-lg p-4 border border-accent/10">
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold mb-2">{idx + 1}. {question.question}</p>
                        {wasAnswered ? (
                          <>
                            <p className="text-sm text-muted-foreground">
                              Your answer: <span className={isCorrect ? 'text-green-500' : 'text-red-500'}>
                                {question.options[userAnswer]}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p className="text-sm text-green-500">
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

            {/* Restart Button */}
            <div className="mt-8 text-center">
              <Button
                onClick={handleRestart}
                size="lg"
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <RotateCcw className="w-5 h-5" />
                Restart Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOption(answers[currentQuestionIndex - 1]);
      toast.info("Previous question", { duration: 1000 });
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Gesture Quiz
          </h1>
          <p className="text-muted-foreground text-lg">
            Control the quiz using hand gestures - no mouse needed!
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Webcam & Guide */}
          <div className="space-y-6 flex flex-col items-center">
            <WebcamGestureDetector onGestureDetected={handleGestureDetected} />
            <GestureGuide />
          </div>

          {/* Right Column - Quiz */}
          <div className="space-y-6 flex flex-col items-center">
            <ProgressBar 
              current={currentQuestionIndex + 1} 
              total={quizQuestions.length} 
            />
            
            <QuizQuestion
              question={currentQuestion.question}
              options={currentQuestion.options}
              selectedOption={selectedOption}
              onOptionSelect={handleOptionSelect}
            />

            {/* Navigation Buttons */}
            <div className="flex gap-4 w-full max-w-2xl">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                variant="secondary"
                className="flex-1 gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                variant="default"
                className="flex-1 gap-2 bg-primary hover:bg-primary/90"
              >
                {currentQuestionIndex === quizQuestions.length - 1 ? "Finish" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Make a gesture to select your answer (1-4), then use the buttons to navigate</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
