// Celebration effects disabled - no confetti
export type CelebrationType = 
  | 'confetti' 
  | 'fireworks' 
  | 'sparkles' 
  | 'starburst' 
  | 'rainbow'
  | 'lightning'
  | 'flame';

interface CelebrationEffectsProps {
  type: CelebrationType;
  trigger: boolean;
  duration?: number;
}

const CelebrationEffects = ({ type, trigger, duration = 3000 }: CelebrationEffectsProps) => {
  // No celebration effects - disabled
  return null;
};

export default CelebrationEffects;

// Hook for easy usage (disabled)
export const useCelebration = () => {
  const celebrate = (type: CelebrationType, duration = 3000) => {
    // No celebration effects - disabled
  };

  return { celebrate };
};
