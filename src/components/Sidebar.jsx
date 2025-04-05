export default function Sidebar({ darkMode }) {
    return (
      <div
        className={`h-full p-4 overflow-y-auto ${
          darkMode ? "bg-gray-800 text-white" : "bg-orange-100 text-black"
        }`}
      >
        <h2 className="text-xl font-bold mb-2">Kommande Möten</h2>
        <ul>
          <li>Möte (kommer från Sidebar.js) 1</li>
          <li>Möte 2</li>
          <li>Möte 3</li>
        </ul>
      </div>
    );
  }
  