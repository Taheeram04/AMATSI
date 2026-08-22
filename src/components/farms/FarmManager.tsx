import React, { useState } from 'react';
import { FarmPlot, CropType } from '../../types';
import { Sprout, MapPin, Plus, Trash2, Check, Layers, Droplet, ShieldCheck, X } from 'lucide-react';
import { CROP_PROFILES } from '../../data/mockData';

interface FarmManagerProps {
  plots: FarmPlot[];
  selectedPlot: FarmPlot;
  onSelectPlot: (plot: FarmPlot) => void;
  onAddPlot: (newPlot: FarmPlot) => void;
  onDeletePlot: (id: string) => void;
}

export const FarmManager: React.FC<FarmManagerProps> = ({
  plots,
  selectedPlot,
  onSelectPlot,
  onAddPlot,
  onDeletePlot
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Kano Plains, Kisumu County');
  const [areaAcres, setAreaAcres] = useState(0.25);
  const [crop, setCrop] = useState<CropType>('managu');
  const [soilType, setSoilType] = useState<FarmPlot['soilType']>('Black Cotton Soil (Vertisol)');
  const [irrigationMethod, setIrrigationMethod] = useState<FarmPlot['irrigationMethod']>('Drip System (Amatsi)');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlot: FarmPlot = {
      id: `plot-${Date.now()}`,
      name: name || `Plot ${plots.length + 1} (${CROP_PROFILES[crop].localName})`,
      location,
      areaAcres: Number(areaAcres),
      crop,
      cropStage: 'Vegetative (Active Growth)',
      plantingDate: new Date().toISOString().split('T')[0],
      soilType,
      irrigationMethod,
      currentMoisture: 60,
      targetMoisture: 70,
      sensorId: `KIJANI-NODE-0${plots.length + 45}`,
      pumpFuelPerWeekKes: 350
    };
    onAddPlot(newPlot);
    setShowAddModal(false);
    setName('');
  };

  return (
    <div className="space-y-6 font-futura">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E5E2DE] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#16A34A]/10 text-[#15803D] border border-[#16A34A]/20 uppercase tracking-widest">
              Field Allocations
            </span>
            <h2 className="text-xl font-extrabold text-[#1A1817]">
              Lake Victoria Basin Farm Plots
            </h2>
          </div>
          <p className="text-xs text-[#615B57] mt-1">
            Real-time telemetry and customized water dosage per crop and soil profile
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Plot</span>
        </button>
      </div>

      {/* Grid of Plots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plots.map((plot) => {
          const isSelected = plot.id === selectedPlot.id;
          const cropInfo = CROP_PROFILES[plot.crop] || CROP_PROFILES.kales;

          return (
            <div
              key={plot.id}
              className={`rounded-3xl border p-6 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#16A34A] ring-2 ring-[#16A34A]/20 shadow-md'
                  : 'bg-white border-[#E5E2DE] hover:border-[#D8D4CE]'
              }`}
            >
              <div>
                {/* Top Badge */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[#F3F1EE]">
                  <div className="flex items-center gap-1.5 text-xs text-[#615B57]">
                    <MapPin className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    <span className="truncate">{plot.location}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#FAF9F7] text-[#1A1817] px-2 py-0.5 rounded-md border border-[#E5E2DE]">
                    {plot.sensorId}
                  </span>
                </div>

                {/* Plot Title */}
                <div className="py-3.5">
                  <h3 className="font-extrabold text-[#1A1817] text-lg mb-2">{plot.name}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#16A34A]/10 text-[#15803D]">
                      {cropInfo.name} ({cropInfo.localName})
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FAF9F7] text-[#1A1817] border border-[#E5E2DE]">
                      {plot.areaAcres} Acres
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                      {plot.soilType}
                    </span>
                  </div>
                </div>

                {/* Plot Specs */}
                <div className="bg-[#FAF9F7] rounded-2xl p-4 border border-[#E5E2DE] text-xs space-y-2 my-2">
                  <div className="flex justify-between">
                    <span className="text-[#615B57]">Irrigation System:</span>
                    <strong className="text-[#1A1817]">{plot.irrigationMethod}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#615B57]">Growth Stage:</span>
                    <span className="text-[#15803D] font-bold">{plot.cropStage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#615B57]">Weekly Pumping Fuel:</span>
                    <span className="text-[#1A1817] font-bold">KES {plot.pumpFuelPerWeekKes}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#F3F1EE] flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectPlot(plot)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#16A34A] text-white shadow-xs'
                      : 'bg-[#FAF9F7] hover:bg-[#F3F1EE] text-[#1A1817] border border-[#E5E2DE]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'Active Plot' : 'Monitor Plot'}</span>
                </button>

                {plots.length > 1 && (
                  <button
                    onClick={() => onDeletePlot(plot.id)}
                    className="p-2.5 rounded-xl text-[#A8A29D] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Plot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Plot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1817]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E5E2DE] max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-[#F3F1EE]">
              <div>
                <h3 className="font-extrabold text-[#1A1817] text-lg">Add Lake Victoria Basin Plot</h3>
                <p className="text-xs text-[#615B57]">Register plot to connect with Kijani Box mesh node</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-[#615B57] hover:bg-[#FAF9F7] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1817] mb-1">Plot Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nyando Riverbank Bed 3"
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F7] border border-[#E5E2DE] rounded-xl text-xs text-[#1A1817] focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1A1817] mb-1">Crop Type</label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value as CropType)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F7] border border-[#E5E2DE] rounded-xl text-xs text-[#1A1817] focus:outline-none focus:border-[#16A34A]"
                  >
                    <option value="kales">Sukuma Wiki (Kales)</option>
                    <option value="managu">Managu (African Nightshade)</option>
                    <option value="spiderplant">Dek / Mitoo (Spider Plant)</option>
                    <option value="tomatoes">Nyanya (Tomatoes)</option>
                    <option value="maize">Oduma (Maize)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1817] mb-1">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    max="5"
                    value={areaAcres}
                    onChange={(e) => setAreaAcres(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F7] border border-[#E5E2DE] rounded-xl text-xs text-[#1A1817] focus:outline-none focus:border-[#16A34A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1817] mb-1">Soil Class</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value as FarmPlot['soilType'])}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F7] border border-[#E5E2DE] rounded-xl text-xs text-[#1A1817] focus:outline-none focus:border-[#16A34A]"
                >
                  <option value="Black Cotton Soil (Vertisol)">Black Cotton Soil (Vertisol - High Cracking)</option>
                  <option value="Clay Loam">Clay Loam (Moderate Infiltration)</option>
                  <option value="Sandy Loam (Lake Shore)">Sandy Loam (Lake Shore Area)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E2DE] text-xs font-bold text-[#615B57] hover:bg-[#FAF9F7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Save & Initialize Sensor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
