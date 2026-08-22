import React from 'react';
import { TankReading } from '../../types';
import { Database, AlertTriangle, ShieldCheck, Gauge } from 'lucide-react';

interface TankLevelCardProps {
  tank: TankReading;
}

export const TankLevelCard: React.FC<TankLevelCardProps> = ({ tank }) => {
  const { currentLiters, capacityLiters, percentage, flowRateLpm, lastRefillDate } = tank;
  const isCriticalLow = currentLiters < 500;

  return (
    <div className="bg-white rounded-3xl border border-[#E5E2DE] p-6 shadow-xs flex flex-col justify-between font-futura">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#F3F1EE]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF9F7] border border-[#E5E2DE] flex items-center justify-center text-[#1A1817]">
              <Database className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#615B57] uppercase tracking-widest">
                Storage Telemetry
              </p>
              <h3 className="font-bold text-[#1A1817] text-sm">
                Tank Storage Level
              </h3>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              isCriticalLow
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-[#16A34A]/10 text-[#15803D] border-[#16A34A]/20'
            }`}
          >
            {isCriticalLow ? 'Critical Reserve' : 'Sufficient Supply'}
          </span>
        </div>

        {/* Liters Metric */}
        <div className="py-4">
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-black text-[#1A1817] tracking-tight">
                {currentLiters.toLocaleString()}
              </span>
              <span className="text-xs text-[#615B57] font-semibold">Liters</span>
            </div>
            <span className="text-xs text-[#615B57]">
              Capacity: <strong className="text-[#1A1817]">{capacityLiters.toLocaleString()}L</strong> ({percentage}%)
            </span>
          </div>

          {/* Level Bar */}
          <div className="relative w-full h-3 bg-[#F3F1EE] rounded-full overflow-hidden border border-[#E5E2DE]">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isCriticalLow ? 'bg-amber-500' : 'bg-[#16A34A]'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-[#A8A29D] font-mono mt-2">
            <span>0L Empty</span>
            <span className="text-amber-700 font-bold">Safety Cutoff (500L)</span>
            <span>{capacityLiters}L Full</span>
          </div>
        </div>

        {/* Context */}
        <div className="bg-[#FAF9F7] border border-[#E5E2DE] rounded-2xl p-3.5 text-xs text-[#615B57] leading-relaxed mb-2">
          {isCriticalLow ? (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-900">Conserve Mode Active: </strong>
                Tank below safety cutoff. Field irrigation halted to protect homestead domestic use.
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#1A1817]">Drip Flow Capacity: </strong>
                Discharges at {flowRateLpm} L/min via gravity-fed drip network. Ample storage for 7+ pulse cycles.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[#F3F1EE] flex items-center justify-between text-[11px] text-[#615B57]">
        <div className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-emerald-600" />
          <span>Flow Rate: <strong>{flowRateLpm} L/min</strong></span>
        </div>
        <span className="text-[#A8A29D]">Refill: {lastRefillDate}</span>
      </div>

    </div>
  );
};
