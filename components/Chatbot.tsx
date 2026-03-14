'use client';

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
};

export default function Chatbot({ rawText, analysisResult }: { rawText: string, analysisResult: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: "Hi! I'm your AI assistant. Ask me anything about the reviews or the analysis report." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Store chat session ref to maintain history
  const chatSessionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      if (!chatSessionRef.current) {
        chatSessionRef.current = ai.chats.create({
          model: 'gemini-3.1-pro-preview',
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
            systemInstruction: `You are an expert customer sentiment analyst assistant. 
You are helping the user understand a batch of customer reviews.
Here is the raw text of the reviews:
---
${rawText}
---
Here is the analysis report that was generated:
---
${JSON.stringify(analysisResult, null, 2)}
---
Answer the user's questions based on this data. Be concise, helpful, and insightful.`,
          }
        });
      }

      const response = await chatSessionRef.current.sendMessage({ message: userMsg });
      
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        content: response.text || "I couldn't generate a response." 
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        content: "Sorry, I encountered an error while trying to respond." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full shadow-xl shadow-indigo-200 hover:shadow-2xl hover:scale-105 transition-all z-40 ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-slate-200/60 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex justify-between items-center text-slate-800 z-10">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Analyst</h3>
                  <p className="text-[10px] text-emerald-600 font-medium flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
                    Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-100 ml-3' : 'bg-white border border-slate-200 shadow-sm mr-3'}`}>
                      {msg.role === 'user' ? <User className="h-4 w-4 text-indigo-600" /> : <Bot className="h-4 w-4 text-slate-600" />}
                    </div>
                    <div className={`px-5 py-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm shadow-md shadow-indigo-100' 
                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm'
                    }`}>
                      {msg.role === 'model' ? (
                        <div className="prose prose-sm prose-slate max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex flex-row max-w-[80%]">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-white border border-slate-200 shadow-sm mr-3 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="px-5 py-3 rounded-2xl rounded-tl-sm bg-white border border-slate-100 shadow-sm flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                      <span className="text-xs text-slate-500 font-medium">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about the reviews..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl text-sm transition-all outline-none"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
