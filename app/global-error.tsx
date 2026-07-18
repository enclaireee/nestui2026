"use client";

// Last-resort boundary for errors thrown by the root layout itself (which the
// segment-level app/error.tsx can't catch). Must render its own <html>/<body>.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#0a3d2e", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ maxWidth: 360, fontSize: 14, opacity: 0.7 }}>
            The app hit an unexpected error. Please reload.
          </p>
          <button onClick={reset} style={{ borderRadius: 12, padding: "10px 24px", fontWeight: 700, color: "#0a3d2e", background: "#c6f24e", border: "none", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
