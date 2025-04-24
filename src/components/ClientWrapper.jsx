"use client";

import { useEffect, useState } from 'react';
import { SessionProvider } from "next-auth/react";

export default function ClientWrapper({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
