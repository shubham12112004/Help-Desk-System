import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("==== ERROR BOUNDARY CAUGHT ERROR ====");
    console.error("Error:", error);
    console.error("Error Message:", error?.message);
    console.error("Error Stack:", error?.stack);
    console.error("Component Stack:", errorInfo?.componentStack);
    console.error("====================================");
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-2xl font-bold text-destructive mb-2">Something went wrong</h1>
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-left">
              <p className="text-sm font-semibold text-foreground mb-2">Error Details:</p>
              <p className="text-sm text-muted-foreground font-mono break-all">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Check the browser console (F12) for full error details
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
              >
                ← Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
