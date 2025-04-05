export default function MainContent({ darkMode }) {
  return (
    <div
      className={`p-4 overflow-y-auto h-full ${
        darkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-black"
      }`}
    >
      <h2 className="text-xl font-bold mb-2">
        Sammanfattning & Protokoll (MainContent.jsx)
      </h2>
      <p>Här visas AI-genererad sammanfattning och protokoll.</p>
    </div>
  );
}
