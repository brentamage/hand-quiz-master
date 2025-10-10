# Camera Shutdown Fix

## Problem
The camera was shutting down for 2-3 seconds when detecting finger gestures, then restarting automatically.

## Root Cause
The component had **two separate `useEffect` hooks** with conflicting dependencies:

1. **First useEffect** - Device capabilities and memory monitoring
   - Dependency: `[onPerformanceDetected]`
   
2. **Second useEffect** - Webcam and model initialization
   - Dependency: `[onGestureDetected]`

### What Was Happening:
1. User shows gesture to camera
2. Gesture detected → `onGestureDetected(gestureName)` called
3. Parent component re-renders (because state changes)
4. `onGestureDetected` function reference changes
5. Second `useEffect` detects dependency change
6. **Cleanup function runs** → Camera stops
7. **Effect re-runs** → Camera reinitializes (2-3 second delay)
8. Camera turns back on

This created a **re-initialization loop** every time a gesture was detected!

## Solution
Combined both `useEffect` hooks into a **single effect with empty dependency array `[]`**:

### Before (Problematic):
```typescript
// Effect 1 - runs when onPerformanceDetected changes
useEffect(() => {
  // Device capabilities setup
}, [onPerformanceDetected]);

// Effect 2 - runs when onGestureDetected changes
useEffect(() => {
  // Camera and model setup
}, [onGestureDetected]); // ❌ This causes re-initialization!
```

### After (Fixed):
```typescript
// Single effect - runs ONLY ONCE on mount
useEffect(() => {
  // Step 1: Device capabilities
  // Step 2: Load AI model
  // Step 3: Request camera
  // Step 4: Initialize camera
  // Step 5: Start predictions
}, []); // ✅ Empty array = runs only once
```

## Key Changes

### 1. Merged Initialization
All initialization steps now happen in one sequential flow:
- Device capability detection
- WebGL setup
- Memory monitor initialization
- Model loading
- Camera access request
- Webcam initialization
- Prediction loop start

### 2. Removed Problematic Dependencies
- `onGestureDetected` is now used via ref (doesn't trigger re-render)
- `onPerformanceDetected` is called once during init
- Effect only runs on component mount

### 3. Proper Cleanup
Cleanup function now handles all resources:
```typescript
return () => {
  isActive = false;
  cancelAnimationFrame(animationFrameRef.current);
  memoryMonitorRef.current?.stop();
  cleanup(model, webcam, stream);
};
```

## Benefits

### ✅ Camera Stability
- Camera initializes **once** and stays on
- No more unexpected shutdowns
- Smooth continuous operation

### ✅ Performance
- No repeated initialization overhead
- Consistent frame rate
- Better user experience

### ✅ Resource Management
- Single initialization = less memory churn
- Proper cleanup on unmount only
- No resource leaks

## Testing Checklist

- [x] Camera starts successfully
- [x] Camera stays on during gesture detection
- [x] No 2-3 second shutdowns
- [x] Gestures detected correctly
- [x] Memory monitor works
- [x] Performance monitor works
- [x] Proper cleanup on page navigation

## Technical Details

### Why Empty Dependency Array?
```typescript
useEffect(() => {
  // This runs ONLY ONCE when component mounts
}, []); // Empty array = no dependencies to watch
```

- **No dependencies** = effect never re-runs
- Camera initializes once and stays active
- Callbacks use refs to avoid stale closures

### Callback Handling
Instead of depending on `onGestureDetected`, we:
1. Call it directly in the prediction loop
2. Parent component can change the callback
3. Component doesn't re-initialize

### Memory Safety
The `isActive` flag prevents race conditions:
```typescript
let isActive = true;

const predict = async () => {
  if (!isActive) return; // Stop if component unmounted
  // ... predictions
};

return () => {
  isActive = false; // Cleanup sets this to false
};
```

## Additional Notes

### If Camera Still Has Issues:
1. Check browser console for errors
2. Verify WebGL is enabled
3. Check camera permissions
4. Try different browser
5. Check Performance Monitor for issues

### Future Improvements:
- Could add manual restart button
- Could implement camera health check
- Could add reconnection logic for dropped streams

## Conclusion

The camera shutdown issue was caused by **React's useEffect dependency system** triggering unnecessary re-initializations. By consolidating all initialization into a single effect with no dependencies, the camera now:

- ✅ Starts once
- ✅ Stays on continuously
- ✅ Detects gestures smoothly
- ✅ No unexpected shutdowns

**Status:** ✅ Fixed and tested
