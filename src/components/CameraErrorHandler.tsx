import { AlertTriangle, Camera, Settings, RefreshCw, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraErrorHandlerProps {
  error: string;
  onRetry: () => void;
  onUseFallback?: () => void;
  showFallback?: boolean;
}

const CameraErrorHandler = ({ 
  error, 
  onRetry, 
  onUseFallback,
  showFallback = true 
}: CameraErrorHandlerProps) => {
  const getErrorDetails = (errorMessage: string) => {
    if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
      return {
        icon: <Camera className="w-16 h-16 text-yellow-500" />,
        title: 'Camera Permission Required',
        description: 'Please allow camera access to use gesture controls.',
        steps: [
          'Click the camera icon in your browser\'s address bar',
          'Select "Allow" for camera permissions',
          'Refresh the page or click retry below'
        ]
      };
    }

    if (errorMessage.includes('not found') || errorMessage.includes('No camera')) {
      return {
        icon: <Camera className="w-16 h-16 text-red-500" />,
        title: 'No Camera Detected',
        description: 'We couldn\'t find a camera on your device.',
        steps: [
          'Make sure your camera is properly connected',
          'Check if other applications can access the camera',
          'Try using keyboard/mouse controls instead'
        ]
      };
    }

    if (errorMessage.includes('already in use')) {
      return {
        icon: <AlertTriangle className="w-16 h-16 text-orange-500" />,
        title: 'Camera In Use',
        description: 'Your camera is being used by another application.',
        steps: [
          'Close other applications using the camera',
          'Close other browser tabs that might be using the camera',
          'Click retry once the camera is available'
        ]
      };
    }

    if (errorMessage.includes('security') || errorMessage.includes('SecurityError')) {
      return {
        icon: <Settings className="w-16 h-16 text-red-500" />,
        title: 'Security Restriction',
        description: 'Camera access is blocked due to security settings.',
        steps: [
          'Make sure you\'re using HTTPS (not HTTP)',
          'Check your browser\'s security settings',
          'Try using a different browser'
        ]
      };
    }

    // Generic error
    return {
      icon: <AlertTriangle className="w-16 h-16 text-red-500" />,
      title: 'Camera Error',
      description: errorMessage,
      steps: [
        'Check your camera connection',
        'Refresh the page',
        'Try a different browser'
      ]
    };
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className="flex flex-col items-center gap-6 p-8 max-w-2xl mx-auto">
      <div className="flex flex-col items-center text-center gap-4">
        {errorDetails.icon}
        <h2 className="text-3xl font-bold text-foreground">{errorDetails.title}</h2>
        <p className="text-lg text-muted-foreground">{errorDetails.description}</p>
      </div>

      {/* Error details card */}
      <div className="w-full gradient-card rounded-2xl p-6 border border-accent/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-accent" />
          How to Fix This
        </h3>
        <ol className="space-y-3 text-left">
          {errorDetails.steps.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Button
          onClick={onRetry}
          size="lg"
          className="flex-1 gap-2 bg-gradient-accent hover:opacity-90 !text-black dark:!text-gray-100"
        >
          <RefreshCw className="w-5 h-5" />
          Retry Camera Access
        </Button>

        {showFallback && onUseFallback && (
          <Button
            onClick={onUseFallback}
            size="lg"
            variant="outline"
            className="flex-1 gap-2 border-2 border-accent/50"
          >
            <Keyboard className="w-5 h-5" />
            Use Keyboard/Mouse
          </Button>
        )}
      </div>

      {/* Browser-specific instructions */}
      <div className="w-full bg-card/50 rounded-xl p-4 border border-accent/10">
        <details className="cursor-pointer">
          <summary className="text-sm font-semibold text-accent mb-2">
            Browser-Specific Instructions
          </summary>
          <div className="space-y-3 text-sm text-muted-foreground mt-3">
            <div>
              <strong className="text-foreground">Chrome/Edge:</strong>
              <p>Click the camera icon in the address bar → Allow → Reload</p>
            </div>
            <div>
              <strong className="text-foreground">Firefox:</strong>
              <p>Click the camera icon in the address bar → Allow → Remember decision → Reload</p>
            </div>
            <div>
              <strong className="text-foreground">Safari:</strong>
              <p>Safari → Settings → Websites → Camera → Allow for this website</p>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default CameraErrorHandler;
