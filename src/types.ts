export type CropType = 'kales' | 'maize' | 'managu' | 'spider_plant' | 'tomatoes';

export type ActionType = 'IRRIGATE' | 'WAIT' | 'MONITOR' | 'CONSERVE';

export type Language = 'en' | 'sw' | 'luo';

export interface SoilReading {
  moisturePercent: number; // e.g. 55%
  optimalMin: number;      // e.g. 60%
  optimalMax: number;      // e.g. 80%
  rootZoneDepthCm: number; // 15-25cm for kales, 60cm for maize
  percolationRisk: 'Low' | 'Moderate' | 'High (Deep Drainage Waste)';
  temperatureC: number;
  lastUpdated: string;
}

export interface WeatherReading {
  temperatureC: number;
  humidityPercent: number;
  rainProbabilityPercent: number; // e.g. 65%
  evaporationRateMmDay: number;   // e.g. 6.8 mm/day in Kisumu lowlands
  condition: 'Sunny & Hot' | 'Partly Cloudy' | 'Rain Approaching' | 'Light Showers' | 'Humid & Overcast';
  windSpeedKmh: number;
}

export interface TankReading {
  currentLiters: number;
  capacityLiters: number;
  percentage: number;
  flowRateLpm: number;
  pumpStatus: 'OFF' | 'PUMPING' | 'SCHEDULED';
  fuelType: 'Petrol (Motorized)' | 'Solar' | 'Grid Electric';
}

export interface Recommendation {
  id: string;
  timestamp: string;
  action: ActionType;
  crop: CropType;
  plotName: string;
  durationMinutes: number;
  waterNeededLiters: number;
  waterSavedLiters: number;
  reason: string;
  ruleTriggered: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Immediate';
  smsTemplates: {
    en: string;
    sw: string;
    luo: string;
  };
}

export interface FarmPlot {
  id: string;
  name: string;
  location: string; // e.g., 'Ahero, Kisumu County' or 'Kanyada, Homa Bay'
  areaAcres: number;
  crop: CropType;
  cropStage: 'Seedling' | 'Vegetative (Active Growth)' | 'Flowering / Maturing' | 'Harvest Ready';
  plantingDate: string;
  soilType: 'Clay Loam' | 'Sandy Loam' | 'Black Cotton Soil (Vertisol)';
  irrigationMethod: 'Drip System (Amatsi)' | 'Traditional Furrow Flooding' | 'Manual Sprinkler';
  currentMoisture: number;
  targetMoisture: number;
  sensorId: string;
  pumpFuelPerWeekKes: number;
}

export interface SMSAlert {
  id: string;
  timestamp: string;
  recipientName: string;
  recipientPhone: string;
  language: Language;
  messageText: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED' | 'QUEUED';
  crop: CropType;
  action: ActionType;
  gateway: "Africa's Talking (Kijani Gateway)";
  costKes: number;
}

export interface CropProfile {
  id: CropType;
  name: string;
  localName: string;
  category: 'Staple Food' | 'High-Value Commercial' | 'Indigenous Nutrient-Rich';
  rootDepthCm: string;
  dailyWaterRequirementMm: number;
  growthPeriodDays: number;
  marketPricePerKgKes: number;
  traditionalFurrowWaterLossPct: number;
  amatsiWaterEfficiencyGainPct: number;
  vulnerabilityToDeepPercolation: string;
}
