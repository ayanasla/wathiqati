import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches unhandled React component errors and displays fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">Oops! Something went wrong</h1>
              <p className="text-slate-600 text-center mb-6">We encountered an unexpected error. Please try again or contact support if the problem persists.</p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-3 bg-slate-100 rounded-lg text-xs font-mono text-red-700 overflow-auto max-h-32">
                  {this.state.error.toString()}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={this.handleReset} className="flex-1 bg-[#9B1C1C] text-white py-2 px-4 rounded-lg hover:bg-[#7F1D1D] transition-colors flex items-center justify-center gap-2 font-medium">
                  <RefreshCw className="w-4 h-4" /> Try Again
                </button>
                <button onClick={() => window.location.href = '/'} className="flex-1 bg-slate-200 text-slate-900 py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors font-medium">
                  Go Home
                </button>
              </div>

              <p className="text-xs text-slate-500 text-center mt-4">Error ID: {Date.now()}</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
