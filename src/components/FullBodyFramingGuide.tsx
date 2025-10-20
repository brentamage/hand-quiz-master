import { motion } from 'framer-motion';
import { User, CheckCircle, AlertCircle } from 'lucide-react';

interface FullBodyFramingGuideProps {
  pose: any;
  videoElement: HTMLVideoElement;
  enabled?: boolean;
}

const FullBodyFramingGuide = ({ pose, videoElement, enabled = true }: FullBodyFramingGuideProps) => {
  if (!enabled) return null;

  // Check if full body is visible
  const isFullBodyVisible = checkFullBodyVisibility(pose);
  const bodyPosition = getBodyPosition(pose, videoElement);

  return (
    <div className="absolute inset-0 pointer-events-none z-5">
      {/* Corner guides */}
      <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-dashed border-purple-500/30 rounded-2xl">
        {/* Top corners */}
        <div className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-purple-500 rounded-tl-lg" />
        <div className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-purple-500 rounded-tr-lg" />
        
        {/* Bottom corners */}
        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-purple-500 rounded-bl-lg" />
        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-purple-500 rounded-br-lg" />
      </div>

      {/* Center silhouette guide */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isFullBodyVisible ? 0.2 : 0.5, scale: 1 }}
          className="relative"
        >
          <User className="w-32 h-32 text-purple-400" strokeWidth={1.5} />
          
          {/* Pulsing ring when not detected */}
          {!isFullBodyVisible && (
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 border-4 border-purple-500 rounded-full"
            />
          )}
        </motion.div>
      </div>

      {/* Status indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 left-1/2 transform -translate-x-1/2"
      >
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md ${
          isFullBodyVisible 
            ? 'bg-green-500/20 border border-green-500/50' 
            : 'bg-yellow-500/20 border border-yellow-500/50'
        }`}>
          {isFullBodyVisible ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold text-sm">Full Body Detected</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold text-sm">{getPositionHint(bodyPosition)}</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Positioning hints */}
      {!isFullBodyVisible && bodyPosition && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-2"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {bodyPosition.tooClose && (
                <div className="text-yellow-400 text-lg font-semibold">
                  ⬅️ Step Back ➡️
                </div>
              )}
              {bodyPosition.tooFar && (
                <div className="text-yellow-400 text-lg font-semibold">
                  ⬆️ Move Closer ⬇️
                </div>
              )}
              {bodyPosition.tooHigh && (
                <div className="text-yellow-400 text-lg font-semibold">
                  ⬇️ Move Down
                </div>
              )}
              {bodyPosition.tooLow && (
                <div className="text-yellow-400 text-lg font-semibold">
                  ⬆️ Move Up
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* Grid overlay (subtle) */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-0 right-0 h-px bg-purple-500" />
        <div className="absolute top-2/3 left-0 right-0 h-px bg-purple-500" />
        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-purple-500" />
        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-purple-500" />
      </div>
    </div>
  );
};

// Helper functions
const checkFullBodyVisibility = (pose: any): boolean => {
  if (!pose || !pose.keypoints) return false;

  const keypoints = pose.keypoints;
  
  // Check if key body parts are visible with good confidence
  const requiredKeypoints = [
    0,  // nose
    5, 6,  // shoulders
    11, 12,  // hips
    15, 16  // ankles
  ];

  const visibleCount = requiredKeypoints.filter(idx => {
    const kp = keypoints[idx];
    return kp && kp.score > 0.5;
  }).length;

  return visibleCount >= 6; // At least 6 out of 8 key points visible
};

const getBodyPosition = (pose: any, videoElement: HTMLVideoElement) => {
  if (!pose || !pose.keypoints || !videoElement) return null;

  const keypoints = pose.keypoints;
  const videoWidth = videoElement.videoWidth;
  const videoHeight = videoElement.videoHeight;

  // Get head and feet positions
  const nose = keypoints[0];
  const leftAnkle = keypoints[15];
  const rightAnkle = keypoints[16];

  if (!nose || nose.score < 0.5) return null;

  const bodyHeight = Math.abs(
    nose.y - Math.min(
      leftAnkle?.y || videoHeight,
      rightAnkle?.y || videoHeight
    )
  );

  return {
    tooClose: bodyHeight > videoHeight * 0.9,
    tooFar: bodyHeight < videoHeight * 0.5,
    tooHigh: nose.y < videoHeight * 0.1,
    tooLow: nose.y > videoHeight * 0.5,
  };
};

const getPositionHint = (bodyPosition: any): string => {
  if (!bodyPosition) return 'Position yourself in frame';
  if (bodyPosition.tooClose) return 'Step back from camera';
  if (bodyPosition.tooFar) return 'Move closer to camera';
  if (bodyPosition.tooHigh) return 'Move down in frame';
  if (bodyPosition.tooLow) return 'Move up in frame';
  return 'Adjust your position';
};

export default FullBodyFramingGuide;
