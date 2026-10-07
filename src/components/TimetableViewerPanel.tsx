import { useAppStore } from "../store/useAppStore";
import React, { useState, useMemo } from 'react';
import { AppData, TimetableData, TimetableSlot } from '../types';
import { Calendar, Plus, Trash2, Clock, Pencil, X, Copy, AlertTriangle } from 'lucide-react';
import { ALL_CLASSES } from '../lib/defaults';

interface TimetableViewerPanelProps {
  timetableState: TimetableData;
  onUpdateTimetable: (data: TimetableData) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const DAY_COLORS: Record<string, string> = {
  Monday:    'bg-blue-50 border-blue-100 text-blue-800',
  Tuesday:   'bg-purple-50 border-purple-100 text-purple-800',
  Wednesday: 'bg-emerald-50 border-emerald-100 text-emerald-800',
  Thursday:  'bg-amber-50 border-amber-100 text-amber-800',
  Friday:    'bg-rose-50 border-rose-100 text-rose-800',
  Saturday:  'bg-slate-50 border-slate-200 text-slate-700',
};

const EMPTY_SLOT: Partial<TimetableSlot> = {
  dayOfWeek: 'Monday',
  startTime: '08:00',
  endTime: '09:00',
  subjectId: '',
  teacherId: '',
  roomId: '',
};

export default function TimetableViewerPanel({ timetableState, onUpdateTimetable }: TimetableViewerPanelProps) {
  const data = useAppStore(state => state.data)!;
  const [selectedClass, setSelectedClass] = useState<string>('P1');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingSlot, setEditingSlot] = useState<Partial<TimetableSlot>>(EMPTY_SLOT);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const availableClasses = ALL_CLASSES;
  const subjects = Array.from(new Set(Object.values(data.settings?.sections || {}).flatMap((s: any) => s.subjects || [])));
  const teachers = data.settings?.teachersList || [];

  const classSlots = useMemo(() => {
    return [...timetableState.slots.filter(s => s.classId === selectedClass)]
      .sort((a, b) => {
        const dayOrder = DAYS_OF_WEEK.indexOf(a.dayOfWeek as any) - DAYS_OF_WEEK.indexOf(b.dayOfWeek as any);
        if (dayOrder !== 0) return dayOrder;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [timetableState.slots, selectedClass]);

  const openAddModal = (day?: string) => {
    setEditingSlot({ ...EMPTY_SLOT, classId: selectedClass, dayOfWeek: (day as any) || 'Monday' });
    setModalMode('add');
  };

  const openEditModal = (slot: TimetableSlot) => {
    setEditingSlot({ ...slot });
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingSlot(EMPTY_SLOT);
  };

  const toast = (message: string, type = 'success') => {
    window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message, type } }));
  };

  // CREATE
  const handleSaveAdd = () => {
    if (!editingSlot.subjectId || !editingSlot.teacherId || !editingSlot.dayOfWeek) return;
    const newSlot: TimetableSlot = {
      id: 'slot-' + Date.now(),
      classId: editingSlot.classId || selectedClass,
      dayOfWeek: editingSlot.dayOfWeek as TimetableSlot['dayOfWeek'],
      startTime: editingSlot.startTime || '08:00',
      endTime: editingSlot.endTime || '09:00',
      subjectId: editingSlot.subjectId,
      teacherId: editingSlot.teacherId,
      roomId: editingSlot.roomId || '',
    };
    onUpdateTimetable({ ...timetableState, slots: [...timetableState.slots, newSlot] });
    toast('Timetable slot added!');
    closeModal();
  };

  // UPDATE
  const handleSaveEdit = () => {
    if (!editingSlot.id || !editingSlot.subjectId || !editingSlot.teacherId) return;
    const updated = timetableState.slots.map(s =>
      s.id === editingSlot.id
        ? {
            ...s,
            dayOfWeek: editingSlot.dayOfWeek as TimetableSlot['dayOfWeek'],
            startTime: editingSlot.startTime || s.startTime,
            endTime: editingSlot.endTime || s.endTime,
            subjectId: editingSlot.subjectId || s.subjectId,
            teacherId: editingSlot.teacherId || s.teacherId,
            roomId: editingSlot.roomId ?? s.roomId,
          }
        : s
    );
    onUpdateTimetable({ ...timetableState, slots: updated });
    toast('Slot updated successfully!');
    closeModal();
  };

  // DELETE
  const handleDeleteSlot = (id: string) => {
    onUpdateTimetable({ ...timetableState, slots: timetableState.slots.filter(s => s.id !== id) });
    setDeleteConfirmId(null);
    toast('Slot deleted.', 'info');
  };

  // DUPLICATE
  const handleDuplicateSlot = (slot: TimetableSlot) => {
    const duplicate: TimetableSlot = {
      ...slot,
      id: 'slot-dup-' + Date.now(),
    };
    onUpdateTimetable({ ...timetableState, slots: [...timetableState.slots, duplicate] });
    toast('Slot duplicated — edit times as needed.', 'info');
  };

  // CLEAR CLASS
  const handleClearClass = () => {
    if (!confirm(`Clear ALL timetable slots for ${selectedClass}? This cannot be undone.`)) return;
    onUpdateTimetable({ ...timetableState, slots: timetableState.slots.filter(s => s.classId !== selectedClass) });
    toast(`All slots cleared for ${selectedClass}.`, 'info');
  };

  const totalSlots = classSlots.length;
  const totalHours = classSlots.reduce((acc, s) => {
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    return acc + (eh * 60 + em - (sh * 60 + sm)) / 60;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm font-bold text-slate-700 whitespace-nowrap">Class:</label>
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 focus:ring-2 focus:ring-emerald-500 outline-none"
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
          >
            {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">{totalSlots} slots</span>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">{totalHours.toFixed(1)} hrs/wk</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalSlots > 0 && (
            <button
              onClick={handleClearClass}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
            >
              <Trash2 size={14} /> Clear All
            </button>
          )}
          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-emerald-700 transition-colors"
          >
            <Plus size={16} /> Add Slot
          </button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DAYS_OF_WEEK.map(day => {
          const slotsForDay = classSlots.filter(s => s.dayOfWeek === day);
          const colorClass = DAY_COLORS[day];
          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className={`border-b p-3 flex items-center justify-between ${colorClass}`}>
                <div>
                  <h4 className="font-black text-xs uppercase tracking-widest">{day}</h4>
                  <p className="text-[10px] opacity-60 mt-0.5">{slotsForDay.length} period{slotsForDay.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={() => openAddModal(day)}
                  className="p-1.5 rounded-lg bg-white/60 hover:bg-white transition-colors opacity-70 hover:opacity-100"
                  title={`Add slot for ${day}`}
                >
                  <Plus size={13} />
                </button>
              </div>

              <div className="p-2 flex-1 flex flex-col gap-2 min-h-[100px]">
                {slotsForDay.length === 0 ? (
                  <button
                    onClick={() => openAddModal(day)}
                    className="flex-1 flex flex-col items-center justify-center text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 transition-all rounded-xl py-6 gap-1 border-2 border-dashed border-slate-100 hover:border-emerald-200"
                  >
                    <Plus size={18} />
                    <span className="text-[10px] font-bold">Add Period</span>
                  </button>
                ) : (
                  slotsForDay.map(slot => {
                    const teacher = teachers.find((t: any) => t.id === slot.teacherId);
                    return (
                      <div key={slot.id} className={`relative group rounded-xl p-2.5 border text-xs transition-all ${colorClass}`}>
                        <div className="flex items-center gap-1 font-mono font-bold text-[10px] mb-1 opacity-60">
                          <Clock size={10} />
                          {slot.startTime} – {slot.endTime}
                        </div>
                        <div className="font-black text-sm leading-tight truncate">{slot.subjectId}</div>
                        <div className="text-[10px] opacity-60 mt-0.5 truncate">{(teacher as any)?.name || '—'}</div>
                        {slot.roomId && (
                          <div className="text-[9px] opacity-50 mt-0.5">📍 {slot.roomId}</div>
                        )}

                        {/* Hover Actions */}
                        <div className="absolute top-1.5 right-1.5 hidden group-hover:flex items-center gap-0.5 bg-white/95 rounded-lg shadow-sm p-0.5 z-10">
                          <button onClick={() => openEditModal(slot)} title="Edit" className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                            <Pencil size={11} />
                          </button>
                          <button onClick={() => handleDuplicateSlot(slot)} title="Duplicate" className="p-1 text-amber-500 hover:bg-amber-50 rounded">
                            <Copy size={11} />
                          </button>
                          <button onClick={() => setDeleteConfirmId(slot.id)} title="Delete" className="p-1 text-rose-500 hover:bg-rose-50 rounded">
                            <Trash2 size={11} />
                          </button>
                        </div>

                        {/* Inline Delete Confirm */}
                        {deleteConfirmId === slot.id && (
                          <div className="absolute inset-0 bg-white/97 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-2 z-20 p-2">
                            <AlertTriangle size={16} className="text-rose-500" />
                            <p className="text-[10px] font-bold text-slate-700 text-center">Delete this slot?</p>
                            <div className="flex gap-2">
                              <button onClick={() => setDeleteConfirmId(null)} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">Cancel</button>
                              <button onClick={() => handleDeleteSlot(slot.id)} className="px-2 py-1 bg-rose-500 text-white rounded text-[10px] font-bold">Delete</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {modalMode !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-xl">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="font-black text-sm">
                    {modalMode === 'add' ? 'Add New Timetable Slot' : 'Edit Timetable Slot'}
                  </h3>
                  <p className="text-slate-400 text-xs">{selectedClass}</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Day */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Day of Week *</label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={editingSlot.dayOfWeek || 'Monday'}
                  onChange={e => setEditingSlot({ ...editingSlot, dayOfWeek: e.target.value as TimetableSlot['dayOfWeek'] })}
                >
                  {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Start Time */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Start Time *</label>
                  <input
                    type="time"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={editingSlot.startTime || '08:00'}
                    onChange={e => setEditingSlot({ ...editingSlot, startTime: e.target.value })}
                  />
                </div>
                {/* End Time */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">End Time *</label>
                  <input
                    type="time"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={editingSlot.endTime || '09:00'}
                    onChange={e => setEditingSlot({ ...editingSlot, endTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Subject *</label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={editingSlot.subjectId || ''}
                  onChange={e => setEditingSlot({ ...editingSlot, subjectId: e.target.value })}
                >
                  <option value="">— Select Subject —</option>
                  {subjects.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
                </select>
              </div>

              {/* Teacher */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Teacher *</label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={editingSlot.teacherId || ''}
                  onChange={e => setEditingSlot({ ...editingSlot, teacherId: e.target.value })}
                >
                  <option value="">— Select Teacher —</option>
                  {(teachers as any[]).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              {/* Room */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Room / Location <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room 3, Science Lab, Library..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={editingSlot.roomId || ''}
                  onChange={e => setEditingSlot({ ...editingSlot, roomId: e.target.value })}
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex gap-3 justify-end bg-slate-50">
              <button onClick={closeModal} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-300">
                Cancel
              </button>
              <button
                onClick={modalMode === 'add' ? handleSaveAdd : handleSaveEdit}
                disabled={!editingSlot.subjectId || !editingSlot.teacherId}
                className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {modalMode === 'add' ? '+ Add Slot' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
