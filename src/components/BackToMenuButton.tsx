import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BackToMenuButtonProps {
  className?: string;
  onRestart?: () => void;
}

const BackToMenuButton = ({ className = '', onRestart }: BackToMenuButtonProps) => {
  const navigate = useNavigate();

  const handleBackToMenu = () => {
    if (onRestart) {
      onRestart();
    } else {
      navigate('/');
    }
  };

  return (
    <Button
      onClick={handleBackToMenu}
      variant="secondary"
      size="icon"
      className={`fixed top-6 left-6 z-50 rounded-full w-14 h-14 shadow-elegant transition-elegant hover:scale-110 ${className}`}
      title="Back to Menu"
      aria-label="Back to Menu"
    >
      <Home className="w-6 h-6 text-accent transition-elegant" />
    </Button>
  );
};

export default BackToMenuButton;
