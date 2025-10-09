import { useState } from 'react';
import { Palette, Check, Sparkles, Moon, Sun, Zap, Flame, Droplet, Leaf } from 'lucide-react';
import { Button } from './ui/button';

export interface Theme {
  id: string;
  name: string;
  icon: React.ReactNode;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    card: string;
  };
  gradient: string;
}

const themes: Theme[] = [
  {
    id: 'purple-dream',
    name: 'Purple Dream',
    icon: <Sparkles className="w-5 h-5" />,
    colors: {
      primary: '#a855f7',
      secondary: '#c084fc',
      accent: '#a855f7',
      background: '#0f0f0f',
      foreground: '#ffffff',
      card: '#1a1a1a'
    },
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    icon: <Moon className="w-5 h-5" />,
    colors: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      accent: '#3b82f6',
      background: '#0a0e1a',
      foreground: '#ffffff',
      card: '#151b2e'
    },
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    icon: <Sun className="w-5 h-5" />,
    colors: {
      primary: '#f97316',
      secondary: '#fb923c',
      accent: '#f97316',
      background: '#1a0f0a',
      foreground: '#ffffff',
      card: '#2e1b15'
    },
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    id: 'electric-cyan',
    name: 'Electric Cyan',
    icon: <Zap className="w-5 h-5" />,
    colors: {
      primary: '#06b6d4',
      secondary: '#22d3ee',
      accent: '#06b6d4',
      background: '#0a1a1a',
      foreground: '#ffffff',
      card: '#152e2e'
    },
    gradient: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'crimson-fire',
    name: 'Crimson Fire',
    icon: <Flame className="w-5 h-5" />,
    colors: {
      primary: '#ef4444',
      secondary: '#f87171',
      accent: '#ef4444',
      background: '#1a0a0a',
      foreground: '#ffffff',
      card: '#2e1515'
    },
    gradient: 'from-red-500 to-red-600'
  },
  {
    id: 'ocean-teal',
    name: 'Ocean Teal',
    icon: <Droplet className="w-5 h-5" />,
    colors: {
      primary: '#14b8a6',
      secondary: '#2dd4bf',
      accent: '#14b8a6',
      background: '#0a1a1a',
      foreground: '#ffffff',
      card: '#15302e'
    },
    gradient: 'from-teal-500 to-teal-600'
  },
  {
    id: 'emerald-forest',
    name: 'Emerald Forest',
    icon: <Leaf className="w-5 h-5" />,
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#10b981',
      background: '#0a1a0f',
      foreground: '#ffffff',
      card: '#152e1b'
    },
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'royal-violet',
    name: 'Royal Violet',
    icon: <Sparkles className="w-5 h-5" />,
    colors: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      accent: '#8b5cf6',
      background: '#0f0a1a',
      foreground: '#ffffff',
      card: '#1b152e'
    },
    gradient: 'from-violet-500 to-violet-600'
  }
];

interface ThemeCustomizerProps {
  onThemeChange?: (theme: Theme) => void;
}

const ThemeCustomizer = ({ onThemeChange }: ThemeCustomizerProps) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('purple-dream');
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme.id);
    
    // Apply theme to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    
    // Update Tailwind CSS variables
    document.documentElement.style.cssText = `
      --primary: ${theme.colors.primary};
      --secondary: ${theme.colors.secondary};
      --accent: ${theme.colors.accent};
      --background: ${theme.colors.background};
      --foreground: ${theme.colors.foreground};
      --card: ${theme.colors.card};
    `;

    if (onThemeChange) {
      onThemeChange(theme);
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-50">
      {/* Theme Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className="rounded-full w-16 h-16 shadow-2xl bg-gradient-accent hover:scale-110 transition-elegant"
      >
        <Palette className="w-7 h-7" />
      </Button>

      {/* Theme Selector Panel */}
      {isOpen && (
        <div className="absolute bottom-20 left-0 animate-slide-in-up">
          <div className="gradient-card rounded-2xl p-6 shadow-2xl border border-accent/30 w-80">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Palette className="w-6 h-6 text-accent" />
                Choose Theme
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme)}
                  className={`relative group rounded-xl p-4 border-2 transition-all duration-300 ${
                    selectedTheme === theme.id
                      ? 'border-accent shadow-lg scale-105'
                      : 'border-accent/20 hover:border-accent/50 hover:scale-102'
                  }`}
                >
                  {/* Theme Preview */}
                  <div className={`w-full h-20 rounded-lg bg-gradient-to-br ${theme.gradient} mb-3 flex items-center justify-center`}>
                    <div className="text-white text-3xl">
                      {theme.icon}
                    </div>
                  </div>

                  {/* Theme Name */}
                  <p className="text-sm font-semibold text-center mb-1">
                    {theme.name}
                  </p>

                  {/* Selected Indicator */}
                  {selectedTheme === theme.id && (
                    <div className="absolute top-2 right-2 bg-accent rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Color Dots */}
                  <div className="flex justify-center gap-1 mt-2">
                    <div 
                      className="w-3 h-3 rounded-full border border-white/30"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-white/30"
                      style={{ backgroundColor: theme.colors.secondary }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-white/30"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-xs text-muted-foreground text-center">
                ✨ Theme changes apply instantly across the entire app
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeCustomizer;
