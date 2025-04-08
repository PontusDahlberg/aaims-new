export default function MainContent({ darkMode, meeting }) {
  return (
    <div
      className={`p-4 overflow-y-auto h-full ${
        darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
      }`}
    >
      <h2 className="text-xl font-bold mb-2">Sammanfattning & Protokoll</h2>
      {meeting ? (
        <div>
          <h3 className="text-lg font-bold">{meeting.summary || "Namnlöst möte"}</h3>
          <p>Detaljer om mötet visas här...</p>
        </div>
      ) : (
        <p>Välj ett möte för att visa detaljer.</p>
      )}
    </div>
  );
}
