-- Seed Data for AMATSI Backend Demonstration
-- Idempotent: safe to re-run, no duplicate rows.

-- 1. Insert a mock user (assuming auth.users exists and has this ID).
-- Note: In a real Supabase environment, you create users via the Auth API.
-- For seeding local DB, we can just insert a dummy user.
INSERT INTO auth.users (id, email) VALUES
    ('00000000-0000-0000-0000-000000000001', 'demo@amatsi.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.users (id, full_name, phone_number) VALUES
    ('00000000-0000-0000-0000-000000000001', 'John Doe Farmer', '+254700000000')
ON CONFLICT DO NOTHING;

-- 2. Insert a Farm
INSERT INTO public.farms (id, user_id, name, latitude, longitude, area_hectares, crop_type, soil_type, irrigation_method, tank_capacity_liters, planting_date) VALUES
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Green Valley Farm', -1.2921, 36.8219, 2.5, 'Maize', 'Loam', 'Drip', 5000, '2026-05-01')
ON CONFLICT DO NOTHING;

-- 3. Insert recent Weather records (guarded: one row per farm + date)
INSERT INTO public.weather (farm_id, temperature, rainfall_probability, soil_moisture, forecast_date)
SELECT v.farm_id, v.temperature, v.rainfall_probability, v.soil_moisture, v.forecast_date
FROM (VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 25.5, 10.0, 45.0, CURRENT_DATE - 2),
    ('11111111-1111-1111-1111-111111111111'::uuid, 26.0, 15.0, 42.0, CURRENT_DATE - 1),
    ('11111111-1111-1111-1111-111111111111'::uuid, 28.5, 5.0, 30.0, CURRENT_DATE)
) AS v(farm_id, temperature, rainfall_probability, soil_moisture, forecast_date)
WHERE NOT EXISTS (
    SELECT 1 FROM public.weather w
    WHERE w.farm_id = v.farm_id AND w.forecast_date = v.forecast_date
);

-- 4. Insert Recommendations (guarded: same farm + action + reason not duplicated)
INSERT INTO public.recommendations (farm_id, action, reason, water_saved_estimate)
SELECT v.farm_id, v.action, v.reason, v.water_saved_estimate
FROM (VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 'MONITOR', 'Soil moisture is adequate at 45%. No irrigation needed.', 0.0),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'IRRIGATE', 'Soil moisture dropped to 30% with high temperatures. Drip irrigation recommended.', 1500.0)
) AS v(farm_id, action, reason, water_saved_estimate)
WHERE NOT EXISTS (
    SELECT 1 FROM public.recommendations r
    WHERE r.farm_id = v.farm_id AND r.action = v.action AND r.reason = v.reason
);

-- 5. Insert Alerts (guarded: same farm + message + status not duplicated)
INSERT INTO public.alerts (farm_id, message, status, sent_at)
SELECT v.farm_id, v.message, v.status, CURRENT_DATE
FROM (VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 'AMATSI Alert: Moisture is low. Recommended to irrigate your Maize field.', 'SENT')
) AS v(farm_id, message, status)
WHERE NOT EXISTS (
    SELECT 1 FROM public.alerts a
    WHERE a.farm_id = v.farm_id AND a.message = v.message AND a.status = v.status
);
