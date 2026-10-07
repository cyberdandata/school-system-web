import { useAppStore } from "../store/useAppStore";
import React, { useState, useEffect } from 'react';
import { AppData, TransportData, FinanceTransaction } from '../types';
import dataManager from '../lib/db';
import { Truck, Bus, Fuel, Wrench } from 'lucide-react';

import TransportFleetPanel from './TransportFleetPanel';
import TransportFuelPanel from './TransportFuelPanel';
import TransportMaintenancePanel from './TransportMaintenancePanel';

interface TransportManagerProps {
  onUpdateTransport?: (transport: TransportData) => void;
}

export default function TransportManager({ onUpdateTransport }: TransportManagerProps) {
  const data = useAppStore(state => state.data)!;
  const initialTransport: TransportData = data.transport || {
    vans: [],
    fuelLogs: [],
    maintenanceLogs: [],
    routes: [],
    allocations: []
  };

  const [transportState, setTransportState] = useState<TransportData>(initialTransport);
  const [activeTab, setActiveTab] = useState<'fleet' | 'fuel' | 'maintenance'>('fleet');

  useEffect(() => {
    if (data.transport) {
      setTransportState(data.transport);
    }
  }, [data.transport, onUpdateTransport]);

  const updateStateAndPersist = (updatedTransport: TransportData) => {
    setTransportState(updatedTransport);
    dataManager.updateTransportData(updatedTransport);
    if (onUpdateTransport) onUpdateTransport(updatedTransport);
  };

  const handleUpdateFinances = (finances: FinanceTransaction[]) => {
    dataManager.updateFinances(finances);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Title & Status Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 text-white">
              <Truck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">Transport &amp; Fleet Management</h1>
              </div>
              <p className="text-xs text-slate-400">
                Manage School Vans, Fuel Consumption, and Maintenance Schedules
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => setActiveTab('fleet')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all font-bold text-sm min-w-[120px] ${
              activeTab === 'fleet' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Bus size={20} />
            Fleet Directory
          </button>
          
          <button
            onClick={() => setActiveTab('fuel')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all font-bold text-sm min-w-[120px] ${
              activeTab === 'fuel' ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Fuel size={20} />
            Fuel &amp; Mileage
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all font-bold text-sm min-w-[120px] ${
              activeTab === 'maintenance' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Wrench size={20} />
            Service History
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {activeTab === 'fleet' && (
          <TransportFleetPanel 
            transportState={transportState} 
            onUpdateTransport={updateStateAndPersist} 
          />
        )}
        
        {activeTab === 'fuel' && (
          <TransportFuelPanel 
            transportState={transportState} 
            onUpdateTransport={updateStateAndPersist} 
            onUpdateFinances={handleUpdateFinances}
          />
        )}
        
        {activeTab === 'maintenance' && (
          <TransportMaintenancePanel 
            transportState={transportState} 
            onUpdateTransport={updateStateAndPersist} 
            onUpdateFinances={handleUpdateFinances}
          />
        )}
      </div>
    </div>
  );
}
