import React, { useState, useEffect } from 'react';
import { AppData, LibraryData } from '../types';
import dataManager from '../lib/db';
import { BookOpen, Book, BookUp } from 'lucide-react';

import LibraryBooksPanel from './LibraryBooksPanel';
import LibraryIssuePanel from './LibraryIssuePanel';
import { useAppStore } from "../store/useAppStore";

interface LibraryManagerProps {
  onUpdateLibrary?: (library: LibraryData) => void;
}

export default function LibraryManager({ onUpdateLibrary }: LibraryManagerProps) {
  const data = useAppStore(state => state.data)!;
  const initialLibrary: LibraryData = data.library || {
    books: [],
    issues: []
  };

  const [libraryState, setLibraryState] = useState<LibraryData>(initialLibrary);
  const [activeTab, setActiveTab] = useState<'catalog' | 'issues'>('catalog');

  useEffect(() => {
    if (data.library) {
      setLibraryState(data.library);
    }
  }, [data.library, onUpdateLibrary]);

  const updateStateAndPersist = (updatedLibrary: LibraryData) => {
    setLibraryState(updatedLibrary);
    dataManager.updateLibraryData(updatedLibrary);
    if (onUpdateLibrary) onUpdateLibrary(updatedLibrary);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Title & Status Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600 rounded-2xl shadow-lg shadow-rose-500/30 text-white">
              <BookOpen size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">Library Management</h1>
              </div>
              <p className="text-xs text-slate-400">
                Catalog books, manage borrowing, and track overdue returns
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all font-bold text-sm min-w-[120px] ${
              activeTab === 'catalog' ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Book size={20} />
            Book Catalog
          </button>
          
          <button
            onClick={() => setActiveTab('issues')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all font-bold text-sm min-w-[120px] ${
              activeTab === 'issues' ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <BookUp size={20} />
            Issues & Returns
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {activeTab === 'catalog' && (
          <LibraryBooksPanel 
            libraryState={libraryState} 
            onUpdateLibrary={updateStateAndPersist} 
          />
        )}
        
        {activeTab === 'issues' && (
          <LibraryIssuePanel 
            libraryState={libraryState} 
            onUpdateLibrary={updateStateAndPersist} 
          />
        )}
      </div>
    </div>
  );
}
