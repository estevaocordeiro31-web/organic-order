import { Home, Gamepad2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

const GABI = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/DpukkKpvgfOJdjGU.png";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(180deg, #06090f 0%, #0c1222 40%, #111827 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(106,191,75,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          animation: "page-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            overflow: "hidden",
            margin: "0 auto 20px",
            border: "2px solid rgba(106,191,75,0.3)",
            boxShadow: "0 0 30px rgba(106,191,75,0.1)",
          }}
        >
          <img src={GABI} alt="Gabi" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* Glass card */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
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

          <p
            style={{
              fontSize: "4rem",
              fontWeight: 800,
              fontFamily: "'Syne', sans-serif",
              background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
              marginBottom: 12,
            }}
          >
            404
          </p>

          <h2
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "1.2rem",
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Oops! Page not found
          </h2>

          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: 28 }}>
            Gabi looked everywhere but couldn't find this page.
            <br />
            Let's get you back on track!
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => setLocation("/")}
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
                transition: "transform 0.15s, box-shadow 0.15s",
                boxShadow: "0 4px 20px rgba(34,197,94,0.25)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(34,197,94,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(34,197,94,0.25)"; }}
            >
              <Home size={16} />
              Go Home
            </button>

            <button
              onClick={() => setLocation("/game/phrase-builder")}
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
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
            >
              <Gamepad2 size={16} />
              Play a Game Instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
