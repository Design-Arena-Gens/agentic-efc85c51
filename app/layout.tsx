import React from 'react';
import './globals.css';

export const metadata = {
  title: 'WhatsApp Agent',
  description: 'Send WhatsApp messages from a web form',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
