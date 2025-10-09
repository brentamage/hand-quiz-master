import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';

// Sound effect generator using Web Audio API
class SoundGenerator {
  private audioContext: AudioContext;
  private masterGain: GainNode;
  private enabled: boolean = true;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = 0.3; // Default volume
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.masterGain.gain.value = volume;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 1) {
    if (!this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Success sound - upward arpeggio
  playSuccess() {
    if (!this.enabled) return;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine'), i * 80);
    });
  }

  // Error sound - descending tone
  playError() {
    if (!this.enabled) return;
    this.playTone(200, 0.3, 'square', 0.5);
  }

  // Click sound - short pop
  playClick() {
    if (!this.enabled) return;
    this.playTone(800, 0.05, 'sine', 0.3);
  }

  // Hover sound - subtle beep
  playHover() {
    if (!this.enabled) return;
    this.playTone(600, 0.03, 'sine', 0.2);
  }

  // Level complete - triumphant fanfare
  playLevelComplete() {
    if (!this.enabled) return;
    const melody = [
      { freq: 523.25, time: 0 },     // C5
      { freq: 659.25, time: 150 },   // E5
      { freq: 783.99, time: 300 },   // G5
      { freq: 1046.50, time: 450 }   // C6
    ];
    melody.forEach(note => {
      setTimeout(() => this.playTone(note.freq, 0.2, 'sine'), note.time);
    });
  }

  // Achievement unlocked - magical chime
  playAchievement() {
    if (!this.enabled) return;
    const chime = [
      { freq: 1046.50, time: 0 },    // C6
      { freq: 1318.51, time: 100 },  // E6
      { freq: 1567.98, time: 200 },  // G6
      { freq: 2093.00, time: 300 }   // C7
    ];
    chime.forEach(note => {
      setTimeout(() => this.playTone(note.freq, 0.3, 'sine', 0.8), note.time);
    });
  }

  // Gesture detected - quick blip
  playGestureDetected() {
    if (!this.enabled) return;
    this.playTone(1000, 0.08, 'sine', 0.4);
  }

  // Countdown tick
  playTick() {
    if (!this.enabled) return;
    this.playTone(440, 0.05, 'square', 0.3);
  }

  // Final countdown urgent tick
  playUrgentTick() {
    if (!this.enabled) return;
    this.playTone(880, 0.05, 'square', 0.5);
  }

  // Whoosh transition
  playWhoosh() {
    if (!this.enabled) return;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }
}

let soundGeneratorInstance: SoundGenerator | null = null;

export const useSoundEffects = () => {
  const [enabled, setEnabled] = useState(true);
  const soundRef = useRef<SoundGenerator | null>(null);

  useEffect(() => {
    if (!soundRef.current) {
      if (!soundGeneratorInstance) {
        soundGeneratorInstance = new SoundGenerator();
      }
      soundRef.current = soundGeneratorInstance;
    }
  }, []);

  const toggleSound = () => {
    const newState = !enabled;
    setEnabled(newState);
    if (soundRef.current) {
      soundRef.current.setEnabled(newState);
    }
  };

  const setVolume = (volume: number) => {
    if (soundRef.current) {
      soundRef.current.setVolume(volume);
    }
  };

  return {
    enabled,
    toggleSound,
    setVolume,
    playSuccess: () => soundRef.current?.playSuccess(),
    playError: () => soundRef.current?.playError(),
    playClick: () => soundRef.current?.playClick(),
    playHover: () => soundRef.current?.playHover(),
    playLevelComplete: () => soundRef.current?.playLevelComplete(),
    playAchievement: () => soundRef.current?.playAchievement(),
    playGestureDetected: () => soundRef.current?.playGestureDetected(),
    playTick: () => soundRef.current?.playTick(),
    playUrgentTick: () => soundRef.current?.playUrgentTick(),
    playWhoosh: () => soundRef.current?.playWhoosh()
  };
};

interface SoundToggleProps {
  className?: string;
}

export const SoundToggle = ({ className = '' }: SoundToggleProps) => {
  const { enabled, toggleSound } = useSoundEffects();

  return (
    <Button
      onClick={toggleSound}
      variant="secondary"
      size="icon"
      className={`fixed top-24 right-6 z-50 rounded-full w-14 h-14 shadow-elegant transition-elegant hover:scale-110 ${className}`}
      title={enabled ? 'Mute sounds' : 'Enable sounds'}
      aria-label="Toggle sound"
    >
      {enabled ? (
        <Volume2 className="w-6 h-6 text-accent transition-elegant" />
      ) : (
        <VolumeX className="w-6 h-6 text-accent transition-elegant" />
      )}
    </Button>
  );
};

export default SoundToggle;
