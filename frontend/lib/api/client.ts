import axios from 'axios';
import type {
  ApiAlert,
  ApiEnvelope,
  ApiFarm,
  ApiRecommendation,
  ApiUser,
  Farm,
  RecommendationAction,
  SMSStatus,
  SoilMoisture,
  WeatherData,
} from '@/types';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

function extractError(err: unknown, fallback: string): Error {
  const data = (err as { response?: { data?: { error?: unknown } } })?.response?.data;
  if (data && typeof data === 'object' && 'error' in data) {
    return new Error(String(data.error));
  }
  return new Error(fallback);
}

/*
 * MAPPERS — backend snake_case -> frontend view models
 */
export function mapFarm(f: ApiFarm): Farm {
  return {
    id: f.id,
    farmerId: f.user_id,
    name: f.name,
    lat: f.latitude,
    lon: f.longitude,
    areaHa: f.area_hectares,
    cropType: f.crop_type as Farm['cropType'],
    plantingDate: f.planting_date,
    soilType: f.soil_type as Farm['soilType'],
    irrigationMethod: f.irrigation_method as Farm['irrigationMethod'],
    tankCapacityL: f.tank_capacity_liters,
    createdAt: f.created_at,
  };
}

export function mapRecommendation(r: ApiRecommendation): import('@/types').Recommendation {
  return {
    id: r.id,
    farmId: r.farm_id,
    action: r.action as RecommendationAction,
    reason: r.reason,
    waterSavedL: r.water_saved_estimate ?? undefined,
    createdAt: r.created_at,
  };
}

export function mapWeather(env: ApiEnvelope<{ temperature: number; rainfall_probability: number }>, farmId: string): WeatherData & { farmId: string } {
  return {
    farmId,
    temperatureC: env.data.temperature,
    rainProbability: env.data.rainfall_probability,
    fetchedAt: new Date().toISOString(),
    source: 'KijaniBox',
  };
}

const ALERT_STATUS_MAP: Record<string, SMSStatus> = {
  PENDING: 'pending',
  SENT: 'delivered',
  FAILED: 'failed',
};

export function mapAlert(a: ApiAlert): {
  id: string;
  message: string;
  status: SMSStatus;
  timestamp: string;
} {
  return {
    id: a.id,
    message: a.message,
    status: ALERT_STATUS_MAP[a.status] ?? 'pending',
    timestamp: a.sent_at ?? a.created_at,
  };
}

export function mapSoil(env: ApiEnvelope<{ moisture_level: number }>, farmId: string, farmName?: string): SoilMoisture & { farmId: string } {
  const level = env.data.moisture_level;
  const status: SoilMoisture['status'] = level >= 40 ? 'optimal' : level >= 20 ? 'caution' : 'dry';
  return {
    farmId,
    farmName: farmName ?? '',
    moisturePercent: level,
    status,
    fetchedAt: new Date().toISOString(),
  };
}

/*
 * FARM ENDPOINTS
 */
export interface CreateFarmInput {
  name: string;
  latitude: number;
  longitude: number;
  area_hectares: number;
  crop_type: string;
  soil_type: string;
  irrigation_method: string;
  tank_capacity_liters: number;
  planting_date: string;
  device_id?: string;
}

export const farmAPI = {
  getFarms: async (): Promise<ApiFarm[]> => {
    try {
      const { data } = await apiClient.get<ApiFarm[]>('/farms');
      return Array.isArray(data) ? data : [];
    } catch (err) {
      throw extractError(err, 'Failed to load farms');
    }
  },
  getFarmDetails: async (farmId: string): Promise<ApiFarm> => {
    try {
      const { data } = await apiClient.get<ApiFarm>(`/farms/${farmId}`);
      return data;
    } catch (err) {
      throw extractError(err, 'Failed to load farm');
    }
  },
  createFarm: async (input: CreateFarmInput): Promise<ApiFarm> => {
    try {
      const { data } = await apiClient.post<ApiFarm>('/farms', input);
      return data;
    } catch (err) {
      throw extractError(err, 'Failed to create farm');
    }
  },
  updateFarm: async (farmId: string, input: Partial<CreateFarmInput>): Promise<ApiFarm> => {
    try {
      const { data } = await apiClient.put<ApiFarm>(`/farms/${farmId}`, input);
      return data;
    } catch (err) {
      throw extractError(err, 'Failed to update farm');
    }
  },
  deleteFarm: async (farmId: string): Promise<void> => {
    try {
      await apiClient.delete(`/farms/${farmId}`);
    } catch (err) {
      throw extractError(err, 'Failed to delete farm');
    }
  },
};

/*
 * WEATHER / SOIL ENDPOINTS
 */
export const weatherAPI = {
  getCurrent: async (farmId: string): Promise<ReturnType<typeof mapWeather>> => {
    try {
      const { data } = await apiClient.get<ApiEnvelope<{ temperature: number; rainfall_probability: number }>>(
        `/weather/${farmId}`
      );
      return mapWeather(data, farmId);
    } catch (err) {
      throw extractError(err, 'Failed to load weather');
    }
  },
  getSoilMoisture: async (farmId: string, farmName?: string): Promise<SoilMoisture> => {
    try {
      const { data } = await apiClient.get<ApiEnvelope<{ moisture_level: number }>>(`/soil/${farmId}`);
      return mapSoil(data, farmId, farmName);
    } catch (err) {
      throw extractError(err, 'Failed to load soil moisture');
    }
  },
};

/*
 * RECOMMENDATION ENDPOINTS
 */
export const recommendationAPI = {
  // Backend returns the full recommendation list for a farm.
  getForFarm: async (farmId: string): Promise<import('@/types').Recommendation[]> => {
    try {
      const { data } = await apiClient.get<ApiRecommendation[]>(`/recommendations/${farmId}`);
      return (Array.isArray(data) ? data : []).map(mapRecommendation);
    } catch (err) {
      throw extractError(err, 'Failed to load recommendations');
    }
  },
  getLatest: async (farmId: string): Promise<import('@/types').Recommendation | null> => {
    const recs = await recommendationAPI.getForFarm(farmId);
    return recs.length > 0 ? recs[recs.length - 1] : null;
  },
  generate: async (farmId: string): Promise<import('@/types').Recommendation> => {
    try {
      const { data } = await apiClient.post<ApiRecommendation>('/recommendations/generate', {
        farm_id: farmId,
      });
      return mapRecommendation(data);
    } catch (err) {
      throw extractError(err, 'Failed to generate recommendation');
    }
  },
};

/*
 * ALERT / SMS ENDPOINTS
 */
export interface SendAlertInput {
  farm_id: string;
  message: string;
}

export const alertAPI = {
  send: async (input: SendAlertInput): Promise<void> => {
    try {
      await apiClient.post('/alerts/send', input);
    } catch (err) {
      throw extractError(err, 'Failed to send alert');
    }
  },
  getHistory: async (
    farmId: string
  ): Promise<ReturnType<typeof mapAlert>[]> => {
    try {
      const { data } = await apiClient.get<ApiAlert[]>(`/alerts/history`, {
        params: { farm_id: farmId },
      });
      return (Array.isArray(data) ? data : []).map(mapAlert);
    } catch (err) {
      throw extractError(err, 'Failed to load alert history');
    }
  },
};

/*
 * USER ENDPOINTS
 */
export const userAPI = {
  me: async (): Promise<ApiUser> => {
    try {
      const { data } = await apiClient.get<ApiUser>('/users/me');
      return data;
    } catch (err) {
      throw extractError(err, 'Failed to load profile');
    }
  },
  updateProfile: async (input: {
    full_name: string;
    email: string;
    language: string;
    sms_enabled: boolean;
  }): Promise<ApiUser> => {
    try {
      const { data } = await apiClient.patch<ApiUser>('/users/me', input);
      return data;
    } catch (err) {
      throw extractError(err, 'Failed to update profile');
    }
  },
  changePassword: async (input: {
    current_password: string;
    new_password: string;
  }): Promise<void> => {
    try {
      await apiClient.post('/users/me/password', input);
    } catch (err) {
      throw extractError(err, 'Failed to change password');
    }
  },
};
