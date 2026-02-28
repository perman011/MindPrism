import { Sentry, isSentryEnabled } from "@/lib/sentry";
import { Component, type ReactNode, type ErrorInfo } from "react";

function FallbackUI() {
  return (
    <div
      className="min-h-screen bg-[#F5F0EB] flex items-center justify-center p-6"
      data-testid="error-boundary-fallback"
    >
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-primary mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-400 mb-6">
          We hit an unexpected error. Our team has been notified and is looking
          into it.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 transition-colors"
          data-testid="button-reload"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface FallbackState {
  hasError: boolean;
}

class BasicErrorBoundary extends Component<ErrorBoundaryProps, FallbackState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): FallbackState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <FallbackUI />;
    }
    return this.props.children;
  }
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  if (isSentryEnabled()) {
    return (
      <Sentry.ErrorBoundary fallback={<FallbackUI />}>
        {children}
      </Sentry.ErrorBoundary>
    );
  }
  return <BasicErrorBoundary>{children}</BasicErrorBoundary>;
}
