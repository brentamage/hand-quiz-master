import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface PoseSkeletonOverlayProps {
  pose: any; // Pose data from Teachable Machine
  videoElement: HTMLVideoElement;
  enabled?: boolean;
  showConfidence?: boolean;
}

const PoseSkeletonOverlay = ({ 
  pose, 
  videoElement, 
  enabled = true,
  showConfidence = true 
}: PoseSkeletonOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Define skeleton connections (which keypoints connect to which)
  const POSE_CONNECTIONS = [
    // Face
    [0, 1], [0, 2], [1, 3], [2, 4], // nose to eyes to ears
    
    // Torso
    [5, 6], // shoulders
    [5, 7], [7, 9], // left arm
    [6, 8], [8, 10], // right arm
    [5, 11], [6, 12], // shoulders to hips
    [11, 12], // hips
    
    // Legs
    [11, 13], [13, 15], // left leg
    [12, 14], [14, 16], // right leg
  ];

  // Keypoint names for reference
  const KEYPOINT_NAMES = [
    'nose', 'leftEye', 'rightEye', 'leftEar', 'rightEar',
    'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow',
    'leftWrist', 'rightWrist', 'leftHip', 'rightHip',
    'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'
  ];

  useEffect(() => {
    if (!enabled || !pose || !canvasRef.current || !videoElement) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw skeleton
    drawSkeleton(ctx, pose, canvas.width, canvas.height);
  }, [pose, enabled, videoElement]);

  const drawSkeleton = (
    ctx: CanvasRenderingContext2D, 
    pose: any, 
    width: number, 
    height: number
  ) => {
    if (!pose || !pose.keypoints) return;

    const keypoints = pose.keypoints;

    // Draw connections (bones)
    ctx.lineWidth = 3;
    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = keypoints[startIdx];
      const end = keypoints[endIdx];

      if (!start || !end) return;

      // Calculate average confidence for this connection
      const avgConfidence = (start.score + end.score) / 2;
      
      // Only draw if both points have reasonable confidence
      if (avgConfidence > 0.3) {
        // Color based on confidence
        const color = getConfidenceColor(avgConfidence);
        ctx.strokeStyle = color;
        
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    });

    // Draw keypoints (joints)
    keypoints.forEach((keypoint: any, index: number) => {
      if (!keypoint || keypoint.score < 0.3) return;

      const { x, y, score } = keypoint;
      const color = getConfidenceColor(score);
      const radius = 6;

      // Draw outer glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2, 0, 2 * Math.PI);
      ctx.fill();

      // Draw keypoint circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw white center
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x, y, radius / 2, 0, 2 * Math.PI);
      ctx.fill();

      // Draw confidence text for important keypoints
      if (showConfidence && (index === 0 || index === 5 || index === 6)) {
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        const text = `${Math.round(score * 100)}%`;
        ctx.strokeText(text, x + 10, y - 10);
        ctx.fillText(text, x + 10, y - 10);
      }
    });
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return '#10b981'; // Green - high confidence
    if (confidence >= 0.6) return '#eab308'; // Yellow - medium confidence
    if (confidence >= 0.4) return '#f97316'; // Orange - low confidence
    return '#ef4444'; // Red - very low confidence
  };

  if (!enabled) return null;

  return (
    <motion.canvas
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.9 }}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ transform: 'scaleX(-1)' }} // Mirror to match video
    />
  );
};

export default PoseSkeletonOverlay;
