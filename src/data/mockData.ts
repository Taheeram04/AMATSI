import { CropProfile, FarmPlot, SMSAlert, SoilReading, TankReading, WeatherReading } from '../types';

export const CROP_PROFILES: Record<string, CropProfile> = {
  kales: {
    id: 'kales',
    name: 'Sukuma Wiki (Collard Greens)',
    localName: 'Sukuma Wiki',
    category: 'High-Value Commercial',
    rootDepthCm: '15 – 25 cm (Shallow roots)',
    dailyWaterRequirementMm: 4.5,
    growthPeriodDays: 45,
    marketPricePerKgKes: 40,
    traditionalFurrowWaterLossPct: 75,
    amatsiWaterEfficiencyGainPct: 65,
    vulnerabilityToDeepPercolation: 'Extremely high. Flooding sinks water past 25cm, causing nutrient leaching and yellowing leaves.'
  },
  maize: {
    id: 'maize',
    name: 'Maize (Staple Grain)',
    localName: 'Bande / Mahindi',
    category: 'Staple Food',
    rootDepthCm: '50 – 80 cm (Medium-Deep)',
    dailyWaterRequirementMm: 6.0,
    growthPeriodDays: 90,
    marketPricePerKgKes: 65,
    traditionalFurrowWaterLossPct: 65,
    amatsiWaterEfficiencyGainPct: 50,
    vulnerabilityToDeepPercolation: 'High during early vegetative stage; susceptible to hot dry spells in Lake Victoria lowlands.'
  },
  managu: {
    id: 'managu',
    name: 'African Nightshade (Managu / Osuga)',
    localName: 'Managu / Osuga',
    category: 'Indigenous Nutrient-Rich',
    rootDepthCm: '20 – 30 cm (Shallow)',
    dailyWaterRequirementMm: 4.0,
    growthPeriodDays: 35,
    marketPricePerKgKes: 90,
    traditionalFurrowWaterLossPct: 70,
    amatsiWaterEfficiencyGainPct: 68,
    vulnerabilityToDeepPercolation: 'Very high. Shallow roots need micro-pulses of water rather than heavy furrows.'
  },
  spider_plant: {
    id: 'spider_plant',
    name: 'Spider Plant (Akeyo / Saget)',
    localName: 'Akeyo / Saget / Dek',
    category: 'Indigenous Nutrient-Rich',
    rootDepthCm: '20 – 35 cm (Moderate)',
    dailyWaterRequirementMm: 3.8,
    growthPeriodDays: 30,
    marketPricePerKgKes: 110,
    traditionalFurrowWaterLossPct: 70,
    amatsiWaterEfficiencyGainPct: 70,
    vulnerabilityToDeepPercolation: 'Drought-tolerant yet vulnerable to root-rot from waterlogged flood channels.'
  },
  tomatoes: {
    id: 'tomatoes',
    name: 'Tomatoes (Nyanya)',
    localName: 'Nyanya',
    category: 'High-Value Commercial',
    rootDepthCm: '30 – 50 cm',
    dailyWaterRequirementMm: 5.5,
    growthPeriodDays: 75,
    marketPricePerKgKes: 80,
    traditionalFurrowWaterLossPct: 72,
    amatsiWaterEfficiencyGainPct: 60,
    vulnerabilityToDeepPercolation: 'High risk of fungal blight when furrow water splashes onto foliage and root zones.'
  }
};

export const INITIAL_PLOTS: FarmPlot[] = [
  {
    id: 'plot-kales-1',
    name: "John's Kales Plot (Sukuma Wiki)",
    location: "Kano Plains, Kisumu County (Lake Victoria Basin)",
    areaAcres: 0.25,
    crop: 'kales',
    cropStage: 'Vegetative (Active Growth)',
    plantingDate: '2026-07-28',
    soilType: 'Black Cotton Soil (Vertisol)',
    irrigationMethod: 'Drip System (Amatsi)',
    currentMoisture: 55,
    targetMoisture: 70,
    sensorId: 'KIJANI-NODE-042',
    pumpFuelPerWeekKes: 850
  },
  {
    id: 'plot-maize-1',
    name: "John's Food Security Maize",
    location: "Kano Plains, Kisumu County",
    areaAcres: 0.25,
    crop: 'maize',
    cropStage: 'Vegetative (Active Growth)',
    plantingDate: '2026-07-15',
    soilType: 'Clay Loam',
    irrigationMethod: 'Drip System (Amatsi)',
    currentMoisture: 62,
    targetMoisture: 65,
    sensorId: 'KIJANI-NODE-043',
    pumpFuelPerWeekKes: 600
  },
  {
    id: 'plot-managu-new',
    name: "Expansion Plot: Indigenous Managu (Saved-Water Plot)",
    location: "Kano Plains, Kisumu County",
    areaAcres: 0.15,
    crop: 'managu',
    cropStage: 'Seedling',
    plantingDate: '2026-08-10',
    soilType: 'Sandy Loam',
    irrigationMethod: 'Drip System (Amatsi)',
    currentMoisture: 50,
    targetMoisture: 65,
    sensorId: 'KIJANI-NODE-044',
    pumpFuelPerWeekKes: 300
  }
];

export const INITIAL_SOIL: SoilReading = {
  moisturePercent: 55,
  optimalMin: 60,
  optimalMax: 78,
  rootZoneDepthCm: 20,
  percolationRisk: 'Low',
  temperatureC: 27.4,
  lastUpdated: 'Just now (via KijaniBox Mesh)'
};

export const INITIAL_WEATHER: WeatherReading = {
  temperatureC: 31.5,
  humidityPercent: 62,
  rainProbabilityPercent: 25,
  evaporationRateMmDay: 6.4,
  condition: 'Sunny & Hot',
  windSpeedKmh: 14
};

export const INITIAL_TANK: TankReading = {
  currentLiters: 2400,
  capacityLiters: 3000,
  percentage: 80,
  flowRateLpm: 28,
  pumpStatus: 'OFF',
  fuelType: 'Petrol (Motorized)'
};

export const INITIAL_ALERTS: SMSAlert[] = [
  {
    id: 'sms-001',
    timestamp: 'Today, 06:45 AM',
    recipientName: 'John Omondi',
    recipientPhone: '+254 712 345 678',
    language: 'en',
    messageText: 'Amatsi Alert: John, your kales need water. Irrigate for 20 minutes now. (Soil: 55%, Rain: 25%)',
    status: 'DELIVERED',
    crop: 'kales',
    action: 'IRRIGATE',
    gateway: "Africa's Talking (Kijani Gateway)",
    costKes: 0.8
  },
  {
    id: 'sms-002',
    timestamp: 'Yesterday, 04:30 PM',
    recipientName: 'John Omondi',
    recipientPhone: '+254 712 345 678',
    language: 'sw',
    messageText: 'Ilani ya Amatsi: John, usimwagilie maji sasa. Mvua inatarajiwa (80%). Hifadhi maji na mafuta ya pampu.',
    status: 'DELIVERED',
    crop: 'maize',
    action: 'WAIT',
    gateway: "Africa's Talking (Kijani Gateway)",
    costKes: 0.8
  },
  {
    id: 'sms-003',
    timestamp: '2 days ago, 07:15 AM',
    recipientName: 'John Omondi',
    recipientPhone: '+254 712 345 678',
    language: 'luo',
    messageText: 'Amatsi E-Simu: John, osuga / managu mari dwaro pi. Olo pi kuom dakika 15 sani kende.',
    status: 'DELIVERED',
    crop: 'managu',
    action: 'IRRIGATE',
    gateway: "Africa's Talking (Kijani Gateway)",
    costKes: 0.8
  }
];

export const REGIONAL_METRICS = {
  basinName: 'Lake Victoria Lowlands (Kisumu / Homa Bay)',
  traditionalLossPercentage: '60% – 80%',
  primaryLossCauses: [
    'Extreme Evaporation: 6-8mm/day losses from flooded open earth channels',
    'Deep Soil Drainage (Percolation): Water sinks past shallow 20cm roots into deep subsoil',
    'Data Blindspot: Inability to gauge sub-surface moisture leads to over/under-watering cycles'
  ],
  amatsiOutcomes: {
    waterSaved: '50% – 70%',
    yieldIncrease: '+30% crop yield',
    fuelSavingsKesWeekly: 'KES 1,200 / week (approx. 55% reduction)',
    hyacinthMitigation: 'Zero fertilizer leaching into Nyando / Sondu Miriu river runoff'
  }
};
