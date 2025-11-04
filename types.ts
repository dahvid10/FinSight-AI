
export interface Expense {
  id: number;
  name: string;
  amount: number | '';
}

export interface BudgetInput {
  city: string;
  monthlyPreTaxIncome: number | '';
  savingsGoalType: 'percentage' | 'amount';
  savingsGoalValue: number | '';
  expenses: Expense[];
}

export interface TaxBreakdown {
    federal: number;
    state: number;
    other: number;
    total: number;
}

export interface BudgetAnalysis {
  summary: string;
  totalExpenses: number;
  savingsAmount: number;
  disposableIncome: number;
  recommendations: string[];
  calculatedAfterTaxIncome: number;
  taxBreakdown: TaxBreakdown;
  cashflowAdvice: string[];
}