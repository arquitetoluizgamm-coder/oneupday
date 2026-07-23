import './globals.css';

export const metadata = {
  title: 'One Up Day — One day. One step up.',
  description: 'Follow real journeys, post one honest step a day, and help people keep going.',
  metadataBase: new URL('https://oneupday.app'),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
