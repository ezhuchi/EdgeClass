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

    if (import.meta.env.PROD) {
      // Log to error tracking service in production
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
        <div className="min-h-screen bg-[--bg-primary] text-[--text-primary] flex items-center justify-center p-4">
          <div className="max-w-md w-full card">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[--text-primary] mb-2">
                Something went wrong
              </h1>
              <p className="text-[--text-secondary]">
                Your data is safe and saved offline. Try refreshing the page.
              </p>
            </div>

            {/* Error details (development only) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm text-[--text-secondary] hover:text-[--text-primary] mb-2">
                  Show error details
                </summary>
                <div className="bg-[--bg-tertiary] border border-[--border-color] rounded p-4 text-xs overflow-auto max-h-48">
                  <p className="font-mono text-[--danger-color] mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-[--text-secondary] whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={this.handleReset}
                className="flex-1 btn btn-primary"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 btn btn-secondary"
              >
                Reload
              </button>
            </div>

            {/* Info */}
            <div className="p-4 bg-[--bg-tertiary] rounded border border-[--border-color]">
              <p className="text-xs text-[--text-secondary] leading-relaxed">
                Your data is automatically saved offline and will sync when you're connected.
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
