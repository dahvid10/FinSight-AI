import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8 w-full">
      <h1 className="text-4xl sm:text-5xl font-bold text-white">
        FinSight AI
      </h1>
      <p className="mt-2 text-lg text-gray-400">
        Your Personal Financial Co-pilot.
      </p>
    </header>
  );
};

export default Header;