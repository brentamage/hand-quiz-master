/**
 * Performance optimization utilities for pose detection
 */

// Device performance tiers
export type PerformanceTier = 'high' | 'medium' | 'low';

// Pose cache for common poses
interface PoseCacheEntry {
  pose: any;
  timestamp: number;
  className: string;
}

class PoseCache {
  private cache: Map<string, PoseCacheEntry> = new Map();
  private maxCacheSize = 10;
  private cacheDuration = 2000; // 2 seconds

  set(className: string, pose: any) {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(className, {
      pose,
      timestamp: Date.now(),
      className
    });
  }

  get(className: string): any | null {
    const entry = this.cache.get(className);
    
    if (!entry) return null;
    
    // Check if cache entry is still valid
    if (Date.now() - entry.timestamp > this.cacheDuration) {
      this.cache.delete(className);
      return null;
    }

    return entry.pose;
  }

  clear() {
    this.cache.clear();
  }
}

export const poseCache = new PoseCache();

/**
 * Get optimal frame rate based on device performance
 */
export const getOptimalFrameRate = (performance: PerformanceTier): number => {
  switch (performance) {
    case 'high':
      return 100; // 10 FPS
    case 'medium':
      return 150; // ~6.6 FPS
    case 'low':
      return 250; // 4 FPS
    default:
      return 150;
  }
};

/**
 * Get optimal pose detection settings based on device performance
 */
export const getOptimalPoseSettings = (performance: PerformanceTier) => {
  switch (performance) {
    case 'high':
      return {
        frameRate: 100,
        enableSkeleton: true,
        enableFramingGuide: true,
        enableTrails: true,
        skeletonQuality: 'high',
        confidenceThreshold: 0.8,
      };
    case 'medium':
      return {
        frameRate: 150,
        enableSkeleton: true,
        enableFramingGuide: true,
        enableTrails: false,
        skeletonQuality: 'medium',
        confidenceThreshold: 0.85,
      };
    case 'low':
      return {
        frameRate: 250,
        enableSkeleton: false,
        enableFramingGuide: true,
        enableTrails: false,
        skeletonQuality: 'low',
        confidenceThreshold: 0.9,
      };
    default:
      return {
        frameRate: 150,
        enableSkeleton: true,
        enableFramingGuide: true,
        enableTrails: false,
        skeletonQuality: 'medium',
        confidenceThreshold: 0.85,
      };
  }
};

/**
 * Adaptive frame rate controller
 */
export class AdaptiveFrameRateController {
  private currentFrameRate: number;
  private targetFrameRate: number;
  private inferenceTimeHistory: number[] = [];
  private maxHistorySize = 10;

  constructor(initialFrameRate: number) {
    this.currentFrameRate = initialFrameRate;
    this.targetFrameRate = initialFrameRate;
  }

  /**
   * Update frame rate based on inference time
   */
  update(inferenceTime: number): number {
    this.inferenceTimeHistory.push(inferenceTime);
    
    // Keep only recent history
    if (this.inferenceTimeHistory.length > this.maxHistorySize) {
      this.inferenceTimeHistory.shift();
    }

    // Calculate average inference time
    const avgInferenceTime = this.inferenceTimeHistory.reduce((a, b) => a + b, 0) / this.inferenceTimeHistory.length;

    // Adjust frame rate based on performance
    if (avgInferenceTime > 200) {
      // Slow down if inference is taking too long
      this.targetFrameRate = Math.min(this.targetFrameRate + 50, 500);
    } else if (avgInferenceTime < 100 && this.targetFrameRate > 100) {
      // Speed up if we have headroom
      this.targetFrameRate = Math.max(this.targetFrameRate - 25, 100);
    }

    // Smooth transition to target frame rate
    this.currentFrameRate += (this.targetFrameRate - this.currentFrameRate) * 0.1;

    return Math.round(this.currentFrameRate);
  }

  getCurrentFrameRate(): number {
    return Math.round(this.currentFrameRate);
  }

  reset(frameRate: number) {
    this.currentFrameRate = frameRate;
    this.targetFrameRate = frameRate;
    this.inferenceTimeHistory = [];
  }
}

/**
 * Region of Interest (ROI) calculator
 * Focus detection on upper body for faster processing
 */
export const calculateROI = (
  videoWidth: number,
  videoHeight: number,
  focusArea: 'full' | 'upper' | 'lower' = 'full'
) => {
  switch (focusArea) {
    case 'upper':
      // Focus on upper 60% of frame
      return {
        x: 0,
        y: 0,
        width: videoWidth,
        height: Math.floor(videoHeight * 0.6)
      };
    case 'lower':
      // Focus on lower 60% of frame
      return {
        x: 0,
        y: Math.floor(videoHeight * 0.4),
        width: videoWidth,
        height: Math.floor(videoHeight * 0.6)
      };
    case 'full':
    default:
      return {
        x: 0,
        y: 0,
        width: videoWidth,
        height: videoHeight
      };
  }
};

/**
 * Throttle function for performance
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

/**
 * Debounce function for performance
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Check if pose has changed significantly
 */
export const hasPoseChangedSignificantly = (
  prevPose: any,
  currentPose: any,
  threshold: number = 0.1
): boolean => {
  if (!prevPose || !currentPose) return true;
  if (!prevPose.keypoints || !currentPose.keypoints) return true;

  // Calculate average distance between keypoints
  let totalDistance = 0;
  let validKeypoints = 0;

  for (let i = 0; i < Math.min(prevPose.keypoints.length, currentPose.keypoints.length); i++) {
    const prev = prevPose.keypoints[i];
    const curr = currentPose.keypoints[i];

    if (prev && curr && prev.score > 0.5 && curr.score > 0.5) {
      const dx = prev.x - curr.x;
      const dy = prev.y - curr.y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
      validKeypoints++;
    }
  }

  if (validKeypoints === 0) return true;

  const avgDistance = totalDistance / validKeypoints;
  return avgDistance > threshold;
};

/**
 * Progressive enhancement detector
 */
export const detectDeviceCapabilities = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  const capabilities = {
    webgl: !!gl,
    hardwareConcurrency: navigator.hardwareConcurrency || 2,
    deviceMemory: (navigator as any).deviceMemory || 4,
    connection: (navigator as any).connection?.effectiveType || '4g',
  };

  // Determine performance tier
  let performanceTier: PerformanceTier = 'medium';

  if (capabilities.hardwareConcurrency >= 8 && capabilities.deviceMemory >= 8) {
    performanceTier = 'high';
  } else if (capabilities.hardwareConcurrency <= 2 || capabilities.deviceMemory <= 2) {
    performanceTier = 'low';
  }

  return {
    ...capabilities,
    performanceTier
  };
};
