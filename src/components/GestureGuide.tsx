import { Hand } from "lucide-react";

const GestureGuide = () => {
  const gestures = [
    { fingers: "1", action: "Select A", icon: "☝️" },
    { fingers: "2", action: "Select B", icon: "✌️" },
    { fingers: "3", action: "Select C", icon: "🤟" },
    { fingers: "4", action: "Select D", icon: "🖖" },
    { fingers: "5", action: "Next Question", icon: "✋" },
    { fingers: "Fist", action: "Previous", icon: "✊" },
  ];

  return (
    <div className="gradient-card rounded-xl p-6 card-shadow border border-accent/20 max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <Hand className="w-5 h-5 text-accent" />
        <h3 className="font-bold text-lg text-foreground">Gesture Controls</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {gestures.map((gesture, index) => (
          <div
            key={index}
            className="bg-secondary/50 rounded-lg p-3 border border-border hover:border-accent/30 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{gesture.icon}</span>
              <span className="text-sm font-semibold text-muted-foreground">{gesture.fingers}</span>
            </div>
            <p className="text-xs text-foreground/80">{gesture.action}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestureGuide;
