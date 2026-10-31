import './globals.css';
export const metadata = {
  title: 'NewPage Office | Business Management',
  description: 'Professional POS, printing orders, production, payments and customer portal for NewPage I.T Koncept.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icons/icon.svg', apple: '/icons/icon-192.png' },
  applicationName: 'NewPage Office',
};
export const viewport = { themeColor: '#103c30', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
