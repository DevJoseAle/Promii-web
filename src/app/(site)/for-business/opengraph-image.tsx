import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Haz crecer tu negocio con Promii - Desde $17/mes";
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
          background: "linear-gradient(135deg, #1a0d33 0%, #46248c 50%, #d35df3 100%)",
          padding: "60px",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "8px" }}>
          Promii para Comercios
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.2,
          }}
        >
          Atrae clientes nuevos desde $17/mes
        </div>
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.8)",
            textAlign: "center",
            maxWidth: "700px",
            marginTop: "16px",
          }}
        >
          Promociones verificadas + influencers locales. Sin comisiones por venta.
        </div>
        <div
          style={{
            display: "flex",
            gap: "30px",
            marginTop: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "14px 28px",
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: "14px",
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 800, color: "#2DD4BF" }}>$17</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Desde / mes</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "14px 28px",
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: "14px",
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 800, color: "#2DD4BF" }}>0%</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Comisión ventas</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "14px 28px",
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: "14px",
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 800, color: "white" }}>24/7</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Panel disponible</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
