import { ActionType, CropType, Language, Recommendation, SoilReading, TankReading, WeatherReading } from '../types';
import { CROP_PROFILES } from '../data/mockData';

export interface EvaluationInput {
  soil: SoilReading;
  weather: WeatherReading;
  tank: TankReading;
  crop: CropType;
  plotName: string;
  areaAcres: number;
}

export function evaluateIrrigationRules(input: EvaluationInput): Recommendation {
  const { soil, weather, tank, crop, plotName, areaAcres } = input;
  const cropProfile = CROP_PROFILES[crop] || CROP_PROFILES.kales;

  let action: ActionType = 'MONITOR';
  let durationMinutes = 0;
  let waterNeededLiters = 0;
  let waterSavedLiters = 0;
  let reason = '';
  let ruleTriggered = '';
  let urgency: 'Low' | 'Medium' | 'High' | 'Immediate' = 'Low';

  // Rule 4 Check first: Tank Low (Critical storage constraint)
  if (tank.currentLiters < 500) {
    action = 'CONSERVE';
    durationMinutes = 0;
    waterNeededLiters = 0;
    waterSavedLiters = Math.round(areaAcres * 1200);
    reason = `Tank level is critically low (${tank.currentLiters}L remaining of ${tank.capacityLiters}L). Ration water reserves for household and micro-nursery use.`;
    ruleTriggered = 'Rule 4: Tank Level < 500L → CONSERVE';
    urgency = 'Immediate';
  }
  // Rule 1: High Rain Forecast (> 60%)
  else if (weather.rainProbabilityPercent >= 60) {
    action = 'WAIT';
    durationMinutes = 0;
    waterNeededLiters = 0;
    // By waiting for natural rain instead of furrow pumping, John saves 100% of pump water
    waterSavedLiters = Math.round(areaAcres * 2400);
    reason = `Rain forecast is high (${weather.rainProbabilityPercent}% chance). Hold off irrigation to let natural rainfall saturate the root zone and prevent fertilizer runoff into Lake Victoria.`;
    ruleTriggered = 'Rule 1: Rain Forecast ≥ 60% → WAIT';
    urgency = 'Medium';
  }
  // Rule 5: Soil is already saturated (> 80%)
  else if (soil.moisturePercent >= 80) {
    action = 'MONITOR';
    durationMinutes = 0;
    waterNeededLiters = 0;
    waterSavedLiters = Math.round(areaAcres * 1800);
    reason = `Soil moisture is at ${soil.moisturePercent}% (optimal threshold exceeded). Additional water will cause deep percolation below ${cropProfile.rootDepthCm} and waterlog the roots.`;
    ruleTriggered = 'Rule 5: Soil Moisture ≥ 80% → MONITOR (Over-saturation Guard)';
    urgency = 'Low';
  }
  // Rule 2: Soil is acutely dry (< 30%)
  else if (soil.moisturePercent < 30) {
    action = 'IRRIGATE';
    // Deep deficit: calculate targeted volume
    const moistureDeficitPct = 70 - soil.moisturePercent; // target 70%
    const baseMinutes = crop === 'maize' ? 35 : 25;
    durationMinutes = Math.round((baseMinutes * (moistureDeficitPct / 40)) * (areaAcres / 0.25));
    waterNeededLiters = Math.round(durationMinutes * tank.flowRateLpm);
    // Traditional furrow would use 3x to 4x this water
    const traditionalFurrowEquivalent = Math.round(waterNeededLiters * 3.2);
    waterSavedLiters = traditionalFurrowEquivalent - waterNeededLiters;
    reason = `Soil moisture has dropped critically to ${soil.moisturePercent}%. Acute water stress detected in the root zone. Immediate pulse irrigation required.`;
    ruleTriggered = 'Rule 2: Soil Moisture < 30% → IRRIGATE (Acute Stress)';
    urgency = 'Immediate';
  }
  // Rule 3: Soil between 30% and 60% (Depleting zone)
  else if (soil.moisturePercent <= 58) {
    action = 'IRRIGATE';
    // Moderate targeted pulse (like John's 20 min alert for kales at 55%)
    const baseMinutes = crop === 'kales' ? 20 : crop === 'managu' ? 15 : 25;
    durationMinutes = Math.round(baseMinutes * (areaAcres / 0.25));
    waterNeededLiters = Math.round(durationMinutes * tank.flowRateLpm);
    const traditionalFurrowEquivalent = Math.round(waterNeededLiters * 2.8);
    waterSavedLiters = traditionalFurrowEquivalent - waterNeededLiters;
    reason = `Soil moisture is at ${soil.moisturePercent}%, approaching lower comfort threshold. High daytime evaporation (${weather.evaporationRateMmDay}mm/day) warrants a targeted ${durationMinutes}-minute pulse.`;
    ruleTriggered = 'Rule 3: Soil Moisture 30%–60% → IRRIGATE (Targeted Pulse)';
    urgency = 'High';
  }
  // Optimal maintenance zone (59% - 79%)
  else {
    action = 'MONITOR';
    durationMinutes = 0;
    waterNeededLiters = 0;
    waterSavedLiters = Math.round(areaAcres * 1200);
    reason = `Soil moisture is in the sweet spot (${soil.moisturePercent}%). Roots have optimal moisture and aeration. No watering needed right now.`;
    ruleTriggered = 'Rule 3/Optimal: Soil Moisture 60%–79% → MONITOR';
    urgency = 'Low';
  }

  // Generate localized SMS templates
  const farmerName = 'John';
  const cropDisplay = cropProfile.localName;

  let enMsg = '';
  let swMsg = '';
  let luoMsg = '';

  if (action === 'IRRIGATE') {
    enMsg = `Amatsi Alert: ${farmerName}, your ${cropDisplay} need water. Irrigate for ${durationMinutes} minutes now. (Soil: ${soil.moisturePercent}%, Rain: ${weather.rainProbabilityPercent}%)`;
    swMsg = `Ilani ya Amatsi: ${farmerName}, ${cropDisplay} zako zinahitaji maji. Mwagilia kwa dakika ${durationMinutes} sasa. (Unyevu: ${soil.moisturePercent}%)`;
    luoMsg = `Amatsi E-Simu: ${farmerName}, ${cropDisplay} mari dwaro pi. Olo pi kuom dakika ${durationMinutes} sani kende. (Lop: ${soil.moisturePercent}%)`;
  } else if (action === 'WAIT') {
    enMsg = `Amatsi Alert: ${farmerName}, do not irrigate now. Rain is expected (${weather.rainProbabilityPercent}%). Save water and pump fuel.`;
    swMsg = `Ilani ya Amatsi: ${farmerName}, usimwagilie sasa. Mvua inatarajiwa (${weather.rainProbabilityPercent}%). Hifadhi maji na mafuta ya pampu.`;
    luoMsg = `Amatsi E-Simu: ${farmerName}, kik iol pi sani. Koth biro chwe (${weather.rainProbabilityPercent}%). Kony pi gi petro mar pampu.`;
  } else if (action === 'CONSERVE') {
    enMsg = `Amatsi Warning: ${farmerName}, tank level is low (${tank.currentLiters}L). Conserve water for critical nursery beds. Refill scheduled.`;
    swMsg = `Tahadhari ya Amatsi: ${farmerName}, tanki ya maji iko chini (${tank.currentLiters}L). Hifadhi maji kwa matumizi maalum.`;
    luoMsg = `Amatsi Siem: ${farmerName}, pi e-teng'ki tin ahinya (${tank.currentLiters}L). Rit pi maber ne nyithi kite.`;
  } else {
    enMsg = `Amatsi Status: ${farmerName}, soil moisture for ${cropDisplay} is optimal (${soil.moisturePercent}%). No irrigation needed today.`;
    swMsg = `Hali ya Amatsi: ${farmerName}, unyevu wa udongo kwa ${cropDisplay} ni mzuri (${soil.moisturePercent}%). Hakuna haja ya kumwagilia leo.`;
    luoMsg = `Amatsi Ber: ${farmerName}, ng'wono mar lop ${cropDisplay} ber ahinya (${soil.moisturePercent}%). Kik iol pi kawuono.`;
  }

  return {
    id: `rec-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    action,
    crop,
    plotName,
    durationMinutes,
    waterNeededLiters,
    waterSavedLiters,
    reason,
    ruleTriggered,
    urgency,
    smsTemplates: {
      en: enMsg,
      sw: swMsg,
      luo: luoMsg
    }
  };
}

export function formatSmsMessage(rec: Recommendation, lang: Language): string {
  return rec.smsTemplates[lang] || rec.smsTemplates.en;
}
