import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GLB Viewer",
  description: "View GLB/GLTF 2.0 3D models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
