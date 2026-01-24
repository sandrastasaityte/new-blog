import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  componentDidUpdate(prevProps) {
    // Reset error when route changes (useful in dashboards)
    if (this.props.resetKey && this.props.resetKey !== prevProps.resetKey) {
      this.setState({ error: null });
    }
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <h2 style={styles.title}>Something went wrong</h2>

            <p style={styles.subtitle}>
              Don’t worry — the app didn’t fully crash.
            </p>

            <pre style={styles.error}>
              {String(this.state.error?.message || this.state.error)}
            </pre>

            <div style={styles.actions}>
              <button onClick={this.handleReset} style={styles.btn}>
                Try again
              </button>
              <button onClick={this.handleReload} style={styles.btnSecondary}>
                Reload page
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
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 16,
    opacity: 0.7,
  },
  error: {
    background: "rgba(0,0,0,0.04)",
    padding: 14,
    borderRadius: 12,
    fontSize: "0.9rem",
    whiteSpace: "pre-wrap",
    marginBottom: 18,
  },
  actions: {
    display: "flex",
    gap: 10,
  },
  btn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
  btnSecondary: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
};
