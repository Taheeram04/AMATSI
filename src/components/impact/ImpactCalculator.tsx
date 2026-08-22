import React, { useState } from 'react';
import { Fuel, TrendingUp, Droplets, Shield, Sparkles, DollarSign, Calculator, Leaf, Info } from 'lucide-react';

export const ImpactCalculator: React.FC = () => {
  // Configurable sliders for economic model
  const [petrolPricePerLiterKes, setPetrolPricePerLiterKes] = useState(195);
  const [baselinePumpHoursPerWeek, setBaselinePumpHoursPerWeek] = useState(14); // 2 hours/day furrow
  const [pumpFuelConsumptionLph, setPumpFuelConsumptionLph] = useState(0.8); // 0.8 L/hr small petrol pump
  const [expansionPlotSizeAcres, setExpansionPlotSizeAcres] = useState(0.15); // Saved water expansion

  // Calculations
  const baselineWeeklyFuelLiters = baselinePumpHoursPerWeek * pumpFuelConsumptionLph;
  const baselineWeeklyFuelCostKes = baselineWeeklyFuelLiters * petrolPricePerLiterKes;

  // AMATSI cuts pump runtime by 60% (from 14 hrs to 5.6 hrs)
  const amatsiWeeklyPumpHours = baselinePumpHoursPerWeek * 0.4;
  const amatsiWeeklyFuelLiters = amatsiWeeklyPumpHours * pumpFuelConsumptionLph;
  const amatsiWeeklyFuelCostKes = amatsiWeeklyFuelLiters * petrolPricePerLiterKes;

  const weeklyFuelSavedKes = Math.round(baselineWeeklyFuelCostKes - amatsiWeeklyFuelCostKes);
  const monthlyFuelSavedKes = weeklyFuelSavedKes * 4;
  const annualFuelSavedKes = weeklyFuelSavedKes * 52;

  // Revenue from saved water expansion (Managu / Spider plant)
  const expansionWeeklyRevenueKes = Math.round(expansionPlotSizeAcres * 550 * 90);
  const totalNetWeeklyBenefitKes = weeklyFuelSavedKes + expansionWeeklyRevenueKes;

  return (
    <div className="space-y-6 font-futura">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E5E2DE] p-6 sm:p-7 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#16A34A]/10 text-[#15803D] border border-[#16A34A]/20 uppercase tracking-widest">
                Economic Impact Model
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1817]">
                Water & Fuel Savings ROI
              </h2>
            </div>
            <p className="text-xs text-[#615B57] mt-1.5 max-w-2xl">
              Eliminating 60%–80% water loss on Lake Victoria Vertisol farms puts thousands of shillings directly back into smallholder households.
            </p>
          </div>

          <div className="bg-[#1A1817] text-white px-5 py-3 rounded-2xl border border-[#2B2725] flex items-center gap-3">
            <div>
              <span className="text-[10px] font-bold text-[#A8A29D] uppercase tracking-widest block">
                Total Net Annual Gain
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#4ADE80]">
                +KES {(totalNetWeeklyBenefitKes * 52).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Impact Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Pillar 1: Pump Fuel Savings */}
        <div className="bg-white rounded-3xl border border-[#E5E2DE] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Fuel className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                -60% Fuel Burn
              </span>
            </div>
            <h3 className="font-extrabold text-[#1A1817] text-base">Pump Fuel Saved</h3>
            <p className="text-xs text-[#615B57] mt-1.5 leading-relaxed">
              Replacing 2-hour furrow pumping runs with 20-minute targeted pulses saves ~8.4 hours of petrol engine runtime every week.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-[#F3F1EE]">
            <span className="text-[10px] text-[#615B57] uppercase font-bold tracking-wider block">Annual Fuel Money Saved</span>
            <span className="text-3xl font-black text-[#1A1817]">
              KES {annualFuelSavedKes.toLocaleString()}
            </span>
            <span className="text-xs text-[#615B57] font-medium block mt-0.5">
              (KES {monthlyFuelSavedKes.toLocaleString()} / month)
            </span>
          </div>
        </div>

        {/* Pillar 2: Saved-Water Production Expansion */}
        <div className="bg-white rounded-3xl border border-[#E5E2DE] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#16A34A]/10 border border-[#16A34A]/20 flex items-center justify-center text-[#15803D]">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-[#16A34A]/10 text-[#15803D] border border-[#16A34A]/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Harvest Growth
              </span>
            </div>
            <h3 className="font-extrabold text-[#1A1817] text-base">Saved-Water Crop Expansion</h3>
            <p className="text-xs text-[#615B57] mt-1.5 leading-relaxed">
              Redirecting the ~11,000L of weekly saved water to 0.15 acres of Managu & Spider Plant generates steady market harvests.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-[#F3F1EE]">
            <span className="text-[10px] text-[#615B57] uppercase font-bold tracking-wider block">Weekly Crop Cashflow</span>
            <span className="text-3xl font-black text-[#16A34A]">
              +KES {expansionWeeklyRevenueKes.toLocaleString()}
            </span>
            <span className="text-xs text-[#615B57] font-medium block mt-0.5">
              High-demand Kisumu fresh markets
            </span>
          </div>
        </div>

        {/* Pillar 3: Lake Victoria Environmental Protection */}
        <div className="bg-white rounded-3xl border border-[#E5E2DE] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Zero Leaching
              </span>
            </div>
            <h3 className="font-extrabold text-[#1A1817] text-base">Lake Victoria Ecosystem</h3>
            <p className="text-xs text-[#615B57] mt-1.5 leading-relaxed">
              No agricultural runoff reaches the Sondu Miriu or Nyando rivers. Fertilizers remain in root zones, starving water hyacinth weeds.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-[#F3F1EE]">
            <span className="text-[10px] text-[#615B57] uppercase font-bold tracking-wider block">Nutrient Runoff Prevented</span>
            <span className="text-3xl font-black text-[#0284C7]">
              100% Retained
            </span>
            <span className="text-xs text-[#615B57] font-medium block mt-0.5">
              Guarding Lake Victoria fresh water
            </span>
          </div>
        </div>

      </div>

      {/* Interactive Financial Sandbox */}
      <div className="bg-white rounded-3xl border border-[#E5E2DE] p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#F3F1EE] mb-5">
          <Calculator className="w-4 h-4 text-[#16A34A]" />
          <h3 className="font-extrabold text-[#1A1817] text-base">Customize Farm Economics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="bg-[#FAF9F7] p-4 rounded-2xl border border-[#E5E2DE]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-[#1A1817]">Petrol Price / Liter (KES)</label>
              <span className="font-bold text-xs text-[#1A1817] bg-white px-2.5 py-1 rounded-lg border border-[#E5E2DE]">
                KES {petrolPricePerLiterKes}
              </span>
            </div>
            <input
              type="range"
              min="160"
              max="240"
              step="5"
              value={petrolPricePerLiterKes}
              onChange={(e) => setPetrolPricePerLiterKes(Number(e.target.value))}
              className="w-full h-2 bg-[#E5E2DE] rounded-lg appearance-none cursor-pointer accent-[#16A34A]"
            />
            <span className="text-[10px] text-[#A8A29D] font-mono block mt-1.5">Kisumu pump tariff</span>
          </div>

          <div className="bg-[#FAF9F7] p-4 rounded-2xl border border-[#E5E2DE]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-[#1A1817]">Baseline Furrow Run (Hrs/Wk)</label>
              <span className="font-bold text-xs text-[#1A1817] bg-white px-2.5 py-1 rounded-lg border border-[#E5E2DE]">
                {baselinePumpHoursPerWeek} hrs
              </span>
            </div>
            <input
              type="range"
              min="6"
              max="28"
              step="2"
              value={baselinePumpHoursPerWeek}
              onChange={(e) => setBaselinePumpHoursPerWeek(Number(e.target.value))}
              className="w-full h-2 bg-[#E5E2DE] rounded-lg appearance-none cursor-pointer accent-[#16A34A]"
            />
            <span className="text-[10px] text-[#A8A29D] font-mono block mt-1.5">Typical smallholder furrow run</span>
          </div>

          <div className="bg-[#FAF9F7] p-4 rounded-2xl border border-[#E5E2DE]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-[#1A1817]">Saved Water Expansion (Acres)</label>
              <span className="font-bold text-xs text-[#15803D] bg-white px-2.5 py-1 rounded-lg border border-[#E5E2DE]">
                {expansionPlotSizeAcres} ac
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.05"
              value={expansionPlotSizeAcres}
              onChange={(e) => setExpansionPlotSizeAcres(Number(e.target.value))}
              className="w-full h-2 bg-[#E5E2DE] rounded-lg appearance-none cursor-pointer accent-[#16A34A]"
            />
            <span className="text-[10px] text-[#A8A29D] font-mono block mt-1.5">African leafy vegetables</span>
          </div>

        </div>

        {/* Bottom Total Value Callout */}
        <div className="mt-6 bg-[#1A1817] text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#2B2725]">
          <div>
            <span className="text-xs text-[#A8A29D] uppercase font-bold tracking-wider block">
              Weekly Smallholder Net Benefit
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-white font-futura">
                +KES {totalNetWeeklyBenefitKes.toLocaleString()}
              </span>
              <span className="text-[#A8A29D] text-xs">/ week (Fuel saved + Expansion harvest)</span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-[#4ADE80] font-bold block">
              Annual Economic Lift: ~KES {(totalNetWeeklyBenefitKes * 52).toLocaleString()}
            </span>
            <span className="text-[11px] text-[#A8A29D] block mt-0.5">
              Amortizes Kijani Box IoT sensor within 6 weeks
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
