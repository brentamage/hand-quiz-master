import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as tmImage from "@teachablemachine/image";

interface WebcamGestureDetectorProps {
  onGestureDetected: (gesture: string) => void;
}

const WebcamGestureDetector = ({ onGestureDetected }: WebcamGestureDetectorProps) => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string>("No gesture detected");
  const modelRef = useRef<tmImage.CustomMobileNet | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    let webcam: tmImage.Webcam | null = null;

    const initWebcam = async () => {
      try {
        // For demo purposes, we'll create a simulated gesture detector
        // In production, you would load your actual Teachable Machine model here
        // const modelURL = "YOUR_MODEL_URL/model.json";
        // const metadataURL = "YOUR_MODEL_URL/metadata.json";
        // modelRef.current = await tmImage.load(modelURL, metadataURL);
        
        webcam = new tmImage.Webcam(320, 320, true);
        await webcam.setup();
        await webcam.play();
        
        if (webcamRef.current) {
          webcamRef.current.srcObject = webcam.webcam.srcObject;
        }
        
        setIsModelLoaded(true);
        
        // Start prediction loop
        const predict = async () => {
          if (webcam && modelRef.current) {
            const prediction = await modelRef.current.predict(webcam.canvas);
            // Process predictions here
            // For demo, we'll simulate gesture detection
          }
          
          // Simulate gesture detection for demo
          simulateGestureDetection();
          
          animationFrameRef.current = requestAnimationFrame(predict);
        };
        
        predict();
      } catch (error) {
        console.error("Error initializing webcam:", error);
      }
    };

    const simulateGestureDetection = () => {
      // This is a placeholder for the actual model predictions
      // In production, this would be replaced by real model inference
      const gestures = ["1 Finger (A)", "2 Fingers (B)", "3 Fingers (C)", "4 Fingers (D)", "5 Fingers (Next)", "Fist (Previous)"];
      
      // Random gesture simulation - replace with actual model output
      const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
      setCurrentGesture(randomGesture);
      onGestureDetected(randomGesture);
    };

    initWebcam();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (webcam) {
        webcam.stop();
      }
    };
  }, [onGestureDetected]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <video
          ref={webcamRef}
          autoPlay
          playsInline
          muted
          className="rounded-lg border-2 border-accent/30 card-shadow w-80 h-80 object-cover"
        />
        {!isModelLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-foreground">Loading camera...</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="gradient-card rounded-lg px-6 py-4 card-shadow border border-accent/20">
        <p className="text-sm text-muted-foreground mb-1">Current Gesture</p>
        <p className="text-xl font-bold text-accent animate-pulse-glow">{currentGesture}</p>
      </div>
    </div>
  );
};

export default WebcamGestureDetector;
