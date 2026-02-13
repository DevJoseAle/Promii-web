import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Monetiza tu audiencia con Promii - 100% gratis";
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
        <div style={{ fontSize: 28, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "8px" }}>
          Promii para Influencers
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
          Monetiza tu audiencia sin invertir un centavo
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
          Comparte códigos de descuento y gana comisiones por cada venta
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
            <div style={{ fontSize: 30, fontWeight: 800, color: "#2DD4BF" }}>20%</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Comisión máx.</div>
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
            <div style={{ fontSize: 30, fontWeight: 800, color: "#2DD4BF" }}>$0</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Sin costo</div>
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
            <div style={{ fontSize: 30, fontWeight: 800, color: "white" }}>100+</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Marcas</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
