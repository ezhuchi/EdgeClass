import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log to error tracking service (e.g., Sentry) in production
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error);
    }
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

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">😵</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600">
                Don't worry - your data is safe offline. Try refreshing the page.
              </p>
            </div>

            {/* Error details (development only) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 mb-2">
                  Show error details
                </summary>
                <div className="bg-red-50 border border-red-200 rounded p-4 text-xs overflow-auto max-h-48">
                  <p className="font-mono text-red-800 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-red-700 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 btn bg-primary-600 text-white hover:bg-primary-700"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 btn bg-gray-600 text-white hover:bg-gray-700"
              >
                Reload Page
              </button>
            </div>

            {/* Offline reminder */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> This app works offline! Your quizzes and progress are saved locally on your device.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
