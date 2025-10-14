import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  X,
  Settings,
  Zap,
  Eye
} from 'lucide-react';
import { 
  getCalibrationMetrics, 
  getRecommendations,
  CalibrationMetrics,
  CalibrationRecommendation
} from '@/utils/cameraCalibration';

interface CameraCalibrationOverlayProps {
  videoElement: HTMLVideoElement | null;
  enabled?: boolean;
  autoHide?: boolean;
  onCalibrationComplete?: (metrics: CalibrationMetrics) => void;
}

const CameraCalibrationOverlay = ({ 
  videoElement, 
  enabled = true,
  autoHide = true,
  onCalibrationComplete
}: CameraCalibrationOverlayProps) => {
  const [metrics, setMetrics] = useState<CalibrationMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<CalibrationRecommendation[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const calibrate = useCallback(async () => {
    if (!videoElement || !enabled) return;
    
    setIsCalibrating(true);
    
    try {
      const calibrationMetrics = await getCalibrationMetrics(videoElement);
      const calibrationRecommendations = getRecommendations(calibrationMetrics);
      
      setMetrics(calibrationMetrics);
      setRecommendations(calibrationRecommendations);
      
      if (onCalibrationComplete) {
        onCalibrationComplete(calibrationMetrics);
      }
      
      // Auto-hide if quality is excellent and autoHide is enabled
      if (autoHide && calibrationMetrics.overallQuality === 'excellent') {
        setTimeout(() => setIsMinimized(true), 3000);
      }
    } catch (error) {
      console.error('Calibration failed:', error);
    } finally {
      setIsCalibrating(false);
    }
  }, [videoElement, enabled, autoHide, onCalibrationComplete]);

  // Auto-calibrate on mount and periodically
  useEffect(() => {
    if (!videoElement || !enabled) return;

    // Initial calibration after video loads
    const initialTimeout = setTimeout(() => {
      calibrate();
    }, 1000);

    // Periodic re-calibration every 10 seconds
    const interval = setInterval(() => {
      calibrate();
    }, 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [videoElement, enabled, calibrate]);

  if (!enabled || !metrics) return null;

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'success': return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'info': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      default: return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  // Minimized view
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute top-2 right-2 z-20"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-black/80 transition-colors"
        >
          <div className={`w-2 h-2 rounded-full ${
            metrics.overallQuality === 'excellent' ? 'bg-green-500' :
            metrics.overallQuality === 'good' ? 'bg-blue-500' :
            metrics.overallQuality === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
          } animate-pulse`} />
          <span className="text-xs text-white">{metrics.score}/100</span>
          <Settings className="w-3 h-3 text-white" />
        </button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute top-2 left-2 right-2 z-20 pointer-events-auto"
      >
        <div className="bg-black/80 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Camera Quality</h3>
              <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                metrics.overallQuality === 'excellent' ? 'bg-green-500/20 text-green-400' :
                metrics.overallQuality === 'good' ? 'bg-blue-500/20 text-blue-400' :
                metrics.overallQuality === 'fair' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {metrics.overallQuality.toUpperCase()}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isCalibrating && (
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
                  <span className="text-xs text-purple-400">Analyzing...</span>
                </div>
              )}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quality Score */}
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/60">Overall Score</span>
              <span className={`text-lg font-bold ${getQualityColor(metrics.overallQuality)}`}>
                {metrics.score}/100
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  metrics.score >= 80 ? 'bg-green-500' :
                  metrics.score >= 60 ? 'bg-blue-500' :
                  metrics.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${metrics.score}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Detailed Metrics */}
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-3 space-y-2 border-b border-white/10"
            >
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/60">Brightness:</span>
                  <span className="text-white font-medium">{metrics.brightness}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Contrast:</span>
                  <span className="text-white font-medium">{metrics.contrast}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Hand Visible:</span>
                  <span className="text-white font-medium">{Math.round(metrics.handVisibility * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Frame Rate:</span>
                  <span className="text-white font-medium flex items-center gap-1">
                    {metrics.frameRate} FPS
                    {metrics.frameRate >= 25 && <Zap className="w-3 h-3 text-green-400" />}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recommendations */}
          <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
            {recommendations.slice(0, 3).map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start gap-2 p-2 rounded-lg border ${getRecommendationColor(rec.type)}`}
              >
                <div className="mt-0.5">
                  {getRecommendationIcon(rec.type)}
                </div>
                <div className="flex-1">
                  <p className="text-xs leading-relaxed">
                    <span className="mr-1">{rec.icon}</span>
                    {rec.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Hand Position Guide */}
          {metrics.handVisibility < 0.5 && (
            <div className="p-3 bg-purple-500/10 border-t border-purple-500/20">
              <p className="text-xs text-purple-300 text-center">
                💡 <strong>Tip:</strong> Position your hand 30-50cm from camera, palm facing forward
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CameraCalibrationOverlay;
