import { Geist } from "next/font/google";
import "./globals.css";
import Player from "@/components/Player";
import Sidebar from "@/components/Sidebar";

const geist = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "Music",
  description: "Your personal music streaming service",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <div className="min-h-screen bg-black text-white">
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-[260px] p-8 pb-32">{children}</main>
          </div>
          <Player />
          <div className="w-[20rem] h-[30rem] bg-black"></div>
        </div>
      </body>
    </html>
  );
}
