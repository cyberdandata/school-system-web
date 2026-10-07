import React, { useState, useMemo } from 'react';
import { BankAccount, BankTransfer, FinanceTransaction, AppData } from '../types';
import { Building2, Plus, ArrowLeftRight, Download, Printer, Search } from 'lucide-react';
import { dataManager } from '../lib/db';
import { useAppStore } from "../store/useAppStore";

interface Props {
  transactions: FinanceTransaction[];
}

export default function FinanceBankingTab({ transactions }: Props) {
  const data = useAppStore(state => state.data)!;
  const bankAccounts = data.bankAccounts || [];
  const bankTransfers = data.bankTransfers || [];

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showStatement, setShowStatement] = useState(false);

  // New Account State
  const [newAccName, setNewAccName] = useState('');
  const [newAccBank, setNewAccBank] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('');

  // Transfer State
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRef, setTransferRef] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);

  // Statement State
  const [stmtAccountId, setStmtAccountId] = useState('');
  const [stmtMonth, setStmtMonth] = useState(new Date().toISOString().slice(0, 7));

  // Compute Balances
  const accountBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    
    // Initial balances
    bankAccounts.forEach(acc => {
      balances[acc.id] = acc.initialBalance;
    });

    // Add Incomes, Subtract Expenses
    transactions.forEach(tx => {
      const accId = tx.bankAccountId || 'ba-main-cash'; // Fallback to Main Cash Box
      if (balances[accId] !== undefined) {
        if (tx.type === 'income') balances[accId] += tx.amount;
        if (tx.type === 'expense' || tx.type === 'refund') balances[accId] -= tx.amount;
      }
    });

    // Handle Transfers
    bankTransfers.forEach(tf => {
      if (balances[tf.fromAccountId] !== undefined) balances[tf.fromAccountId] -= tf.amount;
      if (balances[tf.toAccountId] !== undefined) balances[tf.toAccountId] += tf.amount;
    });

    return balances;
  }, [bankAccounts, transactions, bankTransfers]);

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const newAcc: BankAccount = {
      id: 'ba-' + Date.now().toString(36),
      name: newAccName,
      bankName: newAccBank,
      accountNumber: newAccNumber,
      initialBalance: Number(newAccBalance) || 0
    };
    dataManager.updateBankAccounts([...bankAccounts, newAcc]);
    setShowAddAccount(false);
    setNewAccName(''); setNewAccBank(''); setNewAccNumber(''); setNewAccBalance('');
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferFrom === transferTo) return alert("Cannot transfer to the same account");
    
    const newTransfer: BankTransfer = {
      id: 'bt-' + Date.now().toString(36),
      date: transferDate,
      fromAccountId: transferFrom,
      toAccountId: transferTo,
      amount: Number(transferAmount),
      reference: transferRef,
      recordedBy: dataManager.getLocalActiveUser()?.name || 'Admin'
    };

    dataManager.updateBankTransfers([...bankTransfers, newTransfer]);
    setShowTransfer(false);
    setTransferAmount(''); setTransferRef('');
  };

  // Statement Generation Logic
  const statementLedger = useMemo(() => {
    if (!stmtAccountId) return [];
    
    const ledgerEntries: any[] = [];
    
    // Add transactions for this account in the month
    transactions.filter(tx => 
      (tx.bankAccountId === stmtAccountId || (!tx.bankAccountId && stmtAccountId === 'ba-main-cash')) &&
      tx.date.startsWith(stmtMonth)
    ).forEach(tx => {
      ledgerEntries.push({
        date: tx.date,
        type: tx.type === 'income' ? 'CREDIT' : 'DEBIT',
        description: tx.description || tx.category,
        reference: tx.receiptNo || '-',
        amount: tx.amount
      });
    });

    // Add transfers OUT
    bankTransfers.filter(tf => tf.fromAccountId === stmtAccountId && tf.date.startsWith(stmtMonth)).forEach(tf => {
      ledgerEntries.push({
        date: tf.date,
        type: 'DEBIT',
        description: `Transfer to ${bankAccounts.find(b => b.id === tf.toAccountId)?.name}`,
        reference: tf.reference,
        amount: tf.amount
      });
    });

    // Add transfers IN
    bankTransfers.filter(tf => tf.toAccountId === stmtAccountId && tf.date.startsWith(stmtMonth)).forEach(tf => {
      ledgerEntries.push({
        date: tf.date,
        type: 'CREDIT',
        description: `Transfer from ${bankAccounts.find(b => b.id === tf.fromAccountId)?.name}`,
        reference: tf.reference,
        amount: tf.amount
      });
    });

    // Sort by date
    return ledgerEntries.sort((a, b) => a.date.localeCompare(b.date));
  }, [stmtAccountId, stmtMonth, transactions, bankTransfers, bankAccounts]);

  const printStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Banking & Cash Ledgers</h2>
          <p className="text-slate-500">Manage bank accounts, cash boxes, and internal transfers.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowTransfer(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-all">
            <ArrowLeftRight size={18} />
            Internal Transfer
          </button>
          <button onClick={() => setShowStatement(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all">
            <Download size={18} />
            Generate Statement
          </button>
          <button onClick={() => setShowAddAccount(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md">
            <Plus size={18} />
            Add Account
          </button>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
        {bankAccounts.map(acc => (
          <div key={acc.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Building2 size={24} />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                {acc.bankName}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">{acc.name}</h3>
            <p className="text-sm text-slate-500 mb-6 font-mono">{acc.accountNumber}</p>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Balance</p>
              <p className="text-3xl font-black text-slate-800">UGX {(accountBalances[acc.id] || 0).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800">Add New Bank Account</h2>
            </div>
            <form onSubmit={handleAddAccount} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Account Alias / Name</label>
                <input required value={newAccName} onChange={e => setNewAccName(e.target.value)} type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. Centenary - Main" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bank Name</label>
                <input required value={newAccBank} onChange={e => setNewAccBank(e.target.value)} type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. Centenary Bank" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Account Number</label>
                <input required value={newAccNumber} onChange={e => setNewAccNumber(e.target.value)} type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="Account Number" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Opening Balance (UGX)</label>
                <input required value={newAccBalance} onChange={e => setNewAccBalance(e.target.value)} type="number" min="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="0" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddAccount(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md transition-all">Save Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTransfer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800">Record Internal Transfer</h2>
            </div>
            <form onSubmit={handleTransfer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                <input required value={transferDate} onChange={e => setTransferDate(e.target.value)} type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">From Account</label>
                <select required value={transferFrom} onChange={e => setTransferFrom(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                  <option value="">Select Account</option>
                  {bankAccounts.map(a => <option key={a.id} value={a.id}>{a.name} (Bal: {accountBalances[a.id]?.toLocaleString()})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">To Account</label>
                <select required value={transferTo} onChange={e => setTransferTo(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                  <option value="">Select Account</option>
                  {bankAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (UGX)</label>
                <input required value={transferAmount} onChange={e => setTransferAmount(e.target.value)} type="number" min="1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reference / Note</label>
                <input required value={transferRef} onChange={e => setTransferRef(e.target.value)} type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" placeholder="e.g. Deposit cash to bank" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowTransfer(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-all">Record Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStatement && (
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50 p-4 print:p-0 print:bg-white overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl min-h-screen my-8 shadow-2xl overflow-hidden print:shadow-none print:my-0 print:rounded-none">
            
            {/* Toolbar */}
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center print:hidden sticky top-0 z-10">
              <div className="flex gap-4 items-center">
                <select value={stmtAccountId} onChange={e => setStmtAccountId(e.target.value)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-bold text-sm">
                  <option value="">Select Account...</option>
                  {bankAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <input type="month" value={stmtMonth} onChange={e => setStmtMonth(e.target.value)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-bold text-sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={printStatement} disabled={!stmtAccountId} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2">
                  <Printer size={16} /> Print Ledger
                </button>
                <button onClick={() => setShowStatement(false)} className="px-4 py-2 bg-white text-slate-700 border border-slate-300 font-bold rounded-lg hover:bg-slate-50">
                  Close
                </button>
              </div>
            </div>

            {/* Statement Paper */}
            {stmtAccountId ? (
              <div className="p-10 bg-white">
                <div className="text-center mb-8 pb-8 border-b-2 border-slate-900">
                  <h1 className="text-3xl font-black text-slate-900 mb-2">{data.settings?.schoolName || 'OTEC Edu-AI'}</h1>
                  <h2 className="text-xl font-bold text-slate-600 uppercase tracking-widest">Bank Statement Ledger</h2>
                  <p className="text-slate-500 mt-2">Period: {new Date(stmtMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                </div>

                <div className="flex justify-between mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Details</p>
                    <p className="text-lg font-black text-slate-800">{bankAccounts.find(a => a.id === stmtAccountId)?.name}</p>
                    <p className="text-slate-600">{bankAccounts.find(a => a.id === stmtAccountId)?.bankName} • {bankAccounts.find(a => a.id === stmtAccountId)?.accountNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ending Balance</p>
                    <p className="text-2xl font-black text-slate-800">UGX {accountBalances[stmtAccountId]?.toLocaleString()}</p>
                  </div>
                </div>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-800">
                      <th className="py-3 text-sm font-black text-slate-800 uppercase tracking-wider">Date</th>
                      <th className="py-3 text-sm font-black text-slate-800 uppercase tracking-wider">Description</th>
                      <th className="py-3 text-sm font-black text-slate-800 uppercase tracking-wider">Ref</th>
                      <th className="py-3 text-sm font-black text-slate-800 uppercase tracking-wider text-right">Debit (Out)</th>
                      <th className="py-3 text-sm font-black text-slate-800 uppercase tracking-wider text-right">Credit (In)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statementLedger.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 font-medium italic">No transactions found for this period.</td>
                      </tr>
                    ) : (
                      statementLedger.map((entry, idx) => (
                        <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="py-3 text-sm text-slate-600">{entry.date}</td>
                          <td className="py-3 text-sm font-medium text-slate-800">{entry.description}</td>
                          <td className="py-3 text-sm text-slate-500">{entry.reference}</td>
                          <td className="py-3 text-sm font-mono text-slate-800 text-right">
                            {entry.type === 'DEBIT' ? entry.amount.toLocaleString() : '-'}
                          </td>
                          <td className="py-3 text-sm font-mono text-slate-800 text-right">
                            {entry.type === 'CREDIT' ? entry.amount.toLocaleString() : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-slate-400 print:hidden">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="font-medium text-lg">Select an account to view ledger</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
