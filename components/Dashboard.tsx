'use client';

import { useState } from 'react';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { motion } from 'motion/react';
import { Loader2, MessageSquareText, TrendingUp, AlertCircle, CheckCircle2, Printer, FileText, Sparkles, BarChart3, Users } from 'lucide-react';
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

  const handleLoadSampleData = () => {
    setRawText(`[2023-10-01] The new dashboard is incredibly fast and easy to use. I love the dark mode feature!
[2023-10-05] Customer support was very unhelpful when I tried to reset my password. It took 3 days to get a response.
[2023-10-12] I'm really impressed with the analytics tools. They give me exactly what I need for my weekly reports.
[2023-10-18] The mobile app keeps crashing on my Android phone. It's basically unusable right now.
[2023-10-22] Great value for the price. The premium features are definitely worth the upgrade.
[2023-10-28] I wish there was a way to export the data to Excel. The current PDF export is too limited.
[2023-11-02] The UI update is confusing. I can't find the settings menu anymore.
[2023-11-10] Excellent onboarding experience! The interactive tutorial helped me get started in minutes.
[2023-11-15] Billing is a nightmare. I was charged twice this month and still haven't received a refund.
[2023-11-20] The integration with Slack is a game-changer for our team's workflow.`);
  };

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
      <header className="flex items-center justify-between pb-8 pt-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Sentiment AI</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Customer Intelligence Platform</p>
          </div>
        </div>
      </header>

      {!result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-8 hover:shadow-md transition-shadow duration-300"
        >
          <label htmlFor="reviews" className="block text-base font-semibold text-slate-800 mb-3">
            Paste Raw Text Reviews
          </label>
          <div className="relative">
            <textarea
              id="reviews"
              rows={12}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-5 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white font-mono transition-all outline-none resize-y"
              placeholder="Paste your customer reviews here. They can be unstructured text, CSV data, or chat logs..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
          </div>
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={handleLoadSampleData}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all active:scale-95 w-full sm:w-auto"
            >
              <FileText className="-ml-1 mr-2 h-4 w-4" />
              Load Sample Data
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !rawText.trim()}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 w-full sm:w-auto"
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
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-sm flex items-start"
            >
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </motion.div>
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
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Analysis Report</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 font-semibold transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:shadow active:scale-95"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={() => setResult(null)}
                className="inline-flex items-center text-sm text-white font-semibold transition-colors bg-slate-900 px-4 py-2 rounded-xl shadow-sm hover:bg-slate-800 active:scale-95"
              >
                Analyze New Data
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Reviews Analyzed</p>
                <p className="text-2xl font-bold text-slate-900">{rawText.split('\n').filter(l => l.trim().length > 10).length || 1}</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Average Sentiment</p>
                <p className="text-2xl font-bold text-slate-900">
                  {((result.trendData.reduce((acc, curr) => acc + curr.sentiment, 0) / result.trendData.length) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Top Complaint</p>
                <p className="text-lg font-bold text-slate-900 truncate max-w-[150px]">
                  {result.wordCloudData.filter(w => w.type === 'complaint').sort((a,b) => b.value - a.value)[0]?.text || 'None'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Executive Summary */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-8 h-full hover:shadow-md transition-shadow duration-300">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-500" />
                  Top 3 Actionable Areas
                </h3>
                <div className="space-y-8">
                  {result.executiveSummary.map((area, idx) => (
                    <div key={idx} className="relative pl-6 border-l-2 border-indigo-100">
                      <div className="absolute -left-[11px] top-0 h-5 w-5 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center shadow-sm">
                        <span className="text-[10px] font-bold text-indigo-600">{idx + 1}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 leading-tight">{area.title}</h4>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{area.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Sentiment Trend */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-8 hover:shadow-md transition-shadow duration-300">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
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
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-8 hover:shadow-md transition-shadow duration-300">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Frequent Themes</h3>
                <div className="h-80 w-full bg-slate-50/50 rounded-2xl overflow-hidden relative border border-slate-100">
                  <WordCloudComponent data={result.wordCloudData} />
                </div>
                <div className="mt-6 flex justify-center space-x-8 text-sm font-medium">
                  <div className="flex items-center bg-emerald-50 px-3 py-1.5 rounded-full">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>
                    <span className="text-emerald-700">Praises</span>
                  </div>
                  <div className="flex items-center bg-rose-50 px-3 py-1.5 rounded-full">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2"></span>
                    <span className="text-rose-700">Complaints</span>
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
