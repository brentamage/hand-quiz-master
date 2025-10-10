import { useEffect, useRef, useState, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import * as tmImage from "@teachablemachine/image";
import CameraErrorHandler from "./CameraErrorHandler";
import { 
  getDeviceCapabilities, 
  requestCameraAccess, 
  getRecommendedSettings,
  checkWebGLSupport 
} from "@/utils/deviceCapabilities";
import { 
  cleanup, 
  monitorMemory, 
  MemoryMonitor,
  isMemoryCritical 
} from "@/utils/memoryManager";
import { toast } from "sonner";

interface WebcamGestureDetectorProps {
  onGestureDetected: (gesture: string) => void;
  onPerformanceDetected?: (performance: 'high' | 'medium' | 'low') => void;
}

const WebcamGestureDetector = ({ onGestureDetected, onPerformanceDetected }: WebcamGestureDetectorProps) => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string>("No gesture detected");
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("Initializing...");
  const [inferenceTime, setInferenceTime] = useState<number>(0);
  
  const modelRef = useRef<tmImage.CustomMobileNet | null>(null);
  const webcamInstanceRef = useRef<tmImage.Webcam | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const lastGestureRef = useRef<string>("");
  const lastDetectionTimeRef = useRef<number>(0);
  const memoryMonitorRef = useRef<MemoryMonitor | null>(null);
  const predictionIntervalRef = useRef<number>(100); // Default 10 FPS
  const lastPredictionTimeRef = useRef<number>(0);

  // Initialize device capabilities and memory monitoring
  useEffect(() => {
    const init = async () => {
      try {
        // Check device capabilities
        setLoadingMessage("Checking device capabilities...");
        const capabilities = await getDeviceCapabilities();
        
        // Check WebGL support
        const { webgl } = checkWebGLSupport();
        if (!webgl) {
          setError("WebGL is not supported on this device. The app may not work properly.");
          toast.error("WebGL not supported", { duration: 5000 });
          return;
        }

        // Set TensorFlow.js backend
        await tf.setBackend('webgl');
        await tf.ready();
        
        // Get recommended settings based on device performance
        const settings = getRecommendedSettings(capabilities.performance);
        predictionIntervalRef.current = settings.predictionInterval;
        
        if (onPerformanceDetected) {
          onPerformanceDetected(capabilities.performance);
        }

        // Notify user of device performance
        if (capabilities.performance === 'low') {
          toast.warning("Low-end device detected. Performance may be limited.", { duration: 5000 });
        }

        // Initialize memory monitor
        memoryMonitorRef.current = new MemoryMonitor(100);
        memoryMonitorRef.current.start(5000);
        memoryMonitorRef.current.onUpdate((memory) => {
          if (isMemoryCritical()) {
            toast.error("High memory usage detected. Consider refreshing the page.", { duration: 5000 });
          }
        });

      } catch (err: any) {
        console.error("Initialization error:", err);
        setError(err.message || "Failed to initialize");
      }
    };

    init();

    return () => {
      if (memoryMonitorRef.current) {
        memoryMonitorRef.current.stop();
      }
    };
  }, [onPerformanceDetected]);

  // Main webcam and model initialization
  useEffect(() => {
    let isActive = true;

    const initWebcam = async () => {
      try {
        setLoadingMessage("Loading AI model...");
        
        // Load Teachable Machine model
        const modelURL = "https://teachablemachine.withgoogle.com/models/-veScKgsx/model.json";
        const metadataURL = "https://teachablemachine.withgoogle.com/models/-veScKgsx/metadata.json";
        
        modelRef.current = await tmImage.load(modelURL, metadataURL);
        console.log("Model loaded successfully");
        
        setLoadingMessage("Requesting camera access...");
        
        // Request camera access with proper error handling
        const cameraResult = await requestCameraAccess();
        
        if (!cameraResult.success) {
          setError(cameraResult.error || "Failed to access camera");
          return;
        }

        streamRef.current = cameraResult.stream!;
        
        setLoadingMessage("Initializing camera...");
        
        // Try Teachable Machine webcam first
        try {
          const webcam = new tmImage.Webcam(320, 320, true);
          await webcam.setup({ facingMode: "user" });
          await webcam.play();
          webcamInstanceRef.current = webcam;
          
          if (webcamRef.current && webcam.webcam && webcam.webcam.srcObject) {
            webcamRef.current.srcObject = webcam.webcam.srcObject;
          }
        } catch (webcamError) {
          console.warn("Teachable Machine webcam failed, using native stream:", webcamError);
          
          // Fallback to native stream
          if (webcamRef.current && streamRef.current) {
            webcamRef.current.srcObject = streamRef.current;
            await webcamRef.current.play();
          }
        }
        
        setIsModelLoaded(true);
        setError(null);
        toast.success("Camera initialized successfully!");
        
        // Start prediction loop with throttling
        const predict = async () => {
          if (!isActive || !modelRef.current) return;
          
          const now = performance.now();
          
          // Throttle predictions based on device performance
          if (now - lastPredictionTimeRef.current < predictionIntervalRef.current) {
            animationFrameRef.current = requestAnimationFrame(predict);
            return;
          }
          
          lastPredictionTimeRef.current = now;
          
          try {
            const startTime = performance.now();
            
            let predictions;
            
            if (webcamInstanceRef.current) {
              webcamInstanceRef.current.update();
              predictions = await modelRef.current.predict(webcamInstanceRef.current.canvas);
            } else if (webcamRef.current) {
              predictions = await modelRef.current.predict(webcamRef.current);
            } else {
              return;
            }
            
            const endTime = performance.now();
            const inferenceMs = Math.round(endTime - startTime);
            setInferenceTime(inferenceMs);
            
            // Dispatch event for performance monitor
            window.dispatchEvent(new CustomEvent('inferenceTime', { detail: inferenceMs }));
            
            // Find the prediction with highest probability
            const maxPrediction = predictions.reduce((max, pred) => 
              pred.probability > max.probability ? pred : max
            , predictions[0]);
            
            // Only update if confidence is above threshold
            if (maxPrediction.probability > 0.8) {
              const gestureName = maxPrediction.className;
              setCurrentGesture(gestureName);
              
              // Debounce: only trigger if gesture changed and 2 seconds have passed
              const detectionNow = Date.now();
              if (gestureName !== lastGestureRef.current && detectionNow - lastDetectionTimeRef.current > 2000) {
                lastGestureRef.current = gestureName;
                lastDetectionTimeRef.current = detectionNow;
                onGestureDetected(gestureName);
              }
            } else {
              setCurrentGesture("No gesture detected");
            }
            
            // Monitor memory every 100 predictions
            if (Math.random() < 0.01) {
              monitorMemory(100);
            }
            
          } catch (error) {
            console.error("Prediction error:", error);
          }
          
          if (isActive) {
            animationFrameRef.current = requestAnimationFrame(predict);
          }
        };
        
        predict();
        
      } catch (error: any) {
        console.error("Error initializing webcam:", error);
        setError(error.message || "Failed to initialize camera");
      }
    };

    initWebcam();

    return () => {
      isActive = false;
      
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Cleanup resources
      cleanup(
        modelRef.current,
        webcamInstanceRef.current,
        streamRef.current || undefined
      );
      
      // Clear refs
      modelRef.current = null;
      webcamInstanceRef.current = null;
      streamRef.current = null;
    };
  }, [onGestureDetected]);

  // Retry handler
  const handleRetry = useCallback(() => {
    setError(null);
    setIsModelLoaded(false);
    setLoadingMessage("Retrying...");
    window.location.reload();
  }, []);

  // Fallback to keyboard/mouse
  const handleUseFallback = useCallback(() => {
    toast.info("Gesture controls disabled. Use keyboard or mouse instead.");
    setError(null);
  }, []);

  // Show error handler if there's an error
  if (error) {
    return (
      <CameraErrorHandler 
        error={error}
        onRetry={handleRetry}
        onUseFallback={handleUseFallback}
        showFallback={true}
      />
    );
  }

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
              <p className="text-foreground text-lg font-medium">{loadingMessage}</p>
            </div>
          </div>
        )}
        
        {/* Performance indicator */}
        {isModelLoaded && inferenceTime > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1 text-xs">
            <span className="text-white">{inferenceTime}ms</span>
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
