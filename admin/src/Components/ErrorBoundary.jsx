import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      info: null,
      copied: false,
      errorId: null
    };

    this._isMounted = false;
    this._copyTimer = null;
  }

  /* -------------------------------
     Generate short support ID
  -------------------------------- */

  generateErrorId() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    const errorId = this.generateErrorId();

    console.error("ErrorBoundary caught:", error, info, "ID:", errorId);

    this.setState({ info, errorId });

    /* Optional reporting hook */
    if (this.props.onError) {
      this.props.onError(error, info, errorId);
    }
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this._copyTimer) clearTimeout(this._copyTimer);
  }

  componentDidUpdate(prevProps) {
    if (this.props.resetKey !== prevProps.resetKey) {
      this.reset();
    }

    if (this.props.routeKey !== prevProps.routeKey) {
      this.reset();
    }
  }

  reset = () => {
    if (!this._isMounted) return;

    this.setState({
      error: null,
      info: null,
      copied: false,
      errorId: null
    });

    this.props.onReset?.();
  };

  handleReload = () => {
    window.location.reload();
  };

  /* -------------------------------
     Copy error details
  -------------------------------- */

  handleCopy = async () => {
    const { error, info, errorId } = this.state;

    const text = [
      `Error ID: ${errorId}`,
      error?.message,
      error?.stack,
      info?.componentStack
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      this.setState({ copied: true });

      this._copyTimer = setTimeout(() => {
        if (this._isMounted) this.setState({ copied: false });
      }, 1600);

    } catch {}
  };

  /* -------------------------------
     Render
  -------------------------------- */

  render() {
    const { error, info, errorId } = this.state;
    const isDev = import.meta?.env?.DEV;

    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback({
        error,
        reset: this.reset
      });
    }

    return (
      <div style={styles.wrapper} role="alert">

        <div style={styles.card}>

          <h2 style={styles.title}>
            Something went wrong
          </h2>

          <p style={styles.subtitle}>
            The page encountered an unexpected error.
          </p>

          {errorId && (
            <div style={styles.errorId}>
              Error ID: {errorId}
            </div>
          )}

          {isDev && (
            <>
              <pre style={styles.error}>
                {error.message}
              </pre>

              {error.stack && (
                <details>
                  <summary>Stack trace</summary>
                  <pre style={styles.stack}>{error.stack}</pre>
                </details>
              )}

              {info?.componentStack && (
                <details>
                  <summary>Component stack</summary>
                  <pre style={styles.stack}>
                    {info.componentStack}
                  </pre>
                </details>
              )}
            </>
          )}

          <div style={styles.actions}>

            <button style={styles.primary} onClick={this.reset}>
              Try again
            </button>

            <button style={styles.secondary} onClick={this.handleReload}>
              Reload page
            </button>

            <button style={styles.ghost} onClick={this.handleCopy}>
              {this.state.copied ? "Copied ✅" : "Copy error"}
            </button>

          </div>

        </div>
      </div>
    );
  }
}

/* -------------------------------
   Styles
-------------------------------- */

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f6f7fb",
    padding: 20
  },

  card: {
    maxWidth: 540,
    width: "100%",
    padding: 28,
    borderRadius: 18,
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.08)"
  },

  title: {
    margin: 0,
    fontWeight: 900,
    fontSize: "1.4rem"
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 16,
    color: "rgba(0,0,0,0.7)"
  },

  errorId: {
    fontSize: "0.8rem",
    opacity: 0.6,
    marginBottom: 10
  },

  error: {
    background: "rgba(0,0,0,0.04)",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14
  },

  stack: {
    fontSize: "0.85rem",
    padding: 12,
    background: "rgba(180,35,24,0.05)",
    borderRadius: 12
  },

  actions: {
    display: "flex",
    gap: 10,
    marginTop: 18
  },

  primary: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: "#ff6600",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer"
  },

  secondary: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    cursor: "pointer"
  },

  ghost: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px dashed rgba(0,0,0,0.2)",
    background: "transparent",
    cursor: "pointer"
  }
};
