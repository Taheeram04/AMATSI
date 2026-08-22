import React, { useState } from 'react';
import { Recommendation, Language } from '../../types';
import { Send, CheckCircle2, ShieldCheck, Check, Radio, Droplets, Clock, TrendingDown } from 'lucide-react';
import { formatSmsMessage } from '../../services/recommendationEngine';

interface RecommendationCardProps {
  recommendation: Recommendation;
  language: Language;
  onSendSms: (rec: Recommendation, lang: Language) => void;
  isSendingSms: boolean;
  smsSentFeedback: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  language,
  onSendSms,
  isSendingSms,
  smsSentFeedback
}) => {
  const { action, durationMinutes, waterNeededLiters, waterSavedLiters, reason, ruleTriggered, timestamp, crop, plotName } = recommendation;
  const currentSmsText = formatSmsMessage(recommendation, language);
  const [taskMarkedComplete, setTaskMarkedComplete] = useState(false);

  // Dynamic Headline stating WHEN to irrigate and EXACT QUANTITY
  const getActionSummary = () => {
    switch (action) {
      case 'IRRIGATE':
        return {
          title: `Irrigate for ${durationMinutes > 0 ? `${durationMinutes} mins` : '20 mins'} (${waterNeededLiters > 0 ? `${waterNeededLiters}L` : '320L'})`,
          subtext: `Targeted drip pulse applied directly to ${crop} active root zone to prevent 60–80% furrow waste and deep percolation.`,
          badge: 'Irrigation Required Now',
          badgeStyle: 'bg-[#16A34A] text-white',
          highlightNumber: `${durationMinutes > 0 ? durationMinutes : 20}m`,
          highlightUnit: `${waterNeededLiters > 0 ? waterNeededLiters : 320} Liters exact dose`
        };
      case 'WAIT':
        return {
          title: 'Hold Off Irrigation (Rain Approaching)',
          subtext: 'High rain probability detected. Withholding pumping saves 100% of water and eliminates fertilizer runoff into Lake Victoria.',
          badge: 'Rain Fall Expected',
          badgeStyle: 'bg-sky-600 text-white',
          highlightNumber: '0 min',
          highlightUnit: 'Save 2,400L pump water'
        };
      case 'CONSERVE':
        return {
          title: 'Conserve Water Reserves (Tank Low)',
          subtext: 'Storage tank is critically low. Halting field irrigation protects household water security and nursery seedlings.',
          badge: 'Storage Conservation',
          badgeStyle: 'bg-amber-600 text-white',
          highlightNumber: 'Hold',
          highlightUnit: 'Ration remaining reserves'
        };
      case 'MONITOR':
      default:
        return {
          title: 'Optimal Moisture (No Watering Needed)',
          subtext: `Current soil moisture is in the optimal band. Further pumping would cause overirrigation, root rot, and wasted fuel.`,
          badge: 'Optimal Comfort Zone',
          badgeStyle: 'bg-[#16A34A] text-white',
          highlightNumber: '0 min',
          highlightUnit: 'Roots perfectly hydrated'
        };
    }
  };

  const actionDetails = getActionSummary();

  return (
    <div className="space-y-4 font-futura">
      
      {/* Primary Minimalist Decision Card (Cotton Black Soil & Vegetation Green) */}
      <div className="bg-[#1A1817] text-white p-6 sm:p-8 md:p-9 rounded-3xl relative overflow-hidden shadow-xl border border-[#2B2725]">
        
        {/* Subtle Vegetation Green Radial Atmosphere */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#16A34A]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Top Kijani Box Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#2B2725] relative z-10">
          <div className="flex items-center gap-2.5">
            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${actionDetails.badgeStyle}`}>
              {actionDetails.badge}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#D6D3CD]">
              <span className="w-1.5 h-1.5 bg-[#4ADE80] rounded-full animate-pulse" />
              <span className="font-semibold text-white">KijaniBox IoT Engine</span>
              <span className="text-[#615B57]">•</span>
              <span className="text-[#A8A29D] text-[11px]">{plotName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#A8A29D]">
            <span>{ruleTriggered}</span>
            <span>•</span>
            <span className="font-mono text-white">{timestamp}</span>
          </div>
        </div>

        {/* Core Decision: WHEN and EXACT QUANTITY */}
        <div className="py-6 sm:py-7 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-8 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#4ADE80]">
              Real-Time Prescription
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {actionDetails.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#D6D3CD] leading-relaxed max-w-2xl font-light">
              {actionDetails.subtext}
            </p>
          </div>

          {/* Large Minimalist Metric Pill */}
          <div className="lg:col-span-4 bg-[#262322] border border-[#383432] rounded-2xl p-4 sm:p-5 flex flex-col justify-center text-left lg:text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29D] block mb-0.5">
              Exact Water Dose
            </span>
            <span className="text-3xl sm:text-4xl font-black text-[#4ADE80] tracking-tight leading-none font-futura">
              {actionDetails.highlightNumber}
            </span>
            <span className="text-xs text-[#D6D3CD] mt-1 font-medium">
              {actionDetails.highlightUnit}
            </span>
          </div>

        </div>

        {/* Action Controls & Dispatch */}
        <div className="pt-6 border-t border-[#2B2725] relative z-10 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onSendSms(recommendation, language)}
              disabled={isSendingSms}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white active:scale-95 transition-all font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {isSendingSms ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Dispatching SMS...</span>
                </>
              ) : smsSentFeedback ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>SMS Sent via Africa's Talking!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>Send SMS to Farmer ({language.toUpperCase()})</span>
                </>
              )}
            </button>

            <button
              onClick={() => setTaskMarkedComplete(!taskMarkedComplete)}
              className={`font-bold px-5 py-3 rounded-xl border text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                taskMarkedComplete
                  ? 'bg-[#15803D] text-white border-[#16A34A]'
                  : 'bg-[#262322] text-[#D6D3CD] hover:bg-[#383432] border-[#3E3835]'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{taskMarkedComplete ? 'Action Executed' : 'Mark Completed'}</span>
            </button>
          </div>

          {/* Smallholder SMS Preview */}
          <div className="text-[11px] text-[#A8A29D] bg-[#262322] border border-[#3E3835] px-3 py-1.5 rounded-xl flex items-center gap-2 max-w-md truncate">
            <span className="text-[#4ADE80] font-bold uppercase text-[9px]">SMS Body:</span>
            <span className="truncate text-white select-all">"{currentSmsText}"</span>
          </div>

        </div>

      </div>

      {/* 3 Core Problem-Solving Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1: 60-80% Water Loss Slashed */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E2DE] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-[#615B57] uppercase tracking-widest">
                Water Waste Slashed
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#15803D]">
                -60% to -80%
              </span>
            </div>
            <p className="text-3xl font-black text-[#16A34A] leading-tight">
              {waterSavedLiters > 0 ? `+${waterSavedLiters} L` : '70% Saved'}
            </p>
          </div>
          <p className="text-xs text-[#615B57] mt-2 border-t border-[#F3F1EE] pt-2">
            Eliminates blind furrow & flood loss on Black Cotton clay
          </p>
        </div>

        {/* Metric 2: Fuel Money Kept in Farmer's Pocket */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E2DE] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-[#615B57] uppercase tracking-widest">
                Pump Fuel Saved
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                KES / Week
              </span>
            </div>
            <p className="text-3xl font-black text-[#1A1817] leading-tight">
              KES 1,200
            </p>
          </div>
          <p className="text-xs text-[#615B57] mt-2 border-t border-[#F3F1EE] pt-2">
            Cuts pump runtime from 2 hours to 20 minutes/cycle
          </p>
        </div>

        {/* Metric 3: Lake Victoria Hyacinth Protection */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E2DE] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-[#615B57] uppercase tracking-widest">
                Basin Protection
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                0% Leaching
              </span>
            </div>
            <p className="text-3xl font-black text-[#0284C7] leading-tight">
              Zero Runoff
            </p>
          </div>
          <p className="text-xs text-[#615B57] mt-2 border-t border-[#F3F1EE] pt-2">
            No fertilizer wash to River Nyando & Lake Victoria
          </p>
        </div>

      </div>

    </div>
  );
};
