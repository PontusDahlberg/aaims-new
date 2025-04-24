export default function GoogleChat({ darkMode }) {
  return (
    <div
      className={`h-full p-4 overflow-y-auto ${
        darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <h2 className="text-lg font-bold mb-4">Google Chat</h2>
      <p>Google Chat integration kommer här</p>
    </div>
  );
}
