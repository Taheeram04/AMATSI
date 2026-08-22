-- AMATSI — all migrations in one file (idempotent, safe to re-run)
-- Paste into Supabase SQL Editor and Run.


-- ============ 001_create_users.sql ============

CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============ 002_create_farms.sql ============

CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) NOT NULL,
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    area_hectares DOUBLE PRECISION NOT NULL,
    crop_type TEXT NOT NULL,
    soil_type TEXT NOT NULL,
    irrigation_method TEXT NOT NULL,
    tank_capacity_liters DOUBLE PRECISION,
    planting_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own farms" ON public.farms;
CREATE POLICY "Users can view own farms"
    ON public.farms FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own farms" ON public.farms;
CREATE POLICY "Users can insert own farms"
    ON public.farms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own farms" ON public.farms;
CREATE POLICY "Users can update own farms"
    ON public.farms FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own farms" ON public.farms;
CREATE POLICY "Users can delete own farms"
    ON public.farms FOR DELETE
    USING (auth.uid() = user_id);

-- ============ 003_create_weather.sql ============

CREATE TABLE IF NOT EXISTS public.weather (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES public.farms(id) NOT NULL,
    temperature DOUBLE PRECISION NOT NULL,
    rainfall_probability DOUBLE PRECISION NOT NULL,
    soil_moisture DOUBLE PRECISION NOT NULL,
    forecast_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.weather ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view weather for own farms" ON public.weather;
CREATE POLICY "Users can view weather for own farms"
    ON public.weather FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.farms WHERE farms.id = weather.farm_id AND farms.user_id = auth.uid()
    ));

-- ============ 004_create_recommendations.sql ============

CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES public.farms(id) NOT NULL,
    action TEXT NOT NULL,
    reason TEXT NOT NULL,
    water_saved_estimate DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view recommendations for own farms" ON public.recommendations;
CREATE POLICY "Users can view recommendations for own farms"
    ON public.recommendations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.farms WHERE farms.id = recommendations.farm_id AND farms.user_id = auth.uid()
    ));

-- ============ 005_create_alerts.sql ============

CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES public.farms(id) NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view alerts for own farms" ON public.alerts;
CREATE POLICY "Users can view alerts for own farms"
    ON public.alerts FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.farms WHERE farms.id = alerts.farm_id AND farms.user_id = auth.uid()
    ));

-- ============ 006_seed_data.sql ============

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

-- ============ 007_add_premium_tier.sql ============

-- Premium tier flag + IoT device binding
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false NOT NULL;

ALTER TABLE public.farms
    ADD COLUMN IF NOT EXISTS device_id TEXT;

-- ============ 008_add_auth_fields.sql ============

-- Auth fields for Go JWT signup/login (bcrypt password, SMS prefs)
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS password_hash TEXT,
    ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en',
    ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN NOT NULL DEFAULT true;

-- ============ 009_add_unique_user_phone_number.sql ============

-- Enforce one account per phone number. The partial index preserves support
-- for any legacy records where a phone number was not supplied.
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_number_unique_idx
    ON public.users (phone_number)
    WHERE phone_number IS NOT NULL;
