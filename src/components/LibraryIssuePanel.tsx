import React, { useState, useMemo } from 'react';
import { AppData, LibraryData, LibraryIssue } from '../types';
import { BookUp, Plus, ArrowDownToLine, RefreshCcw, AlertTriangle } from 'lucide-react';
import GlobalFilterBar from './ui/GlobalFilterBar';
import { useAppStore } from "../store/useAppStore";

interface LibraryIssuePanelProps {
  libraryState: LibraryData;
  onUpdateLibrary: (data: LibraryData) => void;
}

export default function LibraryIssuePanel({ libraryState, onUpdateLibrary }: LibraryIssuePanelProps) {
  const data = useAppStore(state => state.data)!;
  const [showIssueForm, setShowIssueForm] = useState(false);

  // === Filters ===
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const resetFilters = () => { setSearch(''); setFilterType('All'); setFilterStatus('All'); setFilterDateFrom(''); setFilterDateTo(''); };
  const [newIssue, setNewIssue] = useState<Partial<LibraryIssue>>({
    borrowerType: 'Learner',
    issueDate: new Date().toISOString().split('T')[0]
  });

  const handleIssueBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssue.bookId || !newIssue.borrowerId || !newIssue.dueDate) return;

    // Find the book and borrower
    const book = libraryState.books.find(b => b.id === newIssue.bookId);
    let borrowerName = 'Unknown';
    if (newIssue.borrowerType === 'Learner') {
      const learner = data.learners.find(l => l.id === newIssue.borrowerId);
      if (learner) borrowerName = `${learner.name} (${learner.cls})`;
    } else if (newIssue.borrowerType === 'Teacher') {
      const teacher = data.settings?.teachersList?.find(t => t.id === newIssue.borrowerId);
      if (teacher) borrowerName = teacher.name;
    } else {
      const staff = data.settings?.nonTeachingStaffList?.find(s => s.id === newIssue.borrowerId);
      if (staff) borrowerName = `${staff.name} (${staff.department})`;
    }

    if (!book || book.availableQuantity <= 0) {
      alert("Book not available.");
      return;
    }

    const issue: LibraryIssue = {
      id: 'issue-' + Date.now(),
      bookId: newIssue.bookId,
      borrowerId: newIssue.borrowerId,
      borrowerType: newIssue.borrowerType as any,
      borrowerName,
      issueDate: newIssue.issueDate || new Date().toISOString(),
      dueDate: newIssue.dueDate,
      status: 'Issued'
    };

    // Update library state
    const updatedBooks = libraryState.books.map(b => 
      b.id === book.id ? { ...b, availableQuantity: b.availableQuantity - 1 } : b
    );

    onUpdateLibrary({
      ...libraryState,
      books: updatedBooks,
      issues: [issue, ...libraryState.issues]
    });

    setNewIssue({ borrowerType: 'Learner', issueDate: new Date().toISOString().split('T')[0] });
    setShowIssueForm(false);
  };

  const handleReturnBook = (issueId: string) => {
    const issue = libraryState.issues.find(i => i.id === issueId);
    if (!issue) return;

    // Check overdue
    const today = new Date();
    const dueDate = new Date(issue.dueDate);
    let fineAmount = 0;
    if (today > dueDate) {
      const diffTime = Math.abs(today.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = diffDays * 500; // 500 UGX per day late
    }

    const confirmMessage = fineAmount > 0 
      ? `Book is overdue by ${Math.ceil(fineAmount/500)} days. Fine: UGX ${fineAmount}. Confirm Return?` 
      : `Confirm return of this book?`;

    if (confirm(confirmMessage)) {
      const updatedIssues = libraryState.issues.map(i => 
        i.id === issueId ? { ...i, status: 'Returned' as const, returnDate: today.toISOString(), fineAmount } : i
      );

      const updatedBooks = libraryState.books.map(b => 
        b.id === issue.bookId ? { ...b, availableQuantity: b.availableQuantity + 1 } : b
      );

      onUpdateLibrary({
        ...libraryState,
        books: updatedBooks,
        issues: updatedIssues
      });
    }
  };

  const getBorrowerOptions = () => {
    if (newIssue.borrowerType === 'Learner') {
      return data.learners.map(l => ({ id: l.id, label: `${l.name} (${l.cls})` }));
    } else if (newIssue.borrowerType === 'Teacher') {
      return data.settings?.teachersList?.map(t => ({ id: t.id, label: t.name })) || [];
    } else {
      return data.settings?.nonTeachingStaffList?.map(s => ({ id: s.id, label: `${s.name} (${s.department})` })) || [];
    }
  };

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return libraryState.issues.filter(issue => {
      const book = libraryState.books.find(b => b.id === issue.bookId);
      const isOverdue = issue.status === 'Issued' && new Date() > new Date(issue.dueDate);
      const effectiveStatus = issue.status === 'Returned' ? 'Returned' : isOverdue ? 'Overdue' : 'Issued';
      const matchSearch = search === '' ||
        (issue.borrowerName || '').toLowerCase().includes(search.toLowerCase()) ||
        (book?.title || '').toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'All' || issue.borrowerType === filterType;
      const matchStatus = filterStatus === 'All' || effectiveStatus === filterStatus;
      const issueDate = issue.issueDate ? issue.issueDate.substring(0, 10) : '';
      const matchFrom = filterDateFrom === '' || issueDate >= filterDateFrom;
      const matchTo = filterDateTo === '' || issueDate <= filterDateTo;
      return matchSearch && matchType && matchStatus && matchFrom && matchTo;
    });
  }, [libraryState.issues, libraryState.books, search, filterType, filterStatus, filterDateFrom, filterDateTo]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BookUp className="text-teal-600" />
          Book Issues &amp; Returns
        </h2>
        <button
          onClick={() => setShowIssueForm(!showIssueForm)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-teal-700 transition-colors"
        >
          <Plus size={16} />
          {showIssueForm ? 'Cancel' : 'Issue a Book'}
        </button>
      </div>

      {showIssueForm && (
        <form onSubmit={handleIssueBook} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-700 border-b pb-2">Issue Book</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Select Book *</label>
              <select
                required
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-teal-500"
                value={newIssue.bookId || ''}
                onChange={e => setNewIssue({ ...newIssue, bookId: e.target.value })}
              >
                <option value="">-- Choose Book --</option>
                {libraryState.books.filter(b => b.availableQuantity > 0).map(b => (
                  <option key={b.id} value={b.id}>{b.title} (Available: {b.availableQuantity})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Borrower Type</label>
              <select
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-teal-500"
                value={newIssue.borrowerType || 'Learner'}
                onChange={e => setNewIssue({ ...newIssue, borrowerType: e.target.value as any, borrowerId: '' })}
              >
                <option value="Learner">Learner</option>
                <option value="Teacher">Teacher</option>
                <option value="Non-Teaching Staff">Non-Teaching Staff</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Select Borrower *</label>
              <select
                required
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-teal-500"
                value={newIssue.borrowerId || ''}
                onChange={e => setNewIssue({ ...newIssue, borrowerId: e.target.value })}
              >
                <option value="">-- Choose {newIssue.borrowerType} --</option>
                {getBorrowerOptions().map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Issue Date</label>
              <input
                required
                type="date"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-teal-500"
                value={newIssue.issueDate || ''}
                onChange={e => setNewIssue({ ...newIssue, issueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Due Date *</label>
              <input
                required
                type="date"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-teal-500"
                value={newIssue.dueDate || ''}
                onChange={e => setNewIssue({ ...newIssue, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm">
              Issue Book
            </button>
          </div>
        </form>
      )}

      {/* === Filters === */}
      <GlobalFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by borrower name or book title..."
        showTypeFilter
        selectedType={filterType}
        onTypeChange={setFilterType}
        typeLabel="Borrower Type"
        typeOptions={[
          { label: 'Learners', value: 'Learner' },
          { label: 'Teachers', value: 'Teacher' },
          { label: 'Non-Teaching Staff', value: 'Non-Teaching Staff' },
        ]}
        showStatusFilter
        selectedStatus={filterStatus}
        onStatusChange={setFilterStatus}
        statusOptions={[
          { label: 'All Statuses', value: 'All' },
          { label: 'Currently Issued', value: 'Issued' },
          { label: 'Overdue', value: 'Overdue' },
          { label: 'Returned', value: 'Returned' },
        ]}
        showDateFilter
        dateFrom={filterDateFrom}
        dateTo={filterDateTo}
        onDateFromChange={setFilterDateFrom}
        onDateToChange={setFilterDateTo}
        onReset={resetFilters}
      />

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">Book Title</th>
              <th className="p-4">Borrower</th>
              <th className="p-4">Issue Date</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredIssues.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  {libraryState.issues.length === 0 ? 'No books have been issued yet.' : 'No issues match the current filters.'}
                </td>
              </tr>
            ) : (
              filteredIssues.map(issue => {
                const book = libraryState.books.find(b => b.id === issue.bookId);
                const isOverdue = issue.status === 'Issued' && new Date() > new Date(issue.dueDate);
                return (
                  <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{book ? book.title : 'Deleted Book'}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">{issue.borrowerName}</span>
                        <span className="text-[10px] text-slate-400">{issue.borrowerType}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{new Date(issue.issueDate).toLocaleDateString()}</td>
                    <td className={`p-4 font-semibold ${isOverdue ? 'text-rose-600 flex items-center gap-1' : 'text-slate-600'}`}>
                      {isOverdue && <AlertTriangle size={14} />}
                      {new Date(issue.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {issue.status === 'Returned' ? (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold">Returned</span>
                      ) : isOverdue ? (
                        <span className="px-2 py-1 bg-rose-100 text-rose-800 rounded-lg text-[10px] font-bold">Overdue</span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-[10px] font-bold">Issued</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {issue.status === 'Issued' ? (
                        <button 
                          onClick={() => handleReturnBook(issue.id)} 
                          className="px-3 py-1.5 bg-slate-900 text-white rounded font-semibold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1 ml-auto"
                        >
                          <ArrowDownToLine size={14} />
                          Return
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs font-semibold">
                          {issue.fineAmount ? `Fine: UGX ${issue.fineAmount}` : 'No Fine'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
