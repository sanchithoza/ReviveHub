import Sidebar from "./sidebar";
import Providers from "./providers";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <Providers>
          <div className="layout">
            <Sidebar />
            <main className="main">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
