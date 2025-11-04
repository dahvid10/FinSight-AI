import React, { useState } from 'react';
import { BudgetInput, BudgetAnalysis, CityComparisonResult } from '../types';
import { generateBudgetPlan } from '../services/geminiService';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import Spinner from './ui/Spinner';

interface CityComparisonProps {
  baseCity: string;
  baseAnalysis: BudgetAnalysis;
  budgetInput: BudgetInput;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const ComparisonCard: React.FC<{
  city: string;
  analysis: BudgetAnalysis;
  isBaseCity: boolean;
  onRemove?: () => void;
  income: number | '';
  isLoading: boolean;
  error: string | null;
  onIncomeChange: React.ChangeEventHandler<HTMLInputElement>;
  onUpdate: React.MouseEventHandler<HTMLButtonElement>;
}> = ({ city, analysis, isBaseCity, onRemove, income, isLoading, error, onIncomeChange, onUpdate }) => {
  return (
    <Card className={`flex flex-col h-full ${isBaseCity ? 'ring-2 ring-sky-500' : ''}`}>
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">{city}</h3>
        {isBaseCity ? (
          <span className="text-xs font-semibold bg-sky-500/20 text-sky-400 px-2 py-1 rounded-full">Primary</span>
        ) : (
          <button onClick={onRemove} className="text-gray-500 hover:text-red-400 transition-colors" aria-label={`Remove ${city}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      <div className="relative flex-grow flex flex-col">
        {isLoading && (
            <div className="absolute inset-0 bg-gray-800/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-t-none">
                <Spinner />
            </div>
        )}
        <div className="p-4 space-y-3 text-sm flex-grow">
            <div className="flex justify-between"><span>After-Tax Income</span> <span className="font-semibold text-green-400">{formatCurrency(analysis.calculatedAfterTaxIncome)}</span></div>
            <div className="flex justify-between"><span>Total Taxes</span> <span className="font-semibold text-red-400">-{formatCurrency(analysis.taxBreakdown.total)}</span></div>
            <div className="flex justify-between"><span>Total Expenses</span> <span className="font-semibold text-yellow-400">-{formatCurrency(analysis.totalExpenses)}</span></div>
            <div className="flex justify-between"><span>Savings</span> <span className="font-semibold text-blue-400">-{formatCurrency(analysis.savingsAmount)}</span></div>
            <div className="flex justify-between font-bold text-base border-t border-gray-700 pt-3 mt-3"><span className="text-sky-400">Disposable Income</span> <span className="text-sky-400">{formatCurrency(analysis.disposableIncome)}</span></div>
        </div>
        <div className="p-4 bg-gray-900/50 text-xs text-gray-400 border-t border-gray-700">
            <p className="italic">{analysis.summary}</p>
        </div>
      </div>
       <div className="p-4 border-t border-gray-700 space-y-2 bg-gray-800 rounded-b-xl">
          <label htmlFor={`income-${city}`} className="block text-xs font-medium text-gray-400">Monthly Pre-Tax Income</label>
          <div className="flex items-center gap-2">
              <Input
                  id={`income-${city}`}
                  type="number"
                  placeholder="e.g., 6000"
                  value={income}
                  onChange={onIncomeChange}
                  disabled={isLoading}
              />
              <Button onClick={onUpdate} disabled={isLoading || !income} className="w-32 flex-shrink-0 justify-center">
                  {isLoading ? <Spinner/> : 'Recalculate'}
              </Button>
          </div>
          {error && <p className="text-xs text-red-400 mt-2" role="alert">{error}</p>}
      </div>
    </Card>
  );
};

const PlaceholderCard: React.FC<{ city: string }> = ({ city }) => (
  <Card className="flex flex-col h-full items-center justify-center p-6" aria-live="polite">
     <Spinner />
     <p className="mt-4 text-gray-400">Analyzing {city}...</p>
  </Card>
);

const ErrorCard: React.FC<{ city: string, error: string, onRemove: () => void }> = ({ city, error, onRemove }) => (
  <Card className="flex flex-col h-full ring-2 ring-red-500/50">
    <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">{city}</h3>
        <button onClick={onRemove} className="text-gray-500 hover:text-red-400 transition-colors" aria-label={`Remove ${city}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
        </button>
    </div>
    <div className="p-4 text-center text-red-400 text-sm" role="alert">
        <p className="font-semibold mb-2">Could not analyze city.</p>
        <p className="text-xs">{error}</p>
    </div>
  </Card>
);


const CityComparison: React.FC<CityComparisonProps> = ({ baseCity, baseAnalysis, budgetInput }) => {
  const [baseCityData, setBaseCityData] = useState({
    city: baseCity,
    analysis: baseAnalysis,
    income: budgetInput.monthlyPreTaxIncome,
    isLoading: false,
    error: null as string | null,
  });
  const [comparisons, setComparisons] = useState<CityComparisonResult[]>([]);
  const [newCity, setNewCity] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleIncomeChange = (city: string, value: string) => {
      const newIncome = value === '' ? '' : parseFloat(value);
      if (value !== '' && (isNaN(newIncome as number) || (newIncome as number) < 0)) return;

      if (city === baseCityData.city) {
          setBaseCityData(prev => ({ ...prev, income: newIncome, error: null }));
      } else {
          setComparisons(prev => prev.map(c => 
              c.city === city ? { ...c, monthlyPreTaxIncome: newIncome, error: null } : c
          ));
      }
  };

  const handleUpdateAnalysis = async (city: string) => {
      let incomeToUse: number | '';
      if (city === baseCityData.city) {
          incomeToUse = baseCityData.income;
          setBaseCityData(prev => ({ ...prev, isLoading: true, error: null }));
      } else {
          const comp = comparisons.find(c => c.city === city);
          if (!comp) return;
          incomeToUse = comp.monthlyPreTaxIncome;
          setComparisons(prev => prev.map(c => 
              c.city === city ? { ...c, isLoading: true, error: null } : c
          ));
      }

      if (incomeToUse === '' || Number(incomeToUse) <= 0) {
          const errorMsg = "Please enter a valid income.";
          if (city === baseCityData.city) setBaseCityData(prev => ({ ...prev, isLoading: false, error: errorMsg }));
          else setComparisons(prev => prev.map(c => c.city === city ? { ...c, isLoading: false, error: errorMsg } : c));
          return;
      };

      try {
          const updatedBudgetInput = { ...budgetInput, city, monthlyPreTaxIncome: Number(incomeToUse) };
          const result = await generateBudgetPlan(updatedBudgetInput);
          if (city === baseCityData.city) {
              setBaseCityData(prev => ({ ...prev, analysis: result, isLoading: false }));
          } else {
              setComparisons(prev => prev.map(c => c.city === city ? { ...c, analysis: result, isLoading: false } : c));
          }
      } catch (err: any) {
          const errorMsg = err.message || 'Failed to update analysis.';
           if (city === baseCityData.city) {
              setBaseCityData(prev => ({ ...prev, isLoading: false, error: errorMsg }));
          } else {
              setComparisons(prev => prev.map(c => c.city === city ? { ...c, isLoading: false, error: errorMsg } : c));
          }
      }
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim() || isAdding || comparisons.length >= 4) return;
    
    const cityExists = comparisons.some(c => c.city.toLowerCase() === newCity.trim().toLowerCase()) || baseCity.toLowerCase() === newCity.trim().toLowerCase();
    if (cityExists) {
        alert(`${newCity} is already in the comparison.`);
        return;
    }

    setIsAdding(true);
    const cityToAdd = newCity.trim();
    
    setComparisons(prev => [...prev, { city: cityToAdd, analysis: null, isLoading: true, error: null, monthlyPreTaxIncome: budgetInput.monthlyPreTaxIncome }]);
    setNewCity('');

    try {
      const comparisonBudgetInput = { ...budgetInput, city: cityToAdd };
      const result = await generateBudgetPlan(comparisonBudgetInput);
      setComparisons(prev => prev.map(c => c.city === cityToAdd ? { ...c, analysis: result, isLoading: false } : c));
    } catch (err: any) {
      console.error(`Error analyzing ${cityToAdd}:`, err);
      setComparisons(prev => prev.map(c => c.city === cityToAdd ? { ...c, error: err.message || 'Failed to fetch data.', isLoading: false } : c));
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveCity = (cityToRemove: string) => {
    setComparisons(prev => prev.filter(c => c.city !== cityToRemove));
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">Cost of Living Comparison</h2>
        <p className="text-center text-gray-400 max-w-2xl mx-auto">Compare how your budget stacks up in different cities. Adjust your pre-tax income for each location to see how salary differences impact your bottom line.</p>
      </div>

      {comparisons.length < 4 && (
        <Card className="max-w-xl mx-auto">
          <form onSubmit={handleAddCity} className="p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full">
                <label htmlFor="new-city" className="sr-only">City Name</label>
                <Input
                    id="new-city"
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g., Chicago"
                    className="w-full"
                    disabled={isAdding}
                    required
                />
            </div>
            <Button type="submit" disabled={isAdding || !newCity.trim()} className="w-full sm:w-auto">
              {isAdding ? 'Adding...' : '+ Add City'}
            </Button>
          </form>
        </Card>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        <ComparisonCard 
            city={baseCityData.city} 
            analysis={baseCityData.analysis} 
            isBaseCity={true}
            income={baseCityData.income}
            isLoading={baseCityData.isLoading}
            error={baseCityData.error}
            onIncomeChange={(e) => handleIncomeChange(baseCityData.city, e.target.value)}
            onUpdate={() => handleUpdateAnalysis(baseCityData.city)}
        />
        {comparisons.map(comp => (
            <div key={comp.city}>
                {comp.isLoading && !comp.analysis ? (
                    <PlaceholderCard city={comp.city} />
                ) : comp.error && !comp.analysis ? (
                    <ErrorCard city={comp.city} error={comp.error} onRemove={() => handleRemoveCity(comp.city)} />
                ) : comp.analysis ? (
                    <ComparisonCard 
                        city={comp.city} 
                        analysis={comp.analysis} 
                        isBaseCity={false} 
                        onRemove={() => handleRemoveCity(comp.city)}
                        income={comp.monthlyPreTaxIncome}
                        isLoading={comp.isLoading}
                        error={comp.error}
                        onIncomeChange={(e) => handleIncomeChange(comp.city, e.target.value)}
                        onUpdate={() => handleUpdateAnalysis(comp.city)}
                    />
                ) : null}
            </div>
        ))}
      </div>
    </div>
  );
};

export default CityComparison;
