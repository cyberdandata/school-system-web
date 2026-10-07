import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Sparkles, Send, Bot, Calendar, Award, HelpCircle } from 'lucide-react';
import { AppData } from '../types';
import dataManager from '../lib/db';
import app from '../lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAppStore } from "../store/useAppStore";

interface AIChatbotProps {
  }

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatbot({  }: AIChatbotProps) {
  const data = useAppStore(state => state.data)!;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am **OTEC Edu-AI**, your grounded school intelligence assistant. I can help you lookup fee accounts, outstanding balances, search registered guardian contacts, analyze streams, or calculate aggregate averages immediately. Ask me anything!"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    if (!textToSend) setInput('');

    const newMessages = [...messages, { role: 'user', content: query } as Message];
    setMessages(newMessages);
    setLoading(true);

    try {
      const { getGeminiClient } = await import('../lib/gemini');
      const ai = getGeminiClient(data.settings?.geminiApiKey);
      
      const systemPrompt = `You are OTEC Edu-AI, a grounded school management assistant.
Current Date/Time: ${new Date().toLocaleString()}

Here is the live school data (students, HR, finance, settings):
${JSON.stringify(data)}

Respond to the user's latest query.
If they ask to add, delete, or modify something, return the updated data object in the JSON. If it's just a question or a summary report, return updatedData as null.
If they ask for a summary report, provide a comprehensive markdown report analyzing the health of the school (total students, financials, etc.).
Always output valid JSON ONLY with the format:
{
  "reply": "Your markdown formatted message to the user",
  "updatedData": null
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + "\n\nChat History:\n" + JSON.stringify(newMessages) }] }
        ],
        config: {
          responseMimeType: "application/json",
        }
      });

      if (!response.text) throw new Error("No response from AI");
      const resData = JSON.parse(response.text);

      setMessages(prev => [...prev, { role: 'assistant', content: resData.reply }]);
      
      if (resData.updatedData) {
        dataManager.setData(resData.updatedData);
        window.dispatchEvent(new CustomEvent('otec-toast', {
          detail: {
            message: 'Live database updated by OTEC Edu-AI Assistant!',
            type: 'success'
          }
        }));
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `⚠️ **Connection Error**: ${err.message || 'Something went wrong while loading the AI response.'}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Pre-formatted query suggestions
  const suggestions = [
    "Generate a comprehensive school summary report of all our data",
    "Record an income of 450,000 UGX under Tuition Fees (Cash) with description 'Tuition for Nabakka'",
    "Add student 'Kato Julius', Male, class P7, guardian 'Nsubuga John' 0772200300",
    "Record 92 marks in Mathematics for student L1001 on exam set-1",
    "List the fee balances and outstanding balances"
  ];

  // Helper to render formatted chat messages with basic markdown support (bold, list, paragraphs)
  const renderMessageContent = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let content: React.ReactNode = line;

      // Handle bullet points
      const isBullet = line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ');
      if (isBullet) {
        content = line.replace(/^[-*•]\s+/, '');
      }

      // Parse Bold text **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      const contentStr = String(content);

      while ((match = boldRegex.exec(contentStr)) !== null) {
        if (match.index > lastIndex) {
          parts.push(contentStr.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-slate-900">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < contentStr.length) {
        parts.push(contentStr.substring(lastIndex));
      }

      const finalLine = parts.length > 0 ? parts : content;

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm text-slate-800 leading-relaxed mb-1">
            {finalLine}
          </li>
        );
      }

      return (
        <p key={idx} className="text-sm text-slate-800 leading-relaxed mb-1.5 min-h-[1rem]">
          {finalLine}
        </p>
      );
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 flex flex-col justify-between gap-2 border-b border-slate-800 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/35 text-blue-400 rounded-xl border border-blue-500/20">
            <Bot size={24} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-50 flex items-center gap-2">
              OTEC Edu-AI Consultant
              <Sparkles size={16} className="text-amber-400 fill-amber-400" />
            </h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Real-time Grounded School Intelligence</p>
          </div>
        </div>

        {/* Time and Date Tracking Bar */}
        <div className="flex items-center gap-3 mt-3 bg-slate-850/80 p-2.5 border border-slate-800/60 rounded-xl text-xs text-slate-300 font-semibold max-w-fit">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar size={14} className="text-blue-400 shrink-0" />
            <span>{currentTime || 'Syncing clock...'}</span>
          </div>
          <div className="text-emerald-400 flex items-center gap-1.5 ml-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>LIVE CONTEXT</span>
          </div>
        </div>
      </div>

      {/* Suggestions / Prompt Starters */}
      <div className="bg-white border-b border-slate-200/60 p-4 shadow-xs shrink-0">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
          <Award size={14} className="text-blue-600" />
          <span>Quick School Queries</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(s)}
              disabled={loading}
              className="shrink-0 text-xs bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-blue-700 font-semibold px-4 py-2 rounded-full cursor-pointer transition-all hover:border-slate-300 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx}
                className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-sm ${
                    isUser ? 'bg-blue-600' : 'bg-slate-800'
                  }`}
                >
                  {isUser ? <HelpCircle size={20} /> : <Bot size={20} />}
                </div>
                <div
                  className={`max-w-[85%] px-5 py-4 rounded-3xl text-sm shadow-sm ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {isUser ? <p className="text-sm leading-relaxed">{m.content}</p> : renderMessageContent(m.content)}
                </div>
              </motion.div>
            );
          })}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Bot size={20} />
              </div>
              <div className="bg-white border border-slate-200 text-slate-500 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Analyzing School Database...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Footer */}
      <div className="p-4 lg:p-6 border-t border-slate-200 bg-white shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask about students, fee balances, PLE advice, or say 'add a student'..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || loading}
            className="p-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl shadow-md transition-all cursor-pointer shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
