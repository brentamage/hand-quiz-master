import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  question: string;
  options: string[];
  selectedOption: number | null;
  onOptionSelect: (index: number) => void;
  correctAnswer?: number;
  showFeedback?: boolean;
}

const QuizQuestion = ({ question, options, selectedOption, onOptionSelect, correctAnswer, showFeedback }: QuizQuestionProps) => {
  const optionLabels = ["A", "B", "C", "D"];

  const getButtonStyle = (index: number) => {
    if (showFeedback && selectedOption !== null) {
      // Always show correct answer in green
      if (index === correctAnswer) {
        return "border-2 border-green-500 bg-green-500/20";
      }
      // Show selected wrong answer in red
      if (index === selectedOption && selectedOption !== correctAnswer) {
        return "border-2 border-red-500 bg-red-500/20";
      }
    }
    // Purple highlight when selected (before feedback)
    if (selectedOption === index && !showFeedback) {
      return "border-2 border-accent bg-accent/10 glow-accent scale-[1.02]";
    }
    return "";
  };

  const getLabelStyle = (index: number) => {
    if (showFeedback && selectedOption !== null) {
      // Correct answer - green
      if (index === correctAnswer) {
        return "bg-green-500 text-white scale-110";
      }
      // Wrong answer - red
      if (index === selectedOption && selectedOption !== correctAnswer) {
        return "bg-red-500 text-white scale-110";
      }
    }
    // Purple when selected (before feedback)
    if (selectedOption === index && !showFeedback) {
      return "bg-accent text-accent-foreground scale-110";
    }
    return "bg-primary/20 text-primary-foreground";
  };

  return (
    <div className="w-full max-w-2xl space-y-6 fade-in-up">
      <div className="gradient-card rounded-2xl p-10 shadow-elegant border border-accent/20 hover-lift">
        <h2 className="text-3xl font-bold text-foreground mb-8 leading-relaxed">{question}</h2>
        
        <div className="grid gap-5">
          {options.map((option, index) => (
            <Button
              key={index}
              onClick={() => onOptionSelect(index)}
              variant="secondary"
              disabled={showFeedback}
              className={cn(
                "w-full h-auto py-5 px-7 text-left flex items-start gap-5 transition-elegant overflow-hidden",
                "hover:scale-[1.02] hover:border-accent/50 hover:shadow-lg rounded-xl",
                getButtonStyle(index)
              )}
            >
              <span className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-base transition-elegant",
                getLabelStyle(index)
              )}>
                {optionLabels[index]}
              </span>
              <span className="text-foreground text-lg leading-relaxed break-words word-break flex-1 min-w-0 overflow-hidden">{option}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizQuestion;
