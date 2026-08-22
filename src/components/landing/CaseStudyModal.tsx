import React from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Sprout } from 'lucide-react';

interface CaseStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToDashboard: () => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ isOpen, onClose, onJumpToDashboard }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1A1817]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto font-futura">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E5E2DE] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#1A1817] text-white p-6 sm:p-7 relative border-b border-[#2B2725]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-[#A8A29D] hover:text-white p-1 rounded-xl hover:bg-[#262322] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-[#4ADE80] text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Problem Statement & Field Validation</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            John Omondi's 0.5-Acre Farm Case Study
          </h2>
          <p className="text-xs text-[#D6D3CD] mt-1 max-w-xl font-light">
            How smart sensor-scheduled irrigation eliminated an 80% water loss blindspot on Vertisol soils in the Kano Plains, Lake Victoria Basin.
          </p>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 sm:p-7 space-y-4 text-xs text-[#615B57] max-h-[70vh] overflow-y-auto">
          
          {/* Section 1: The Context */}
          <div className="bg-[#FAF9F7] rounded-2xl p-4 sm:p-5 border border-[#E5E2DE]">
            <h3 className="font-extrabold text-[#1A1817] text-sm mb-1.5 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-[#16A34A]" />
              <span>1. The Context: John’s 0.5-Acre Smallholding</span>
            </h3>
            <p className="leading-relaxed text-[#615B57]">
              John is a smallholder farmer in the Kano Plains (Kisumu County, Lake Victoria Basin). He relies on his 0.5-acre plot to feed his family and sell fresh vegetables at Kibuye Market. On his farm, John grows:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-[#1A1817] font-semibold">
              <li><strong>Maize (Oduma):</strong> Staple grain for household food security.</li>
              <li><strong>Kales (Sukuma Wiki) & Managu:</strong> Traditional African nightshade as high-value cash crops.</li>
            </ul>
            <p className="mt-2 text-[#78716C]">
              Like most smallholders in the basin, John used to rely on open furrow flooding—running a noisy petrol pump for 2+ hours to flood dirt ditches.
            </p>
          </div>

          {/* Section 2: The Core Problem Statement */}
          <div className="bg-red-50 rounded-2xl p-4 sm:p-5 border border-red-200">
            <div className="flex items-center gap-2 text-red-950 font-extrabold text-sm mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>2. The Problem: 60%–80% Diverted Water Lost</span>
            </div>
            <p className="leading-relaxed text-red-950 font-medium">
              Regional field assessments by the <strong>Lake Victoria Basin Commission (LVBC)</strong> and <strong>IWMI</strong> establish that traditional smallholders lose <strong>60% to 80%</strong> of their diverted water due to lack of real-time soil data:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="bg-white p-3 rounded-xl border border-red-200">
                <strong className="text-red-900 block font-bold mb-1">Deep Fissures & Percolation:</strong>
                <span className="text-[11px] text-[#615B57]">Cracking Black Cotton clay channels water deep below the 20cm root zone, wasting water and leaching soil nutrients.</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-red-200">
                <strong className="text-red-900 block font-bold mb-1">Severe Fuel Burn:</strong>
                <span className="text-[11px] text-[#615B57]">Running small petrol pumps for 2 hours daily drains KES 1,200/wk in fuel costs from the farmer's pocket.</span>
              </div>
            </div>
          </div>

          {/* Section 3: The Solution with Kijani Box */}
          <div className="bg-[#F0FDF4] rounded-2xl p-4 sm:p-5 border border-[#DCFCE7]">
            <div className="flex items-center gap-2 text-[#14532D] font-extrabold text-sm mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>3. The AMATSI Solution: Real-Time Precision & Dosage</span>
            </div>
            <p className="leading-relaxed text-[#14532D]">
              Instead of guessing or flooding, AMATSI links with the Kijani API Box. When soil moisture drops to <strong>55%</strong>, the system triggers a precise 20-minute pulse (320 Liters) directly to John's feature phone via Africa's Talking SMS in Luo or Swahili:
            </p>
            <div className="bg-[#1A1817] text-[#4ADE80] font-mono p-3 rounded-xl border border-[#2B2725] text-xs my-2.5 select-all">
              "Amatsi Alert: John, your kales need water. Irrigate for 20 minutes now. (Soil: 55%, Rain: 15%)"
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-white p-2.5 rounded-xl border border-[#DCFCE7] font-bold text-center text-[#15803D]">
                💧 60%–80% Water Waste Eliminated
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#DCFCE7] font-bold text-center text-[#15803D]">
                📈 +30% Vegetable Yield Boost
              </div>
            </div>
          </div>

          {/* Section 4: The Environmental Impact */}
          <div className="bg-amber-50 rounded-2xl p-4 sm:p-5 border border-amber-200">
            <h3 className="font-extrabold text-amber-950 text-sm mb-1.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>4. Lake Victoria Basin Ecological Impact</span>
            </h3>
            <p className="text-amber-900 leading-relaxed">
              By applying only what crops can absorb, zero fertilizer runs off into the Nyando or Sondu Miriu rivers. This halts the nitrogen and phosphorus loading that triggers suffocating Water Hyacinth blooms across Lake Victoria's shores.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-[#FAF9F7] px-6 sm:px-7 py-4 border-t border-[#E5E2DE] flex items-center justify-between">
          <span className="text-[11px] text-[#A8A29D]">
            LVBC & IWMI Model Grounded
          </span>
          <button
            onClick={() => {
              onClose();
              onJumpToDashboard();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span>Launch Live Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
