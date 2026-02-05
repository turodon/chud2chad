import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chud2Chad | C2C Social Skills Trainer',
  description: 'AI-powered social skills training platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
