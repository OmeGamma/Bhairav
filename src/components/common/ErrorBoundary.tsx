import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[BHAIRAV ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <p className="text-[var(--color-bhairav-ember)] text-sm font-bold uppercase tracking-widest mb-2">
            Something went wrong
          </p>
          <p className="text-[var(--color-bhairav-text-muted)] text-xs max-w-md">
            {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-4 px-4 py-2 bg-[var(--color-bhairav-primary)]/15 hover:bg-[var(--color-bhairav-primary)]/25 text-white rounded-md text-xs uppercase tracking-widest font-medium border border-[var(--color-bhairav-primary)]/40"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
