import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
          <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-8 max-w-md w-full text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface WithErrorBoundaryProps {
  fallback?: ReactNode;
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  const boundFallback = fallback;

  class WithErrorBoundary extends Component<P & WithErrorBoundaryProps> {
    static displayName = `WithErrorBoundary(${displayName})`;

    render() {
      const { fallback: propFallback, ...rest } = this.props as P & { fallback?: ReactNode };
      return (
        <ErrorBoundary fallback={propFallback ?? boundFallback}>
          <WrappedComponent {...(rest as P)} />
        </ErrorBoundary>
      );
    }
  }

  return WithErrorBoundary;
}

export default ErrorBoundary;
