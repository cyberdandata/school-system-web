import React, { useState } from 'react';
import { AppData, CommunicationMessage } from '../types';
import { MessageSquare, Mail, Send, History, Search, Users, AlertCircle, Filter, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from "../store/useAppStore";

interface Props {
  onUpdateCommunications: (comms: { messages: CommunicationMessage[] }) => void;
}

export default function CommunicationsEngine({ onUpdateCommunications }: Props) {
  const data = useAppStore(state => state.data)!;
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [messageType, setMessageType] = useState<'SMS' | 'Email'>('SMS');
  const [recipientGroup, setRecipientGroup] = useState<string>('all_parents');
  const [messageBody, setMessageBody] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'SMS' | 'Email'>('All');

  const messages = data.communications?.messages || [];

  const handleSendMessage = () => {
    if (!messageBody.trim()) {
      window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: 'Message body cannot be empty.', type: 'warning' } }));
      return;
    }

    const newMessage: CommunicationMessage = {
      id: `msg-${Date.now()}`,
      type: messageType,
      recipientId: recipientGroup,
      recipientName: recipientGroup === 'all_parents' ? 'All Parents' : `Class ${recipientGroup}`,
      recipientContact: 'Multiple',
      body: messageBody.trim(),
      sentAt: new Date().toISOString(),
      status: 'Sent',
      sentBy: 'Admin User' // Should ideally use activeUser.name but keeping simple for demo
    };

    const newMessages = [newMessage, ...messages];
    onUpdateCommunications({ messages: newMessages });

    window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: `${messageType} broadcast sent successfully!`, type: 'success' } }));
    setMessageBody('');
    setActiveTab('history');
  };

  const filteredHistory = messages.filter(msg => 
    msg.body.toLowerCase().includes(searchHistory.toLowerCase()) || 
    msg.recipientName.toLowerCase().includes(searchHistory.toLowerCase())
  ).filter(msg => filterType === 'All' || msg.type === filterType)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <header>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <MessageSquare className="text-blue-600" size={26} />
          Communications Engine
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Broadcast SMS and Emails to parents, staff, and stakeholders.</p>
      </header>

      <div className="flex border-b border-slate-200/80 mb-6">
        <button
          onClick={() => setActiveTab('compose')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'compose' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Send size={16} /> Compose Broadcast
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <History size={16} /> Message History
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'compose' && (
          <motion.div
            key="compose"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
                <div className="mb-5 flex gap-3 border-b border-slate-100 pb-5">
                  <button
                    onClick={() => setMessageType('SMS')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all ${
                      messageType === 'SMS' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <MessageSquare size={16} /> SMS Text
                  </button>
                  <button
                    onClick={() => setMessageType('Email')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all ${
                      messageType === 'Email' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Mail size={16} /> Email
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Recipients Target</label>
                    <div className="relative">
                      <select 
                        value={recipientGroup}
                        onChange={e => setRecipientGroup(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 appearance-none"
                      >
                        <option value="all_parents">All Parents in School</option>
                        <optgroup label="Specific Classes">
                          <option value="P7">Primary 7 Parents</option>
                          <option value="P6">Primary 6 Parents</option>
                          <option value="P5">Primary 5 Parents</option>
                          <option value="ELEPHANT">Nursery - Elephant</option>
                        </optgroup>
                        <optgroup label="Financial Target">
                          <option value="fee_defaulters">Fee Defaulters (Balance &gt; 0)</option>
                        </optgroup>
                      </select>
                      <Users className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Message Content</label>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {messageBody.length} / 160 chars (1 SMS unit)
                      </span>
                    </div>
                    <textarea
                      value={messageBody}
                      onChange={e => setMessageBody(e.target.value)}
                      placeholder="Type your message here..."
                      rows={5}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 resize-none"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button onClick={() => setMessageBody(prev => prev + '{{student_name}}')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600 rounded">Insert {'{{student_name}}'}</button>
                      <button onClick={() => setMessageBody(prev => prev + '{{fee_balance}}')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600 rounded">Insert {'{{fee_balance}}'}</button>
                      <button onClick={() => setMessageBody(prev => prev + '{{class}}')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600 rounded">Insert {'{{class}}'}</button>
                    </div>
                  </div>

                  <button 
                    onClick={handleSendMessage}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2"
                  >
                    <Send size={18} /> Send {messageType} Broadcast
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Info/Summary */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MessageSquare size={16} /> SMS Gateway Status
                </h3>
                <div className="text-3xl font-black mb-1">4,250</div>
                <p className="text-xs text-slate-400 font-medium">SMS Units Remaining</p>
                
                <div className="mt-5 pt-5 border-t border-slate-700/50">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-slate-400">Gateway</span>
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={14}/> Connected</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-5 flex items-start gap-3">
                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  Messages exceeding 160 characters will be billed as 2 SMS units. Please keep notices concise to conserve school credits.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={searchHistory}
                  onChange={e => setSearchHistory(e.target.value)}
                  placeholder="Search message history..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
              <button 
                onClick={() => setFilterType(f => f === 'All' ? 'SMS' : f === 'SMS' ? 'Email' : 'All')}
                className={`p-2 border rounded-lg transition-colors ${filterType !== 'All' ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                title={`Filter: ${filterType}`}
              >
                <Filter size={16} />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
              {filteredHistory.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-medium text-sm">
                  No message history found.
                </div>
              ) : (
                filteredHistory.map(msg => (
                  <div key={msg.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
                    <div className={`p-2 rounded-xl mt-1 shrink-0 ${msg.type === 'SMS' ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-blue-600'}`}>
                      {msg.type === 'SMS' ? <MessageSquare size={16} /> : <Mail size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-800 text-sm truncate pr-4">To: {msg.recipientName}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                          {new Date(msg.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-100/50 p-2.5 rounded-lg border border-slate-100 mt-2 whitespace-pre-wrap">
                        {msg.body}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-[10px] font-semibold flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <CheckCircle2 size={10} /> {msg.status}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          Sent by: {msg.sentBy}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
