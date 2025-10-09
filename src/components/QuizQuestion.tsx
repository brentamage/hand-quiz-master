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
    <div className="w-full max-w-2xl space-y-6 fade-in-up">
      <div className="gradient-card rounded-2xl p-10 shadow-elegant border border-accent/20 hover-lift">
        <h2 className="text-3xl font-bold text-foreground mb-8 leading-relaxed">{question}</h2>
        
        <div className="grid gap-5">
          {options.map((option, index) => (
            <Button
              key={index}
              onClick={() => onOptionSelect(index)}
              variant="secondary"
              className={cn(
                "w-full h-auto py-5 px-7 text-left flex items-start gap-5 transition-elegant overflow-hidden",
                "hover:scale-[1.02] hover:border-accent/50 hover:shadow-lg rounded-xl",
                selectedOption === index && "border-2 border-accent bg-accent/10 glow-accent scale-[1.02]"
              )}
            >
              <span className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-base transition-elegant",
                "bg-primary/20 text-primary-foreground",
                selectedOption === index && "bg-accent text-accent-foreground scale-110"
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
