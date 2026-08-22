"use client";

/*
 * app/dashboard/page.tsx — DASHBOARD OVERVIEW
 *
 * Loads the farmer's first farm, then fetches live weather / soil /
 * recommendations / alerts from the Go backend. Cards without a backend
 * source (tank level, water usage) fall back to mock data. If no farm
 * exists yet or the API is unreachable, all cards use mock data.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useOffline } from "@/hooks/useOffline";
import { useRealtime } from "@/hooks/useRealtime";
import WeatherCard from "@/components/dashboard/WeatherCard";
import SoilMoistureCard from "@/components/dashboard/SoilMoistureCard";
import TankLevelCard from "@/components/dashboard/TankLevelCard";
import WaterUsageChart from "@/components/dashboard/WaterUsageChart";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import {
	farmAPI,
	weatherAPI,
	recommendationAPI,
	alertAPI,
} from "@/lib/api/client";
import {
	mockAlerts,
	mockRecommendation,
	mockSoilMoisture,
	mockTankLevel,
	mockWaterUsage,
	mockWeather,
	type Alert,
	type WaterPoint,
} from "@/lib/mock/data";
import type {
	Recommendation,
	SoilMoisture,
	TankLevel,
	WeatherData,
} from "@/types";

type AlertRow = Alert;

export default function DashboardPage() {
	const { user, loading } = useAuth();
	const { isOnline } = useOffline("dashboard", null);
	const [toast, setToast] = useState<string | null>(null);

	const [farmId, setFarmId] = useState<string | null>(null);
	const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
	const [weather, setWeather] = useState<WeatherData | null>(null);
	const [soilReadings, setSoilReadings] = useState<SoilMoisture[] | null>(null);
	const [recentAlerts, setRecentAlerts] = useState<AlertRow[] | null>(null);

	useRealtime<Record<string, unknown>>("recommendations", () => {
		setToast("New recommendation received");
		setTimeout(() => setToast(null), 4000);
	});

	useEffect(() => {
		let cancelled = false;
		(async () => {
			let farms;
			try {
				farms = await farmAPI.getFarms();
			} catch {
				return;
			}
			if (cancelled || farms.length === 0) return;

			const farm = farms[0];
			setFarmId(farm.id);

			const [w, recs, soil, alerts] = await Promise.allSettled([
				weatherAPI.getCurrent(farm.id),
				recommendationAPI.getForFarm(farm.id),
				weatherAPI.getSoilMoisture(farm.id, farm.name),
				alertAPI.getHistory(farm.id),
			]);
			if (cancelled) return;

			if (w.status === "fulfilled") setWeather(w.value);
			if (recs.status === "fulfilled" && recs.value.length > 0) {
				setRecommendation(recs.value[recs.value.length - 1]);
			}
			if (soil.status === "fulfilled") setSoilReadings([soil.value]);
			if (alerts.status === "fulfilled") {
				setRecentAlerts(alerts.value.slice(0, 5));
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const handleSendSMS = async () => {
		if (!farmId || !recommendation) return;
		try {
			await alertAPI.send({
				farm_id: farmId,
				message: `${recommendation.action}: ${recommendation.reason}`,
			});
			setToast("SMS alert queued");
		} catch {
			setToast("Failed to queue SMS");
		}
		setTimeout(() => setToast(null), 4000);
	};

	if (loading) {
		return (
			<div className="h-96 flex items-center justify-center text-stone-500">Loading...</div>
		);
	}

	if (!user) {
		return <p className="text-rose-600">Please login to view dashboard</p>;
	}

	const farmerName = user.full_name?.trim() || "Farmer";

	const tankLevel: TankLevel = mockTankLevel();
	const waterUsage: WaterPoint[] = mockWaterUsage();

	const shownRecommendation: Recommendation =
		recommendation ?? mockRecommendation();
	const shownWeather: WeatherData = weather ?? mockWeather();
	const shownSoil: SoilMoisture[] = soilReadings ?? mockSoilMoisture();
	const shownAlerts: AlertRow[] = recentAlerts ?? mockAlerts();

	return (
		<div className="space-y-6">
			<div className="bg-brand-card shadow-sm p-6 mb-2 rounded-t-2xl border border-stone-200/60">
				<div className="flex items-center gap-4">
					<span className="text-2xl font-bold font-serif text-stone-900">
						Karibu, {farmerName}!
					</span>
					<span
						className={`text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-full ${
							isOnline ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-700"
						}`}
					>
						{isOnline ? "Online" : "Offline Mode"}
					</span>
				</div>
				{toast && <p className="text-xs text-emerald-700 mt-1">{toast}</p>}
			</div>

			{!farmId && (
				<div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm flex items-center justify-between gap-4">
					<span>No farms yet — add one to unlock live weather and recommendations.</span>
					<Link href="/dashboard/farms" className="font-semibold underline whitespace-nowrap">
						Add Farm
					</Link>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
				<RecommendationCard
					recommendation={shownRecommendation}
					onSendSMS={handleSendSMS}
				/>
				<WeatherCard weather={shownWeather} />
				<TankLevelCard tank={tankLevel} />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<SoilMoistureCard readings={shownSoil} />
				<WaterUsageChart data={waterUsage} />
				<RecentAlerts alerts={shownAlerts} />
			</div>
		</div>
	);
}
