import React, { useState } from 'react';
import { RecommendationCard } from './RecommendationCard';
import { SoilMoistureCard } from './SoilMoistureCard';
import { WeatherCard } from './WeatherCard';
import { TankLevelCard } from './TankLevelCard';
import { FeaturePhoneSimulator } from './FeaturePhoneSimulator';
import { SensorSimulator } from './SensorSimulator';
import { WaterUsageChart } from './WaterUsageChart';
import { FarmPlot, Language, Recommendation, SoilReading, TankReading, WeatherReading, CropProfile } from '../../types';
import { SlidersHorizontal, Smartphone, Sparkles, Sprout, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface LiveIrrigationViewProps {
  currentRecommendation: Recommendation;
  selectedPlot: FarmPlot;
  activeCropProfile: CropProfile;
  soil: SoilReading;
  setSoil: React.Dispatch<React.SetStateAction<SoilReading>>;
  weather: WeatherReading;
  setWeather: React.Dispatch<React.SetStateAction<WeatherReading>>;
  tank: TankReading;
  setTank: React.Dispatch<React.SetStateAction<TankReading>>;
  language: Language;
  setLanguage: (lang: Language) => void;
  onSendSms: (rec: Recommendation, lang: Language) => void;
  isSendingSms: boolean;
  smsSentFeedback: boolean;
  onApplyPreset: (scenario: string) => void;
}

export const LiveIrrigationView: React.FC<LiveIrrigationViewProps> = ({
  currentRecommendation,
  selectedPlot,
  activeCropProfile,
  soil,
  setSoil,
  weather,
  setWeather,
  tank,
  setTank,
  language,
  setLanguage,
  onSendSms,
  isSendingSms,
  smsSentFeedback,
  onApplyPreset
}) => {
  const [showSimulatorTools, setShowSimulatorTools] = useState(false);
  const [showPhonePreview, setShowPhonePreview] = useState(false);

  return (
    <div className="space-y-6 font-futura">
      
      {/* Problem & Solution Context Banner (Minimalist) */}
      <div className="bg-white border border-[#E5E2DE] p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF9F7] border border-[#E5E2DE] flex items-center justify-center shrink-0">
            <Sprout className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1A1817] uppercase tracking-wider">
                Plot: {selectedPlot.name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#15803D]">
                {activeCropProfile.localName} ({selectedPlot.areaAcres} acres)
              </span>
            </div>
            <p className="text-xs text-[#615B57] mt-0.5">
              Root Depth: <strong>{activeCropProfile.rootDepthCm}</strong> • Target Moisture: <strong>{activeCropProfile.optimalMoistureMin}%–{activeCropProfile.optimalMoistureMax}% VWC</strong>
            </p>
          </div>
        </div>

        {/* Problem Statement Pill */}
        <div className="flex items-center gap-2 bg-[#FAF9F7] border border-[#E5E2DE] px-3 py-1.5 rounded-xl text-xs text-[#615B57]">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <span>Kijani Box prevents <strong>60%–80%</strong> water loss from blind furrowing</span>
        </div>
      </div>

      {/* Primary Action & Advice Banner */}
      <RecommendationCard
        recommendation={currentRecommendation}
        language={language}
        onSendSms={onSendSms}
        isSendingSms={isSendingSms}
        smsSentFeedback={smsSentFeedback}
      />

      {/* 3 Core Field Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <SoilMoistureCard soil={soil} cropProfile={activeCropProfile} />
        <WeatherCard weather={weather} />
        <TankLevelCard tank={tank} />
      </div>

      {/* Minimalist Utility Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimulatorTools(!showSimulatorTools)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              showSimulatorTools
                ? 'bg-[#1A1817] text-white border-[#1A1817] shadow-xs'
                : 'bg-white text-[#1A1817] border-[#E5E2DE] hover:bg-[#FAF9F7]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showSimulatorTools ? 'Close Sensor Simulator' : 'Adjust Sensor Readings'}</span>
          </button>

          <button
            onClick={() => setShowPhonePreview(!showPhonePreview)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              showPhonePreview
                ? 'bg-[#1A1817] text-white border-[#1A1817] shadow-xs'
                : 'bg-white text-[#1A1817] border-[#E5E2DE] hover:bg-[#FAF9F7]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{showPhonePreview ? 'Close Phone Preview' : 'Farmer SMS Preview'}</span>
          </button>
        </div>

        {/* Quick Scenario Preset Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[#A8A29D] font-bold text-[10px] uppercase tracking-wider mr-1 hidden sm:inline">
            Quick Tests:
          </span>
          <button
            onClick={() => onApplyPreset('john-case-study')}
            className="px-3 py-1 rounded-lg bg-[#16A34A]/10 text-[#15803D] border border-[#16A34A]/20 font-bold hover:bg-[#16A34A]/20 transition-all text-xs whitespace-nowrap cursor-pointer"
          >
            55% Moisture (Irrigate 20m)
          </button>
          <button
            onClick={() => onApplyPreset('rule-1-rain')}
            className="px-3 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-bold hover:bg-sky-100 transition-all text-xs whitespace-nowrap cursor-pointer"
          >
            80% Rain (Hold Pumping)
          </button>
          <button
            onClick={() => onApplyPreset('rule-2-drought')}
            className="px-3 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200 font-bold hover:bg-red-100 transition-all text-xs whitespace-nowrap cursor-pointer"
          >
            22% Dry (Urgent Drip)
          </button>
        </div>
      </div>

      {/* Collapsible Simulator Panels */}
      {showSimulatorTools && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <SensorSimulator
            soil={soil}
            weather={weather}
            tank={tank}
            crop={selectedPlot.crop}
            onUpdateSoilMoisture={(val) => setSoil((prev) => ({ ...prev, moisturePercent: val }))}
            onUpdateRainProbability={(val) => setWeather((prev) => ({ ...prev, rainProbabilityPercent: val }))}
            onUpdateTankLiters={(val) => setTank((prev) => ({ ...prev, currentLiters: val, percentage: Math.round((val / prev.capacityLiters) * 100) }))}
            onUpdateEvaporationRate={(val) => setWeather((prev) => ({ ...prev, evaporationRateMmDay: val }))}
            onApplyPreset={onApplyPreset}
          />
        </div>
      )}

      {showPhonePreview && (
        <div className="max-w-md mx-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <FeaturePhoneSimulator
            recommendation={currentRecommendation}
            language={language}
            onSelectLanguage={setLanguage}
            farmerName="John Omondi"
          />
        </div>
      )}

      {/* Water Usage & Conservation Chart */}
      <WaterUsageChart />

    </div>
  );
};
