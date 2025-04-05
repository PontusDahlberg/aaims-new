"use client";

export default function Button({ children, onClick, className = "" }) {
  return (
    <button 
      onClick={onClick} 
      className={`px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition ${className}`}
    >
      {children}
    </button>
  );
}
