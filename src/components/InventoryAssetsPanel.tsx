import React, { useState } from 'react';
import { AppData, InventoryData, InventoryAsset } from '../types';
import { Package, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";

interface InventoryAssetsPanelProps {
  inventoryState: InventoryData;
  onUpdateInventory: (data: InventoryData) => void;
}

export default function InventoryAssetsPanel({ inventoryState, onUpdateInventory }: InventoryAssetsPanelProps) {
  const data = useAppStore(state => state.data)!;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<InventoryAsset>>({
    category: 'Furniture',
    condition: 'New',
    quantity: 1
  });

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.quantity || !newAsset.location) return;

    const asset: InventoryAsset = {
      id: 'asset-' + Date.now(),
      name: newAsset.name,
      category: newAsset.category as any,
      quantity: newAsset.quantity,
      condition: newAsset.condition as any,
      location: newAsset.location,
      assignedTo: newAsset.assignedTo,
      cost: newAsset.cost,
      purchaseDate: newAsset.purchaseDate,
      lastUpdated: new Date().toISOString()
    };

    onUpdateInventory({
      ...inventoryState,
      assets: [asset, ...inventoryState.assets]
    });

    setNewAsset({ category: 'Furniture', condition: 'New', quantity: 1 });
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this asset?')) {
      onUpdateInventory({
        ...inventoryState,
        assets: inventoryState.assets.filter(a => a.id !== id)
      });
    }
  };

  const getStaffOptions = () => {
    const teachers = data.settings?.teachersList?.map(t => ({ id: t.id, name: t.name })) || [];
    const nonTeaching = data.settings?.nonTeachingStaffList?.map(s => ({ id: s.id, name: s.name })) || [];
    return [...teachers, ...nonTeaching];
  };

  const staffOptions = getStaffOptions();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Package className="text-purple-600" />
          School Assets &amp; Inventory
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-purple-700 transition-colors"
        >
          <Plus size={16} />
          {showAddForm ? 'Cancel' : 'Add New Asset'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddAsset} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-700 border-b pb-2">Register New Asset</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Item Name / Description *</label>
              <input
                required
                type="text"
                placeholder="e.g. Dell Latitude 3420"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-purple-500"
                value={newAsset.name || ''}
                onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
              <select
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-purple-500"
                value={newAsset.category || 'Furniture'}
                onChange={e => setNewAsset({ ...newAsset, category: e.target.value as any })}
              >
                <option value="Furniture">Furniture (Desks, Chairs)</option>
                <option value="Electronics">Electronics (Laptops, Projectors)</option>
                <option value="Lab Equipment">Lab Equipment</option>
                <option value="Stationery">Stationery</option>
                <option value="Sports">Sports Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Quantity *</label>
              <input
                required
                type="number"
                min="1"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-purple-500"
                value={newAsset.quantity || 1}
                onChange={e => setNewAsset({ ...newAsset, quantity: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Condition</label>
              <select
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-purple-500"
                value={newAsset.condition || 'New'}
                onChange={e => setNewAsset({ ...newAsset, condition: e.target.value as any })}
              >
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Broken">Broken / Needs Repair</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Location *</label>
              <select
                required
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-purple-500"
                value={newAsset.location || ''}
                onChange={e => setNewAsset({ ...newAsset, location: e.target.value })}
              >
                <option value="">-- Select Location --</option>
                {(data.settings.assetLocations || []).map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              {(!data.settings.assetLocations || data.settings.assetLocations.length === 0) && (
                <p className="text-[10px] text-rose-500 mt-1">Please add locations in Settings first.</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Assigned To (Optional)</label>
              <select
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-purple-500"
                value={newAsset.assignedTo || ''}
                onChange={e => setNewAsset({ ...newAsset, assignedTo: e.target.value })}
              >
                <option value="">-- Unassigned --</option>
                {staffOptions.map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Estimated Cost (UGX)</label>
              <input
                type="number"
                min="0"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-purple-500"
                value={newAsset.cost || ''}
                onChange={e => setNewAsset({ ...newAsset, cost: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm">
              Save Asset
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">Item Description</th>
              <th className="p-4">Category</th>
              <th className="p-4">Location</th>
              <th className="p-4">Qty</th>
              <th className="p-4">Condition</th>
              <th className="p-4">Assigned To</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventoryState.assets.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">No assets have been recorded yet.</td>
              </tr>
            ) : (
              inventoryState.assets.map(asset => {
                const assignedStaff = staffOptions.find(s => s.id === asset.assignedTo);
                
                let conditionColor = 'bg-emerald-100 text-emerald-800';
                if (asset.condition === 'Fair') conditionColor = 'bg-amber-100 text-amber-800';
                if (asset.condition === 'Poor' || asset.condition === 'Broken') conditionColor = 'bg-rose-100 text-rose-800';

                return (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{asset.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">
                        {asset.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{asset.location}</td>
                    <td className="p-4 font-bold">{asset.quantity}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${conditionColor}`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {assignedStaff ? assignedStaff.name : <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(asset.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
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
