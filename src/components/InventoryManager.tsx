import React, { useState, useEffect } from 'react';
import { AppData, InventoryData } from '../types';
import dataManager from '../lib/db';
import { Archive, Package } from 'lucide-react';

import InventoryAssetsPanel from './InventoryAssetsPanel';
import { useAppStore } from "../store/useAppStore";

interface InventoryManagerProps {
  onUpdateInventory?: (inventory: InventoryData) => void;
}

export default function InventoryManager({ onUpdateInventory }: InventoryManagerProps) {
  const data = useAppStore(state => state.data)!;
  const initialInventory: InventoryData = data.inventory || {
    assets: []
  };

  const [inventoryState, setInventoryState] = useState<InventoryData>(initialInventory);
  const [activeTab, setActiveTab] = useState<'assets'>('assets');

  useEffect(() => {
    if (data.inventory) {
      setInventoryState(data.inventory);
    }
  }, [data.inventory, onUpdateInventory]);

  const updateStateAndPersist = (updatedInventory: InventoryData) => {
    setInventoryState(updatedInventory);
    dataManager.updateInventoryData(updatedInventory);
    if (onUpdateInventory) onUpdateInventory(updatedInventory);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Title & Status Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-600 rounded-2xl shadow-lg shadow-purple-500/30 text-white">
              <Archive size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">Inventory &amp; Asset Management</h1>
              </div>
              <p className="text-xs text-slate-400">
                Track school property, furniture, electronics, and lab equipment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all font-bold text-sm min-w-[120px] ${
              activeTab === 'assets' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Package size={20} />
            Asset Register
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {activeTab === 'assets' && (
          <InventoryAssetsPanel 
            inventoryState={inventoryState} 
            onUpdateInventory={updateStateAndPersist} 
          />
        )}
      </div>
    </div>
  );
}
