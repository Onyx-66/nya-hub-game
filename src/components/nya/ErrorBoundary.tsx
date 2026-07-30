import { Component, type ErrorInfo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level error boundary that catches render errors and shows
 * a friendly fallback screen instead of a blank white page.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] Uncaught render error:", error);
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 bg-background p-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="w-16 h-16 rounded-2xl bg-destructive/15 flex items-center justify-center"
          >
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </motion.div>
          <div>
            <h2 className="font-heading font-bold text-xl text-foreground">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Don't worry — your progress is safe. Try again or head back home.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-sm active:scale-95 transition-transform"
            >
              <RotateCcw className="w-4 h-4" /> Retry
            </button>
            <button
              onClick={this.handleGoHome}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-muted text-foreground font-heading font-semibold text-sm active:scale-95 transition-transform"
            >
              <Home className="w-4 h-4" /> Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}