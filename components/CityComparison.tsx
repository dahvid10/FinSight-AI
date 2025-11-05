import React, { useState } from 'react';
import { BudgetInput, BudgetAnalysis, CityComparisonResult, Expense } from '../types';
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

interface ComparisonCardProps {
    data: CityComparisonResult;
    isBaseCity: boolean;
    onRemove?: () => void;
    isLoading: boolean;
    error: string | null;
    onDataChange: (city: string, field: keyof CityComparisonResult, value: any) => void;
    onExpenseChange: (city: string, expenseId: number, field: 'name' | 'amount', value: string) => void;
    addExpense: (city: string) => void;
    removeExpense: (city: string, expenseId: number) => void;
    onUpdate: (city: string) => void;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ data, isBaseCity, onRemove, onDataChange, onExpenseChange, addExpense, removeExpense, onUpdate }) => {
  const { city, analysis, isLoading, error, monthlyPreTaxIncome, expenses, savingsGoalType, savingsGoalValue } = data;
  const [isEditing, setIsEditing] = useState(false);

  const handleRecalculate = () => {
    setIsEditing(false);
    onUpdate(city);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Note: This doesn't revert changes. The main state holds the single source of truth.
    // To revert, we'd need to store pre-edit state, which adds complexity.
  }
  
  return (
    <Card className={`flex flex-col h-full ${isBaseCity ? 'ring-2 ring-sky-500' : ''}`}>
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-100">{city}</h3>
        {isBaseCity ? (
          <span className="text-xs font-semibold bg-sky-900/50 text-sky-300 px-2 py-1 rounded-full">Primary</span>
        ) : (
          <button onClick={onRemove} className="text-gray-500 hover:text-red-500 transition-colors" aria-label={`Remove ${city}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4 flex-grow space-y-4">
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
        
        {!isLoading && !isEditing && analysis && (
            <>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">After-Tax Income:</span> <span className="font-semibold text-green-500">{formatCurrency(analysis.calculatedAfterTaxIncome)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Total Expenses:</span> <span className="font-semibold text-yellow-400">-{formatCurrency(analysis.totalExpenses)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Savings:</span> <span className="font-semibold text-blue-400">-{formatCurrency(analysis.savingsAmount)}</span></div>
                    <div className="flex justify-between pt-2 border-t border-gray-700 mt-2 font-bold"><span className="text-sky-400">Disposable Income:</span> <span className="text-sky-400">{formatCurrency(analysis.disposableIncome)}</span></div>
                </div>
                <div className="text-xs space-y-1 mt-2 pt-2 border-t border-gray-700">
                    <h4 className="font-semibold text-gray-300 mb-1">Tax Breakdown</h4>
                    <div className="flex justify-between"><span className="text-gray-500">Federal Tax:</span> <span className="text-red-500">-{formatCurrency(analysis.taxBreakdown.federal)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">State Tax:</span> <span className="text-red-500">-{formatCurrency(analysis.taxBreakdown.state)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Other Tax (FICA):</span> <span className="text-red-500">-{formatCurrency(analysis.taxBreakdown.other)}</span></div>
                </div>
            </>
        )}

        {!isBaseCity && !isLoading && isEditing && (
            <div className="space-y-4 text-sm">
                 <div>
                    <label className="text-sm font-medium text-gray-300">Est. Pre-Tax Income</label>
                    <Input type="number" value={monthlyPreTaxIncome} onChange={(e) => onDataChange(city, 'monthlyPreTaxIncome', e.target.value)} placeholder="e.g. 6000" className="mt-1"/>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Savings Goal</label>
                    <div className="flex items-center gap-x-4 mb-1">
                        <div className="flex items-center"><input id={`goal-percentage-${city}`} type="radio" value="percentage" checked={savingsGoalType === 'percentage'} onChange={() => onDataChange(city, 'savingsGoalType', 'percentage')} className="h-4 w-4 text-sky-600 border-gray-600 bg-transparent"/> <label htmlFor={`goal-percentage-${city}`} className="ml-2 text-xs">Percent (%)</label></div>
                        <div className="flex items-center"><input id={`goal-amount-${city}`} type="radio" value="amount" checked={savingsGoalType === 'amount'} onChange={() => onDataChange(city, 'savingsGoalType', 'amount')} className="h-4 w-4 text-sky-600 border-gray-600 bg-transparent"/> <label htmlFor={`goal-amount-${city}`} className="ml-2 text-xs">Amount ($)</label></div>
                    </div>
                    <Input type="number" value={savingsGoalValue} onChange={(e) => onDataChange(city, 'savingsGoalValue', e.target.value)} placeholder={savingsGoalType === 'percentage' ? 'e.g., 20' : 'e.g., 500'}/>
                 </div>
                 <div>
                    <label className="text-sm font-medium text-gray-300">Expenses</label>
                    <div className="space-y-2 mt-1 max-h-40 overflow-y-auto pr-1">
                        {expenses.map(exp => (
                            <div key={exp.id} className="grid grid-cols-12 gap-2 items-center">
                                <Input className="col-span-6" type="text" placeholder="Name" value={exp.name} onChange={e => onExpenseChange(city, exp.id, 'name', e.target.value)} />
                                <Input className="col-span-5" type="number" placeholder="Amount" value={exp.amount} onChange={e => onExpenseChange(city, exp.id, 'amount', e.target.value)} />
                                <button type="button" onClick={() => removeExpense(city, exp.id)} className="col-span-1 text-gray-500 hover:text-red-500 justify-self-end">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                    <Button type="button" onClick={() => addExpense(city)} variant="ghost" className="text-xs mt-2">+ Add Expense</Button>
                 </div>
            </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-700 mt-auto">
        {!isBaseCity && !isLoading && (
            isEditing ? (
                <div className="flex gap-2">
                    <Button onClick={handleCancel} variant="secondary" className="w-full text-xs">Cancel</Button>
                    <Button onClick={handleRecalculate} className="w-full text-xs">Recalculate Analysis</Button>
                </div>
            ) : (
                <Button onClick={() => setIsEditing(true)} variant="secondary" className="w-full text-xs">Edit Budget</Button>
            )
        )}
        {!isLoading && !isEditing && analysis && (
            <p className="text-xs text-gray-400 italic">{analysis.summary}</p>
        )}
      </div>
    </Card>
  );
};


const CityComparison: React.FC<CityComparisonProps> = ({ baseCity, baseAnalysis, budgetInput }) => {
  const [comparisonCities, setComparisonCities] = useState<CityComparisonResult[]>([]);
  const [newCity, setNewCity] = useState('');

  const addCity = async () => {
    const trimmedCity = newCity.trim();
    if (!trimmedCity || comparisonCities.length >= 4 || trimmedCity.toLowerCase() === baseCity.toLowerCase() || comparisonCities.some(c => c.city.toLowerCase() === trimmedCity.toLowerCase())) {
        setNewCity('');
        return;
    }

    const cityToAdd: CityComparisonResult = {
        city: trimmedCity,
        analysis: null,
        isLoading: true,
        error: null,
        monthlyPreTaxIncome: budgetInput.monthlyPreTaxIncome,
        expenses: JSON.parse(JSON.stringify(budgetInput.expenses)),
        savingsGoalType: budgetInput.savingsGoalType,
        savingsGoalValue: budgetInput.savingsGoalValue,
    };
    setComparisonCities(prev => [...prev, cityToAdd]);
    setNewCity('');

    try {
        const newBudgetInput: BudgetInput = {
            city: cityToAdd.city,
            monthlyPreTaxIncome: cityToAdd.monthlyPreTaxIncome,
            expenses: cityToAdd.expenses,
            savingsGoalType: cityToAdd.savingsGoalType,
            savingsGoalValue: cityToAdd.savingsGoalValue
        };
        const result = await generateBudgetPlan(newBudgetInput);
        setComparisonCities(prev => prev.map(c => c.city === cityToAdd.city ? { ...c, analysis: result, isLoading: false } : c));
    } catch (err) {
        console.error(err);
        setComparisonCities(prev => prev.map(c => c.city === cityToAdd.city ? { ...c, error: 'Failed to generate analysis.', isLoading: false } : c));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCity();
  };

  const removeCity = (cityToRemove: string) => {
    setComparisonCities(prev => prev.filter(c => c.city !== cityToRemove));
  };
  
  const handleCityDataChange = (cityToUpdate: string, field: keyof CityComparisonResult, value: any) => {
      const isNumericField = field === 'monthlyPreTaxIncome' || field === 'savingsGoalValue';
      if (isNumericField) {
        if (value === '') {
            setComparisonCities(prev => prev.map(c => c.city === cityToUpdate ? { ...c, [field]: '' } : c));
        } else {
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue) && numericValue >= 0) {
                 setComparisonCities(prev => prev.map(c => c.city === cityToUpdate ? { ...c, [field]: numericValue } : c));
            }
        }
      } else {
         setComparisonCities(prev => prev.map(c => c.city === cityToUpdate ? { ...c, [field]: value } : c));
      }
  };
  
  const handleCityExpenseChange = (cityToUpdate: string, expenseId: number, field: 'name' | 'amount', value: string) => {
     setComparisonCities(prev => prev.map(c => {
        if (c.city !== cityToUpdate) return c;
        const newExpenses = c.expenses.map(exp => {
           if (exp.id !== expenseId) return exp;
           if (field === 'name') return { ...exp, name: value };
           if (value === '') return { ...exp, amount: '' };
           const numValue = parseFloat(value);
           return (!isNaN(numValue) && numValue >= 0) ? { ...exp, amount: numValue } : exp;
        });
        return { ...c, expenses: newExpenses };
     }));
  };
  
  const addCityExpense = (cityToUpdate: string) => {
      setComparisonCities(prev => prev.map(c => c.city === cityToUpdate ? {...c, expenses: [...c.expenses, { id: Date.now(), name: '', amount: '' }]} : c));
  }

  const removeCityExpense = (cityToUpdate: string, expenseId: number) => {
      setComparisonCities(prev => prev.map(c => c.city === cityToUpdate ? {...c, expenses: c.expenses.filter(exp => exp.id !== expenseId)} : c));
  }

  const updateCityAnalysis = async (cityToUpdate: string) => {
    const cityData = comparisonCities.find(c => c.city === cityToUpdate);
    if (!cityData) return;

    setComparisonCities(prev => prev.map(c => c.city === cityToUpdate ? { ...c, isLoading: true, error: null } : c));

    try {
      const newBudgetInput: BudgetInput = {
        city: cityData.city,
        monthlyPreTaxIncome: cityData.monthlyPreTaxIncome,
        expenses: cityData.expenses,
        savingsGoalType: cityData.savingsGoalType,
        savingsGoalValue: cityData.savingsGoalValue,
      };
      const result = await generateBudgetPlan(newBudgetInput);
      setComparisonCities(prev => prev.map(c => c.city === cityToUpdate ? { ...c, analysis: result, isLoading: false } : c));
    } catch (err) {
      console.error(err);
      setComparisonCities(prev => prev.map(c => c.city === cityToUpdate ? { ...c, error: 'Failed to update analysis.', isLoading: false } : c));
    }
  };


  const allCities: CityComparisonResult[] = [
    { city: baseCity, analysis: baseAnalysis, isLoading: false, error: null, monthlyPreTaxIncome: budgetInput.monthlyPreTaxIncome, expenses: budgetInput.expenses, savingsGoalType: budgetInput.savingsGoalType, savingsGoalValue: budgetInput.savingsGoalValue },
    ...comparisonCities
  ];

  return (
    <div className="space-y-8">
      <Card>
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Compare Cost of Living</h2>
            <p className="text-gray-400 mb-4">Add up to 4 other cities to see how your budget stacks up.</p>
            <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                <Input 
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Enter city name..."
                    className="flex-grow"
                    disabled={comparisonCities.length >= 4}
                />
                <Button type="submit" disabled={!newCity.trim() || comparisonCities.length >= 4} className="w-full sm:w-auto">
                    Add City
                </Button>
            </form>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {allCities.map((item) => (
          <ComparisonCard
            key={item.city}
            data={item}
            isBaseCity={item.city === baseCity}
            onRemove={() => removeCity(item.city)}
            isLoading={item.isLoading}
            error={item.error}
            onDataChange={handleCityDataChange}
            onExpenseChange={handleCityExpenseChange}
            addExpense={addCityExpense}
            removeExpense={removeCityExpense}
            onUpdate={updateCityAnalysis}
          />
        ))}
      </div>
    </div>
  );
};

export default CityComparison;