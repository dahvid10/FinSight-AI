import React, { useState, useCallback } from 'react';
import { BudgetInput, BudgetAnalysis, Expense } from './types';
import { generateBudgetPlan } from './services/geminiService';

import Header from './components/Header';
import BudgetForm from './components/BudgetForm';
import BudgetResult from './components/BudgetResult';
import Spinner from './components/ui/Spinner';
import Card from './components/ui/Card';
import { Tabs, TabList, Tab, TabPanel } from './components/ui/Tabs';
import CityComparison from './components/CityComparison';


const initialExpenses: Expense[] = [
  { id: 1, name: 'Rent/Mortgage', amount: 1500 },
  { id: 2, name: 'Groceries', amount: 400 },
  { id: 3, name: 'Utilities', amount: 150 },
];

const initialBudget: BudgetInput = {
  city: 'San Francisco',
  monthlyPreTaxIncome: 6000,
  savingsGoalType: 'percentage',
  savingsGoalValue: 20,
  expenses: initialExpenses,
};

const App: React.FC = () => {
  const [budgetInput, setBudgetInput] = useState<BudgetInput>(initialBudget);
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('setup');
  const [resultsAvailable, setResultsAvailable] = useState(false);

  const handleGenerateBudget = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setResultsAvailable(true);
    setActiveTab('results');

    try {
      const result = await generateBudgetPlan(budgetInput);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating the budget plan. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [budgetInput]);
  
  const handleReset = () => {
    setBudgetInput(initialBudget);
    setAnalysis(null);
    setError(null);
    setResultsAvailable(false);
    setActiveTab('setup');
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <Header />
      <main className="w-full max-w-6xl mx-auto mb-8">
         <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabList className="mb-4">
            <Tab value="setup">Budget Setup</Tab>
            <Tab value="results" disabled={!resultsAvailable}>Analysis & Results</Tab>
            <Tab value="comparison" disabled={!resultsAvailable}>City Comparison</Tab>
          </TabList>
          
          <TabPanel value="setup">
            <div className="max-w-4xl mx-auto">
              <BudgetForm 
                budgetInput={budgetInput} 
                setBudgetInput={setBudgetInput}
                onSubmit={handleGenerateBudget}
                onReset={handleReset}
                isLoading={isLoading}
              />
            </div>
          </TabPanel>

          <TabPanel value="results">
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <Spinner />
                <p className="ml-4 text-lg text-gray-500 dark:text-gray-400">AI is analyzing your finances...</p>
              </div>
            )}

            {error && (
               <div className="max-w-4xl mx-auto">
                <Card>
                  <div className="p-6 text-center text-red-500">
                    <h3 className="font-bold text-lg mb-2">Oops! Something went wrong.</h3>
                    <p>{error}</p>
                  </div>
                </Card>
              </div>
            )}

            {analysis && !isLoading && (
               <div className="max-w-4xl mx-auto">
                <BudgetResult 
                  analysis={analysis} 
                  preTaxIncome={Number(budgetInput.monthlyPreTaxIncome) || 0}
                  expenses={budgetInput.expenses}
                />
              </div>
            )}
          </TabPanel>

          <TabPanel value="comparison">
            {analysis && (
              <CityComparison
                baseCity={budgetInput.city}
                baseAnalysis={analysis}
                budgetInput={budgetInput}
              />
            )}
          </TabPanel>

        </Tabs>
      </main>
    </div>
  );
};

export default App;