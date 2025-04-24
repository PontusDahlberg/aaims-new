import "./globals.css";
import { Inter } from "next/font/google";
import ClientWrapper from "@/components/ClientWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AAIMS",
  description: "Apropoda AI Meeting Secretary",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sv" className={inter.className}>
      <body suppressHydrationWarning={true}>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
