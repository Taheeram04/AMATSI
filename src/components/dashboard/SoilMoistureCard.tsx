import React from 'react';
import { SoilReading, CropProfile } from '../../types';
import { Activity, AlertCircle, Layers, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SoilMoistureCardProps {
  soil: SoilReading;
  cropProfile: CropProfile;
}

export const SoilMoistureCard: React.FC<SoilMoistureCardProps> = ({ soil, cropProfile }) => {
  const { moisturePercent, optimalMin, optimalMax, rootZoneDepthCm, temperatureC, lastUpdated } = soil;

  // Determine status
  let statusText = 'Optimal Comfort';
  let statusBadge = 'bg-[#16A34A]/10 text-[#15803D] border-[#16A34A]/20';
  let gaugeColor = 'bg-[#16A34A]';

  if (moisturePercent < 30) {
    statusText = 'Critical Dryness';
    statusBadge = 'bg-red-50 text-red-700 border-red-200';
    gaugeColor = 'bg-red-500';
  } else if (moisturePercent < optimalMin) {
    statusText = 'Needs Drip Pulse';
    statusBadge = 'bg-amber-50 text-amber-800 border-amber-200';
    gaugeColor = 'bg-amber-500';
  } else if (moisturePercent > optimalMax) {
    statusText = 'Over-saturated';
    statusBadge = 'bg-sky-50 text-sky-800 border-sky-200';
    gaugeColor = 'bg-sky-500';
  }

  return (
    <div className="bg-white rounded-3xl border border-[#E5E2DE] p-6 shadow-xs flex flex-col justify-between font-futura">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#F3F1EE]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF9F7] border border-[#E5E2DE] flex items-center justify-center text-[#1A1817]">
              <Layers className="w-4 h-4 text-[#16A34A]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#615B57] uppercase tracking-widest">
                Kijani API Telemetry
              </p>
              <h3 className="font-bold text-[#1A1817] text-sm">
                Root-Zone Moisture
              </h3>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}>
            {statusText}
          </span>
        </div>

        {/* Real-time reading */}
        <div className="py-4">
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-black text-[#1A1817] tracking-tight">
                {moisturePercent}%
              </span>
              <span className="text-xs text-[#615B57] font-semibold">VWC</span>
            </div>
            <span className="text-xs text-[#615B57]">
              Optimal Band: <strong className="text-[#15803D]">{optimalMin}–{optimalMax}%</strong>
            </span>
          </div>

          {/* Progress Bar with Optimal Threshold Marker */}
          <div className="relative w-full h-3 bg-[#F3F1EE] rounded-full overflow-hidden border border-[#E5E2DE]">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${gaugeColor}`}
              style={{ width: `${Math.min(100, Math.max(0, moisturePercent))}%` }}
            />
            {/* Optimal Range Visual Marker */}
            <div
              className="absolute top-0 bottom-0 bg-[#16A34A]/20 border-x border-[#16A34A]/50 pointer-events-none"
              style={{ left: `${optimalMin}%`, width: `${optimalMax - optimalMin}%` }}
              title="Optimal Agronomic Range"
            />
          </div>

          <div className="flex justify-between text-[10px] text-[#A8A29D] font-mono mt-2">
            <span>0% Wilting</span>
            <span className="text-[#15803D] font-bold">Target Zone ({optimalMin}-{optimalMax}%)</span>
            <span>100% Saturated</span>
          </div>
        </div>

        {/* Scientific Context */}
        <div className="bg-[#FAF9F7] border border-[#E5E2DE] rounded-2xl p-3.5 text-xs text-[#615B57] leading-relaxed mb-2">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1A1817]">Overirrigation Guard: </strong>
              {cropProfile.name} roots are active at {cropProfile.rootDepthCm}. Kijani Box stops watering before moisture seeps past this boundary into deep Vertisol cracks.
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry metadata footer */}
      <div className="pt-3 border-t border-[#F3F1EE] flex items-center justify-between text-[11px] text-[#615B57]">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>Depth: <strong>{rootZoneDepthCm}cm</strong> • Temp: <strong>{temperatureC}°C</strong></span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
          <span className="text-[#A8A29D]">{lastUpdated}</span>
        </div>
      </div>

    </div>
  );
};
