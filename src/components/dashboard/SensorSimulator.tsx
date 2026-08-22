import React from 'react';
import { CropType, SoilReading, TankReading, WeatherReading } from '../../types';
import { Sliders, Zap, Sparkles, Cpu } from 'lucide-react';

interface SensorSimulatorProps {
  soil: SoilReading;
  weather: WeatherReading;
  tank: TankReading;
  crop: CropType;
  onUpdateSoilMoisture: (val: number) => void;
  onUpdateRainProbability: (val: number) => void;
  onUpdateTankLiters: (val: number) => void;
  onUpdateEvaporationRate: (val: number) => void;
  onApplyPreset: (presetName: string) => void;
}

export const SensorSimulator: React.FC<SensorSimulatorProps> = ({
  soil,
  weather,
  tank,
  crop,
  onUpdateSoilMoisture,
  onUpdateRainProbability,
  onUpdateTankLiters,
  onUpdateEvaporationRate,
  onApplyPreset
}) => {
  return (
    <div className="bg-white rounded-3xl border border-[#E5E2DE] p-6 shadow-xs font-futura">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F3F1EE] gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FAF9F7] border border-[#E5E2DE] flex items-center justify-center text-[#1A1817]">
            <Cpu className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#615B57] uppercase tracking-widest">
              Live Field Testing Sandbox
            </p>
            <h3 className="font-bold text-[#1A1817] text-sm">
              Kijani API Box Telemetry & Rule Engine Simulator
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#15803D] bg-[#16A34A]/10 px-3 py-1 rounded-xl border border-[#16A34A]/20">
          <Zap className="w-3.5 h-3.5 text-[#16A34A]" />
          <span className="font-bold text-[11px]">Real-Time Prescriptions Active</span>
        </div>
      </div>

      {/* Preset Scenarios */}
      <div className="py-4 border-b border-[#F3F1EE]">
        <span className="text-[11px] text-[#615B57] font-semibold block mb-2">
          Click a Field Scenario to test how Kijani API calculates timing & exact volume:
        </span>
        <div className="flex flex-wrap gap-2">
          
          <button
            onClick={() => onApplyPreset('john-case-study')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#16A34A]/10 text-[#15803D] hover:bg-[#16A34A]/20 border border-[#16A34A]/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>55% Moisture (Kales Pulse: 20 min / 320L)</span>
          </button>

          <button
            onClick={() => onApplyPreset('rule-1-rain')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 transition-all cursor-pointer"
          >
            <span>80% Rain Approaching (Rule 1: WAIT / 0 min)</span>
          </button>

          <button
            onClick={() => onApplyPreset('rule-2-drought')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-800 hover:bg-red-100 border border-red-200 transition-all cursor-pointer"
          >
            <span>22% Acute Drought (Rule 2: Urgent Drip / 35 min)</span>
          </button>

          <button
            onClick={() => onApplyPreset('rule-4-low-tank')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer"
          >
            <span>350L Low Tank (Rule 4: CONSERVE)</span>
          </button>

          <button
            onClick={() => onApplyPreset('rule-5-saturated')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 transition-all cursor-pointer"
          >
            <span>88% Saturated (Rule 5: MONITOR / No Overirrigation)</span>
          </button>

        </div>
      </div>

      {/* Interactive Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        
        {/* Soil Moisture Slider */}
        <div className="bg-[#FAF9F7] p-4 rounded-2xl border border-[#E5E2DE]">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-[#1A1817]">
              Soil Moisture (VWC Probe)
            </label>
            <span className="font-bold text-xs text-[#15803D] bg-white px-2.5 py-0.5 rounded-lg border border-[#E5E2DE]">
              {soil.moisturePercent}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="95"
            step="1"
            value={soil.moisturePercent}
            onChange={(e) => onUpdateSoilMoisture(Number(e.target.value))}
            className="w-full h-2 bg-[#E5E2DE] rounded-lg appearance-none cursor-pointer accent-[#16A34A]"
          />
          <div className="flex justify-between text-[10px] text-[#A8A29D] font-mono mt-2">
            <span>10% (Bone Dry)</span>
            <span className="text-[#15803D] font-bold">55% (Trigger Point)</span>
            <span>95% (Waterlogged)</span>
          </div>
        </div>

        {/* Rain Probability Slider */}
        <div className="bg-[#FAF9F7] p-4 rounded-2xl border border-[#E5E2DE]">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-[#1A1817]">
              Rain Forecast Probability
            </label>
            <span className="font-bold text-xs text-sky-800 bg-white px-2.5 py-0.5 rounded-lg border border-[#E5E2DE]">
              {weather.rainProbabilityPercent}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={weather.rainProbabilityPercent}
            onChange={(e) => onUpdateRainProbability(Number(e.target.value))}
            className="w-full h-2 bg-[#E5E2DE] rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
          <div className="flex justify-between text-[10px] text-[#A8A29D] font-mono mt-2">
            <span>0% (Clear Sky)</span>
            <span className="text-sky-700 font-bold">≥ 60% (Rain Hold Cutoff)</span>
            <span>100% (Storm)</span>
          </div>
        </div>

        {/* Water Tank Level Slider */}
        <div className="bg-[#FAF9F7] p-4 rounded-2xl border border-[#E5E2DE]">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-[#1A1817]">
              Tank Storage Reservoir
            </label>
            <span className="font-bold text-xs text-[#15803D] bg-white px-2.5 py-0.5 rounded-lg border border-[#E5E2DE]">
              {tank.currentLiters} L
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="3000"
            step="50"
            value={tank.currentLiters}
            onChange={(e) => onUpdateTankLiters(Number(e.target.value))}
            className="w-full h-2 bg-[#E5E2DE] rounded-lg appearance-none cursor-pointer accent-[#16A34A]"
          />
          <div className="flex justify-between text-[10px] text-[#A8A29D] font-mono mt-2">
            <span className="text-amber-700 font-bold">&lt; 500L (Conserve Cutoff)</span>
            <span>1,500L (Half)</span>
            <span>3,000L (Full)</span>
          </div>
        </div>

        {/* Evaporation Rate Slider */}
        <div className="bg-[#FAF9F7] p-4 rounded-2xl border border-[#E5E2DE]">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-[#1A1817]">
              Evapotranspiration Rate (ET₀)
            </label>
            <span className="font-bold text-xs text-amber-800 bg-white px-2.5 py-0.5 rounded-lg border border-[#E5E2DE]">
              {weather.evaporationRateMmDay} mm/day
            </span>
          </div>
          <input
            type="range"
            min="2.0"
            max="10.0"
            step="0.2"
            value={weather.evaporationRateMmDay}
            onChange={(e) => onUpdateEvaporationRate(Number(e.target.value))}
            className="w-full h-2 bg-[#E5E2DE] rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[10px] text-[#A8A29D] font-mono mt-2">
            <span>2.0 mm (Cool/Cloudy)</span>
            <span>6.4 mm (Kano Plains Avg)</span>
            <span>10.0 mm (Extreme Sun)</span>
          </div>
        </div>

      </div>

    </div>
  );
};
