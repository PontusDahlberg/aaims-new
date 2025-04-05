"use client";

export default function Card({ children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
      {children}
    </div>
  );
}
