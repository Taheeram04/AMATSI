import React from 'react';
import { Recommendation, Language } from '../../types';
import { Smartphone, Signal, Battery, MessageSquare } from 'lucide-react';
import { formatSmsMessage } from '../../services/recommendationEngine';

interface FeaturePhoneSimulatorProps {
  recommendation: Recommendation;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  farmerName: string;
}

export const FeaturePhoneSimulator: React.FC<FeaturePhoneSimulatorProps> = ({
  recommendation,
  language,
  onSelectLanguage,
  farmerName
}) => {
  const smsBody = formatSmsMessage(recommendation, language);

  return (
    <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-lg text-slate-100 flex flex-col items-center max-w-sm mx-auto font-futura">
      
      {/* Phone Brand & Speaker */}
      <div className="w-full flex items-center justify-between px-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span className="font-bold tracking-widest text-[10px] text-slate-300 font-mono">2G FEATURE PHONE (NOKIA 105)</span>
        </div>
        <div className="w-10 h-1 bg-slate-700 rounded-full" />
      </div>

      {/* Retro LCD Screen */}
      <div className="w-full bg-[#c8dcaf] text-[#1c2c15] p-3.5 rounded-xl border-2 border-[#9eb780] shadow-inner font-mono text-xs flex flex-col justify-between min-h-[220px]">
        
        {/* Top Status Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-[#1c2c15]/30 text-[10px] font-bold">
          <div className="flex items-center gap-1">
            <Signal className="w-3 h-3" />
            <span>Safaricom 2G</span>
          </div>
          <span className="text-[10px]">{recommendation.timestamp}</span>
          <div className="flex items-center gap-1">
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Message Container */}
        <div className="py-2.5 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-1 font-bold text-[11px] mb-1 uppercase tracking-tight">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>1 New SMS • AMATSI</span>
          </div>
          <div className="bg-[#b5cd98] p-2.5 rounded border border-[#8da570] text-[11px] leading-relaxed shadow-2xs font-semibold select-all break-words">
            {smsBody}
          </div>
        </div>

        {/* Bottom LCD Controls */}
        <div className="pt-1.5 border-t border-[#1c2c15]/30 flex items-center justify-between text-[9px] font-bold tracking-wider">
          <span>OPTIONS</span>
          <span className="bg-[#1c2c15] text-[#c8dcaf] px-1.5 py-0.5 rounded">READ</span>
          <span>BACK</span>
        </div>
      </div>

      {/* Language Switcher for SMS */}
      <div className="w-full mt-4 bg-slate-800/90 rounded-xl p-2.5 border border-slate-700/80">
        <div className="text-[11px] text-slate-300 font-medium mb-1.5 flex items-center justify-between">
          <span>SMS Language:</span>
          <span className="text-[10px] text-emerald-400 font-mono">{farmerName}</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => onSelectLanguage('en')}
            className={`py-1 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              language === 'en'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onSelectLanguage('sw')}
            className={`py-1 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              language === 'sw'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Kiswahili
          </button>
          <button
            onClick={() => onSelectLanguage('luo')}
            className={`py-1 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              language === 'luo'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Dholuo
          </button>
        </div>
      </div>

      {/* Keypad Mock */}
      <div className="w-full grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono text-center">
        <div className="bg-slate-800/80 py-1.5 rounded-lg border border-slate-700/60 font-bold">1 <span className="text-[8px] block text-slate-500">_@</span></div>
        <div className="bg-slate-800/80 py-1.5 rounded-lg border border-slate-700/60 font-bold">2 <span className="text-[8px] block text-slate-500">abc</span></div>
        <div className="bg-slate-800/80 py-1.5 rounded-lg border border-slate-700/60 font-bold">3 <span className="text-[8px] block text-slate-500">def</span></div>
      </div>

    </div>
  );
};
