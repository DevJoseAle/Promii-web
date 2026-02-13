import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Promii — Descubre ofertas increíbles cerca de ti";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #46248c 0%, #d35df3 100%)",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-2px",
            }}
          >
            Promii
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "rgba(255,255,255,0.9)",
              textAlign: "center",
              maxWidth: "800px",
            }}
          >
            Descubre ofertas increíbles cerca de ti
          </div>
          <div
            style={{
              display: "flex",
              gap: "40px",
              marginTop: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "16px 32px",
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: "16px",
              }}
            >
              <div style={{ fontSize: 36, fontWeight: 800, color: "white" }}>70%</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Descuento máx.</div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "16px 32px",
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: "16px",
              }}
            >
              <div style={{ fontSize: 36, fontWeight: 800, color: "white" }}>100%</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Verificado</div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "16px 32px",
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: "16px",
              }}
            >
              <div style={{ fontSize: 36, fontWeight: 800, color: "#2DD4BF" }}>GRATIS</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Para usuarios</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
