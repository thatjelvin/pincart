"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * React error boundary that optionally reports to Sentry.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, info);
    try {
      import("../lib/sentry").then((mod) => mod.captureException(error));
    } catch {
      // noop
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: 32, textAlign: "center" }}>
            <h2>Something went wrong</h2>
            <p>Please refresh the page or contact support.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{
                marginTop: 12,
                padding: "8px 24px",
                borderRadius: 6,
                border: "none",
                background: "#6366f1",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
