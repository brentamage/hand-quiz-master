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
    <div className="gradient-card rounded-2xl p-8 shadow-elegant border border-accent/20 max-w-md hover-lift">
      <div className="flex items-center gap-3 mb-6">
        <Hand className="w-6 h-6 text-accent transition-elegant" />
        <h3 className="font-bold text-xl text-foreground">Gesture Controls</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {gestures.map((gesture, index) => (
          <div
            key={index}
            className="bg-secondary/50 rounded-xl p-4 border border-border hover:border-accent/30 transition-elegant hover:scale-105 hover:bg-secondary/70"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">{gesture.icon}</span>
              <span className="text-sm font-semibold text-muted-foreground">{gesture.fingers}</span>
            </div>
            <p className="text-sm text-foreground/90">{gesture.action}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestureGuide;
