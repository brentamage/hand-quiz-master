import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Palette, Check } from 'lucide-react';

const themes = [
  { name: 'dark', label: 'Dark', icon: '🌙', colors: ['#1a1a2e', '#16213e', '#0f3460'] },
  { name: 'light', label: 'Light', icon: '☀️', colors: ['#ffffff', '#f0f0f0', '#e0e0e0'] },
  { name: 'sakura', label: 'Sakura', icon: '🌸', colors: ['#ffb7c5', '#ffc0cb', '#ff69b4'] },
  { name: 'ocean', label: 'Ocean', icon: '🌊', colors: ['#006994', '#0891b2', '#06b6d4'] },
  { name: 'fire', label: 'Fire', icon: '🔥', colors: ['#ff4500', '#ff6347', '#ffa500'] },
  { name: 'forest', label: 'Forest', icon: '🌲', colors: ['#228b22', '#32cd32', '#90ee90'] },
  { name: 'midnight', label: 'Midnight', icon: '🌙', colors: ['#191970', '#4b0082', '#8b00ff'] },
  { name: 'sunset', label: 'Sunset', icon: '☀️', colors: ['#ff6b6b', '#ffa500', '#ff69b4'] },
  { name: 'neon', label: 'Neon', icon: '🎮', colors: ['#ff00ff', '#00ffff', '#00ff00'] },
  { name: 'classic', label: 'Classic', icon: '📚', colors: ['#8b4513', '#d2691e', '#deb887'] },
] as const;

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-24 right-6 z-50">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-14 h-14 shadow-elegant transition-elegant hover:scale-110 border-2 border-accent/30 hover:border-accent"
        title="Change Theme"
      >
        <Palette className="w-6 h-6 text-accent" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute right-0 mt-2 p-4 bg-card/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-accent/20 w-80"
          >
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              Choose Theme
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    setTheme(t.name as any);
                    setIsOpen(false);
                  }}
                  className={`relative p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                    theme === t.name
                      ? 'border-accent bg-accent/10'
                      : 'border-accent/20 hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{t.icon}</span>
                    <span className="text-sm font-medium">{t.label}</span>
                  </div>
                  <div className="flex gap-1">
                    {t.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-full h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {theme === t.name && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 bg-accent rounded-full p-1"
                    >
                      <Check className="w-3 h-3 text-black" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;
