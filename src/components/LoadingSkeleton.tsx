import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

const Skeleton = ({ 
  className = '', 
  variant = 'text',
  width,
  height,
  count = 1
}: SkeletonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const getDefaultSize = () => {
    switch (variant) {
      case 'circular':
        return { width: '40px', height: '40px' };
      case 'rectangular':
        return { width: '100%', height: '200px' };
      case 'text':
      default:
        return { width: '100%', height: '1em' };
    }
  };

  const defaultSize = getDefaultSize();
  const style = {
    width: width || defaultSize.width,
    height: height || defaultSize.height,
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <motion.div
      key={i}
      className={`bg-gradient-to-r from-muted via-muted/50 to-muted ${getVariantClasses()} ${className}`}
      style={style}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  ));

  return count > 1 ? <div className="space-y-2">{skeletons}</div> : skeletons[0];
};

// Preset skeleton layouts
export const QuizSkeleton = () => (
  <div className="space-y-6 p-6">
    <Skeleton variant="text" height="2em" width="80%" />
    <div className="space-y-3">
      <Skeleton variant="rectangular" height="60px" />
      <Skeleton variant="rectangular" height="60px" />
      <Skeleton variant="rectangular" height="60px" />
      <Skeleton variant="rectangular" height="60px" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="flex items-center gap-4 p-4">
    <Skeleton variant="circular" width="60px" height="60px" />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="60%" />
    </div>
  </div>
);

export const LeaderboardSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} className="flex items-center gap-4 p-3">
        <Skeleton variant="circular" width="40px" height="40px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="50%" />
        </div>
        <Skeleton variant="text" width="60px" />
      </div>
    ))}
  </div>
);

export default Skeleton;
