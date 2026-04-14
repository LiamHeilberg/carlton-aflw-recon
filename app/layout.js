export const metadata = {
  title: 'Carlton AFLW Performance Reconditioning',
  description: 'Performance testing dashboard for Carlton AFLW reconditioning programs',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" /></head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
