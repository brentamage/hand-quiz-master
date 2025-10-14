import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // You can also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
          <div className="max-w-2xl w-full">
            <div className="holographic-card animated-gradient-border rounded-3xl p-12 shadow-depth text-center">
              {/* Error Icon */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
                <AlertTriangle className="w-24 h-24 mx-auto text-red-500 relative z-10" />
              </div>

              {/* Error Title */}
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-shimmer">
                Oops! Something went wrong
              </h1>
              
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-red-500 to-purple-500 rounded-full mb-6"></div>

              {/* Error Message */}
              <p className="text-xl text-muted-foreground mb-8">
                We encountered an unexpected error. Don't worry, your progress is safe!
              </p>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-8 text-left">
                  <summary className="cursor-pointer text-accent hover:text-accent/80 mb-4">
                    View Error Details (Development Mode)
                  </summary>
                  <div className="bg-slate-900/50 rounded-xl p-4 overflow-auto max-h-64">
                    <p className="text-red-400 font-mono text-sm mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-gray-400 font-mono text-xs whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={this.handleReset}
                  variant="default"
                  className="gap-2 px-8 py-6 text-lg rounded-xl bg-gradient-accent hover:opacity-90 transition-elegant hover:scale-105 shadow-elegant !text-black dark:!text-gray-100"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </Button>

                <Button
                  onClick={this.handleReload}
                  variant="secondary"
                  className="gap-2 px-8 py-6 text-lg rounded-xl transition-elegant hover:scale-105"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reload Page
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="gap-2 px-8 py-6 text-lg rounded-xl transition-elegant hover:scale-105"
                >
                  <Home className="w-5 h-5" />
                  Go Home
                </Button>
              </div>

              {/* Helpful Tips */}
              <div className="mt-12 pt-8 border-t border-accent/20">
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Quick fixes:</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Try refreshing the page</li>
                  <li>• Check your internet connection</li>
                  <li>• Clear your browser cache</li>
                  <li>• Make sure your camera permissions are enabled</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
