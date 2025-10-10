# Quality Settings Guide

## How to Reduce Quality for Better Performance

### Current Settings (After Optimization)

#### Video Resolution:
- **Changed from:** 320x320
- **Changed to:** 224x224
- **Impact:** ~50% less pixels to process = better performance

#### Prediction Frequency:
- **High-end devices:** 10 FPS (was 20 FPS)
- **Medium devices:** 6-7 FPS (was 10 FPS)  
- **Low-end devices:** 4 FPS (was 5 FPS)

### Performance Impact

| Setting | Before | After | Performance Gain |
|---------|--------|-------|------------------|
| Video Size | 320x320 | 224x224 | ~40% faster |
| High FPS | 20 | 10 | ~50% less CPU |
| Medium FPS | 10 | 6-7 | ~35% less CPU |
| Low FPS | 5 | 4 | ~20% less CPU |

---

## Manual Quality Adjustment

### Option 1: Further Reduce Video Resolution

**File:** `src/components/WebcamGestureDetector.tsx` (Line 113)

```typescript
// Current (224x224)
const webcam = new tmImage.Webcam(224, 224, true);

// For even lower quality (160x160)
const webcam = new tmImage.Webcam(160, 160, true);

// For minimal quality (128x128) - may affect accuracy
const webcam = new tmImage.Webcam(128, 128, true);
```

### Option 2: Reduce Prediction Frequency

**File:** `src/utils/deviceCapabilities.ts` (Lines 160-183)

```typescript
case 'high':
  return {
    videoWidth: 224,
    videoHeight: 224,
    predictionInterval: 200, // Change to 200 for 5 FPS
    confidenceThreshold: 0.8
  };
```

**Prediction Interval Guide:**
- `50ms` = 20 FPS (very smooth, high CPU)
- `100ms` = 10 FPS (smooth, moderate CPU) ✅ Current
- `150ms` = 6-7 FPS (acceptable, low CPU)
- `200ms` = 5 FPS (choppy, very low CPU)
- `250ms` = 4 FPS (very choppy, minimal CPU)

### Option 3: Lower Confidence Threshold

**File:** `src/utils/deviceCapabilities.ts`

```typescript
case 'high':
  return {
    videoWidth: 224,
    videoHeight: 224,
    predictionInterval: 100,
    confidenceThreshold: 0.7 // Lower from 0.8 to 0.7
  };
```

**Note:** Lower threshold = faster detection but more false positives

---

## Recommended Settings by Use Case

### 1. Maximum Performance (Lowest Quality)
```typescript
// WebcamGestureDetector.tsx
const webcam = new tmImage.Webcam(160, 160, true);

// deviceCapabilities.ts
predictionInterval: 250, // 4 FPS
confidenceThreshold: 0.7
```

### 2. Balanced (Current Settings) ✅
```typescript
// WebcamGestureDetector.tsx
const webcam = new tmImage.Webcam(224, 224, true);

// deviceCapabilities.ts
predictionInterval: 100, // 10 FPS
confidenceThreshold: 0.8
```

### 3. Maximum Quality (Highest Accuracy)
```typescript
// WebcamGestureDetector.tsx
const webcam = new tmImage.Webcam(320, 320, true);

// deviceCapabilities.ts
predictionInterval: 50, // 20 FPS
confidenceThreshold: 0.85
```

---

## Quick Reference Table

| Quality Level | Resolution | FPS | CPU Usage | Accuracy |
|---------------|------------|-----|-----------|----------|
| Ultra Low | 128x128 | 4 | Minimal | Poor |
| Low | 160x160 | 5 | Low | Fair |
| **Medium** ✅ | **224x224** | **10** | **Moderate** | **Good** |
| High | 320x320 | 15 | High | Very Good |
| Ultra High | 320x320 | 20 | Very High | Excellent |

---

## How to Test Different Settings

1. **Edit the files** with your preferred settings
2. **Save the changes**
3. **Rebuild:** `npm run build`
4. **Test in browser**
5. **Check Performance Monitor** (Activity icon in bottom-right)
6. **Adjust as needed**

---

## Monitoring Performance

### Using Performance Monitor:
1. Click the **Activity icon** (📊) in bottom-right
2. Watch these metrics:
   - **FPS:** Should be stable (30+ is good)
   - **Inference Time:** Lower is better (<100ms ideal)
   - **Memory:** Should stay below 80%

### Signs You Need Lower Quality:
- ❌ FPS drops below 20
- ❌ Inference time > 150ms
- ❌ Memory usage > 80%
- ❌ Browser feels sluggish
- ❌ Gesture detection is slow

### Signs You Can Increase Quality:
- ✅ FPS consistently 30+
- ✅ Inference time < 50ms
- ✅ Memory usage < 60%
- ✅ Smooth, responsive experience

---

## Current Optimizations Applied

✅ **Video resolution reduced** from 320x320 to 224x224
✅ **Prediction frequency reduced** by ~50%
✅ **Automatic quality adjustment** based on device
✅ **Memory monitoring** to prevent leaks
✅ **Throttled predictions** to save CPU

---

## Additional Performance Tips

### 1. Close Unnecessary Tabs
- Each tab uses memory and CPU
- Close tabs you're not using

### 2. Disable Browser Extensions
- Extensions can slow down performance
- Disable temporarily for better speed

### 3. Use Hardware Acceleration
- **Chrome:** Settings → Advanced → System → "Use hardware acceleration"
- **Firefox:** Preferences → Performance → "Use hardware acceleration"

### 4. Update Your Browser
- Newer versions have better performance
- Update to latest Chrome/Edge/Firefox

### 5. Clear Browser Cache
- Old cache can slow things down
- Clear cache and reload

---

## Troubleshooting

### Still Too Slow?
1. Try 160x160 resolution
2. Increase prediction interval to 200ms
3. Lower confidence threshold to 0.7
4. Close other applications
5. Restart browser

### Gestures Not Detecting?
1. Increase video resolution to 320x320
2. Decrease prediction interval to 50ms
3. Increase confidence threshold to 0.85
4. Ensure good lighting
5. Position hand clearly in frame

---

## Summary

**Current settings provide a good balance** between performance and accuracy:
- ✅ 224x224 resolution (medium quality)
- ✅ 10 FPS predictions (smooth enough)
- ✅ 0.8 confidence threshold (accurate)

**For better performance:** Reduce resolution to 160x160 and increase interval to 200ms
**For better accuracy:** Increase resolution to 320x320 and decrease interval to 50ms

Choose based on your device capabilities and requirements! 🚀
