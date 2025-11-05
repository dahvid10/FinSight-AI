import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200';

  const variantClasses = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-500 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-900',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus-visible:ring-gray-500 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-900',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus-visible:ring-gray-500 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-900'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;