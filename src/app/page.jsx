"use client";

import DragResizableLayout from '@/components/DragResizableLayout';
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Laddar...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Välkommen till AAIMS
          </h1>
          <p className="text-gray-600">
            Apropoda AI Meeting Secretary
          </p>
        </div>
      </div>
    );
  }

  return <DragResizableLayout />;
}
