import { useAppStore } from "../store/useAppStore";
import React, { useState, useMemo } from 'react';
import { AppData, CalendarEvent, SchoolSettings } from '../types';
import dataManager from '../lib/db';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Printer, 
  Clock, 
  Tag, 
  AlertTriangle, 
  Check, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

interface AcademicCalendarProps {
  onUpdateSettings: (newSettings: SchoolSettings) => void;
}

export default function AcademicCalendar({ onUpdateSettings }: AcademicCalendarProps) {
  const data = useAppStore(state => state.data)!;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Form State for Adding Event
  const [showAddModal, setShowAddModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState<'event' | 'deadline' | 'holiday'>('event');
  const [eventDesc, setEventDesc] = useState('');

  const events = useMemo(() => data.settings.calendarEvents || [], [data.settings.calendarEvents]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar Math
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    const cells: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean; events: CalendarEvent[] }> = [];
    
    // Fill padding of previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        events: events.filter(e => e.date === dateStr)
      });
    }
    
    // Fill active month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        events: events.filter(e => e.date === dateStr)
      });
    }
    
    // Fill next month padding up to 42 cells (6 rows)
    const totalCells = 42;
    const nextDaysNeeded = totalCells - cells.length;
    for (let d = 1; d <= nextDaysNeeded; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        events: events.filter(e => e.date === dateStr)
      });
    }
    
    return cells;
  }, [year, month, events]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setEventDate(dateStr);
    setShowAddModal(true);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) {
      alert('Event title and date are required.');
      return;
    }

    const newEvent: CalendarEvent = {
      id: 'EV' + Date.now().toString(36),
      title: eventTitle.trim(),
      date: eventDate,
      type: eventType,
      description: eventDesc.trim() || undefined
    };

    const updatedEvents = [...events, newEvent];
    onUpdateSettings({
      ...data.settings,
      calendarEvents: updatedEvents
    });

    dataManager.addActivityLog(
      'settings_modified', 
      `Added school calendar event: "${eventTitle}" scheduled for ${eventDate}.`
    );

    // Reset Form
    setEventTitle('');
    setEventDesc('');
    setEventType('event');
    setShowAddModal(false);
  };

  const handleDeleteEvent = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove the event: "${title}"?`)) return;
    
    const updatedEvents = events.filter(ev => ev.id !== id);
    onUpdateSettings({
      ...data.settings,
      calendarEvents: updatedEvents
    });

    dataManager.addActivityLog(
      'settings_modified', 
      `Deleted school calendar event: "${title}".`
    );
  };

  const activeTermEvents = useMemo(() => {
    // Return all events sorted chronologically
    return [...events].sort((a, b) => a.date.localeCompare(b.date));
  }, [events]);

  const getEventBadgeColor = (type: 'event' | 'deadline' | 'holiday') => {
    switch (type) {
      case 'holiday':
        return 'bg-emerald-50 text-emerald-800 border-emerald-100';
      case 'deadline':
        return 'bg-amber-50 text-amber-800 border-amber-100';
      case 'event':
      default:
        return 'bg-blue-50 text-blue-800 border-blue-100';
    }
  };

  const getDotColor = (type: 'event' | 'deadline' | 'holiday') => {
    switch (type) {
      case 'holiday':
        return 'bg-emerald-500';
      case 'deadline':
        return 'bg-amber-500';
      case 'event':
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 print:bg-white print:p-0">
      
      {/* Header Panel */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">Academic Planner &amp; Term Calendar</h2>
            <p className="text-slate-500 text-xs mt-1">
              Organize term milestones, scheduling deadlines, and school holidays on a centralized interactive planner.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={13} />
              <span>Print Schedule</span>
            </button>
            <button
              onClick={() => {
                setEventDate(new Date().toISOString().slice(0, 10));
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-600/15 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Schedule Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Event List on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Interactive Calendar Body (Col-span-8) */}
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarIcon className="text-blue-600" size={18} />
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
                {monthNames[month]} {year}
              </h3>
            </div>
            
            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={handleToday}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                Today
              </button>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-white rounded-md text-slate-600 hover:text-slate-950 transition-all cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-white rounded-md text-slate-600 hover:text-slate-950 transition-all cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 border-t border-l border-slate-100 rounded-lg overflow-hidden">
            {calendarCells.map((cell, idx) => {
              const isToday = cell.dateStr === new Date().toISOString().slice(0, 10);
              
              return (
                <div
                  key={`${cell.dateStr}-${idx}`}
                  onClick={() => handleDateClick(cell.dateStr)}
                  className={`min-h-[90px] p-2 border-r border-b border-slate-100 flex flex-col justify-between transition-all cursor-pointer group hover:bg-slate-50/75 relative ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/40 text-slate-400'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${
                      isToday 
                        ? 'bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-black shadow-md shadow-blue-500/10' 
                        : cell.isCurrentMonth ? 'text-slate-950' : 'text-slate-400'
                    }`}>
                      {cell.dayNum}
                    </span>
                    <Plus 
                      size={10} 
                      className="text-slate-300 group-hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100" 
                    />
                  </div>

                  {/* Micro-events inside the cell */}
                  <div className="space-y-1 mt-1.5 flex-1 flex flex-col justify-end">
                    {cell.events.slice(0, 3).map(ev => (
                      <div
                        key={ev.id}
                        className={`px-1 py-0.5 rounded text-[9px] font-bold border truncate ${getEventBadgeColor(ev.type)}`}
                        title={`${ev.title}${ev.description ? `: ${ev.description}` : ''}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {cell.events.length > 3 && (
                      <span className="text-[8px] font-extrabold text-slate-400 block text-right">
                        +{cell.events.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Color Legend */}
          <div className="flex flex-wrap gap-4 pt-3 text-[10px] font-bold text-slate-500 uppercase border-t border-slate-50">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>School Events</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Deadlines / Milestones</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Holidays</span>
            </span>
          </div>
        </div>

        {/* Chronological Milestone List View (Col-span-4) */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="text-blue-600" size={16} />
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">Chronological Schedule</h3>
              </div>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded-md">
                {activeTermEvents.length} Entries
              </span>
            </div>

            {activeTermEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold space-y-2">
                <span className="text-2xl block">📅</span>
                <p>No events scheduled. Click any date on the calendar to log an entry.</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1.5 custom-scrollbar">
                {activeTermEvents.map(ev => (
                  <div 
                    key={ev.id} 
                    className="p-3 bg-slate-50/60 hover:bg-slate-50 border border-slate-200/50 rounded-2xl flex justify-between items-start gap-4 group transition-all"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 border text-[9px] font-black uppercase tracking-wider rounded-md ${getEventBadgeColor(ev.type)}`}>
                          {ev.type}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {new Date(ev.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-950 break-words leading-tight">{ev.title}</h4>
                      {ev.description && (
                        <p className="text-[10px] text-slate-500 font-semibold leading-normal">{ev.description}</p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleDeleteEvent(ev.id, ev.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer print:hidden"
                      title="Delete event"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Informational Notice Board card */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-slate-200 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/15">
              <Sparkles size={16} className="text-blue-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Active Term Countdown</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span>School Term:</span>
                <span className="text-white font-extrabold">{data.settings.term} ({data.settings.year})</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span>Academic Year:</span>
                <span className="text-white font-extrabold">{data.settings.year} Calendar</span>
              </div>
              
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[10.5px] font-semibold text-slate-300 leading-relaxed">
                📢 All dates recorded here are saved directly into the school master database and will be synced instantly for other staff members.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in print:hidden">
          <form 
            onSubmit={handleAddEvent}
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-up text-left"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <span className="text-xl">📅</span>
              <div>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">Schedule Termly Event</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Define school milestones &amp; deadlines</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End of Term Grading Day"
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Event Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-950 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Classification</label>
                  <select
                    value={eventType}
                    onChange={e => setEventType(e.target.value as 'event' | 'deadline' | 'holiday')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                  >
                    <option value="event">School Event</option>
                    <option value="deadline">Academic Milestone</option>
                    <option value="holiday">Official Holiday</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Description / Notes (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Provide supplementary details, times, or guidelines..."
                  value={eventDesc}
                  onChange={e => setEventDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                Publish Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
