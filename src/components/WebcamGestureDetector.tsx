import { useEffect, useRef, useState, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import * as tmImage from "@teachablemachine/image";
import CameraErrorHandler from "./CameraErrorHandler";
// import HandSkeletonOverlay from "./HandSkeletonOverlay"; // Disabled due to memory issues
import CameraCalibrationOverlay from "./CameraCalibrationOverlay";
// import GestureTrailEffect from "./GestureTrailEffect";
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

interface WebcamGestureDetectorProps {
  onGestureDetected: (gesture: string) => void;
  onPerformanceDetected?: (performance: 'high' | 'medium' | 'low') => void;
  showCalibration?: boolean;
}

const WebcamGestureDetector = ({ 
  onGestureDetected, 
  onPerformanceDetected,
  showCalibration = true 
}: WebcamGestureDetectorProps) => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string>("No gesture detected");
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("Initializing...");
  const [inferenceTime, setInferenceTime] = useState<number>(0);
  const [cameraQuality, setCameraQuality] = useState<number>(0);
  
  const modelRef = useRef<tmImage.CustomMobileNet | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const lastGestureRef = useRef<string>("");
  const lastDetectionTimeRef = useRef<number>(0);
  const memoryMonitorRef = useRef<MemoryMonitor | null>(null);
  const predictionIntervalRef = useRef<number>(150); // Default ~6.6 FPS for smoother performance
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
          return;
        }

        // Set TensorFlow.js backend
        await tf.setBackend('webgl');
        await tf.ready();
        
        // Get recommended settings based on device performance
        const settings = getRecommendedSettings(capabilities.performance);
        
        // Optimize prediction interval for smooth performance
        if (capabilities.performance === 'high') {
          predictionIntervalRef.current = 100; // 10 FPS
        } else if (capabilities.performance === 'medium') {
          predictionIntervalRef.current = 150; // ~6.6 FPS
        } else {
          predictionIntervalRef.current = 250; // 4 FPS for low-end devices
        }
        
        if (onPerformanceDetected) {
          onPerformanceDetected(capabilities.performance);
        }

        // Device performance detected (no toast notification)

        // Initialize memory monitor
        memoryMonitorRef.current = new MemoryMonitor(100);
        memoryMonitorRef.current.start(5000);
        memoryMonitorRef.current.onUpdate((memory) => {
          if (isMemoryCritical()) {
            console.warn("High memory usage detected");
          }
        });

      } catch (err) {
        console.error("Initialization error:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize");
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
        const modelURL = "https://teachablemachine.withgoogle.com/models/uI0KyValB/model.json";
        const metadataURL = "https://teachablemachine.withgoogle.com/models/uI0KyValB/metadata.json";
        
        modelRef.current = await tmImage.load(modelURL, metadataURL);
        console.log("Model loaded successfully");
        
        setLoadingMessage("Requesting camera access...");
        
        // Reuse existing stream if available, otherwise request new access
        if (!streamRef.current) {
          const cameraResult = await requestCameraAccess();
          
          if (!cameraResult.success) {
            setError(cameraResult.error || "Failed to access camera");
            return;
          }

          streamRef.current = cameraResult.stream!;
          console.log("New camera stream created");
        } else {
          console.log("Reusing existing camera stream");
        }
        
        setLoadingMessage("Initializing camera...");
        
        // Use native stream directly for better compatibility
        if (webcamRef.current && streamRef.current) {
          webcamRef.current.srcObject = streamRef.current;
          
          // Ensure video plays
          try {
            await webcamRef.current.play();
            console.log("Video playing successfully");
          } catch (playError) {
            console.error("Error playing video:", playError);
            // Try again after a short delay
            setTimeout(async () => {
              try {
                if (webcamRef.current) {
                  await webcamRef.current.play();
                }
              } catch (retryError) {
                console.error("Retry failed:", retryError);
              }
            }, 500);
          }
        } else {
          throw new Error("Failed to initialize video element");
        }
        
        setIsModelLoaded(true);
        setError(null);
        
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
            
            if (!webcamRef.current) {
              return;
            }
            
            const predictions = await modelRef.current.predict(webcamRef.current);
            
            const endTime = performance.now();
            const inferenceMs = Math.round(endTime - startTime);
            setInferenceTime(inferenceMs);
            
            // Dispatch event for performance monitor
            window.dispatchEvent(new CustomEvent('inferenceTime', { detail: inferenceMs }));
            
            // Find the prediction with highest probability
            const maxPrediction = predictions.reduce((max, pred) => 
              pred.probability > max.probability ? pred : max
            , predictions[0]);
            
            // Higher confidence threshold for more accurate detection
            const CONFIDENCE_THRESHOLD = 0.90; // Increased from 0.8 to 0.90 for better accuracy
            const DEBOUNCE_TIME = 1500; // Reduced from 2000ms to 1500ms for faster response
            
            if (maxPrediction.probability > CONFIDENCE_THRESHOLD) {
              const gestureName = maxPrediction.className;
              
              // Don't show "background" as current gesture
              if (gestureName !== "background") {
                setCurrentGesture(gestureName);
                
                // Debounce: only trigger if gesture changed and debounce time has passed
                const detectionNow = Date.now();
                if (gestureName !== lastGestureRef.current && detectionNow - lastDetectionTimeRef.current > DEBOUNCE_TIME) {
                  lastGestureRef.current = gestureName;
                  lastDetectionTimeRef.current = detectionNow;
                  onGestureDetected(gestureName);
                }
              } else {
                setCurrentGesture("No gesture detected");
              }
            } else {
              // Show confidence level for debugging
              if (maxPrediction.probability > 0.7 && maxPrediction.className !== "background") {
                setCurrentGesture(`${maxPrediction.className} (${Math.round(maxPrediction.probability * 100)}%)`);
              } else {
                setCurrentGesture("No gesture detected");
              }
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
        
      } catch (error) {
        console.error("Error initializing webcam:", error);
        setError(error instanceof Error ? error.message : "Failed to initialize camera");
      }
    };

    initWebcam();

    return () => {
      isActive = false;
      
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // DON'T cleanup camera stream - keep it alive for reuse
      // Only cleanup model
      if (modelRef.current) {
        try {
          modelRef.current.dispose();
        } catch (e) {
          console.error("Error disposing model:", e);
        }
      }
      
      // Don't clear streamRef - keep it for reuse
      modelRef.current = null;
      // streamRef.current = null; // KEEP THE STREAM ALIVE
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
          className="rounded-2xl border-2 border-accent/30 shadow-elegant w-80 h-80 object-cover transition-elegant hover:border-accent/50 neon-border"
          style={{ transform: 'scaleX(-1)' }}
        />
        
        {/* Camera Calibration Overlay */}
        {showCalibration && isModelLoaded && webcamRef.current && (
          <CameraCalibrationOverlay 
            videoElement={webcamRef.current} 
            enabled={true}
            autoHide={true}
            onCalibrationComplete={(metrics) => {
              setCameraQuality(metrics.score);
            }}
          />
        )}

        {/* 3D Hand Skeleton Overlay - Disabled by default due to memory issues */}
        {/* Uncomment to enable hand skeleton visualization */}
        {/* {isModelLoaded && webcamRef.current && (
          <HandSkeletonOverlay videoElement={webcamRef.current} enabled={true} />
        )} */}
        
        {/* Gesture Trail Effect - Temporarily disabled */}
        {/* {isModelLoaded && webcamRef.current && (
          <GestureTrailEffect videoElement={webcamRef.current} enabled={true} />
        )} */}
        
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
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1 text-xs z-20">
            <span className="text-white">{inferenceTime}ms</span>
          </div>
        )}
      </div>
      
      <div className="holographic-card animated-gradient-border rounded-xl px-8 py-5 shadow-depth transition-elegant hover:scale-105">
        <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">Current Gesture</p>
        <p className="text-2xl font-bold text-accent animate-pulse-glow">{currentGesture}</p>
        
        {/* Camera Quality Indicator */}
        {cameraQuality > 0 && (
          <div className="mt-3 pt-3 border-t border-accent/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Camera Quality</span>
              <span className={`font-semibold ${
                cameraQuality >= 80 ? 'text-green-500' :
                cameraQuality >= 60 ? 'text-blue-500' :
                cameraQuality >= 40 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {cameraQuality >= 80 ? '⭐ Excellent' :
                 cameraQuality >= 60 ? '✓ Good' :
                 cameraQuality >= 40 ? '⚠ Fair' : '✗ Poor'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamGestureDetector;
