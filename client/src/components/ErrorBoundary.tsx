import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "linear-gradient(180deg, #06090f 0%, #0c1222 40%, #111827 100%)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: 420,
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 24,
                padding: "40px 32px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top shine */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "10%",
                  right: "10%",
                  height: 1,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                }}
              />

              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <AlertTriangle size={28} color="rgba(239,68,68,0.8)" />
              </div>

              <h2 style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.2rem", fontWeight: 700, marginBottom: 8 }}>
                Something went wrong
              </h2>

              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: 8 }}>
                An unexpected error occurred. Please try reloading the page.
              </p>

              {this.state.error?.message && (
                <p
                  style={{
                    color: "rgba(255,255,255,0.25)",
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 10,
                    padding: "8px 12px",
                    marginBottom: 24,
                    wordBreak: "break-word",
                  }}
                >
                  {this.state.error.message}
                </p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "12px 24px",
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(34,197,94,0.25)",
                  }}
                >
                  <RotateCcw size={16} />
                  Reload Page
                </button>

                <button
                  onClick={() => { window.location.href = "/"; }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "12px 24px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: 500,
                    fontSize: "0.85rem",
                    border: "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer",
                  }}
                >
                  <Home size={16} />
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
