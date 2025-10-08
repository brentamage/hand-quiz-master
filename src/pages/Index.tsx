import { useState, useCallback } from "react";
import WebcamGestureDetector from "@/components/WebcamGestureDetector";
import QuizQuestion from "@/components/QuizQuestion";
import ProgressBar from "@/components/ProgressBar";
import GestureGuide from "@/components/GestureGuide";
import { quizQuestions } from "@/data/quizData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(quizQuestions.length).fill(null));

  const currentQuestion = quizQuestions[currentQuestionIndex];

  const handleGestureDetected = useCallback((gesture: string) => {
    // Map gestures to actions
    if (gesture.includes("1 Finger")) {
      handleOptionSelect(0);
    } else if (gesture.includes("2 Fingers")) {
      handleOptionSelect(1);
    } else if (gesture.includes("3 Fingers")) {
      handleOptionSelect(2);
    } else if (gesture.includes("4 Fingers")) {
      handleOptionSelect(3);
    } else if (gesture.includes("5 Fingers")) {
      handleNext();
    } else if (gesture.includes("Fist")) {
      handlePrevious();
    }
  }, [currentQuestionIndex, selectedOption]);

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
      const score = answers.reduce((acc, answer, idx) => 
        answer === quizQuestions[idx].correctAnswer ? acc + 1 : acc, 0
      );
      toast.success(`Quiz completed! Score: ${score}/${quizQuestions.length}`, {
        duration: 3000,
      });
    }
  };

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
          <p>Use hand gestures or click the buttons to navigate</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
