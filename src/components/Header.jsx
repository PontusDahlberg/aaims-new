"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Header({ darkMode, toggleDarkMode }) {
  const { data: sessionData } = useSession();
  const handleAuth = () => {
    if (sessionData?.user) {
      signOut();
    } else {
      signIn("google");
    }
  };

  return (
    <header
      className={`w-full py-4 px-6 flex justify-between items-center shadow-md ${
        darkMode ? "bg-gray-700 text-white" : "bg-purple-900 text-white"
      }`}
    >
      <h1 className="text-2xl font-bold">AAIMS – Apropoda AI Meeting Secretary</h1>
      <nav className="space-x-4">
        <button
          className={`py-2 px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105 outline-none focus:outline-none ring-2 ring-offset-1 ${
            darkMode
              ? "bg-gray-600 hover:bg-gray-500 ring-gray-400 text-white"
              : "bg-purple-600 hover:bg-purple-500 ring-purple-400 text-white"
          } font-bold`}
          onClick={toggleDarkMode}
        >
          {darkMode ? "Ljust Läge" : "Mörkt Läge"}
        </button>
        <button
          className={`py-2 px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105 outline-none focus:outline-none ring-2 ring-offset-1 ${
            darkMode
              ? "bg-gray-600 hover:bg-gray-500 ring-gray-400 text-white"
              : "bg-purple-600 hover:bg-purple-500 ring-purple-400 text-white"
          } font-bold`}
        >
          Dashboard
        </button>
        <button
          className={`py-2 px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105 outline-none focus:outline-none ring-2 ring-offset-1 ${
            darkMode
              ? "bg-gray-600 hover:bg-gray-500 ring-gray-400 text-white"
              : "bg-purple-600 hover:bg-purple-500 ring-purple-400 text-white"
          } font-bold`}
        >
          Settings
        </button>
        <button
          className={`py-2 px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105 outline-none focus:outline-none ring-2 ring-offset-1 ${
            darkMode
              ? "bg-gray-600 hover:bg-gray-500 ring-gray-400 text-white"
              : "bg-purple-600 hover:bg-purple-500 ring-purple-400 text-white"
          } font-bold`}
          onClick={handleAuth}
        >
          {sessionData?.user ? "Logga ut" : "Logga in"}
        </button>
      </nav>
    </header>
  );
}
