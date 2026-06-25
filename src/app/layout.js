import dns from "node:dns"
dns.setServers(["8.8.8.8", "1.1.1.1"])
import { Inter } from "next/font/google";
import "@/app/globals.css"
import Navbar from "@/Components/Navbar";
import { Providers } from "@/Components/Providers";
import Footer from "@/Components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "OmniFlex",
  description: "Your Best Fitenes Partner",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>
        <main className="">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
