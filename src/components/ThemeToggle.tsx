import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="secondary"
      size="icon"
      className="fixed top-6 right-6 z-50 rounded-full w-14 h-14 shadow-elegant transition-elegant hover:scale-110"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-6 h-6 text-accent transition-elegant" />
      ) : (
        <Moon className="w-6 h-6 text-accent transition-elegant" />
      )}
    </Button>
  );
};

export default ThemeToggle;
