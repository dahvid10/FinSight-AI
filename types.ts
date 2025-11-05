
export interface Expense {
  id: number;
  name: string;
  amount: number | '';
}

export interface BudgetInput {
  city: string;
  // FIX: Renamed 'monthlyPre--TaxIncome' to 'monthlyPreTaxIncome' to be a valid property name.
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

export interface CityComparisonResult {
  city: string;
  analysis: BudgetAnalysis | null;
  isLoading: boolean;
  error: string | null;
  monthlyPreTaxIncome: number | '';
  expenses: Expense[];
  savingsGoalType: 'percentage' | 'amount';
  savingsGoalValue: number | '';
}