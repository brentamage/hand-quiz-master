/**
 * Camera Calibration Utilities
 * Auto-detect camera quality and provide recommendations for optimal gesture detection
 */

export interface CalibrationMetrics {
  brightness: number; // 0-100
  contrast: number; // 0-100
  lighting: 'excellent' | 'good' | 'fair' | 'poor';
  handVisibility: number; // 0-1
  backgroundNoise: number; // 0-1
  frameRate: number;
  resolution: { width: number; height: number };
  overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
  score: number; // 0-100
}

export interface CalibrationRecommendation {
  type: 'error' | 'warning' | 'success' | 'info';
  message: string;
  icon: string;
  priority: number; // 1-5, 1 being highest
}

/**
 * Analyze video frame for brightness
 */
export const analyzeBrightness = (
  videoElement: HTMLVideoElement,
  canvas?: HTMLCanvasElement
): number => {
  const tempCanvas = canvas || document.createElement('canvas');
  const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
  
  if (!ctx || !videoElement.videoWidth) return 50;

  tempCanvas.width = videoElement.videoWidth;
  tempCanvas.height = videoElement.videoHeight;
  
  try {
    ctx.drawImage(videoElement, 0, 0);
    const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      // Calculate perceived brightness using luminance formula
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
      totalBrightness += brightness;
    }
    
    const avgBrightness = totalBrightness / (data.length / 4);
    return Math.round((avgBrightness / 255) * 100);
  } catch (error) {
    console.warn('Brightness analysis failed:', error);
    return 50;
  }
};

/**
 * Analyze video frame for contrast
 */
export const analyzeContrast = (
  videoElement: HTMLVideoElement,
  canvas?: HTMLCanvasElement
): number => {
  const tempCanvas = canvas || document.createElement('canvas');
  const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
  
  if (!ctx || !videoElement.videoWidth) return 50;

  tempCanvas.width = videoElement.videoWidth;
  tempCanvas.height = videoElement.videoHeight;
  
  try {
    ctx.drawImage(videoElement, 0, 0);
    const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    
    let sum = 0;
    let sumSq = 0;
    const pixelCount = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      sum += brightness;
      sumSq += brightness * brightness;
    }
    
    const mean = sum / pixelCount;
    const variance = (sumSq / pixelCount) - (mean * mean);
    const stdDev = Math.sqrt(variance);
    
    // Normalize standard deviation to 0-100 scale
    const contrast = Math.min(100, (stdDev / 128) * 100);
    return Math.round(contrast);
  } catch (error) {
    console.warn('Contrast analysis failed:', error);
    return 50;
  }
};

/**
 * Detect hand presence in frame (simplified)
 */
export const detectHandPresence = (
  videoElement: HTMLVideoElement,
  canvas?: HTMLCanvasElement
): number => {
  const tempCanvas = canvas || document.createElement('canvas');
  const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
  
  if (!ctx || !videoElement.videoWidth) return 0;

  tempCanvas.width = videoElement.videoWidth;
  tempCanvas.height = videoElement.videoHeight;
  
  try {
    ctx.drawImage(videoElement, 0, 0);
    const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    
    // Simple skin tone detection (HSV-based approximation)
    let skinPixels = 0;
    const totalPixels = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Simplified skin tone detection
      if (r > 95 && g > 40 && b > 20 &&
          r > g && r > b &&
          Math.abs(r - g) > 15) {
        skinPixels++;
      }
    }
    
    const skinRatio = skinPixels / totalPixels;
    // Hand should be 5-30% of frame
    if (skinRatio >= 0.05 && skinRatio <= 0.30) {
      return Math.min(1, skinRatio / 0.15);
    } else if (skinRatio < 0.05) {
      return skinRatio / 0.05; // Too far
    } else {
      return Math.max(0, 1 - ((skinRatio - 0.30) / 0.30)); // Too close
    }
  } catch (error) {
    console.warn('Hand detection failed:', error);
    return 0;
  }
};

/**
 * Analyze background noise/complexity
 */
export const analyzeBackgroundNoise = (
  videoElement: HTMLVideoElement,
  canvas?: HTMLCanvasElement
): number => {
  const tempCanvas = canvas || document.createElement('canvas');
  const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
  
  if (!ctx || !videoElement.videoWidth) return 0.5;

  tempCanvas.width = videoElement.videoWidth;
  tempCanvas.height = videoElement.videoHeight;
  
  try {
    ctx.drawImage(videoElement, 0, 0);
    const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    
    // Calculate edge density as proxy for background complexity
    let edgeCount = 0;
    const threshold = 30;
    
    for (let y = 1; y < tempCanvas.height - 1; y++) {
      for (let x = 1; x < tempCanvas.width - 1; x++) {
        const idx = (y * tempCanvas.width + x) * 4;
        const current = data[idx];
        const right = data[idx + 4];
        const down = data[idx + tempCanvas.width * 4];
        
        if (Math.abs(current - right) > threshold || 
            Math.abs(current - down) > threshold) {
          edgeCount++;
        }
      }
    }
    
    const edgeDensity = edgeCount / (tempCanvas.width * tempCanvas.height);
    return Math.min(1, edgeDensity * 10); // Normalize
  } catch (error) {
    console.warn('Background noise analysis failed:', error);
    return 0.5;
  }
};

/**
 * Measure actual frame rate
 */
export const measureFrameRate = (
  videoElement: HTMLVideoElement,
  duration: number = 1000
): Promise<number> => {
  return new Promise((resolve) => {
    let frameCount = 0;
    const lastTime = performance.now();
    
    const countFrame = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= duration) {
        const fps = (frameCount / (currentTime - lastTime)) * 1000;
        resolve(Math.round(fps));
      } else {
        requestAnimationFrame(countFrame);
      }
    };
    
    requestAnimationFrame(countFrame);
  });
};

/**
 * Get comprehensive calibration metrics
 */
export const getCalibrationMetrics = async (
  videoElement: HTMLVideoElement
): Promise<CalibrationMetrics> => {
  const canvas = document.createElement('canvas');
  
  const brightness = analyzeBrightness(videoElement, canvas);
  const contrast = analyzeContrast(videoElement, canvas);
  const handVisibility = detectHandPresence(videoElement, canvas);
  const backgroundNoise = analyzeBackgroundNoise(videoElement, canvas);
  const frameRate = await measureFrameRate(videoElement);
  
  const resolution = {
    width: videoElement.videoWidth,
    height: videoElement.videoHeight
  };
  
  // Determine lighting quality
  let lighting: CalibrationMetrics['lighting'];
  if (brightness >= 40 && brightness <= 70 && contrast >= 30) {
    lighting = 'excellent';
  } else if (brightness >= 30 && brightness <= 80 && contrast >= 20) {
    lighting = 'good';
  } else if (brightness >= 20 && brightness <= 90) {
    lighting = 'fair';
  } else {
    lighting = 'poor';
  }
  
  // Calculate overall quality score
  const brightnessScore = Math.max(0, 100 - Math.abs(55 - brightness) * 2);
  const contrastScore = Math.min(100, contrast * 2);
  const handScore = handVisibility * 100;
  const noiseScore = (1 - backgroundNoise) * 100;
  const fpsScore = Math.min(100, (frameRate / 30) * 100);
  
  const score = Math.round(
    (brightnessScore * 0.25) +
    (contrastScore * 0.20) +
    (handScore * 0.20) +
    (noiseScore * 0.20) +
    (fpsScore * 0.15)
  );
  
  let overallQuality: CalibrationMetrics['overallQuality'];
  if (score >= 80) overallQuality = 'excellent';
  else if (score >= 60) overallQuality = 'good';
  else if (score >= 40) overallQuality = 'fair';
  else overallQuality = 'poor';
  
  return {
    brightness,
    contrast,
    lighting,
    handVisibility,
    backgroundNoise,
    frameRate,
    resolution,
    overallQuality,
    score
  };
};

/**
 * Generate recommendations based on metrics
 */
export const getRecommendations = (
  metrics: CalibrationMetrics
): CalibrationRecommendation[] => {
  const recommendations: CalibrationRecommendation[] = [];
  
  // Brightness recommendations
  if (metrics.brightness < 30) {
    recommendations.push({
      type: 'error',
      message: 'Too dark! Turn on more lights or move to a brighter area.',
      icon: '💡',
      priority: 1
    });
  } else if (metrics.brightness > 80) {
    recommendations.push({
      type: 'warning',
      message: 'Too bright! Reduce direct light or move away from windows.',
      icon: '☀️',
      priority: 2
    });
  } else if (metrics.brightness >= 40 && metrics.brightness <= 70) {
    recommendations.push({
      type: 'success',
      message: 'Perfect lighting! Keep it this way.',
      icon: '✨',
      priority: 5
    });
  }
  
  // Contrast recommendations
  if (metrics.contrast < 20) {
    recommendations.push({
      type: 'warning',
      message: 'Low contrast detected. Try a plain background.',
      icon: '🎨',
      priority: 2
    });
  }
  
  // Hand visibility recommendations
  if (metrics.handVisibility < 0.3) {
    recommendations.push({
      type: 'error',
      message: 'Hand not detected! Position your hand in front of the camera.',
      icon: '✋',
      priority: 1
    });
  } else if (metrics.handVisibility < 0.6) {
    recommendations.push({
      type: 'warning',
      message: 'Hand barely visible. Move closer or adjust position.',
      icon: '👋',
      priority: 2
    });
  } else if (metrics.handVisibility > 0.9) {
    recommendations.push({
      type: 'warning',
      message: 'Hand too close! Move back a bit.',
      icon: '🤚',
      priority: 2
    });
  } else {
    recommendations.push({
      type: 'success',
      message: 'Hand position is perfect!',
      icon: '👍',
      priority: 5
    });
  }
  
  // Background noise recommendations
  if (metrics.backgroundNoise > 0.7) {
    recommendations.push({
      type: 'warning',
      message: 'Busy background detected. Use a plain wall if possible.',
      icon: '🖼️',
      priority: 3
    });
  }
  
  // Frame rate recommendations
  if (metrics.frameRate < 20) {
    recommendations.push({
      type: 'warning',
      message: 'Low frame rate. Close other apps or use better hardware.',
      icon: '🐌',
      priority: 3
    });
  } else if (metrics.frameRate >= 25) {
    recommendations.push({
      type: 'success',
      message: `Smooth ${metrics.frameRate} FPS - Great performance!`,
      icon: '⚡',
      priority: 5
    });
  }
  
  // Resolution recommendations
  if (metrics.resolution.width < 640) {
    recommendations.push({
      type: 'info',
      message: 'Low resolution. Consider using a better camera.',
      icon: '📹',
      priority: 4
    });
  }
  
  // Overall quality message
  if (metrics.overallQuality === 'excellent') {
    recommendations.push({
      type: 'success',
      message: `Excellent setup! Quality score: ${metrics.score}/100`,
      icon: '🏆',
      priority: 5
    });
  } else if (metrics.overallQuality === 'poor') {
    recommendations.push({
      type: 'error',
      message: `Poor quality (${metrics.score}/100). Follow recommendations above.`,
      icon: '⚠️',
      priority: 1
    });
  }
  
  // Sort by priority (highest first)
  return recommendations.sort((a, b) => a.priority - b.priority);
};

/**
 * Get ideal hand position guide
 */
export const getHandPositionGuide = () => {
  return {
    distance: '30-50cm from camera',
    position: 'Center of frame',
    lighting: 'Front-facing light source',
    background: 'Plain, solid color',
    angle: 'Palm facing camera'
  };
};
