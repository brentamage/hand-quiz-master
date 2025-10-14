import confetti from 'canvas-confetti';
import { useEffect } from 'react';

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
  useEffect(() => {
    if (!trigger) return;

    switch (type) {
      case 'confetti':
        fireConfetti(duration);
        break;
      case 'fireworks':
        fireFireworks(duration);
        break;
      case 'sparkles':
        fireSparkles(duration);
        break;
      case 'starburst':
        fireStarburst();
        break;
      case 'rainbow':
        fireRainbow(duration);
        break;
      case 'lightning':
        fireLightning();
        break;
      case 'flame':
        fireFlame(duration);
        break;
    }
  }, [trigger, type, duration]);

  return null;
};

// Confetti effect
const fireConfetti = (duration: number) => {
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

  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors
    });
  }, 200);
};

// Fireworks effect
const fireFireworks = (duration: number) => {
  const end = Date.now() + duration;
  const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 100,
      origin: { x: 0, y: 0.7 },
      colors: colors,
      ticks: 200,
      gravity: 1,
      decay: 0.94,
      startVelocity: 30,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 100,
      origin: { x: 1, y: 0.7 },
      colors: colors,
      ticks: 200,
      gravity: 1,
      decay: 0.94,
      startVelocity: 30,
    });

    if (Date.now() < end) {
      setTimeout(frame, 250);
    }
  }());
};

// Sparkles effect
const fireSparkles = (duration: number) => {
  const end = Date.now() + duration;
  const colors = ['#FFD700', '#FFA500', '#FFFF00', '#FFFFFF'];

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 90,
      spread: 360,
      origin: { x: Math.random(), y: Math.random() * 0.6 },
      colors: colors,
      shapes: ['star'],
      scalar: 1.2,
      ticks: 100,
      gravity: 0.5,
      decay: 0.95,
    });

    if (Date.now() < end) {
      setTimeout(frame, 100);
    }
  }());
};

// Starburst effect
const fireStarburst = () => {
  const colors = ['#FFD700', '#FFA500', '#FF6347', '#FF1493'];
  
  confetti({
    particleCount: 100,
    spread: 360,
    origin: { x: 0.5, y: 0.5 },
    colors: colors,
    shapes: ['star'],
    scalar: 1.5,
    ticks: 150,
    gravity: 0.8,
    startVelocity: 45,
  });
};

// Rainbow effect
const fireRainbow = (duration: number) => {
  const end = Date.now() + duration;
  
  (function frame() {
    confetti({
      particleCount: 3,
      angle: 90,
      spread: 45,
      origin: { x: Math.random(), y: 0 },
      colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
      ticks: 300,
      gravity: 0.6,
      decay: 0.92,
      startVelocity: 20,
    });

    if (Date.now() < end) {
      setTimeout(frame, 50);
    }
  }());
};

// Lightning effect
const fireLightning = () => {
  const colors = ['#FFFFFF', '#FFFF00', '#00FFFF'];
  
  // Quick burst
  confetti({
    particleCount: 50,
    spread: 180,
    origin: { x: 0.5, y: 0 },
    colors: colors,
    ticks: 50,
    gravity: 2,
    decay: 0.9,
    startVelocity: 50,
    shapes: ['line'],
  });
};

// Flame effect
const fireFlame = (duration: number) => {
  const end = Date.now() + duration;
  const colors = ['#FF4500', '#FF6347', '#FFA500', '#FFD700'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 90,
      spread: 30,
      origin: { x: 0.5, y: 1 },
      colors: colors,
      ticks: 150,
      gravity: -0.5,
      decay: 0.94,
      startVelocity: 25,
    });

    if (Date.now() < end) {
      setTimeout(frame, 50);
    }
  }());
};

export default CelebrationEffects;

// Hook for easy usage
export const useCelebration = () => {
  const celebrate = (type: CelebrationType, duration = 3000) => {
    switch (type) {
      case 'confetti':
        fireConfetti(duration);
        break;
      case 'fireworks':
        fireFireworks(duration);
        break;
      case 'sparkles':
        fireSparkles(duration);
        break;
      case 'starburst':
        fireStarburst();
        break;
      case 'rainbow':
        fireRainbow(duration);
        break;
      case 'lightning':
        fireLightning();
        break;
      case 'flame':
        fireFlame(duration);
        break;
    }
  };

  return { celebrate };
};
