// Universal Gold Icon Component (replaces emoji 🪙) — extraído de App.tsx (JSX idêntico)
export const GoldIcon = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizeClasses = {
    sm: 'w-3 h-3 text-[8px]',
    md: 'w-4 h-4 text-[10px]',
    lg: 'w-5 h-5 text-xs'
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-bold border border-yellow-700 ${sizeClasses[size]} ${className}`}
      style={{ lineHeight: 1 }}
    >
      G
    </span>
  );
};
