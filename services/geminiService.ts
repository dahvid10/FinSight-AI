
import { GoogleGenAI, Type } from "@google/genai";
import { BudgetInput, BudgetAnalysis } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const budgetSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { 
      type: Type.STRING,
      description: "A brief, one-paragraph, encouraging summary of the user's financial situation based on the provided data."
    },
    taxBreakdown: {
        type: Type.OBJECT,
        description: "An itemized breakdown of estimated monthly taxes.",
        properties: {
            federal: { type: Type.NUMBER, description: "Estimated monthly federal tax." },
            state: { type: Type.NUMBER, description: "Estimated monthly state tax." },
            other: { type: Type.NUMBER, description: "Estimated other taxes (e.g., FICA, local). Sum of Social Security and Medicare." },
            total: { type: Type.NUMBER, description: "Total estimated monthly taxes. Should be the sum of federal, state, and other." }
        },
        required: ["federal", "state", "other", "total"]
    },
    calculatedAfterTaxIncome: {
      type: Type.NUMBER,
      description: "The calculated after-tax income after subtracting the total estimated taxes from the pre-tax income. This value is then used for all other calculations."
    },
    totalExpenses: { 
      type: Type.NUMBER,
      description: "The calculated total of all monthly expenses."
    },
    savingsAmount: { 
      type: Type.NUMBER,
      description: "The calculated monthly savings amount based on the user's specified savings goal."
    },
    disposableIncome: { 
      type: Type.NUMBER,
      description: "The remaining money after all expenses and savings are deducted from the calculated after-tax income."
    },
    recommendations: {
      type: Type.ARRAY,
      description: "An array of 3-5 concise, actionable, and personalized saving tips relevant to the user's city and financial data.",
      items: { type: Type.STRING }
    },
    cashflowAdvice: {
      type: Type.ARRAY,
      description: "An array of 2-3 actionable tips on how to improve cash flow, such as reducing specific expenses or suggesting income-generating ideas.",
      items: { type: Type.STRING }
    }
  },
  required: ["summary", "taxBreakdown", "calculatedAfterTaxIncome", "totalExpenses", "savingsAmount", "disposableIncome", "recommendations", "cashflowAdvice"],
};

export async function generateBudgetPlan(input: BudgetInput): Promise<BudgetAnalysis> {
  const expensesString = input.expenses.map(e => `${e.name}: $${e.amount || 0}`).join(', ');
  const savingsGoalValue = input.savingsGoalValue || 0;
  const savingsGoalString = input.savingsGoalType === 'percentage'
    ? `${savingsGoalValue}% of after-tax income`
    : `$${savingsGoalValue} fixed amount`;
  const monthlyPreTaxIncome = Number(input.monthlyPreTaxIncome) || 0;

  const prompt = `
    You are a helpful financial assistant for the 'FinSight AI' app.
    Your task is to create a personalized budget analysis based on the user's input. Do not output any introductory text. Go straight to the JSON.
    
    User's Data:
    - City: ${input.city}
    - Monthly Pre-Tax Income: $${monthlyPreTaxIncome}
    - Monthly Savings Goal: ${savingsGoalString}
    - Listed Monthly Expenses: ${expensesString || 'None'}

    Task:
    1.  First, based on the provided city and pre-tax income, provide an itemized estimate for monthly taxes (Federal, State, and Other - like FICA). Calculate the total tax and the final 'after-tax income'. This is a critical first step.
    2.  Using the calculated after-tax income, analyze the user's financial situation.
    3.  Provide a summary, calculate their total expenses, the amount they should save based on their goal, and their final disposable income.
    4.  Provide 3-5 concise, actionable, and personalized recommendations for saving money in their specific city.
    5.  Provide 2-3 actionable tips to enhance their cash flow (e.g., reducing outflows or increasing inflows).

    Return the entire response as a single, valid JSON object matching the provided schema. Do not include any markdown formatting or backticks around the JSON.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: budgetSchema,
      temperature: 0.5,
    },
  });

  try {
    const jsonString = response.text.trim();
    const parsedResponse: BudgetAnalysis = JSON.parse(jsonString);
    
    // Post-process to ensure data integrity
    const { federal, state, other } = parsedResponse.taxBreakdown;
    parsedResponse.taxBreakdown.total = federal + state + other;
    parsedResponse.calculatedAfterTaxIncome = monthlyPreTaxIncome - parsedResponse.taxBreakdown.total;

    return parsedResponse;
  } catch (error) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("The AI returned an invalid response format.");
  }
}