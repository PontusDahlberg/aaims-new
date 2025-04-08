"use client";

import './globals.css'
import DragResizableLayout from "@/components/DragResizableLayout";
import { useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (
      localStorage.getItem("darkMode") === "true" ||
      (!("darkMode" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <html lang="sv" className="h-screen">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Mötesassistent -- från aaims-new/src/app/layout.js</title>
      </head>
      <body className="h-screen bg-gray-100">
        <SessionProvider>
          <DragResizableLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
            {children}
          </DragResizableLayout>
        </SessionProvider>
      </body>
    </html>
  );
}