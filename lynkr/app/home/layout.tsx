
import UserIcon from "@/components/userIcon";
import '../globals.css';
import { ContentProvider } from "@/components/contentProvider";
import SideBarClient from "@/components/sideBarClient";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
   

  return (
    <ContentProvider>
      <html lang="en">
        <body>
          <div className="flex">
            <div className="w-20">
             
            <SideBarClient />
            </div>
            <UserIcon />

            <main className="flex-1 ">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ContentProvider>
  );
}
