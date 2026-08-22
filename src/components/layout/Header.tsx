import React from 'react';
import { Globe, Sparkles, Sprout, Wifi, WifiOff, Bot } from 'lucide-react';
import { FarmPlot, Language } from '../../types';
import { NavigationTab } from '../../hooks/useIrrigationState';
import { Logo } from '../common/Logo';

interface HeaderProps {
  plots: FarmPlot[];
  selectedPlot: FarmPlot;
  onSelectPlot: (plot: FarmPlot) => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onOpenCaseStudy: () => void;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  plots,
  selectedPlot,
  onSelectPlot,
  language,
  onSelectLanguage,
  isOffline,
  onToggleOffline,
  onOpenCaseStudy,
  activeTab,
  onSelectTab
}) => {
  return (
    <header className="bg-white border-b border-[#E5E2DE] sticky top-0 z-40 font-futura shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between py-3.5 border-b border-[#F3F1EE] gap-4">
          
          {/* Brand Logo & Basin Mission */}
          <div className="flex items-center">
            <Logo size="md" variant="dark" />
          </div>

          {/* Controls: Plot Switcher, Offline Indicator, Language, Case Study */}
          <div className="flex items-center gap-2.5 text-xs">
            
            {/* Plot Switcher */}
            <div className="flex items-center gap-1.5 bg-[#FAF9F7] border border-[#E5E2DE] px-2.5 py-1.5 rounded-xl">
              <Sprout className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
              <select
                value={selectedPlot.id}
                onChange={(e) => {
                  const target = plots.find((p) => p.id === e.target.value);
                  if (target) onSelectPlot(target);
                }}
                className="bg-transparent text-[#1A1817] font-semibold text-xs focus:outline-none cursor-pointer pr-1 truncate max-w-[130px] sm:max-w-[190px]"
              >
                {plots.map((plot) => (
                  <option key={plot.id} value={plot.id} className="bg-white text-[#1A1817]">
                    {plot.name} ({plot.areaAcres} ac)
                  </option>
                ))}
              </select>
            </div>

            {/* Offline toggle status */}
            <button
              onClick={onToggleOffline}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
                isOffline
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-[#F0FDF4] border-[#DCFCE7] text-[#15803D]'
              }`}
              title={isOffline ? 'Using Local Telemetry Cache' : 'Live KijaniBox Mesh Network'}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  <span className="text-[10px] uppercase tracking-wider font-bold">Offline</span>
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-pulse" />
                  <span className="text-[10px] uppercase tracking-wider font-bold">Online</span>
                </>
              )}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center gap-0.5 bg-[#FAF9F7] border border-[#E5E2DE] p-0.5 rounded-xl">
              <Globe className="w-3 h-3 text-[#A8A29D] ml-1.5 mr-0.5" />
              {(['en', 'sw', 'luo'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => onSelectLanguage(l)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                    language === l
                      ? 'bg-[#1A1817] text-white shadow-2xs font-extrabold'
                      : 'text-[#615B57] hover:text-[#1A1817]'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'sw' ? 'SW' : 'LUO'}
                </button>
              ))}
            </div>

            {/* Case Study */}
            <button
              onClick={onOpenCaseStudy}
              className="flex items-center gap-1 bg-[#FAF9F7] hover:bg-[#F0FDF4] text-[#15803D] border border-[#E5E2DE] hover:border-[#16A34A] px-2.5 py-1.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="hidden sm:inline">Case Study</span>
            </button>

          </div>
        </div>

        {/* Navigation Bar with AI Agronomist tab */}
        <nav className="flex space-x-1.5 py-2 overflow-x-auto scrollbar-none">
          
          <button
            onClick={() => onSelectTab('irrigate')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'irrigate'
                ? 'bg-[#1A1817] text-white shadow-xs font-bold'
                : 'text-[#615B57] hover:text-[#1A1817] hover:bg-[#FAF9F7]'
            }`}
          >
            Live Irrigation
          </button>

          <button
            onClick={() => onSelectTab('agronomist')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'agronomist'
                ? 'bg-[#1A1817] text-[#4ADE80] shadow-xs font-bold border border-[#2B2725]'
                : 'text-[#15803D] hover:bg-[#F0FDF4]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Agronomist</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#16A34A]/20 text-[#16A34A] uppercase">
              Gemini
            </span>
          </button>

          <button
            onClick={() => onSelectTab('plots')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'plots'
                ? 'bg-[#1A1817] text-white shadow-xs font-bold'
                : 'text-[#615B57] hover:text-[#1A1817] hover:bg-[#FAF9F7]'
            }`}
          >
            Farm Plots ({plots.length})
          </button>

          <button
            onClick={() => onSelectTab('savings')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'savings'
                ? 'bg-[#1A1817] text-white shadow-xs font-bold'
                : 'text-[#615B57] hover:text-[#1A1817] hover:bg-[#FAF9F7]'
            }`}
          >
            Water & Fuel Savings
          </button>

          <button
            onClick={() => onSelectTab('sms')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'sms'
                ? 'bg-[#1A1817] text-white shadow-xs font-bold'
                : 'text-[#615B57] hover:text-[#1A1817] hover:bg-[#FAF9F7]'
            }`}
          >
            SMS Broadcast Log
          </button>

        </nav>

      </div>
    </header>
  );
};
