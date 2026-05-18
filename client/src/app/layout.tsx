"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";
import Providers from "./providers";
import AuthGuard from "@/components/AuthGuard";
import ViewOnlyNotice from "@/components/ViewOnlyNotice";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <Providers>
          <ViewOnlyNotice />
          {isLoginPage ? (
            children
          ) : (
            <AuthGuard>
              <div className="layout">
                <Sidebar />
                <main className="main">
                  {children}
                </main>
              </div>
            </AuthGuard>
          )}
        </Providers>
      </body>
    </html>
  );
}
