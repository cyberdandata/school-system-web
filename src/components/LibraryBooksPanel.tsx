import React, { useState } from 'react';
import { AppData, LibraryData, LibraryBook } from '../types';
import { Book, Plus, Trash2, Edit2 } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";

interface LibraryBooksPanelProps {
  libraryState: LibraryData;
  onUpdateLibrary: (data: LibraryData) => void;
}

export default function LibraryBooksPanel({ libraryState, onUpdateLibrary }: LibraryBooksPanelProps) {
  const data = useAppStore(state => state.data)!;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBook, setNewBook] = useState<Partial<LibraryBook>>({ category: 'Fiction', totalQuantity: 1, availableQuantity: 1 });

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) return;

    const book: LibraryBook = {
      id: 'book-' + Date.now(),
      title: newBook.title,
      author: newBook.author,
      isbn: newBook.isbn,
      category: newBook.category || 'Fiction',
      totalQuantity: newBook.totalQuantity || 1,
      availableQuantity: newBook.totalQuantity || 1, // Start fully available
      addedBy: 'Admin'
    };

    onUpdateLibrary({
      ...libraryState,
      books: [book, ...libraryState.books]
    });
    setNewBook({ category: 'Fiction', totalQuantity: 1, availableQuantity: 1 });
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this book from the catalog?')) {
      onUpdateLibrary({
        ...libraryState,
        books: libraryState.books.filter(b => b.id !== id)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Book className="text-rose-600" />
          Library Catalog
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-rose-700 transition-colors"
        >
          <Plus size={16} />
          {showAddForm ? 'Cancel' : 'Add New Book'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddBook} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-700 border-b pb-2">Register New Book</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="md:col-span-2 xl:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Book Title *</label>
              <input
                required
                type="text"
                placeholder="e.g. Things Fall Apart"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-rose-500"
                value={newBook.title || ''}
                onChange={e => setNewBook({ ...newBook, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Author *</label>
              <input
                required
                type="text"
                placeholder="e.g. Chinua Achebe"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-rose-500"
                value={newBook.author || ''}
                onChange={e => setNewBook({ ...newBook, author: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
              <select
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-rose-500"
                value={newBook.category || ''}
                onChange={e => setNewBook({ ...newBook, category: e.target.value })}
              >
                <option value="">-- Select Category --</option>
                {(data.settings.libraryCategories || []).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {(!data.settings.libraryCategories || data.settings.libraryCategories.length === 0) && (
                <p className="text-[10px] text-rose-500 mt-1">Please add book categories in Settings first.</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Total Quantity</label>
              <input
                required
                type="number"
                min="1"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-rose-500"
                value={newBook.totalQuantity || 1}
                onChange={e => setNewBook({ ...newBook, totalQuantity: parseInt(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2 xl:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">ISBN (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 978-0385474542"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-rose-500"
                value={newBook.isbn || ''}
                onChange={e => setNewBook({ ...newBook, isbn: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm">
              Save Book to Catalog
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Author</th>
              <th className="p-4">Category</th>
              <th className="p-4">ISBN</th>
              <th className="p-4">Stock (Avail/Total)</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {libraryState.books.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">The catalog is currently empty.</td>
              </tr>
            ) : (
              libraryState.books.map(book => {
                const stockColor = book.availableQuantity === 0 ? 'text-rose-600' : 'text-emerald-600';
                return (
                  <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{book.title}</td>
                    <td className="p-4 text-slate-600">{book.author}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">
                        {book.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 text-xs font-mono">{book.isbn || 'N/A'}</td>
                    <td className="p-4 font-bold">
                      <span className={stockColor}>{book.availableQuantity}</span>
                      <span className="text-slate-400"> / {book.totalQuantity}</span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleDelete(book.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
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
