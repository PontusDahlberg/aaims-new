"use client";

import { useSearchParams } from "next/navigation";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Autentiseringsfel
        </h1>
        <p className="text-gray-600 mb-4">
          {error === "Configuration" && "Det uppstod ett fel med konfigurationen."}
          {error === "AccessDenied" && "Åtkomst nekad."}
          {error === "Callback" && "Fel vid inloggning."}
          {!error && "Ett okänt fel har uppstått."}
        </p>
        <a
          href="/"
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tillbaka till startsidan
        </a>
      </div>
    </div>
  );
}
