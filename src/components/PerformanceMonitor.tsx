import { useEffect, useState, useRef } from "react";
import { Activity, Cpu, HardDrive, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PerformanceMetrics {
  fps: number;
  inferenceTime: number;
  memoryUsage: number;
  totalMemory: number;
  webglSupported: boolean;
  devicePerformance: 'high' | 'medium' | 'low';
}

interface PerformanceMonitorProps {
  isVisible?: boolean;
  onToggle?: () => void;
  onPerformanceChange?: (performance: 'high' | 'medium' | 'low') => void;
}

const PerformanceMonitor = ({ 
  isVisible = false, 
  onToggle,
  onPerformanceChange 
}: PerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    inferenceTime: 0,
    memoryUsage: 0,
    totalMemory: 0,
    webglSupported: false,
    devicePerformance: 'medium'
  });
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const webglSupported = !!gl;

    // Detect device performance
    const detectPerformance = (): 'high' | 'medium' | 'low' => {
      const memory = (performance as any).memory;
      const hardwareConcurrency = navigator.hardwareConcurrency || 2;
      
      if (!webglSupported) return 'low';
      
      // High-end: 8+ cores, WebGL supported
      if (hardwareConcurrency >= 8) return 'high';
      
      // Medium: 4-7 cores
      if (hardwareConcurrency >= 4) return 'medium';
      
      // Low: < 4 cores
      return 'low';
    };

    const devicePerformance = detectPerformance();
    
    setMetrics(prev => ({
      ...prev,
      webglSupported,
      devicePerformance
    }));

    if (onPerformanceChange) {
      onPerformanceChange(devicePerformance);
    }

    // Listen for inference time updates
    const handleInferenceTime = (event: any) => {
      setMetrics(prev => ({
        ...prev,
        inferenceTime: event.detail
      }));
    };

    window.addEventListener('inferenceTime', handleInferenceTime);

    // FPS and memory monitoring loop
    const monitorPerformance = () => {
      const now = performance.now();
      frameCountRef.current++;

      // Update FPS every second
      if (now - lastTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        
        // Get memory info if available
        const memory = (performance as any).memory;
        const memoryUsage = memory ? Math.round(memory.usedJSHeapSize / 1048576) : 0;
        const totalMemory = memory ? Math.round(memory.jsHeapSizeLimit / 1048576) : 0;

        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage,
          totalMemory
        }));

        frameCountRef.current = 0;
        lastTimeRef.current = now;

        // Warn if memory usage is high (>80%)
        if (memory && totalMemory > 0) {
          const memoryPercent = (memoryUsage / totalMemory) * 100;
          if (memoryPercent > 80) {
            console.warn(`High memory usage: ${memoryPercent.toFixed(1)}%`);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(monitorPerformance);
    };

    monitorPerformance();

    return () => {
      window.removeEventListener('inferenceTime', handleInferenceTime);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onPerformanceChange]);

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getFpsColor = (fps: number) => {
    if (fps >= 30) return 'text-green-500';
    if (fps >= 15) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMemoryColor = (usage: number, total: number) => {
    if (total === 0) return 'text-muted-foreground';
    const percent = (usage / total) * 100;
    if (percent < 60) return 'text-green-500';
    if (percent < 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
        title="Show Performance Metrics"
      >
        <Activity className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card/95 backdrop-blur-sm border-2 border-accent/30 rounded-2xl shadow-elegant p-4 min-w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent" />
          Performance
        </h3>
        <Button
          onClick={onToggle}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          ✕
        </Button>
      </div>

      <div className="space-y-3">
        {/* FPS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">FPS</span>
          </div>
          <span className={`text-lg font-bold ${getFpsColor(metrics.fps)}`}>
            {metrics.fps}
          </span>
        </div>

        {/* Inference Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Inference</span>
          </div>
          <span className="text-lg font-bold text-accent">
            {metrics.inferenceTime}ms
          </span>
        </div>

        {/* Memory Usage */}
        {metrics.totalMemory > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Memory</span>
            </div>
            <span className={`text-sm font-bold ${getMemoryColor(metrics.memoryUsage, metrics.totalMemory)}`}>
              {metrics.memoryUsage}MB / {metrics.totalMemory}MB
            </span>
          </div>
        )}

        {/* Device Performance */}
        <div className="flex items-center justify-between pt-2 border-t border-accent/20">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Device</span>
          </div>
          <span className={`text-sm font-bold uppercase ${getPerformanceColor(metrics.devicePerformance)}`}>
            {metrics.devicePerformance}
          </span>
        </div>

        {/* WebGL Support */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">WebGL</span>
          </div>
          <span className={`text-sm font-bold ${metrics.webglSupported ? 'text-green-500' : 'text-red-500'}`}>
            {metrics.webglSupported ? 'Supported' : 'Not Supported'}
          </span>
        </div>

        {/* Warnings */}
        {(!metrics.webglSupported || metrics.devicePerformance === 'low') && (
          <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-500">
                {!metrics.webglSupported 
                  ? 'WebGL not supported. Performance may be degraded.'
                  : 'Low-end device detected. Consider reducing quality settings.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;

// Hook to update inference time from outside
export const usePerformanceMetrics = () => {
  const [inferenceTime, setInferenceTime] = useState(0);

  const updateInferenceTime = (time: number) => {
    setInferenceTime(time);
    // Dispatch custom event for PerformanceMonitor to listen
    window.dispatchEvent(new CustomEvent('inferenceTime', { detail: time }));
  };

  return { inferenceTime, updateInferenceTime };
};
