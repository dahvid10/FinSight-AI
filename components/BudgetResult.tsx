import React, { useState } from 'react';
import { BudgetAnalysis, Expense } from '../types';
import Card from './ui/Card';
import { Tabs, TabList, Tab, TabPanel } from './ui/Tabs';
import FinancialChat from './FinancialChat';

interface BudgetResultProps {
  analysis: BudgetAnalysis;
  preTaxIncome: number;
  expenses: Expense[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const AdviceListItem: React.FC<{text: string}> = ({ text }) => (
  <li className="flex items-start">
    <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span className="text-gray-300">{text}</span>
  </li>
);

const BudgetResult: React.FC<BudgetResultProps> = ({ analysis, preTaxIncome, expenses }) => {
  const [activeTab, setActiveTab] = useState('summary');

  return (
    <div id="results" className="scroll-mt-20">
      <Card>
        <div className="p-6 sm:p-8">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-100">Your Personal Budget Analysis</h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabList>
              <Tab value="summary">Summary</Tab>
              <Tab value="cashflow">Cash Flow</Tab>
              <Tab value="chat">Financial Chat</Tab>
            </TabList>

            {/* Summary Tab */}
            <TabPanel value="summary">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-200 mb-2">AI Summary</h3>
                  <p className="text-gray-400">{analysis.summary}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-200">AI Recommendations</h3>
                      <ul className="space-y-3">
                        {analysis.recommendations.map((rec, index) => <AdviceListItem key={`rec-${index}`} text={rec} />)}
                      </ul>
                   </div>
                   <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-200">Cash Flow Enhancement Tips</h3>
                      <ul className="space-y-3">
                        {analysis.cashflowAdvice.map((rec, index) => <AdviceListItem key={`cf-${index}`} text={rec} />)}
                      </ul>
                   </div>
                </div>
              </div>
            </TabPanel>

            {/* Cash Flow Tab */}
            <TabPanel value="cashflow">
                <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-semibold text-gray-200 mb-4 text-center">Monthly Financial Flow</h3>
                    <div className="space-y-3 text-sm bg-gray-800/50 rounded-lg p-4 ring-1 ring-gray-700">
                        <div className="flex justify-between items-center"><span className="text-gray-400">Pre-Tax Income:</span> <span className="font-medium text-gray-200">{formatCurrency(preTaxIncome)}</span></div>
                        <div className="flex justify-between items-center pl-4 border-l-2 border-red-500/50"><span className="text-gray-400">Federal Tax:</span> <span className="font-medium text-red-500">-{formatCurrency(analysis.taxBreakdown.federal)}</span></div>
                        <div className="flex justify-between items-center pl-4 border-l-2 border-red-500/50"><span className="text-gray-400">State Tax:</span> <span className="font-medium text-red-500">-{formatCurrency(analysis.taxBreakdown.state)}</span></div>
                        <div className="flex justify-between items-center pl-4 border-l-2 border-red-500/50"><span className="text-gray-400">Other Taxes (FICA):</span> <span className="font-medium text-red-500">-{formatCurrency(analysis.taxBreakdown.other)}</span></div>
                        <div className="flex justify-between items-center font-bold border-t border-gray-700 pt-2 mt-2 !mb-2"><span className="text-green-500">After-Tax Income:</span> <span className="text-green-500">{formatCurrency(analysis.calculatedAfterTaxIncome)}</span></div>
                        <div className="flex justify-between items-center pl-4 border-l-2 border-yellow-500/50"><span className="text-gray-400">Total Expenses:</span> <span className="font-medium text-yellow-400">-{formatCurrency(analysis.totalExpenses)}</span></div>
                        <div className="pl-8 space-y-1 my-1">
                          {expenses.filter(e => e.name && e.amount).map((expense) => (
                            <div key={expense.id} className="flex justify-between items-center">
                              <span className="text-gray-500 text-xs italic">{expense.name}:</span>
                              <span className="font-medium text-yellow-400/80 text-xs">-{formatCurrency(Number(expense.amount) || 0)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pl-4 border-l-2 border-blue-500/50"><span className="text-gray-400">Savings Goal:</span> <span className="font-medium text-blue-400">-{formatCurrency(analysis.savingsAmount)}</span></div>
                        <div className="flex justify-between items-center font-bold border-t border-gray-700 pt-2 mt-2"><span className="text-sky-400">Disposable Income:</span> <span className="text-sky-400">{formatCurrency(analysis.disposableIncome)}</span></div>
                    </div>
                </div>
            </TabPanel>

            {/* Financial Chat Tab */}
            <TabPanel value="chat">
              <FinancialChat analysis={analysis} />
            </TabPanel>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default BudgetResult;