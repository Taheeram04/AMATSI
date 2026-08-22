import React from 'react';
import { useIrrigationState } from './hooks/useIrrigationState';
import { Header } from './components/layout/Header';
import { LiveIrrigationView } from './components/dashboard/LiveIrrigationView';
import { AIAgronomist } from './components/ai/AIAgronomist';
import { FarmManager } from './components/farms/FarmManager';
import { ImpactCalculator } from './components/impact/ImpactCalculator';
import { AlertHistory } from './components/alerts/AlertHistory';
import { CaseStudyModal } from './components/landing/CaseStudyModal';
import { Logo } from './components/common/Logo';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const {
    activeTab,
    setActiveTab,
    plots,
    selectedPlot,
    setSelectedPlotId,
    soil,
    setSoil,
    weather,
    setWeather,
    tank,
    setTank,
    language,
    setLanguage,
    isOffline,
    setIsOffline,
    alerts,
    isSendingSms,
    smsSentFeedback,
    toastMessage,
    isCaseStudyOpen,
    setIsCaseStudyOpen,
    activeCropProfile,
    currentRecommendation,
    handleSendSms,
    handleApplyPreset,
    handleAddPlot,
    handleDeletePlot
  } = useIrrigationState();

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1A1817] flex flex-col font-futura antialiased selection:bg-[#DCFCE7] selection:text-[#14532D]">
      
      {/* App Header with Bespoke Logo & Clean Futura Navigation */}
      <Header
        plots={plots}
        selectedPlot={selectedPlot}
        onSelectPlot={(plot) => setSelectedPlotId(plot.id)}
        language={language}
        onSelectLanguage={setLanguage}
        isOffline={isOffline}
        onToggleOffline={() => setIsOffline(!isOffline)}
        onOpenCaseStudy={() => setIsCaseStudyOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1A1817] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#2B2725] text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: LIVE IRRIGATION TELEMETRY */}
        {activeTab === 'irrigate' && (
          <LiveIrrigationView
            currentRecommendation={currentRecommendation}
            selectedPlot={selectedPlot}
            activeCropProfile={activeCropProfile}
            soil={soil}
            setSoil={setSoil}
            weather={weather}
            setWeather={setWeather}
            tank={tank}
            setTank={setTank}
            language={language}
            setLanguage={setLanguage}
            onSendSms={handleSendSms}
            isSendingSms={isSendingSms}
            smsSentFeedback={smsSentFeedback}
            onApplyPreset={handleApplyPreset}
          />
        )}

        {/* TAB 2: AI AGRONOMIST (GEMINI 3.7 FLASH) */}
        {activeTab === 'agronomist' && (
          <AIAgronomist
            selectedPlot={selectedPlot}
            soil={soil}
            weather={weather}
            tank={tank}
            language={language}
            onSelectLanguage={setLanguage}
          />
        )}

        {/* TAB 3: MY FARM PLOTS */}
        {activeTab === 'plots' && (
          <FarmManager
            plots={plots}
            selectedPlot={selectedPlot}
            onSelectPlot={(plot) => setSelectedPlotId(plot.id)}
            onAddPlot={handleAddPlot}
            onDeletePlot={handleDeletePlot}
          />
        )}

        {/* TAB 4: WATER & FUEL SAVINGS ROI */}
        {activeTab === 'savings' && <ImpactCalculator />}

        {/* TAB 5: SMS BROADCASTS (AFRICA'S TALKING) */}
        {activeTab === 'sms' && (
          <AlertHistory
            alerts={alerts}
            onTriggerTestSms={(lang) => handleSendSms(currentRecommendation, lang)}
          />
        )}

      </main>

      {/* Case Study Modal */}
      <CaseStudyModal
        isOpen={isCaseStudyOpen}
        onClose={() => setIsCaseStudyOpen(false)}
        onJumpToDashboard={() => {
          setIsCaseStudyOpen(false);
          setActiveTab('irrigate');
        }}
      />

      {/* Brand Footer: Cotton Black Soil & Vegetation Green */}
      <footer className="bg-white border-t border-[#E5E2DE] py-6 text-xs mt-12 text-[#615B57] font-futura">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} />
            <div>
              <span className="font-bold text-[#1A1817]">AMATSI Smart Irrigation Systems</span>
              <span className="mx-2 text-[#D8D4CE]">•</span>
              <span className="text-[11px] text-[#78716C]">
                Lake Victoria Basin Commission (LVBC) & IWMI Vertisol Model Grounded
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-[11px] text-[#A8A29D]">
            <span>Kisumu County</span>
            <span>•</span>
            <span>Homa Bay County</span>
            <span>•</span>
            <span className="text-[#15803D] font-bold">Africa's Talking SMS Gateway</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
