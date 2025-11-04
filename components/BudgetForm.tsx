import React from 'react';
import { BudgetInput, Expense } from '../types';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';

interface BudgetFormProps {
  budgetInput: BudgetInput;
  setBudgetInput: React.Dispatch<React.SetStateAction<BudgetInput>>;
  onSubmit: () => void;
  onReset: () => void;
  isLoading: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ budgetInput, setBudgetInput, onSubmit, onReset, isLoading }) => {

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBudgetInput(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === '') {
      setBudgetInput(prev => ({ ...prev, [name]: '' }));
    } else {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue >= 0) {
        setBudgetInput(prev => ({ ...prev, [name]: numericValue }));
      }
    }
  };

  const handleGoalTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newType = e.target.value as 'percentage' | 'amount';
    setBudgetInput(prev => ({ 
        ...prev, 
        savingsGoalType: newType,
        savingsGoalValue: prev.savingsGoalType === newType ? prev.savingsGoalValue : ''
    }));
  };

  const handleExpenseChange = (id: number, field: 'name' | 'amount', value: string) => {
    setBudgetInput(prev => ({
      ...prev,
      expenses: prev.expenses.map(exp => {
        if (exp.id !== id) return exp;

        if (field === 'name') {
          return { ...exp, name: value };
        }
        
        // Handle amount change
        if (value === '') {
          return { ...exp, amount: '' };
        }
        
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0) {
          return { ...exp, amount: numericValue };
        }
        
        return exp; // Return original if input is invalid
      })
    }));
  };

  const addExpense = () => {
    setBudgetInput(prev => ({
      ...prev,
      expenses: [...prev.expenses, { id: Date.now(), name: '', amount: '' }]
    }));
  };

  const removeExpense = (id: number) => {
    setBudgetInput(prev => ({
      ...prev,
      expenses: prev.expenses.filter(exp => exp.id !== id)
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">Your City</label>
            <Input id="city" name="city" type="text" value={budgetInput.city} onChange={handleInputChange} placeholder="e.g., New York" required />
          </div>
          <div>
            <label htmlFor="monthlyPreTaxIncome" className="block text-sm font-medium text-gray-300 mb-1">Monthly Pre-Tax Income ($)</label>
            <Input id="monthlyPreTaxIncome" name="monthlyPreTaxIncome" type="number" value={budgetInput.monthlyPreTaxIncome} onChange={handleNumericInputChange} placeholder="e.g., 6000" required />
            <p className="text-xs text-gray-400 mt-1">We'll estimate your after-tax income based on your city.</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Monthly Savings Goal</label>
             <div className="flex items-center gap-x-6 gap-y-2 flex-wrap mb-2">
                <div className="flex items-center">
                    <input id="goal-percentage" name="savingsGoalType" type="radio" value="percentage" checked={budgetInput.savingsGoalType === 'percentage'} onChange={handleGoalTypeChange} className="h-4 w-4 text-sky-600 border-gray-600 focus:ring-sky-500 bg-transparent" />
                    <label htmlFor="goal-percentage" className="ml-2 block text-sm text-gray-300">Percentage (%)</label>
                </div>
                <div className="flex items-center">
                    <input id="goal-amount" name="savingsGoalType" type="radio" value="amount" checked={budgetInput.savingsGoalType === 'amount'} onChange={handleGoalTypeChange} className="h-4 w-4 text-sky-600 border-gray-600 focus:ring-sky-500 bg-transparent" />
                    <label htmlFor="goal-amount" className="ml-2 block text-sm text-gray-300">Fixed Amount ($)</label>
                </div>
            </div>
            <Input 
              id="savingsGoalValue" 
              name="savingsGoalValue" 
              type="number" 
              value={budgetInput.savingsGoalValue} 
              onChange={handleNumericInputChange} 
              placeholder={budgetInput.savingsGoalType === 'percentage' ? 'e.g., 20' : 'e.g., 500'} 
              required 
              min="0" 
              max={budgetInput.savingsGoalType === 'percentage' ? 100 : undefined} 
            />
            {budgetInput.savingsGoalType === 'percentage' && (
              <p className="text-xs text-gray-400 mt-1">Percentage is based on estimated after-tax income.</p>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2 mb-4">Monthly Expenses</h3>
          <div className="space-y-4">
            {budgetInput.expenses.map((expense, index) => (
              <div key={expense.id} className="grid grid-cols-1 sm:grid-cols-8 gap-3 items-center">
                <div className="sm:col-span-4">
                   <label htmlFor={`expense-name-${index}`} className="sr-only">Expense Name</label>
                   <Input id={`expense-name-${index}`} type="text" placeholder="Expense Name (e.g., Rent)" value={expense.name} onChange={e => handleExpenseChange(expense.id, 'name', e.target.value)} />
                </div>
                <div className="sm:col-span-3">
                    <label htmlFor={`expense-amount-${index}`} className="sr-only">Amount</label>
                    <Input id={`expense-amount-${index}`} type="number" placeholder="Amount" value={expense.amount} onChange={e => handleExpenseChange(expense.id, 'amount', e.target.value)} />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                    <button type="button" onClick={() => removeExpense(expense.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-900/50 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    </button>
                </div>
              </div>
            ))}
          </div>
          <Button type="button" onClick={addExpense} variant="secondary" className="mt-4">
            + Add Expense
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-700 gap-4">
           <Button type="button" onClick={onReset} variant="ghost" disabled={isLoading}>Reset Form</Button>
           <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
             {isLoading ? 'Generating...' : 'Generate Budget Plan'}
           </Button>
        </div>
      </form>
    </Card>
  );
};

export default BudgetForm;