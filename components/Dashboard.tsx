'use client';

import { useState } from 'react';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { motion } from 'motion/react';
import { Loader2, MessageSquareText, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WordCloudComponent from './WordCloudComponent';
import Chatbot from './Chatbot';

type SentimentDataPoint = {
  id: number;
  date: string;
  sentiment: number; // -1 to 1
};

type WordCloudItem = {
  text: string;
  value: number;
  type: 'complaint' | 'praise';
};

type ActionableArea = {
  title: string;
  description: string;
};

type AnalysisResult = {
  trendData: SentimentDataPoint[];
  wordCloudData: WordCloudItem[];
  executiveSummary: ActionableArea[];
};

export default function Dashboard() {
  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Analyze the following customer reviews and extract:
1. A chronological sentiment trend (approximate dates or sequence if no dates provided). Sentiment should be a number between -1 (very negative) and 1 (very positive).
2. A list of the most frequent words/phrases categorized as 'complaint' or 'praise', with a frequency value (1-100).
3. An executive summary detailing the top 3 actionable areas for improvement.

Reviews:
${rawText}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              trendData: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    date: { type: Type.STRING, description: "Date or sequence label (e.g., 'Review 1', 'Jan 15')" },
                    sentiment: { type: Type.NUMBER, description: "Sentiment score from -1 to 1" }
                  },
                  required: ["id", "date", "sentiment"]
                }
              },
              wordCloudData: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    value: { type: Type.INTEGER, description: "Frequency or importance score (1-100)" },
                    type: { type: Type.STRING, description: "Either 'complaint' or 'praise'" }
                  },
                  required: ["text", "value", "type"]
                }
              },
              executiveSummary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["title", "description"]
                },
                description: "Top 3 actionable areas for improvement."
              }
            },
            required: ["trendData", "wordCloudData", "executiveSummary"]
          }
        }
      });

      if (response.text) {
        const parsedResult = JSON.parse(response.text) as AnalysisResult;
        setResult(parsedResult);
      } else {
        throw new Error("No response from AI");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <header className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Sentiment AI</h1>
          <p className="text-slate-500 mt-1">Analyze customer feedback instantly</p>
        </div>
      </header>

      {!result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
        >
          <label htmlFor="reviews" className="block text-sm font-medium text-slate-700 mb-2">
            Paste Raw Text Reviews
          </label>
          <textarea
            id="reviews"
            rows={12}
            className="w-full rounded-xl border border-slate-300 p-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
            placeholder="Paste your customer reviews here. They can be unstructured text, CSV data, or chat logs..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !rawText.trim()}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Analyzing (Thinking...)
                </>
              ) : (
                <>
                  <MessageSquareText className="-ml-1 mr-2 h-5 w-5" />
                  Generate Report
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </motion.div>
      )}

      {result && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-slate-900">Analysis Report</h2>
            <button
              onClick={() => setResult(null)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Analyze New Data
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Executive Summary */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
                <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-500" />
                  Top 3 Actionable Areas
                </h3>
                <div className="space-y-6">
                  {result.executiveSummary.map((area, idx) => (
                    <div key={idx} className="relative pl-4 border-l-2 border-indigo-100">
                      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-indigo-600">{idx + 1}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">{area.title}</h4>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{area.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Sentiment Trend */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-medium text-slate-900 mb-6 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-indigo-500" />
                  Sentiment Trend
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis 
                        domain={[-1, 1]} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ color: '#0f172a', fontWeight: 500, marginBottom: '4px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sentiment" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, fill: '#4f46e5', strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Word Cloud */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-medium text-slate-900 mb-6">Frequent Themes</h3>
                <div className="h-80 w-full bg-slate-50 rounded-xl overflow-hidden relative">
                  <WordCloudComponent data={result.wordCloudData} />
                </div>
                <div className="mt-4 flex justify-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span>
                    <span className="text-slate-600">Praises</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-rose-500 mr-2"></span>
                    <span className="text-slate-600">Complaints</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Chatbot rawText={rawText} analysisResult={result} />
        </motion.div>
      )}
    </div>
  );
}
