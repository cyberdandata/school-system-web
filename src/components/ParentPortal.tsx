import React, { useState } from 'react';
import { AppData, Learner } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Calendar, CreditCard, LogOut, MessageSquare, User, AlertCircle, ChevronRight, CheckCircle2, FileText, Bell } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";

interface Props {
  onExit: () => void;
}

export default function ParentPortal({ onExit }: Props) {
  const data = useAppStore(state => state.data)!;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authId, setAuthId] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'finances' | 'messages' | 'timetable'>('overview');
  
  const [activeLearner, setActiveLearner] = useState<Learner | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    // Simulate auth by finding a learner by ID or checking if they just entered "demo"
    const learner = data.learners.find(l => 
      l.id.toLowerCase() === authId.toLowerCase() || 
      l.unebUln?.toLowerCase() === authId.toLowerCase()
    );

    if (learner) {
      setActiveLearner(learner);
      setIsAuthenticated(true);
    } else if (authId.toLowerCase() === 'demo') {
      // Fallback for easy demoing
      if (data.learners.length > 0) {
        setActiveLearner(data.learners[0]);
        setIsAuthenticated(true);
      } else {
        setAuthError('No students found in database to demo.');
      }
    } else {
      setAuthError('Invalid Student ID or Phone Number. Try "demo".');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveLearner(null);
    setAuthId('');
  };

  // Find messages addressed to this parent
  const myMessages = (data.communications?.messages || []).filter(msg => 
    msg.recipientId === 'ALL_PARENTS' || 
    msg.recipientId === activeLearner?.classId ||
    msg.recipientId === activeLearner?.id
  );

  // Finances
  const myTransactions = (data.finances || []).filter(tx => tx.studentId === activeLearner?.id);
  const totalPaid = myTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const requiredFees = 450000; // Mock fixed term fee
  const balance = requiredFees - totalPaid;

  // Timetable
  const myTimetable = (data.timetable?.slots || []).filter(slot => slot.classId === activeLearner?.classId);

  // Latest Score
  const latestScore = data.scores[`${activeLearner?.id}|ES9`];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-600/30 mb-4 transform -rotate-6">
              <User size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{data.settings.shortName} Parent Portal</h1>
            <p className="text-slate-500 font-medium text-sm mt-2">Track your child's academic progress, fees, and school updates.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {authError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} />
                {authError}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Student ID or Parent Phone</label>
              <input 
                type="text" 
                value={authId}
                onChange={e => setAuthId(e.target.value)}
                placeholder="e.g. seeded_5 or demo"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
            >
              Access Portal
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={onExit} className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors underline decoration-slate-300 underline-offset-4">
              Return to Admin Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!activeLearner) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
              <User size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 leading-tight">Parent Portal</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{data.settings.schoolName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${activeLearner.id}&backgroundColor=e2e8f0`} alt="Avatar" className="w-6 h-6 rounded-full bg-white" />
              <span className="text-xs font-bold text-slate-700">{activeLearner.name}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Sign Out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Nav */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          {[
            { id: 'overview', icon: BookOpen, label: 'Overview' },
            { id: 'academics', icon: FileText, label: 'Academics & Reports' },
            { id: 'finances', icon: CreditCard, label: 'Fees & Finances' },
            { id: 'timetable', icon: Calendar, label: 'Class Timetable' },
            { id: 'messages', icon: Bell, label: 'School Notices', badge: myMessages.length }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : 'bg-transparent text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={activeTab === item.id ? 'text-blue-100' : 'text-slate-400'} />
                {item.label}
              </div>
              {item.badge ? (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === item.id ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                }`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                
                {/* Welcome Card */}
                <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <User size={120} />
                  </div>
                  <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-2">Hello, Parent!</h2>
                    <p className="text-blue-100 font-medium mb-8 max-w-md">Welcome to your dedicated portal. Here is a quick summary of {activeLearner.name}'s progress.</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                        <div className="text-[10px] uppercase tracking-wider text-blue-200 font-bold mb-1">Student</div>
                        <div className="font-bold truncate">{activeLearner.name}</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                        <div className="text-[10px] uppercase tracking-wider text-blue-200 font-bold mb-1">Class</div>
                        <div className="font-bold truncate">{activeLearner.classId}</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                        <div className="text-[10px] uppercase tracking-wider text-blue-200 font-bold mb-1">Fee Balance</div>
                        <div className={`font-bold truncate ${balance > 0 ? 'text-red-300' : 'text-emerald-300'}`}>
                          UGX {balance.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                        <div className="text-[10px] uppercase tracking-wider text-blue-200 font-bold mb-1">Attendance</div>
                        <div className="font-bold truncate">98%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Messages Widget */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-800">Recent Notices</h3>
                      <button onClick={() => setActiveTab('messages')} className="text-xs font-bold text-blue-600 hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                      {myMessages.slice(0, 3).map(msg => (
                        <div key={msg.id} className="flex gap-3">
                          <div className="mt-0.5"><MessageSquare size={16} className="text-slate-400" /></div>
                          <div>
                            <p className="text-sm font-medium text-slate-700 line-clamp-2 leading-relaxed">{msg.body}</p>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">
                              {new Date(msg.sentAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      {myMessages.length === 0 && <p className="text-sm text-slate-500 italic">No recent notices.</p>}
                    </div>
                  </div>

                  {/* Academic Snapshot Widget */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-800">Latest Grades</h3>
                      <button onClick={() => setActiveTab('academics')} className="text-xs font-bold text-blue-600 hover:underline">Full Report</button>
                    </div>
                    {latestScore ? (
                      <div className="space-y-3">
                        {Object.entries(latestScore).slice(0, 4).map(([subject, mark]) => (
                          <div key={subject} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-sm font-semibold text-slate-700">{subject}</span>
                            <span className="text-sm font-black text-slate-900 bg-white px-2 py-1 rounded shadow-xs border border-slate-200">{mark}%</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No grades published for this term yet.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'finances' && (
              <motion.div key="finances" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800">Fees & Finances</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Term Bill</p>
                    <p className="text-2xl font-black text-slate-800">UGX {requiredFees.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Paid</p>
                    <p className="text-2xl font-black text-emerald-600">UGX {totalPaid.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Outstanding Balance</p>
                    <p className={`text-2xl font-black ${balance > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                      UGX {balance.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="p-5 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Payment History</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {myTransactions.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm font-medium">No transactions found.</div>
                    ) : (
                      myTransactions.map(tx => (
                        <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div>
                            <p className="font-bold text-sm text-slate-800">{tx.description || tx.category}</p>
                            <p className="text-xs text-slate-500 mt-1">{new Date(tx.date).toLocaleDateString()} &bull; {tx.paymentMethod}</p>
                          </div>
                          <span className={`font-black text-sm ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {tx.type === 'income' ? '+' : '-'} UGX {tx.amount.toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'academics' && (
              <motion.div key="academics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800">Academic Report</h2>
                {latestScore ? (
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50">
                      <h3 className="font-bold text-slate-800">Term 3 Results</h3>
                    </div>
                    <div className="p-0">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                          <tr>
                            <th className="p-4 border-b border-slate-100">Subject</th>
                            <th className="p-4 border-b border-slate-100 text-right">Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {Object.entries(latestScore).map(([subject, mark]) => (
                            <tr key={subject} className="hover:bg-slate-50">
                              <td className="p-4 font-semibold text-slate-700">{subject}</td>
                              <td className="p-4 text-right font-black text-slate-900">{mark}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                    <p className="text-slate-500 font-medium">No academic records published yet.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div key="messages" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800">School Notices</h2>
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {myMessages.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm font-medium">No messages found.</div>
                    ) : (
                      myMessages.map(msg => (
                        <div key={msg.id} className="p-6 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-md tracking-wider uppercase border border-blue-100">
                              <Bell size={12} /> {msg.type}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {new Date(msg.sentAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed font-medium">
                            {msg.body}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'timetable' && (
              <motion.div key="timetable" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800">Class Timetable</h2>
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 overflow-x-auto">
                  {myTimetable.length === 0 ? (
                    <p className="text-center text-slate-500 py-8 text-sm">Timetable not yet configured for this class.</p>
                  ) : (
                    <div className="min-w-[600px] flex gap-4">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                        const daySlots = myTimetable.filter(s => s.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
                        return (
                          <div key={day} className="flex-1 bg-slate-50 rounded-xl border border-slate-100 p-3">
                            <h3 className="font-bold text-sm text-center text-slate-700 mb-4 pb-2 border-b border-slate-200/60">{day}</h3>
                            <div className="space-y-2">
                              {daySlots.map(slot => (
                                <div key={slot.id} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                                  <div className="text-[10px] font-bold text-blue-600 mb-1">{slot.startTime} - {slot.endTime}</div>
                                  <div className="font-bold text-xs text-slate-800">{slot.subjectId}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
