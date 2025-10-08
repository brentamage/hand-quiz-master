import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  question: string;
  options: string[];
  selectedOption: number | null;
  onOptionSelect: (index: number) => void;
}

const QuizQuestion = ({ question, options, selectedOption, onOptionSelect }: QuizQuestionProps) => {
  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="w-full max-w-2xl space-y-6 animate-fade-in">
      <div className="gradient-card rounded-xl p-8 card-shadow border border-accent/20">
        <h2 className="text-2xl font-bold text-foreground mb-6">{question}</h2>
        
        <div className="grid gap-4">
          {options.map((option, index) => (
            <Button
              key={index}
              onClick={() => onOptionSelect(index)}
              variant="secondary"
              className={cn(
                "w-full h-auto py-4 px-6 text-left flex items-start gap-4 transition-all duration-300",
                "hover:scale-[1.02] hover:border-accent/50",
                selectedOption === index && "border-2 border-accent bg-accent/10 glow-accent"
              )}
            >
              <span className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold",
                "bg-primary/20 text-primary-foreground",
                selectedOption === index && "bg-accent text-accent-foreground"
              )}>
                {optionLabels[index]}
              </span>
              <span className="text-foreground text-lg">{option}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizQuestion;
