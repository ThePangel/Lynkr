import SideBar from "@/components/sidebar";
import UserIcon from "@/components/userIcon";
import '../globals.css';


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
            <SideBar /> 
          </div>
          <UserIcon />

          <main className="flex-1 ">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
