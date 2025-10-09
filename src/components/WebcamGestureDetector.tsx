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
  const lastGestureRef = useRef<string>("");
  const lastDetectionTimeRef = useRef<number>(0);

  useEffect(() => {
    let webcam: tmImage.Webcam | null = null;
    let isActive = true;

    const initWebcam = async () => {
      try {
        // Load your Teachable Machine model
        const modelURL = "https://teachablemachine.withgoogle.com/models/-veScKgsx/model.json";
        const metadataURL = "https://teachablemachine.withgoogle.com/models/-veScKgsx/metadata.json";
        
        modelRef.current = await tmImage.load(modelURL, metadataURL);
        
        // Initialize webcam with better error handling
        webcam = new tmImage.Webcam(320, 320, true);
        
        try {
          await webcam.setup({ facingMode: "user" });
          await webcam.play();
        } catch (webcamError) {
          console.error("Teachable Machine webcam failed, trying native API:", webcamError);
          
          // Fallback to native browser API
          if (webcamRef.current) {
            const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { 
                width: 320, 
                height: 320,
                facingMode: "user"
              } 
            });
            webcamRef.current.srcObject = stream;
            await webcamRef.current.play();
          }
        }
        
        if (webcamRef.current && webcam.webcam && webcam.webcam.srcObject) {
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
            if (maxPrediction.probability > 0.8) {
              const gestureName = maxPrediction.className;
              setCurrentGesture(gestureName);
              
              // Debounce: only trigger if gesture changed and 2 seconds have passed
              const now = Date.now();
              if (gestureName !== lastGestureRef.current && now - lastDetectionTimeRef.current > 2000) {
                lastGestureRef.current = gestureName;
                lastDetectionTimeRef.current = now;
                onGestureDetected(gestureName);
              }
            } else {
              setCurrentGesture("No gesture detected");
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
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <video
          ref={webcamRef}
          autoPlay
          playsInline
          muted
          className="rounded-2xl border-2 border-accent/30 shadow-elegant w-80 h-80 object-cover transition-elegant hover:border-accent/50"
          style={{ transform: 'scaleX(-1)' }}
        />
        {!isModelLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/90 rounded-2xl backdrop-blur-sm">
            <div className="text-center">
              <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-foreground text-lg font-medium">Loading camera...</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="gradient-card rounded-xl px-8 py-5 shadow-elegant border border-accent/20 transition-elegant hover:border-accent/40">
        <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">Current Gesture</p>
        <p className="text-2xl font-bold text-accent animate-pulse-glow">{currentGesture}</p>
      </div>
    </div>
  );
};

export default WebcamGestureDetector;
