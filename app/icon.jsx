import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* CF Monogram */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-1px",
            display: "flex",
            lineHeight: 1,
          }}
        >
          CF
        </div>
        {/* Gold accent dot */}
        <div
          style={{
            position: "absolute",
            bottom: 4,
            right: 4,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
