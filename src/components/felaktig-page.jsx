"use client";

import { useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import Header from "../components/Header";
import DragResizableLayout from "../components/DragResizableLayout";
import Footer from "../components/Footer";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const { data: session } = useSession();

  return (
    <SessionProvider>
      <div className={`${darkMode ? "dark" : ""} min-h-screen`}>
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <DragResizableLayout
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          session={session}
        />
        <Footer darkMode={darkMode} />
      </div>
    </SessionProvider>
  );
}
