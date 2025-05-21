import { Geist } from "next/font/google";
import "./globals.css";
import Player from "@/components/Player";

const geist = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "Music Stream",
  description: "Your personal music streaming service",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <div className="min-h-screen bg-background text-foreground">
          <div className="flex">
            <nav className="w-64 fixed h-screen bg-black/5 backdrop-blur-lg p-6">
              <h1 className="text-2xl font-bold mb-8">Music Stream</h1>
              <ul className="space-y-4">
                <li>
                  <a
                    href="/"
                    className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="/artists"
                    className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors"
                  >
                    Artists
                  </a>
                </li>
                <li>
                  <a
                    href="/albums"
                    className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors"
                  >
                    Albums
                  </a>
                </li>
              </ul>
            </nav>
            <main className="flex-1 ml-64 p-8 pb-24">{children}</main>
          </div>
          <Player />
        </div>
      </body>
    </html>
  );
}
