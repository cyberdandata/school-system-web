import React, { useState, useRef, useEffect } from 'react';
import { AppData } from '../types';
import { UserSquare2, GraduationCap, Wallet, HeartPulse, Scale, BedDouble, Truck, Trophy, AlertTriangle, Search, X } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";

interface Student360Props {
  }

export default function Student360({  }: Student360Props) {
  const data = useAppStore(state => state.data)!;
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const learner = data.learners.find(l => l.id === selectedLearnerId);
  const filteredLearners = data.learners.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.cls.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Aggregate Data Collections
  const learnerFinances = data.finances?.filter(f => f.category === 'Fee Payment' && f.description.includes(learner?.name || '')) || [];
  const learnerDiscipline = data.discipline?.incidents.filter(i => i.learnerId === selectedLearnerId) || [];
  const learnerClinicVisits = data.clinic?.visits.filter(v => v.learnerId === selectedLearnerId) || [];
  const learnerClinicRecord = data.clinic?.records[selectedLearnerId];
  
  const learnerHostelAlloc = data.hostel?.allocations.find(a => a.learnerId === selectedLearnerId);
  const hostelDorm = learnerHostelAlloc ? data.hostel?.dormitories.find(d => d.id === learnerHostelAlloc.dormitoryId) : null;
  const hostelRoom = hostelDorm ? hostelDorm.rooms.find(r => r.id === learnerHostelAlloc?.roomId) : null;

  const learnerTransportAlloc = data.transport?.allocations.find(a => a.learnerId === selectedLearnerId);
  const transportRoute = learnerTransportAlloc ? data.transport?.routes.find(r => r.id === learnerTransportAlloc.routeId) : null;

  const learnerClubs = data.extracurricular?.memberships.filter(m => m.learnerId === selectedLearnerId) || [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/30 text-white">
            <UserSquare2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Student 360° Profile</h1>
            <p className="text-xs text-slate-400">Comprehensive cross-module view for a single learner</p>
          </div>
        </div>
        <div className="flex-1 lg:max-w-md relative" ref={dropdownRef}>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search for a learner by name or class..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full bg-slate-800 border border-slate-700 text-white pl-10 pr-10 py-3 rounded-xl focus:ring-indigo-500 font-semibold"
            />
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLearnerId('');
                }} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2">
              {filteredLearners.length > 0 ? (
                filteredLearners.map(l => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setSelectedLearnerId(l.id);
                      setSearchTerm(l.name);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-indigo-600 hover:text-white text-slate-200 border-b border-slate-700/50 last:border-0 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold">{l.name}</div>
                      <div className="text-[11px] text-slate-400 group-hover:text-indigo-200">{l.cls}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400 text-sm">No learners found matching "{searchTerm}"</div>
              )}
            </div>
          )}
        </div>
      </div>

      {!learner ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center text-slate-500">
          <UserSquare2 size={48} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">No Learner Selected</h2>
          <p>Please select a learner from the dropdown above to view their comprehensive profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Core Profile & Logistics */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <UserSquare2 size={100} />
              </div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl border-2 border-indigo-200">
                  {learner.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{learner.name}</h2>
                  <p className="text-indigo-600 font-bold text-sm">{learner.cls}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm relative z-10">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Gender</span>
                  <span className="font-semibold text-slate-700">{learner.sex}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Age</span>
                  <span className="font-semibold text-slate-700">{learner.age || 'N/A'}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                </div>
              </div>
            </div>

            {/* Logistics (Hostel & Transport) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <BedDouble size={18} className="text-purple-500" /> Logistics
              </h3>
              
              <div className="mb-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Boarding Status</div>
                {hostelDorm && hostelRoom ? (
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                    <div className="font-bold text-purple-900">{hostelDorm.name}</div>
                    <div className="text-sm text-purple-700">{hostelRoom.name}</div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic">Day Scholar / Not Allocated</div>
                )}
              </div>

              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Transport</div>
                {transportRoute ? (
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 flex items-start gap-3">
                    <Truck size={20} className="text-amber-500 mt-0.5" />
                    <div>
                      <div className="font-bold text-amber-900">{transportRoute.name}</div>
                      <div className="text-xs text-amber-700 font-semibold">{learnerTransportAlloc?.stopName}</div>
                      <div className="text-xs text-amber-600/80 mt-1 capitalize">{learnerTransportAlloc?.direction} Route</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic">No school transport allocated</div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Health, Discipline & Extracurriculars */}
          <div className="space-y-6">
            {/* Health & Clinic */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <HeartPulse size={18} className="text-rose-500" /> Health Profile
              </h3>
              
              {learnerClinicRecord?.allergies || learnerClinicRecord?.chronicConditions ? (
                <div className="bg-rose-50 rounded-lg p-3 border border-rose-100 mb-4">
                  <div className="flex items-center gap-2 text-rose-700 font-bold mb-1">
                    <AlertTriangle size={14} /> Medical Alerts
                  </div>
                  {learnerClinicRecord.allergies && <div className="text-xs text-rose-600"><span className="font-semibold">Allergies:</span> {learnerClinicRecord.allergies}</div>}
                  {learnerClinicRecord.chronicConditions && <div className="text-xs text-rose-600 mt-1"><span className="font-semibold">Notes:</span> {learnerClinicRecord.chronicConditions}</div>}
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic mb-4">No critical medical alerts.</div>
              )}

              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Clinic Visits</div>
              <div className="space-y-2">
                {learnerClinicVisits.length === 0 ? (
                  <div className="text-xs text-slate-500">No recent visits recorded.</div>
                ) : (
                  learnerClinicVisits.slice(0, 3).map(v => (
                    <div key={v.id} className="text-xs border-l-2 border-rose-200 pl-2 py-1">
                      <span className="font-semibold text-slate-700">{new Date(v.date).toLocaleDateString()}</span> - {v.symptoms}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Discipline */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <Scale size={18} className="text-orange-500" /> Conduct Log
              </h3>
              
              <div className="space-y-3">
                {learnerDiscipline.length === 0 ? (
                  <div className="text-sm text-slate-500 italic">No disciplinary incidents recorded.</div>
                ) : (
                  learnerDiscipline.slice(0, 4).map(d => (
                    <div key={d.id} className={`p-2 rounded-lg border text-xs ${d.type === 'Merit' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                      <div className="flex justify-between font-bold mb-1">
                        <span>{d.type === 'Merit' ? '+' : '-'}{d.points} Points</span>
                        <span>{new Date(d.date).toLocaleDateString()}</span>
                      </div>
                      <div>{d.description}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Extracurriculars */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-500" /> Extracurriculars
              </h3>
              <div className="flex flex-wrap gap-2">
                {learnerClubs.length === 0 ? (
                  <div className="text-sm text-slate-500 italic">Not a member of any clubs.</div>
                ) : (
                  learnerClubs.map(m => {
                    const club = data.extracurricular?.clubs.find(c => c.id === m.clubId);
                    return (
                      <div key={m.id} className="bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1 flex items-center gap-2">
                        <span className="font-bold text-yellow-800 text-xs">{club?.name}</span>
                        {m.role !== 'Member' && (
                          <span className="bg-yellow-200 text-yellow-900 text-[10px] px-1.5 rounded-full font-bold">{m.role}</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Column 3: Academics & Finance */}
          <div className="space-y-6">
            {/* Academics Snapshot */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <GraduationCap size={18} className="text-blue-500" /> Academic Snapshot
              </h3>
              <div className="text-sm text-slate-500 italic text-center py-6">
                (Full report cards available in the Report Cards module)
              </div>
              {/* Note: Pulling specific grades requires knowing the active exam set. 
                  For a 360 view, we just link or show a high level aggregate if available */}
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: 'Navigate to the Report Cards module to generate and print full terminal reports.', type: 'info' } }))}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
              >
                View Full Report Card
              </button>
            </div>

            {/* Finances */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <Wallet size={18} className="text-emerald-500" /> Financial Summary
              </h3>
              
              <div className="mb-5 grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Fees Due</div>
                  <div className="font-bold text-slate-800 text-sm">
                    UGX {((learner.feeTuition || 0) + (learner.feeBoarding || 0) + (learner.feeVan || 0)).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Fees Paid</div>
                  <div className="font-bold text-emerald-600 text-sm">
                    UGX {learnerFinances.reduce((sum, f) => sum + f.amount, 0).toLocaleString()}
                  </div>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200/60 mt-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Current Balance</div>
                  <div className={`font-black text-lg ${
                    Number(learner.outstandingBalance) > 0 ? 'text-rose-600' :
                    Number(learner.outstandingBalance) < 0 ? 'text-emerald-600' : 'text-slate-800'
                  }`}>
                    {Number(learner.outstandingBalance) < 0 ? '-' : ''}UGX {Math.abs(Number(learner.outstandingBalance || 0)).toLocaleString()}
                    {Number(learner.outstandingBalance) < 0 && <span className="text-xs font-semibold ml-2 text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">(Credit)</span>}
                  </div>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Payments</div>
              <div className="space-y-2">
                {learnerFinances.length === 0 ? (
                  <div className="text-sm text-slate-500 italic">No fee payments recorded.</div>
                ) : (
                  learnerFinances.map(f => (
                    <div key={f.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                      <div>
                        <div className="font-semibold text-slate-700">{new Date(f.date).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[150px]">{f.description}</div>
                      </div>
                      <div className="font-bold text-emerald-600">
                        + {f.amount.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
