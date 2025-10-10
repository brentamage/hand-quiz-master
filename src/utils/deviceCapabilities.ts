/**
 * Device Capability Detection Utilities
 * Checks for WebGL, camera permissions, and device performance
 */

export interface DeviceCapabilities {
  webgl: boolean;
  webgl2: boolean;
  camera: 'granted' | 'denied' | 'prompt' | 'unsupported';
  hardwareConcurrency: number;
  deviceMemory?: number;
  performance: 'high' | 'medium' | 'low';
  isMobile: boolean;
  supportsWebcam: boolean;
}

/**
 * Check if WebGL is supported
 */
export const checkWebGLSupport = (): { webgl: boolean; webgl2: boolean } => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const gl2 = canvas.getContext('webgl2');
    
    return {
      webgl: !!gl,
      webgl2: !!gl2
    };
  } catch (e) {
    return { webgl: false, webgl2: false };
  }
};

/**
 * Check camera permission status
 */
export const checkCameraPermission = async (): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return 'unsupported';
    }

    // Check if Permissions API is available
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        return result.state as 'granted' | 'denied' | 'prompt';
      } catch (e) {
        // Permissions API might not support camera on some browsers
        return 'prompt';
      }
    }

    return 'prompt';
  } catch (e) {
    return 'unsupported';
  }
};

/**
 * Request camera access
 */
export const requestCameraAccess = async (): Promise<{ success: boolean; stream?: MediaStream; error?: string }> => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { 
        success: false, 
        error: 'Camera API not supported in this browser' 
      };
    }

    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 320 },
        height: { ideal: 320 },
        facingMode: 'user'
      } 
    });

    return { success: true, stream };
  } catch (error: any) {
    let errorMessage = 'Failed to access camera';
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      errorMessage = 'No camera found on this device.';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      errorMessage = 'Camera is already in use by another application.';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = 'Camera does not support the requested settings.';
    } else if (error.name === 'SecurityError') {
      errorMessage = 'Camera access blocked due to security restrictions.';
    }

    return { success: false, error: errorMessage };
  }
};

/**
 * Detect device performance level
 */
export const detectDevicePerformance = (): 'high' | 'medium' | 'low' => {
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory; // GB
  const { webgl, webgl2 } = checkWebGLSupport();

  // No WebGL = low performance
  if (!webgl) return 'low';

  // High-end: 8+ cores, 8GB+ RAM, WebGL2
  if (cores >= 8 && webgl2 && (!memory || memory >= 8)) {
    return 'high';
  }

  // Medium: 4-7 cores, 4GB+ RAM, WebGL
  if (cores >= 4 && (!memory || memory >= 4)) {
    return 'medium';
  }

  // Low: everything else
  return 'low';
};

/**
 * Check if device is mobile
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Get all device capabilities
 */
export const getDeviceCapabilities = async (): Promise<DeviceCapabilities> => {
  const { webgl, webgl2 } = checkWebGLSupport();
  const camera = await checkCameraPermission();
  const hardwareConcurrency = navigator.hardwareConcurrency || 2;
  const deviceMemory = (navigator as any).deviceMemory;
  const performance = detectDevicePerformance();
  const isMobile = isMobileDevice();
  const supportsWebcam = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  return {
    webgl,
    webgl2,
    camera,
    hardwareConcurrency,
    deviceMemory,
    performance,
    isMobile,
    supportsWebcam
  };
};

/**
 * Get recommended quality settings based on device performance
 */
export const getRecommendedSettings = (performance: 'high' | 'medium' | 'low') => {
  switch (performance) {
    case 'high':
      return {
        videoWidth: 224,
        videoHeight: 224,
        predictionInterval: 100, // 10 FPS (reduced from 20)
        confidenceThreshold: 0.8
      };
    case 'medium':
      return {
        videoWidth: 224,
        videoHeight: 224,
        predictionInterval: 150, // 6-7 FPS (reduced from 10)
        confidenceThreshold: 0.75
      };
    case 'low':
      return {
        videoWidth: 160,
        videoHeight: 160,
        predictionInterval: 250, // 4 FPS (reduced from 5)
        confidenceThreshold: 0.7
      };
  }
};
