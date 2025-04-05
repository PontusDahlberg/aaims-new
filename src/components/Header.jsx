export default function Header({ darkMode }) {
    return (
      <header
        className={`w-full py-4 px-6 flex justify-between items-center shadow-md ${
          darkMode ? "bg-gray-800 text-white" : "bg-purple-900 text-white"
        }`}
      >
        <h1 className="text-2xl font-bold">AAIMS – Apropoda AI Meeting Secretary</h1>
        <nav className="space-x-4">
          <button className={`py-2 px-4 rounded ${
            darkMode ? "hover:bg-gray-700" : "hover:bg-purple-700"
          }`}>Dashboard</button>
          <button className={`py-2 px-4 rounded ${
            darkMode ? "hover:bg-gray-700" : "hover:bg-purple-700"
          }`}>Settings</button>
          <button className={`py-2 px-4 rounded ${
            darkMode ? "hover:bg-gray-700" : "hover:bg-purple-700"
          }`}>Logga ut</button>
        </nav>
      </header>
    );
  }
  