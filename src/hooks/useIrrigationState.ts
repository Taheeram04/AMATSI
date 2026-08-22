import { useState, useMemo, useCallback } from 'react';
import { 
  INITIAL_PLOTS, 
  INITIAL_SOIL, 
  INITIAL_WEATHER, 
  INITIAL_TANK, 
  INITIAL_ALERTS, 
  CROP_PROFILES 
} from '../data/mockData';
import { FarmPlot, Language, SoilReading, WeatherReading, TankReading, SMSAlert, Recommendation } from '../types';
import { evaluateIrrigationRules, formatSmsMessage } from '../services/recommendationEngine';

export type NavigationTab = 'irrigate' | 'agronomist' | 'plots' | 'savings' | 'sms';

export function useIrrigationState() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavigationTab>('irrigate');

  // Farm Plots State
  const [plots, setPlots] = useState<FarmPlot[]>(INITIAL_PLOTS);
  const [selectedPlotId, setSelectedPlotId] = useState<string>(INITIAL_PLOTS[0].id);

  // Sensor & Telemetry Readings
  const [soil, setSoil] = useState<SoilReading>(INITIAL_SOIL);
  const [weather, setWeather] = useState<WeatherReading>(INITIAL_WEATHER);
  const [tank, setTank] = useState<TankReading>(INITIAL_TANK);

  // Language Preferences (en, sw, luo)
  const [language, setLanguage] = useState<Language>('en');

  // Network State
  const [isOffline, setIsOffline] = useState(false);

  // Alerts History
  const [alerts, setAlerts] = useState<SMSAlert[]>(INITIAL_ALERTS);

  // Dispatch States & Toast
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsSentFeedback, setSmsSentFeedback] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Story Modal State
  const [isCaseStudyOpen, setIsCaseStudyOpen] = useState(false);

  // Selected Plot Object
  const selectedPlot = useMemo(() => {
    return plots.find((p) => p.id === selectedPlotId) || plots[0];
  }, [plots, selectedPlotId]);

  const activeCropProfile = useMemo(() => {
    return CROP_PROFILES[selectedPlot.crop] || CROP_PROFILES.kales;
  }, [selectedPlot]);

  // Compute live irrigation recommendation
  const currentRecommendation: Recommendation = useMemo(() => {
    return evaluateIrrigationRules({
      soil,
      weather,
      tank,
      crop: selectedPlot.crop,
      plotName: selectedPlot.name,
      areaAcres: selectedPlot.areaAcres
    });
  }, [soil, weather, tank, selectedPlot]);

  // Handle SMS Dispatch
  const handleSendSms = useCallback((rec: Recommendation, lang: Language) => {
    setIsSendingSms(true);
    const smsText = formatSmsMessage(rec, lang);

    setTimeout(() => {
      const newAlert: SMSAlert = {
        id: `sms-${Date.now()}`,
        timestamp: 'Just now',
        recipientName: 'John Omondi',
        recipientPhone: '+254 712 345 678',
        language: lang,
        messageText: smsText,
        status: 'DELIVERED',
        crop: rec.crop,
        action: rec.action,
        gateway: "Africa's Talking (Kijani Gateway)",
        costKes: 0.8
      };

      setAlerts((prev) => [newAlert, ...prev]);
      setIsSendingSms(false);
      setSmsSentFeedback(true);
      setToastMessage(`SMS sent to John (+254 712 345 678) via Africa's Talking`);

      setTimeout(() => {
        setSmsSentFeedback(false);
      }, 3000);

      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
    }, 700);
  }, []);

  // Quick Preset Scenarios for verification
  const handleApplyPreset = useCallback((scenario: string) => {
    if (scenario === 'john-case-study') {
      setSoil((prev) => ({ ...prev, moisturePercent: 55 }));
      setWeather((prev) => ({ ...prev, rainProbabilityPercent: 25, condition: 'Sunny & Hot' }));
      setTank((prev) => ({ ...prev, currentLiters: 2400 }));
      const kalesPlot = plots.find((p) => p.crop === 'kales');
      if (kalesPlot) setSelectedPlotId(kalesPlot.id);
      setToastMessage("Scenario loaded: John's Kales at 55% moisture");
    } else if (scenario === 'rule-1-rain') {
      setWeather((prev) => ({ ...prev, rainProbabilityPercent: 80, condition: 'Rain Approaching' }));
      setToastMessage("Scenario loaded: 80% Rain Expected (Action: WAIT)");
    } else if (scenario === 'rule-2-drought') {
      setSoil((prev) => ({ ...prev, moisturePercent: 22 }));
      setWeather((prev) => ({ ...prev, rainProbabilityPercent: 10, condition: 'Sunny & Hot' }));
      setToastMessage("Scenario loaded: Critical Dryness 22% (Action: IRRIGATE)");
    } else if (scenario === 'rule-4-low-tank') {
      setTank((prev) => ({ ...prev, currentLiters: 350 }));
      setToastMessage("Scenario loaded: Low Tank 350L (Action: CONSERVE)");
    }
  }, [plots]);

  // Plot Management
  const handleAddPlot = useCallback((newPlot: FarmPlot) => {
    setPlots((prev) => [...prev, newPlot]);
    setSelectedPlotId(newPlot.id);
    setToastMessage(`Plot "${newPlot.name}" added`);
  }, []);

  const handleDeletePlot = useCallback((id: string) => {
    if (plots.length <= 1) return;
    setPlots((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (selectedPlotId === id) {
        setSelectedPlotId(remaining[0].id);
      }
      return remaining;
    });
    setToastMessage("Plot removed");
  }, [plots.length, selectedPlotId]);

  return {
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
  };
}
