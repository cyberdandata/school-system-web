import React, { useState } from 'react';
import { AppData, Vendor, VendorInvoice, FinanceTransaction, BankAccount } from '../types';
import dataManager from '../lib/db';
import { Store, FileText, CheckCircle, Clock, Plus, Filter, Search, DollarSign, X } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";

const formatUGX = (amount: number) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB');
};


interface FinanceVendorsTabProps {
  }

export default function FinanceVendorsTab({  }: FinanceVendorsTabProps) {
  const data = useAppStore(state => state.data)!;
  const vendors = data.vendors || [];
  const invoices = data.vendorInvoices || [];
  const bankAccounts = data.bankAccounts || [];
  
  const [activeView, setActiveView] = useState<'vendors' | 'invoices'>('invoices');
  
  // Modals state
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [payInvoice, setPayInvoice] = useState<VendorInvoice | null>(null);

  // Calculate totals
  const totalPending = invoices.filter(i => i.status === 'Unpaid' || i.status === 'Partial').reduce((acc, curr) => acc + (curr.amount - (curr.amountPaid || 0)), 0);
  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amountPaid, 0);

  // Forms State
  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({ status: 'Active', balanceOwed: 0 });
  const [newInvoice, setNewInvoice] = useState<Partial<VendorInvoice>>({ status: 'Unpaid', amountPaid: 0 });
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [selectedBankId, setSelectedBankId] = useState<string>('');

  const handleAddVendor = () => {
    if (!newVendor.name || !newVendor.category) return;
    const vendor: Vendor = {
      id: 'VEN-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      name: newVendor.name,
      contactPerson: newVendor.contactPerson || '',
      phone: newVendor.phone || '',
      email: newVendor.email || '',
      category: newVendor.category,
      balanceOwed: 0,
      status: 'Active'
    };
    dataManager.updateVendors([...vendors, vendor]);
    setShowAddVendor(false);
    setNewVendor({ status: 'Active', balanceOwed: 0 });
  };

  const handleAddInvoice = () => {
    if (!newInvoice.vendorId || !newInvoice.amount || !newInvoice.invoiceNumber) return;
    const invoice: VendorInvoice = {
      id: 'INV-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      vendorId: newInvoice.vendorId,
      invoiceNumber: newInvoice.invoiceNumber,
      date: newInvoice.date || new Date().toISOString().split('T')[0],
      dueDate: newInvoice.dueDate || new Date().toISOString().split('T')[0],
      amount: Number(newInvoice.amount),
      amountPaid: 0,
      status: 'Unpaid',
      description: newInvoice.description || ''
    };
    
    // Update vendor balance
    const updatedVendors = vendors.map(v => v.id === invoice.vendorId ? { ...v, balanceOwed: v.balanceOwed + invoice.amount } : v);
    dataManager.updateVendors(updatedVendors);
    dataManager.updateVendorInvoices([...invoices, invoice]);
    setShowAddInvoice(false);
    setNewInvoice({ status: 'Unpaid', amountPaid: 0 });
  };

  const handlePayInvoice = () => {
    if (!payInvoice || paymentAmount <= 0 || !selectedBankId) return;
    
    const bank = bankAccounts.find(b => b.id === selectedBankId);
    if (!bank) return;

    // 1. Create Transaction
    const transaction: FinanceTransaction = {
      id: 'TRX-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toISOString(),
      type: 'expense',
      category: 'Accounts Payable',
      amount: paymentAmount,
      description: `Payment for Vendor Invoice ${payInvoice.invoiceNumber}`,
      paymentMethod: 'Bank Transfer',
      reference: payInvoice.invoiceNumber,
      recordedBy: 'System', // Ideally the logged in user
      status: 'completed',
      receiptNumber: 'PAY-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      bankAccountId: bank.id
    };

    // 2. Update Invoice
    const newAmountPaid = (payInvoice.amountPaid || 0) + paymentAmount;
    let newStatus: 'Unpaid' | 'Partial' | 'Paid' = 'Partial';
    if (newAmountPaid >= payInvoice.amount) {
      newStatus = 'Paid';
    }

    const updatedInvoices = invoices.map(inv => 
      inv.id === payInvoice.id 
        ? { ...inv, amountPaid: newAmountPaid, status: newStatus } 
        : inv
    );

    // 3. Update Vendor Balance
    const updatedVendors = vendors.map(v => 
      v.id === payInvoice.vendorId 
        ? { ...v, balanceOwed: Math.max(0, v.balanceOwed - paymentAmount) } 
        : v
    );

    // 4. Update Bank Balance
    const updatedBanks = bankAccounts.map(b => 
      b.id === bank.id ? { ...b, balance: b.balance - paymentAmount } : b
    );

    dataManager.updateVendors(updatedVendors);
    dataManager.updateVendorInvoices(updatedInvoices);
    dataManager.updateFinances([...(data.finances || []), transaction]);
    
    // settings need to be updated for bankAccounts
    // No settings to update for bankAccounts, it's on AppData
    // Instead update bank accounts on root. Wait, dataManager doesn't have updateBankAccounts. Let's just mutate AppData for now since we're in the app. Or saveToLocal.
    const currentData = dataManager.getData();
    currentData.bankAccounts = updatedBanks;
    dataManager.setData(currentData);

    setPayInvoice(null);
    setPaymentAmount(0);
    window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: 'Vendor invoice payment recorded successfully', type: 'success' }}));
  };

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Vendors</span>
          <div className="text-2xl font-black text-slate-800">{vendors.filter(v => v.status === 'Active').length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Pending Payables</span>
          <div className="text-2xl font-black text-rose-600">{formatUGX(totalPending)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Cleared Payables</span>
          <div className="text-2xl font-black text-emerald-600">{formatUGX(totalPaid)}</div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('invoices')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeView === 'invoices' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Vendor Invoices
          </button>
          <button
            onClick={() => setActiveView('vendors')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeView === 'vendors' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Vendor Directory
          </button>
        </div>
        <button 
          onClick={() => activeView === 'invoices' ? setShowAddInvoice(true) : setShowAddVendor(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold inline-flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={16} /> Add {activeView === 'invoices' ? 'Invoice' : 'Vendor'}
        </button>
      </div>
      
      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {activeView === 'invoices' ? (
          invoices.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <FileText className="mx-auto text-slate-300 w-12 h-12" />
              <h3 className="text-lg font-bold text-slate-800">No Invoices Found</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Manage accounts payable by recording vendor invoices here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">Inv Number</th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">Vendor</th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">Date</th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">Amount</th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">Balance</th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">Status</th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map(inv => {
                    const vendor = vendors.find(v => v.id === inv.vendorId);
                    const balance = inv.amount - (inv.amountPaid || 0);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-800">{inv.invoiceNumber}</td>
                        <td className="p-3 text-slate-600">{vendor?.name || 'Unknown'}</td>
                        <td className="p-3 text-slate-500 text-sm">{formatDate(inv.date)}</td>
                        <td className="p-3 font-medium text-slate-800">{formatUGX(inv.amount)}</td>
                        <td className="p-3 font-bold text-rose-600">{formatUGX(balance)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                            inv.status === 'Partial' ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {inv.status !== 'Paid' && (
                            <button 
                              onClick={() => {
                                setPayInvoice(inv);
                                setPaymentAmount(balance);
                              }}
                              className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Record Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          vendors.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <Store className="mx-auto text-slate-300 w-12 h-12" />
              <h3 className="text-lg font-bold text-slate-800">No Vendors Found</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Add service providers and suppliers to manage their accounts and billing.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">Vendor Name</th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">Category</th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">Contact</th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">Phone</th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">Balance Owed</th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-800">{v.name}</td>
                      <td className="p-3 text-slate-500 text-sm">{v.category}</td>
                      <td className="p-3 text-slate-600">{v.contactPerson}</td>
                      <td className="p-3 text-slate-600">{v.phone}</td>
                      <td className="p-3 font-bold text-rose-600">{formatUGX(v.balanceOwed)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${v.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {v.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Add Vendor Modal */}
      {showAddVendor && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Store size={18} className="text-blue-600"/> Add New Vendor
              </h3>
              <button onClick={() => setShowAddVendor(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Company/Vendor Name *</label>
                <input type="text" value={newVendor.name || ''} onChange={e => setNewVendor({...newVendor, name: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Category *</label>
                <select value={newVendor.category || ''} onChange={e => setNewVendor({...newVendor, category: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Select Category</option>
                  <option value="Food & Supplies">Food & Supplies</option>
                  <option value="Stationery & Office">Stationery & Office</option>
                  <option value="Maintenance & Repair">Maintenance & Repair</option>
                  <option value="Utilities & Services">Utilities & Services</option>
                  <option value="IT & Software">IT & Software</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Contact Person</label>
                  <input type="text" value={newVendor.contactPerson || ''} onChange={e => setNewVendor({...newVendor, contactPerson: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Phone</label>
                  <input type="text" value={newVendor.phone || ''} onChange={e => setNewVendor({...newVendor, phone: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button onClick={() => setShowAddVendor(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200">Cancel</button>
                <button onClick={handleAddVendor} className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50" disabled={!newVendor.name || !newVendor.category}>Add Vendor</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {showAddInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-blue-600"/> Record Vendor Invoice
              </h3>
              <button onClick={() => setShowAddInvoice(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Select Vendor *</label>
                <select value={newInvoice.vendorId || ''} onChange={e => setNewInvoice({...newInvoice, vendorId: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Choose a vendor...</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Invoice Number *</label>
                  <input type="text" value={newInvoice.invoiceNumber || ''} onChange={e => setNewInvoice({...newInvoice, invoiceNumber: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Amount (UGX) *</label>
                  <input type="number" value={newInvoice.amount || ''} onChange={e => setNewInvoice({...newInvoice, amount: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Invoice Date</label>
                  <input type="date" value={newInvoice.date || ''} onChange={e => setNewInvoice({...newInvoice, date: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Due Date</label>
                  <input type="date" value={newInvoice.dueDate || ''} onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Description / Notes</label>
                <textarea value={newInvoice.description || ''} onChange={e => setNewInvoice({...newInvoice, description: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none" placeholder="Details about this invoice..."></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button onClick={() => setShowAddInvoice(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200">Cancel</button>
                <button onClick={handleAddInvoice} className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50" disabled={!newInvoice.vendorId || !newInvoice.invoiceNumber || !newInvoice.amount}>Record Invoice</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay Invoice Modal */}
      {payInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-600"/> Pay Invoice #{payInvoice.invoiceNumber}
              </h3>
              <button onClick={() => setPayInvoice(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500 font-medium">Invoice Total:</span>
                  <span className="font-bold text-slate-800">{formatUGX(payInvoice.amount)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500 font-medium">Already Paid:</span>
                  <span className="font-bold text-emerald-600">{formatUGX(payInvoice.amountPaid || 0)}</span>
                </div>
                <div className="flex justify-between pt-2 mt-2 border-t border-slate-200">
                  <span className="text-slate-700 font-bold">Remaining Balance:</span>
                  <span className="font-black text-rose-600">{formatUGX(payInvoice.amount - (payInvoice.amountPaid || 0))}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Payment Amount (UGX) *</label>
                <input 
                  type="number" 
                  value={paymentAmount} 
                  onChange={e => setPaymentAmount(Number(e.target.value))} 
                  className="w-full border border-slate-200 rounded-lg p-2 text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
                  max={payInvoice.amount - (payInvoice.amountPaid || 0)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Pay From Bank Account *</label>
                <select 
                  value={selectedBankId} 
                  onChange={e => setSelectedBankId(e.target.value)} 
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Source Account...</option>
                  {bankAccounts.map(bank => (
                    <option key={bank.id} value={bank.id} disabled={bank.balance < paymentAmount}>
                      {bank.bankName} - {bank.accountNumber} (Balance: {formatUGX(bank.balance)})
                    </option>
                  ))}
                </select>
                {selectedBankId && bankAccounts.find(b => b.id === selectedBankId)?.balance < paymentAmount && (
                  <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                    Insufficient funds in this account.
                  </p>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button onClick={() => setPayInvoice(null)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200">Cancel</button>
                <button 
                  onClick={handlePayInvoice} 
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50" 
                  disabled={!selectedBankId || paymentAmount <= 0 || paymentAmount > (payInvoice.amount - (payInvoice.amountPaid || 0)) || (bankAccounts.find(b => b.id === selectedBankId)?.balance || 0) < paymentAmount}
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
