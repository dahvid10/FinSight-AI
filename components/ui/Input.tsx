import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  const baseClasses = 'block w-full rounded-md border-0 py-1.5 px-3 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6 transition-colors duration-200';
  
  return (
    <input
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
};

export default Input;