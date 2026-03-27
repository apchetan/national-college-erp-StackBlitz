import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-3">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Something went wrong</h1>
                  <p className="text-red-50 text-sm mt-1">
                    The application encountered an unexpected error
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {this.state.error && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Error Details:</h3>
                  <div className="bg-gray-100 rounded-lg p-3 overflow-auto max-h-32">
                    <code className="text-xs text-red-600 font-mono">
                      {this.state.error.message}
                    </code>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={this.handleReload}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Reload Page
                </button>
                <button
                  onClick={this.handleGoToDashboard}
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-6">
                If the problem persists, please contact the administrator.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
