"use client";

import { useState, useRef, useEffect } from 'react';

export default function Tooltip({ children, content, position = 'right' }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const targetRef = useRef(null);

  const updatePosition = () => {
    if (!targetRef.current || !showTooltip) return;

    const rect = targetRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'right':
        x = rect.right + 10;
        y = rect.top + (rect.height / 2);
        break;
      case 'left':
        x = rect.left - 10;
        y = rect.top + (rect.height / 2);
        break;
      case 'bottom':
        x = rect.left + (rect.width / 2);
        y = rect.bottom + 10;
        break;
      default: // top
        x = rect.left + (rect.width / 2);
        y = rect.top - 10;
    }

    setTooltipPosition({ x, y });
  };

  useEffect(() => {
    if (showTooltip) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showTooltip]);

  return (
    <div
      ref={targetRef}
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div
          className={`fixed z-[1100] px-2 py-1 text-sm bg-gray-900 text-white rounded shadow-lg whitespace-pre-wrap max-w-xs`}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: getTransform(position)
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

function getTransform(position) {
  switch (position) {
    case 'right':
      return 'translateY(-50%)';
    case 'left':
      return 'translateX(-100%) translateY(-50%)';
    case 'bottom':
      return 'translateX(-50%)';
    default: // top
      return 'translateX(-50%) translateY(-100%)';
  }
}
