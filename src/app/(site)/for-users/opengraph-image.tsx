import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Ahorra hasta 70% en lo que ya compras - Promii";
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
          background: "linear-gradient(135deg, #d11d73 0%, #ee3a94 50%, #d35df3 100%)",
          padding: "60px",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "8px" }}>
          Promii
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
          Ahorra hasta 70% en lo que ya compras
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
          Restaurantes, spas, entretenimiento y más cerca de ti en Venezuela
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "40px",
            padding: "16px 40px",
            backgroundColor: "#2DD4BF",
            borderRadius: "16px",
            fontSize: 22,
            fontWeight: 700,
            color: "white",
          }}
        >
          Crear cuenta gratis
        </div>
      </div>
    ),
    { ...size }
  );
}
