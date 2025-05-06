import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <AppRouterCacheProvider>
        <main >
          {children}
        </main>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
