import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-800 rounded-xl shadow-md overflow-hidden ring-1 ring-gray-700 ${className}`}>
      {children}
    </div>
  );
};

export default Card;