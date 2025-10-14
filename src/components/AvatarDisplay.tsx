import { Avatar } from '@/types/profile';

interface AvatarDisplayProps {
  avatar: Avatar;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

const AvatarDisplay = ({ 
  avatar, 
  size = 'md', 
  className = '',
  showBorder = true 
}: AvatarDisplayProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  const getBackgroundStyle = () => {
    if (avatar.background === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${avatar.primaryColor}, ${avatar.secondaryColor})`
      };
    } else if (avatar.background === 'pattern') {
      return {
        background: `repeating-linear-gradient(45deg, ${avatar.primaryColor}, ${avatar.primaryColor} 10px, ${avatar.secondaryColor} 10px, ${avatar.secondaryColor} 20px)`
      };
    }
    return { background: avatar.primaryColor };
  };

  const renderPattern = () => {
    switch (avatar.pattern) {
      case 'stripes':
        return (
          <div className="absolute inset-0 opacity-30">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute h-full"
                style={{
                  left: `${i * 12.5}%`,
                  width: '6.25%',
                  background: avatar.secondaryColor
                }}
              />
            ))}
          </div>
        );
      case 'dots':
        return (
          <div className="absolute inset-0 opacity-30">
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${(i % 5) * 20 + 10}%`,
                  top: `${Math.floor(i / 5) * 20 + 10}%`,
                  width: '8%',
                  height: '8%',
                  background: avatar.secondaryColor
                }}
              />
            ))}
          </div>
        );
      case 'waves':
        return (
          <svg className="absolute inset-0 opacity-30" viewBox="0 0 100 100">
            <path
              d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z"
              fill={avatar.secondaryColor}
            />
          </svg>
        );
      case 'grid':
        return (
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke={avatar.secondaryColor}
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const renderAvatar = () => {
    switch (avatar.style) {
      case 'robot':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Robot head */}
            <div className="w-3/5 h-3/5 rounded-lg relative" style={{ background: avatar.secondaryColor }}>
              {/* Eyes */}
              <div className="absolute top-1/3 left-1/4 w-1/6 h-1/6 bg-white rounded-full" />
              <div className="absolute top-1/3 right-1/4 w-1/6 h-1/6 bg-white rounded-full" />
              {/* Antenna */}
              <div className="absolute -top-1/4 left-1/2 transform -translate-x-1/2 w-1 h-1/4 bg-white" />
              <div className="absolute -top-1/3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
        );
      
      case 'geometric':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Triangle */}
            <svg viewBox="0 0 100 100" className="w-3/5 h-3/5">
              <polygon
                points="50,20 80,70 20,70"
                fill={avatar.secondaryColor}
              />
              <circle cx="50" cy="50" r="15" fill="white" opacity="0.9" />
            </svg>
          </div>
        );
      
      case 'gradient':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div
              className="w-3/5 h-3/5 rounded-full"
              style={{
                background: `radial-gradient(circle, ${avatar.secondaryColor}, ${avatar.primaryColor})`
              }}
            />
          </div>
        );
      
      case 'pixel':
        return (
          <div className="relative w-full h-full grid grid-cols-8 grid-rows-8 gap-0.5 p-2">
            {[...Array(64)].map((_, i) => (
              <div
                key={i}
                className="rounded-sm"
                style={{
                  background: Math.random() > 0.5 ? avatar.secondaryColor : 'transparent'
                }}
              />
            ))}
          </div>
        );
      
      case 'abstract':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="30" cy="30" r="20" fill={avatar.secondaryColor} opacity="0.7" />
              <circle cx="70" cy="50" r="25" fill={avatar.secondaryColor} opacity="0.5" />
              <circle cx="50" cy="70" r="15" fill="white" opacity="0.8" />
            </svg>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderAccessory = () => {
    if (!avatar.accessory || avatar.accessory === 'none') return null;

    const accessoryStyle = { position: 'absolute' as const };

    switch (avatar.accessory) {
      case 'glasses':
        return (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-2/3 h-1/6 flex justify-between">
            <div className="w-2/5 h-full border-2 border-black rounded-full bg-white/20" />
            <div className="w-2/5 h-full border-2 border-black rounded-full bg-white/20" />
          </div>
        );
      case 'hat':
        return (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3/4 text-4xl">
            🎩
          </div>
        );
      case 'crown':
        return (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-4xl">
            👑
          </div>
        );
      case 'headphones':
        return (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-4xl">
            🎧
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <div
        className={`w-full h-full rounded-full overflow-hidden relative ${
          showBorder ? 'ring-4 ring-accent/30 shadow-elegant' : ''
        }`}
        style={getBackgroundStyle()}
      >
        {renderPattern()}
        {renderAvatar()}
        {renderAccessory()}
      </div>
    </div>
  );
};

export default AvatarDisplay;
