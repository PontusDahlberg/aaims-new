export default function Footer({ darkMode }) {
  return (
    <footer
      className={`p-3 text-center text-sm ${
        darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-300 text-gray-800"
      }`}
    >
      © 2025 AAIMS – Apropoda AI Meeting Secretary
    </footer>
  );
}
