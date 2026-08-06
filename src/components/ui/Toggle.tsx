import { ReactNode } from 'react';

interface ToggleProps {
  options: { value: string; label: ReactNode; icon?: ReactNode }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Toggle({ options, value, onChange, className = '' }: ToggleProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`} role="group" aria-label="Toggle options">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`btn px-4 py-2 text-sm ${
            value === option.value
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
          aria-pressed={value === option.value}
        >
          {option.icon && <span className="mr-2">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
}