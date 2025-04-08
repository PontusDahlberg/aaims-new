"use client";

import React from 'react';

const Card = React.forwardRef(function Card({ children, className = "" }, ref) {
  return (
    <div ref={ref} className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 ${className}`}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
