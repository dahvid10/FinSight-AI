import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { BudgetAnalysis } from '../types';
import Input from './ui/Input';
import Button from './ui/Button';
import Spinner from './ui/Spinner';

interface FinancialChatProps {
  analysis: BudgetAnalysis;
}

interface Message {
  author: 'user' | 'ai';
  text: string;
}

const API_KEY = process.env.API_KEY;

const FinancialChat: React.FC<FinancialChatProps> = ({ analysis }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!API_KEY) return;
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const initialPrompt = `
      You are an expert financial assistant integrated into the 'FinSight AI' app.
      The user's personal financial analysis has been provided to you as context.
      Your task is to answer the user's questions, help them brainstorm solutions, and provide actionable advice.
      Use the user's financial data as the primary context for your answers.
      You can also use your general knowledge and Google Search to provide more comprehensive, helpful, and up-to-date information, such as suggesting specific savings accounts, investment options, or local money-saving tips. Be encouraging, concise, and helpful.

      Here is the user's financial data:
      ${JSON.stringify(analysis, null, 2)}
    `;

    const chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: [{ role: "user", parts: [{ text: initialPrompt }] }],
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    setChat(chatSession);

    // Start with a greeting
    setMessages([{ author: 'ai', text: "Hello! I've reviewed your financial analysis. How can I help you brainstorm or clarify your budget?" }]);
  }, [analysis]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !chat || isLoading) return;

    const userMessage: Message = { author: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await chat.sendMessage({ message: userInput });
      const aiMessage: Message = { author: 'ai', text: response.text };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = { author: 'ai', text: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-96 bg-gray-800 rounded-lg p-4 ring-1 ring-gray-700">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${msg.author === 'user' ? 'bg-sky-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl bg-gray-700 text-gray-200">
                <Spinner />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2 border-t border-gray-700 pt-4">
        <Input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask about your budget..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !userInput.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
};

export default FinancialChat;