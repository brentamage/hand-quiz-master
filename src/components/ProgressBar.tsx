import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full max-w-2xl space-y-3 fade-in-up">
      <div className="flex justify-between text-base text-muted-foreground font-medium">
        <span className="transition-elegant">Question {current} of {total}</span>
        <span className="text-accent transition-elegant">{Math.round(percentage)}%</span>
      </div>
      <Progress value={percentage} className="h-3 transition-elegant" />
    </div>
  );
};

export default ProgressBar;
