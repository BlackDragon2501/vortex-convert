import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vórtex Convert - Convierte tus imágenes, sin límites",
  description: "Vórtex Convert, de Vortex Company: convierte imágenes entre PNG, JPG y WebP con control de calidad, redimensionado opcional y peso antes/después. Lote completo, gratis, sin anuncios y 100% local.",
  keywords: ["Vórtex Convert","convertir imágenes","PNG a JPG","JPG a WebP","convertidor de imágenes gratis","comprimir imágenes","sin anuncios"],
  authors: [{ name: "Vortex Company" }],
  icons: {
    icon:
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#161616"/><path d="M12 18h16l-4-5" fill="none" stroke="#fbbf24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M36 30H20l4 5" fill="none" stroke="#fbbf24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      ),
  },
  openGraph: {
    title: "Vórtex Convert - Convierte tus imágenes, sin límites",
    description: "Vórtex Convert, de Vortex Company: convierte imágenes entre PNG, JPG y WebP con control de calidad, redimensionado opcional y peso antes/después. Lote completo, gratis, sin anuncios y 100% local.",
    siteName: "Vórtex Convert - Convierte tus imágenes, sin límites",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0f10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className="antialiased bg-[#0f0f10] text-[#ececf1]">{children}</body>
    </html>
  );
}
