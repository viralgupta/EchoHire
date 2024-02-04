import { Inter } from "next/font/google";
import "@/app/globals.css";
import { SocketProvider } from "@/app/context/SocketProvider";
import Header from "@/app/components/(Header)/Header";
import Footer from "@/app/components/Footer";
import { Toaster } from "./components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SocketProvider>
        <Toaster richColors/>
          <Header />
          {children}
          <Footer />
        </SocketProvider>
      </body>
    </html>
  );
}