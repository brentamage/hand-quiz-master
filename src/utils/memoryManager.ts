/**
 * Memory Management Utilities for TensorFlow.js
 * Handles tensor disposal, memory monitoring, and cleanup
 */

import * as tf from "@tensorflow/tfjs";

export interface MemoryInfo {
  numTensors: number;
  numBytes: number;
  numBytesInGPU?: number;
  unreliable?: boolean;
  reasons?: string[];
}

/**
 * Get current TensorFlow.js memory usage
 */
export const getMemoryInfo = (): MemoryInfo => {
  const memory = tf.memory();
  return {
    numTensors: memory.numTensors,
    numBytes: memory.numBytes,
    unreliable: memory.unreliable,
    reasons: memory.reasons
  };
};

/**
 * Monitor memory and log warnings if usage is high
 */
export const monitorMemory = (threshold: number = 100): void => {
  const memory = tf.memory();
  
  if (memory.numTensors > threshold) {
    console.warn(`High tensor count: ${memory.numTensors} tensors in memory`);
  }

  const mbUsed = memory.numBytes / (1024 * 1024);
  if (mbUsed > 100) {
    console.warn(`High memory usage: ${mbUsed.toFixed(2)} MB`);
  }

  if (memory.unreliable) {
    console.warn('Memory tracking is unreliable:', memory.reasons);
  }
};

/**
 * Dispose all tensors and clean up memory
 */
export const disposeAllTensors = (): void => {
  const numTensors = tf.memory().numTensors;
  
  // This is aggressive - only use when completely shutting down
  tf.disposeVariables();
  
  console.log(`Disposed tensors. Before: ${numTensors}, After: ${tf.memory().numTensors}`);
};

/**
 * Create a memory-safe prediction wrapper
 * Automatically disposes tensors after prediction
 * Note: tf.tidy doesn't work with async functions, so this is a manual cleanup helper
 */
export const tidyPredict = async <T>(fn: () => Promise<T>): Promise<T> => {
  const tensorsBefore = tf.memory().numTensors;
  try {
    return await fn();
  } finally {
    const tensorsAfter = tf.memory().numTensors;
    if (tensorsAfter > tensorsBefore + 10) {
      console.warn(`Potential memory leak: ${tensorsAfter - tensorsBefore} new tensors created`);
    }
  }
};

/**
 * Check if memory usage is critical
 */
export const isMemoryCritical = (): boolean => {
  const memory = tf.memory();
  const mbUsed = memory.numBytes / (1024 * 1024);
  
  // Critical if using more than 200MB or more than 500 tensors
  return mbUsed > 200 || memory.numTensors > 500;
};

/**
 * Get memory usage percentage (if browser supports it)
 */
export const getMemoryUsagePercent = (): number | null => {
  const memory = (performance as any).memory;
  
  if (!memory) return null;
  
  const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
  return Math.round(usedPercent);
};

/**
 * Check if device has low memory
 */
export const isLowMemoryDevice = (): boolean => {
  const deviceMemory = (navigator as any).deviceMemory; // GB
  
  if (deviceMemory && deviceMemory < 4) {
    return true;
  }

  // Fallback: check current memory usage
  const memoryPercent = getMemoryUsagePercent();
  if (memoryPercent && memoryPercent > 80) {
    return true;
  }

  return false;
};

/**
 * Memory monitoring class for continuous tracking
 */
export class MemoryMonitor {
  private intervalId: number | null = null;
  private callbacks: Array<(info: MemoryInfo) => void> = [];
  private warningThreshold: number;

  constructor(warningThreshold: number = 100) {
    this.warningThreshold = warningThreshold;
  }

  start(intervalMs: number = 5000): void {
    if (this.intervalId) return;

    this.intervalId = window.setInterval(() => {
      const memory = getMemoryInfo();
      
      // Check for warnings
      if (memory.numTensors > this.warningThreshold) {
        console.warn(`Memory warning: ${memory.numTensors} tensors`);
      }

      if (isMemoryCritical()) {
        console.error('Critical memory usage detected!');
      }

      // Notify callbacks
      this.callbacks.forEach(cb => cb(memory));
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onUpdate(callback: (info: MemoryInfo) => void): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (info: MemoryInfo) => void): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }
}

/**
 * Cleanup function to be called on component unmount
 */
export const cleanup = (model: any, webcam: any, stream?: MediaStream): void => {
  // Dispose model
  if (model && typeof model.dispose === 'function') {
    try {
      model.dispose();
      console.log('Model disposed');
    } catch (e) {
      console.error('Error disposing model:', e);
    }
  }

  // Stop webcam
  if (webcam && typeof webcam.stop === 'function') {
    try {
      webcam.stop();
      console.log('Webcam stopped');
    } catch (e) {
      console.error('Error stopping webcam:', e);
    }
  }

  // Stop media stream
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
      console.log('Media track stopped');
    });
  }

  // Log final memory state
  const finalMemory = getMemoryInfo();
  console.log('Final memory state:', {
    tensors: finalMemory.numTensors,
    mb: (finalMemory.numBytes / (1024 * 1024)).toFixed(2)
  });
};
