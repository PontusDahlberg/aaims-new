export default function Spinner({ size = 'medium', darkMode = false }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`inline-flex ${sizeClasses[size]}`}>
      <div className={`
        animate-spin 
        rounded-full 
        border-2 
        border-current 
        border-t-transparent 
        ${darkMode ? 'text-purple-400' : 'text-purple-600'}
        opacity-75
        transition-all
        duration-300
      `} 
      style={{ 
        width: '100%', 
        height: '100%',
        animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' 
      }} />
    </div>
  );
}
