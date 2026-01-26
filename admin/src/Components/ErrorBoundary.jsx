import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null, copied: false };
    this._copyTimer = null;
    this._isMounted = false;
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
    this.setState({ info });
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this._copyTimer) clearTimeout(this._copyTimer);
  }

  componentDidUpdate(prevProps) {
    // reset on resetKey change
    if (this.props.resetKey && this.props.resetKey !== prevProps.resetKey) {
      this.resetState();
      return;
    }

    // optional: reset when route changes (pass pathname as routeKey)
    if (this.props.routeKey && this.props.routeKey !== prevProps.routeKey) {
      this.resetState();
    }
  }

  resetState = () => {
    if (!this._isMounted) return;
    this.setState({ error: null, info: null, copied: false });
  };

  handleReset = () => {
    this.resetState();
    this.props.onReset?.();
  };

  handleReload = () => {
    window.location.reload();
  };

  copyTextFallback(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }

  handleCopy = async () => {
    const msg = String(this.state.error?.message || this.state.error || "");
    const stack = String(this.state.error?.stack || "");
    const componentStack = String(this.state.info?.componentStack || "");
    const text = [msg, stack, componentStack].filter(Boolean).join("\n\n") || "Unknown error";

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ok = this.copyTextFallback(text);
        if (!ok) throw new Error("Copy failed");
      }

      if (!this._isMounted) return;
      this.setState({ copied: true });

      if (this._copyTimer) clearTimeout(this._copyTimer);
      this._copyTimer = setTimeout(() => {
        if (this._isMounted) this.setState({ copied: false });
      }, 1600);
    } catch {
      // ignore
    }
  };

  render() {
    if (this.state.error) {
      const isDev = import.meta?.env?.DEV;

      return (
        <div style={styles.wrapper} role="alert" aria-live="assertive">
          <div style={styles.card}>
            <h2 style={styles.title}>Something went wrong</h2>

            <p style={styles.subtitle}>Don’t worry — the app didn’t fully crash.</p>

            <pre style={styles.error}>
              {String(this.state.error?.message || this.state.error)}
            </pre>

            {isDev && this.state.error?.stack ? (
              <details style={styles.details}>
                <summary style={styles.summary}>Show stack trace</summary>
                <pre style={styles.stack}>{String(this.state.error.stack)}</pre>
              </details>
            ) : null}

            {isDev && this.state.info?.componentStack ? (
              <details style={styles.details}>
                <summary style={styles.summary}>Show component stack</summary>
                <pre style={styles.stack}>{String(this.state.info.componentStack)}</pre>
              </details>
            ) : null}

            <div style={styles.actions}>
              <button onClick={this.handleReset} style={styles.btnPrimary}>
                Try again
              </button>

              <button onClick={this.handleReload} style={styles.btnSecondary}>
                Reload page
              </button>

              <button onClick={this.handleCopy} style={styles.btnGhost}>
                {this.state.copied ? "Copied ✅" : "Copy error"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#f6f7fb",
    display: "grid",
    placeItems: "center",
    padding: 20,
    fontFamily: "system-ui, sans-serif",
  },
  card: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 18,
    padding: 26,
    maxWidth: 560,
    width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
  },
  title: {
    margin: 0,
    fontSize: "1.4rem",
    fontWeight: 900,
    color: "#111",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 16,
    color: "rgba(0,0,0,0.7)",
  },
  error: {
    background: "rgba(0,0,0,0.04)",
    padding: 14,
    borderRadius: 12,
    fontSize: "0.92rem",
    whiteSpace: "pre-wrap",
    marginBottom: 14,
    border: "1px solid rgba(0,0,0,0.06)",
  },
  details: {
    marginBottom: 16,
  },
  summary: {
    cursor: "pointer",
    fontWeight: 800,
    color: "rgba(0,0,0,0.8)",
    marginBottom: 8,
  },
  stack: {
    background: "rgba(180,35,24,0.06)",
    border: "1px solid rgba(180,35,24,0.14)",
    color: "rgba(120,0,0,0.85)",
    padding: 12,
    borderRadius: 12,
    fontSize: "0.86rem",
    whiteSpace: "pre-wrap",
  },
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  btnPrimary: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #ff6600, #ff8a3d)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
  btnSecondary: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },
  btnGhost: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px dashed rgba(0,0,0,0.18)",
    background: "transparent",
    cursor: "pointer",
    fontWeight: 800,
    color: "rgba(0,0,0,0.8)",
  },
};
