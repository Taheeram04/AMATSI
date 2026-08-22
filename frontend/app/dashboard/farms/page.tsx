"use client";

/*
 * app/dashboard/farms/page.tsx — FARM MANAGEMENT
 * Lists the farmer's farms from the backend, with create and delete.
 */

import { useCallback, useEffect, useState } from "react";
import { farmAPI } from "@/lib/api/client";
import type { ApiFarm } from "@/types";

const CROPS = ["Maize", "Beans", "Tomatoes", "Onions", "Cabbage", "Potatoes", "Rice"];
const SOILS = ["Loam", "Clay", "Sandy", "Silt", "Other"];
const METHODS = ["Drip", "Sprinkler", "Furrow", "Manual"];

const EMPTY_FORM = {
	name: "",
	latitude: "-1.29",
	longitude: "36.82",
	area_hectares: "1",
	crop_type: "Maize",
	soil_type: "Loam",
	irrigation_method: "Drip",
	tank_capacity_liters: "5000",
	planting_date: new Date().toISOString().slice(0, 10),
	device_id: "",
};

export default function FarmsPage() {
	const [farms, setFarms] = useState<ApiFarm[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState(EMPTY_FORM);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			setFarms(await farmAPI.getFarms());
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load farms");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setError(null);
		try {
			await farmAPI.createFarm({
				name: form.name.trim(),
				latitude: parseFloat(form.latitude),
				longitude: parseFloat(form.longitude),
				area_hectares: parseFloat(form.area_hectares),
				crop_type: form.crop_type,
				soil_type: form.soil_type,
				irrigation_method: form.irrigation_method,
				tank_capacity_liters: parseFloat(form.tank_capacity_liters),
				planting_date: form.planting_date,
				device_id: form.device_id.trim() || undefined,
			});
			setForm(EMPTY_FORM);
			setShowForm(false);
			await load();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create farm");
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!window.confirm("Delete this farm?")) return;
		try {
			await farmAPI.deleteFarm(id);
			await load();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete farm");
		}
	};

	const inputCls =
		"w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-emerald-500 focus:outline-none";

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-serif text-2xl font-bold text-stone-900">Farms</h1>
					<p className="mt-1 text-stone-500 text-sm">
						Manage the fields monitored by AMATSI.
					</p>
				</div>
				<button
					onClick={() => setShowForm((s) => !s)}
					className="rounded-xl bg-emerald-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-800"
				>
					{showForm ? "Cancel" : "Add Farm"}
				</button>
			</div>

			{error && (
				<div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
					{error}
				</div>
			)}

			{showForm && (
				<form
					onSubmit={handleCreate}
					className="grid grid-cols-1 gap-4 rounded-2xl border border-stone-200/60 bg-brand-card p-6 sm:grid-cols-2 lg:grid-cols-3"
				>
					<label className="block sm:col-span-2 lg:col-span-3">
						<span className="mb-1 block text-xs font-semibold text-stone-700">Farm Name</span>
						<input
							required
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
							placeholder="e.g. North Field"
							className={inputCls}
						/>
					</label>
					<label className="block">
						<span className="mb-1 block text-xs font-semibold text-stone-700">Latitude (-90..90)</span>
						<input required type="number" step="any" min={-90} max={90} value={form.latitude}
							onChange={(e) => setForm({ ...form, latitude: e.target.value })} className={inputCls} />
					</label>
					<label className="block">
						<span className="mb-1 block text-xs font-semibold text-stone-700">Longitude (-180..180)</span>
						<input required type="number" step="any" min={-180} max={180} value={form.longitude}
							onChange={(e) => setForm({ ...form, longitude: e.target.value })} className={inputCls} />
					</label>
					<label className="block">
						<span className="mb-1 block text-xs font-semibold text-stone-700">Area (hectares)</span>
						<input required type="number" step="any" min="0.01" value={form.area_hectares}
							onChange={(e) => setForm({ ...form, area_hectares: e.target.value })} className={inputCls} />
					</label>
					<label className="block">
						<span className="mb-1 block text-xs font-semibold text-stone-700">Tank Capacity (litres)</span>
						<input required type="number" step="any" min="1" value={form.tank_capacity_liters}
							onChange={(e) => setForm({ ...form, tank_capacity_liters: e.target.value })} className={inputCls} />
					</label>
					<label className="block">
						<span className="mb-1 block text-xs font-semibold text-stone-700">Crop Type</span>
						<select value={form.crop_type} onChange={(e) => setForm({ ...form, crop_type: e.target.value })} className={inputCls}>
							{CROPS.map((c) => <option key={c}>{c}</option>)}
						</select>
					</label>
					<label className="block">
						<span className="mb-1 block text-xs font-semibold text-stone-700">Soil Type</span>
						<select value={form.soil_type} onChange={(e) => setForm({ ...form, soil_type: e.target.value })} className={inputCls}>
							{SOILS.map((s) => <option key={s}>{s}</option>)}
						</select>
					</label>
					<label className="block">
						<span className="mb-1 block text-xs font-semibold text-stone-700">Irrigation Method</span>
						<select value={form.irrigation_method} onChange={(e) => setForm({ ...form, irrigation_method: e.target.value })} className={inputCls}>
							{METHODS.map((m) => <option key={m}>{m}</option>)}
						</select>
					</label>
					<label className="block">
						<span className="mb-1 block text-xs font-semibold text-stone-700">Planting Date</span>
						<input required type="date" value={form.planting_date}
							onChange={(e) => setForm({ ...form, planting_date: e.target.value })} className={inputCls} />
					</label>
					<label className="block">
						<span className="mb-1 block text-xs font-semibold text-stone-700">Device ID (optional)</span>
						<input value={form.device_id} onChange={(e) => setForm({ ...form, device_id: e.target.value })}
							placeholder="IoT device for premium farms" className={inputCls} />
					</label>
					<div className="sm:col-span-2 lg:col-span-3">
						<button
							type="submit"
							disabled={saving}
							className="w-full rounded-xl bg-brand-orange py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-orange-500 disabled:opacity-50 sm:w-auto sm:px-8"
						>
							{saving ? "Creating..." : "Create Farm"}
						</button>
					</div>
				</form>
			)}

			{loading ? (
				<div className="flex h-40 items-center justify-center text-sm text-stone-500">Loading farms...</div>
			) : farms.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500">
					No farms yet. Click <span className="font-semibold">Add Farm</span> to create your first field.
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{farms.map((farm) => (
						<div key={farm.id} className="rounded-2xl border border-stone-200/60 bg-brand-card p-5">
							<div className="flex items-start justify-between">
								<div>
									<h3 className="font-serif text-lg font-bold text-stone-900">{farm.name}</h3>
									<p className="text-xs text-stone-500">{farm.crop_type} · {farm.soil_type}</p>
								</div>
								<button
									onClick={() => handleDelete(farm.id)}
									className="text-[11px] font-mono uppercase text-rose-600 hover:text-rose-800"
								>
									Delete
								</button>
							</div>
							<dl className="mt-4 space-y-1 text-xs text-stone-600">
								<div className="flex justify-between"><dt>Area</dt><dd>{farm.area_hectares} ha</dd></div>
								<div className="flex justify-between"><dt>Tank</dt><dd>{farm.tank_capacity_liters.toLocaleString()} L</dd></div>
								<div className="flex justify-between"><dt>Irrigation</dt><dd>{farm.irrigation_method}</dd></div>
								<div className="flex justify-between"><dt>Planted</dt><dd>{farm.planting_date?.slice(0, 10)}</dd></div>
								<div className="flex justify-between"><dt>Location</dt><dd className="font-mono">{farm.latitude.toFixed(3)}, {farm.longitude.toFixed(3)}</dd></div>
							</dl>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
