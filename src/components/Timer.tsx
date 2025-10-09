import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  isActive: boolean;
}

const Timer = ({ duration, onTimeUp, isActive }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isActive) return;

    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isActive, onTimeUp]);

  const percentage = (timeLeft / duration) * 100;
  const isWarning = percentage <= 30;
  const isCritical = percentage <= 10;

  return (
    <div className="w-full max-w-2xl fade-in-up">
      <div className="gradient-card rounded-2xl p-6 shadow-elegant border border-accent/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock className={`w-6 h-6 transition-elegant ${
              isCritical ? 'text-destructive animate-pulse' : 
              isWarning ? 'text-yellow-500' : 
              'text-accent'
            }`} />
            <span className="text-lg font-semibold text-foreground">Time Remaining</span>
          </div>
          <span className={`text-3xl font-bold transition-elegant ${
            isCritical ? 'text-destructive' : 
            isWarning ? 'text-yellow-500' : 
            'text-accent'
          }`}>
            {timeLeft}s
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-linear ${
              isCritical ? 'bg-gradient-danger' : 
              isWarning ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
              'bg-gradient-accent'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Timer;
