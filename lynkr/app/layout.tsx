"use client"
import Sidebar from "../components/sidebar";
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex">
          <div className="w-20">
            <Sidebar /> 
          </div>

          <main className="flex-1 ">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
