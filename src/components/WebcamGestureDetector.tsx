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
    let isActive = true;

    const initWebcam = async () => {
      try {
        // Load your Teachable Machine model
        const modelURL = "https://teachablemachine.withgoogle.com/models/-veScKgsx/model.json";
        const metadataURL = "https://teachablemachine.withgoogle.com/models/-veScKgsx/metadata.json";
        
        modelRef.current = await tmImage.load(modelURL, metadataURL);
        console.log("Model loaded successfully");
        
        // Initialize webcam
        webcam = new tmImage.Webcam(320, 320, true);
        await webcam.setup();
        await webcam.play();
        
        if (webcamRef.current && webcam.webcam.srcObject) {
          webcamRef.current.srcObject = webcam.webcam.srcObject;
        }
        
        setIsModelLoaded(true);
        
        // Start prediction loop
        const predict = async () => {
          if (!isActive || !webcam || !modelRef.current) return;
          
          try {
            webcam.update();
            const predictions = await modelRef.current.predict(webcam.canvas);
            
            // Find the prediction with highest probability
            const maxPrediction = predictions.reduce((max, pred) => 
              pred.probability > max.probability ? pred : max
            , predictions[0]);
            
            // Only update if confidence is above threshold
            if (maxPrediction.probability > 0.7) {
              const gestureName = maxPrediction.className;
              setCurrentGesture(gestureName);
              onGestureDetected(gestureName);
            }
          } catch (error) {
            console.error("Prediction error:", error);
          }
          
          if (isActive) {
            animationFrameRef.current = requestAnimationFrame(predict);
          }
        };
        
        predict();
      } catch (error) {
        console.error("Error initializing webcam:", error);
        setCurrentGesture("Camera access denied or unavailable");
      }
    };

    initWebcam();

    return () => {
      isActive = false;
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
