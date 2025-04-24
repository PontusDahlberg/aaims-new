export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          404 - Sidan kunde inte hittas
        </h1>
        <p className="text-gray-600 mb-6">
          Tyvärr kunde vi inte hitta sidan du letar efter.
        </p>
        <a
          href="/"
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Tillbaka till startsidan
        </a>
      </div>
    </div>
  );
}
