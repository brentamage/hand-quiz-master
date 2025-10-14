import { useEffect, useRef } from 'react';
import { Hands, Results } from '@mediapipe/hands';

interface HandSkeletonOverlayProps {
  videoElement: HTMLVideoElement | null;
  enabled?: boolean;
}

const HandSkeletonOverlay = ({ videoElement, enabled = true }: HandSkeletonOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<Hands | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!videoElement || !canvasRef.current || !enabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize MediaPipe Hands
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    hands.onResults((results: Results) => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        // Draw connections with glowing effect
        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
          [0, 5], [5, 6], [6, 7], [7, 8], // Index
          [0, 9], [9, 10], [10, 11], [11, 12], // Middle
          [0, 13], [13, 14], [14, 15], [15, 16], // Ring
          [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
          [5, 9], [9, 13], [13, 17] // Palm
        ];

        // Draw glowing connections
        connections.forEach(([start, end]) => {
          const startPoint = landmarks[start];
          const endPoint = landmarks[end];

          const x1 = startPoint.x * canvas.width;
          const y1 = startPoint.y * canvas.height;
          const x2 = endPoint.x * canvas.width;
          const y2 = endPoint.y * canvas.height;

          // Outer glow
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
          ctx.lineWidth = 8;
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Inner line
          ctx.strokeStyle = 'rgba(192, 132, 252, 1)';
          ctx.lineWidth = 3;
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(192, 132, 252, 1)';
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });

        // Draw glowing joints
        landmarks.forEach((landmark, index) => {
          const x = landmark.x * canvas.width;
          const y = landmark.y * canvas.height;

          // Determine joint size based on importance
          const isFingerTip = [4, 8, 12, 16, 20].includes(index);
          const isWrist = index === 0;
          const radius = isFingerTip ? 8 : isWrist ? 10 : 6;

          // Outer glow
          ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
          ctx.shadowBlur = 25;
          ctx.shadowColor = 'rgba(168, 85, 247, 1)';
          ctx.beginPath();
          ctx.arc(x, y, radius + 4, 0, 2 * Math.PI);
          ctx.fill();

          // Middle layer
          ctx.fillStyle = 'rgba(192, 132, 252, 0.8)';
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'rgba(192, 132, 252, 1)';
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fill();

          // Inner bright core
          ctx.fillStyle = 'rgba(255, 255, 255, 1)';
          ctx.shadowBlur = 5;
          ctx.shadowColor = 'rgba(255, 255, 255, 1)';
          ctx.beginPath();
          ctx.arc(x, y, radius / 2, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Reset shadow
        ctx.shadowBlur = 0;
      }
    });

    handsRef.current = hands;

    // Process video frames
    const processFrame = async () => {
      if (!videoElement || !handsRef.current) return;

      try {
        await handsRef.current.send({ image: videoElement });
      } catch (error) {
        console.error('Hand detection error:', error);
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    // Start processing when video is ready
    if (videoElement.readyState >= 2) {
      processFrame();
    } else {
      videoElement.addEventListener('loadeddata', processFrame);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [videoElement, enabled]);

  // Sync canvas size with video
  useEffect(() => {
    if (!videoElement || !canvasRef.current) return;

    const updateSize = () => {
      if (canvasRef.current && videoElement) {
        canvasRef.current.width = videoElement.videoWidth || 320;
        canvasRef.current.height = videoElement.videoHeight || 320;
      }
    };

    updateSize();
    videoElement.addEventListener('loadedmetadata', updateSize);

    return () => {
      videoElement.removeEventListener('loadedmetadata', updateSize);
    };
  }, [videoElement]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ 
        transform: 'scaleX(-1)',
        mixBlendMode: 'screen'
      }}
    />
  );
};

export default HandSkeletonOverlay;
