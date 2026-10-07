import React, { useState, useMemo } from 'react';
import { AppData, ProcurementRequest, InventoryAsset } from '../types';
import { activeUser } from '../lib/db';
import GlobalFilterBar from './GlobalFilterBar';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  PackageCheck,
  FileText,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from "../store/useAppStore";

interface ProcurementManagerProps {
  onUpdateProcurement: (procurement: any) => void;
  onUpdateInventory?: (inventory: any) => void;
}

export default function ProcurementManager({ onUpdateProcurement, onUpdateInventory }: ProcurementManagerProps) {
  const data = useAppStore(state => state.data)!;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled'>('All');
  
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newEstimatedCost, setNewEstimatedCost] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const [fulfillmentModal, setFulfillmentModal] = useState<ProcurementRequest | null>(null);
  const [inventoryCategory, setInventoryCategory] = useState<'Furniture' | 'Electronics' | 'Lab Equipment' | 'Stationery' | 'Sports' | 'Other'>('Stationery');
  const [inventoryLocation, setInventoryLocation] = useState('');
  
  const requests = data.procurement?.requests || [];
  const isAdminOrFinance = activeUser?.role === 'superuser' || activeUser?.role === 'accountant';

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = req.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            req.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            req.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }, [requests, searchTerm, statusFilter]);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newEstimatedCost || !newDepartment) return;

    const newReq: ProcurementRequest = {
      id: `req-${Date.now()}`,
      itemName: newItemName,
      quantity: newQuantity,
      estimatedCost: Number(newEstimatedCost),
      department: newDepartment,
      notes: newNotes,
      requestedBy: activeUser?.username || 'Unknown Staff',
      requestDate: new Date().toISOString(),
      status: 'Pending'
    };

    onUpdateProcurement({
      requests: [...requests, newReq]
    });

    setShowNewRequestForm(false);
    setNewItemName('');
    setNewQuantity(1);
    setNewEstimatedCost('');
    setNewDepartment('');
    setNewNotes('');
  };

  const handleUpdateStatus = (reqId: string, newStatus: 'Approved' | 'Rejected') => {
    if (!isAdminOrFinance) return;
    const updated = requests.map(r => {
      if (r.id === reqId) {
        return { 
          ...r, 
          status: newStatus,
          approvedBy: activeUser?.username
        };
      }
      return r;
    });
    onUpdateProcurement({ requests: updated });
  };

  const handleFulfill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fulfillmentModal) return;

    // First update the request status
    const updatedRequests = requests.map(r => {
      if (r.id === fulfillmentModal.id) {
        return {
          ...r,
          status: 'Fulfilled' as const,
          fulfilledDate: new Date().toISOString()
        };
      }
      return r;
    });
    onUpdateProcurement({ requests: updatedRequests });

    // Next optionally push to inventory
    if (onUpdateInventory && inventoryLocation) {
      const assets = data.inventory?.assets || [];
      const newAsset: InventoryAsset = {
        id: `ast-${Date.now()}`,
        name: fulfillmentModal.itemName,
        category: inventoryCategory,
        quantity: fulfillmentModal.quantity,
        condition: 'New',
        location: inventoryLocation,
        purchaseDate: new Date().toISOString(),
        cost: fulfillmentModal.estimatedCost,
        lastUpdated: new Date().toISOString()
      };
      onUpdateInventory({ assets: [...assets, newAsset] });
    }

    setFulfillmentModal(null);
    setInventoryLocation('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Procurement & Requisitions</h2>
          <p className="text-sm text-slate-500 mt-1">Manage purchase requests, approvals, and inventory receiving.</p>
        </div>
        <button
          onClick={() => setShowNewRequestForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>New Request</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Requests</div>
            <div className="text-2xl font-black text-slate-800">{requests.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
            <FileText size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pending</div>
            <div className="text-2xl font-black text-amber-600">{requests.filter(r => r.status === 'Pending').length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Approved</div>
            <div className="text-2xl font-black text-blue-600">{requests.filter(r => r.status === 'Approved').length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <CheckCircle size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fulfilled</div>
            <div className="text-2xl font-black text-emerald-600">{requests.filter(r => r.status === 'Fulfilled').length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <PackageCheck size={20} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <GlobalFilterBar 
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search requests..."
          filterOptions={[
            { id: 'All', label: 'All Status' },
            { id: 'Pending', label: 'Pending' },
            { id: 'Approved', label: 'Approved' },
            { id: 'Rejected', label: 'Rejected' },
            { id: 'Fulfilled', label: 'Fulfilled' }
          ]}
          activeFilter={statusFilter}
          onFilterChange={(f) => setStatusFilter(f as any)}
        />
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Item & Dept</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Est. Cost</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Requester</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShoppingCart size={32} className="text-slate-300" />
                      <p className="font-semibold text-slate-600">No requests found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{req.itemName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{req.department}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{req.quantity}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{data.settings.currency} {req.estimatedCost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{req.requestedBy}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(req.requestDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        req.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        req.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                        req.status === 'Fulfilled' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === 'Pending' && isAdminOrFinance && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'Approved')}
                              className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                              className="px-3 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-lg transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {req.status === 'Approved' && isAdminOrFinance && (
                          <button 
                            onClick={() => setFulfillmentModal(req)}
                            className="px-3 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <PackageCheck size={14} /> Fulfill
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {showNewRequestForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <ShoppingCart size={18} className="text-blue-600" />
                  New Procurement Request
                </h3>
                <button onClick={() => setShowNewRequestForm(false)} className="text-slate-400 hover:text-slate-600">
                  <AlertCircle size={20} className="rotate-45" />
                </button>
              </div>
              <form onSubmit={handleCreateRequest} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g., Whiteboard Markers"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Est. Total Cost</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newEstimatedCost}
                      onChange={(e) => setNewEstimatedCost(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    required
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Select Department</option>
                    <option value="Administration">Administration</option>
                    <option value="Science Dept">Science Dept</option>
                    <option value="Arts Dept">Arts Dept</option>
                    <option value="Sports">Sports</option>
                    <option value="Library">Library</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-24 resize-none"
                    placeholder="Provide justification or specifications..."
                  ></textarea>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewRequestForm(false)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fulfillment Modal */}
      <AnimatePresence>
        {fulfillmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <PackageCheck size={18} className="text-emerald-600" />
                  Fulfill Request
                </h3>
                <button onClick={() => setFulfillmentModal(null)} className="text-slate-400 hover:text-slate-600">
                  <AlertCircle size={20} className="rotate-45" />
                </button>
              </div>
              <form onSubmit={handleFulfill} className="p-5 space-y-4">
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm">
                  You are about to mark <strong>{fulfillmentModal.quantity}x {fulfillmentModal.itemName}</strong> as fulfilled.
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-sm font-bold text-slate-800 mb-3">Add to Asset Inventory (Optional)</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Asset Category</label>
                      <select
                        value={inventoryCategory}
                        onChange={(e) => setInventoryCategory(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        <option value="Furniture">Furniture</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Lab Equipment">Lab Equipment</option>
                        <option value="Stationery">Stationery</option>
                        <option value="Sports">Sports</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={inventoryLocation}
                        onChange={(e) => setInventoryLocation(e.target.value)}
                        placeholder="e.g. Main Store Room, Science Lab"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Leave location blank to skip adding to inventory.</p>
                    </div>
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillmentModal(null)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                  >
                    Confirm Fulfillment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
