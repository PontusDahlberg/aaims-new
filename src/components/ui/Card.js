"use client";

import React from 'react';

const Card = React.forwardRef(function Card({ children, className = "" }, ref) {
  return (
    <div ref={ref} className={`rounded-lg shadow-lg p-4 mb-4 transition-colors duration-200 ${className}`}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
