import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full max-w-6xl mx-auto mb-8 text-center py-4">
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-50">
        FinSight AI
      </h1>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
        Your Personal Financial Co-pilot.
      </p>
    </header>
  );
};

export default Header;