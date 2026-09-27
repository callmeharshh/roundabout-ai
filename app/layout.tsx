import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roundabout AI',
  description: 'A dark, game-show-inspired party prompt battle.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
