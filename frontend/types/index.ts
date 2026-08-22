/*
 * types/index.ts — SHARED TYPES
 * Mirrors DB schema (migrations 001-005) and API response shapes.
 * Keep in sync with backend/internal/models/* and ai-service models.
 */

export type Language = "en" | "sw" | "luo";
export type Theme = "light" | "dark" | "auto";
export type Plan = "free" | "pro";

export interface Farmer {
	id: string;
	name: string;
	phone: string;
	email: string;
	language: Language;
	sms_enabled: boolean;
	theme: Theme;
	plan: Plan;
	created_at: string;
}

export type CropType =
	| "Maize"
	| "Beans"
	| "Tomatoes"
	| "Onions"
	| "Cabbage"
	| "Potatoes"
	| "Rice";

export type SoilType = "Loam" | "Clay" | "Sandy" | "Silt" | "Other";
export type IrrigationMethod = "Drip" | "Sprinkler" | "Furrow" | "Manual";

export interface Farm {
	id: string;
	farmerId: string;
	name: string;
	lat: number;
	lon: number;
	areaHa: number;
	cropType: CropType;
	plantingDate: string;
	soilType: SoilType;
	irrigationMethod: IrrigationMethod;
	tankCapacityL: number;
	createdAt: string;
}

export type RecommendationAction = "IRRIGATE" | "WAIT" | "MONITOR" | "CONSERVE";
export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface Recommendation {
	id: string;
	farmId: string;
	action: RecommendationAction;
	reason: string;
	volumeL?: number;
	waterSavedL?: number;
	confidence?: ConfidenceLevel;
	createdAt: string;
	read?: boolean;
}

export interface WeatherData {
	temperatureC: number;
	rainProbability: number;
	expectedRainfallMm?: number;
	humidity?: number;
	fetchedAt: string;
	source: "KijaniBox";
}

export type SoilStatus = "optimal" | "caution" | "dry";

export interface SoilMoisture {
	farmId: string;
	farmName: string;
	moisturePercent: number;
	status: SoilStatus;
	fetchedAt: string;
}

export interface TankLevel {
	farmId: string;
	currentL: number;
	capacityL: number;
	inflowRateLPerMin?: number;
	estFullMinutes?: number;
	updatedAt: string;
}

export type SMSStatus = "delivered" | "pending" | "failed";

export interface SMSLog {
	id: string;
	farmerId: string;
	farmName: string;
	recipientPhone: string;
	message: string;
	language: Language;
	status: SMSStatus;
	createdAt: string;
}

export interface PhoneLabel {
	phone: string;
	label: string;
	isPrimary: boolean;
}

export interface Notification {
	id: string;
	type: string;
	message: string;
	read: boolean;
	createdAt: string;
}

/*
 * BACKEND API TYPES — mirror backend/internal/models/* JSON tags exactly.
 */
export interface ApiUser {
	id: string;
	full_name: string;
	phone_number: string;
	email?: string;
	language?: string;
	sms_enabled?: boolean;
	is_premium?: boolean;
	created_at: string;
	updated_at: string;
}

export interface ApiFarm {
	id: string;
	user_id: string;
	name: string;
	device_id: string | null;
	latitude: number;
	longitude: number;
	area_hectares: number;
	crop_type: string;
	soil_type: string;
	irrigation_method: string;
	tank_capacity_liters: number;
	planting_date: string;
	created_at: string;
	updated_at: string;
}

export interface ApiRecommendation {
	id: string;
	farm_id: string;
	action: RecommendationAction | string;
	reason: string;
	water_saved_estimate: number;
	created_at: string;
}

export type ApiAlertStatus = "PENDING" | "SENT" | "FAILED";

export interface ApiAlert {
	id: string;
	farm_id: string;
	message: string;
	status: ApiAlertStatus;
	sent_at: string | null;
	created_at: string;
}

export interface ApiEnvelope<T> {
	data: T;
	from_cache?: boolean;
}
