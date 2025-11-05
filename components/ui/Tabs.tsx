import React, { createContext, useContext, ReactNode } from 'react';

interface TabsContextProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextProps | undefined>(undefined);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a Tabs component');
  }
  return context;
};

interface TabsProps {
  children: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ children, value, onValueChange, className = '' }) => {
  return (
    <TabsContext.Provider value={{ activeTab: value, setActiveTab: onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabListProps {
  children: ReactNode;
  className?: string;
}

export const TabList: React.FC<TabListProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex border-b border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

interface TabProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

export const Tab: React.FC<TabProps> = ({ value, children, disabled = false }) => {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  const handleClick = () => {
    if (!disabled) {
      setActiveTab(value);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      role="tab"
      aria-selected={isActive}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-sky-500 ${
        isActive
          ? 'border-sky-500 text-sky-400'
          : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
      } ${
        disabled
          ? 'cursor-not-allowed text-gray-600'
          : ''
      }`}
    >
      {children}
    </button>
  );
};

interface TabPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({ value, children, className = '' }) => {
  const { activeTab } = useTabs();

  return (
    <div
      role="tabpanel"
      hidden={activeTab !== value}
      className={`py-6 focus:outline-none ${className}`}
    >
      {children}
    </div>
  );
};