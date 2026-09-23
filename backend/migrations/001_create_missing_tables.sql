-- ============================================================
-- SIH 26006 Maritime Cargo Intelligence Platform
-- Migration 001: Create Missing Analytic & Recommendation Tables
-- Non-destructive: Uses CREATE TABLE IF NOT EXISTS
-- ============================================================

-- 1. Recommendations Table (Module 18)
CREATE TABLE IF NOT EXISTS public.recommendations (
    id TEXT PRIMARY KEY,
    cargo_id BIGINT REFERENCES public.cargo(id) ON DELETE SET NULL,
    origin_port_id BIGINT REFERENCES public.ports(id) ON DELETE SET NULL,
    destination_port_id BIGINT REFERENCES public.ports(id) ON DELETE SET NULL,
    recommended_vessel_id BIGINT REFERENCES public.vessels(id) ON DELETE SET NULL,
    recommendation_score NUMERIC(5, 2),
    preference TEXT DEFAULT 'balanced',
    has_eligible_vessels BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_cargo_id ON public.recommendations(cargo_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON public.recommendations(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and service role access
CREATE POLICY "Allow read access to recommendations" 
    ON public.recommendations FOR SELECT USING (true);

CREATE POLICY "Allow insert access to recommendations" 
    ON public.recommendations FOR INSERT WITH CHECK (true);

-- 2. Costs History Table (Module 12)
CREATE TABLE IF NOT EXISTS public.costs (
    id BIGSERIAL PRIMARY KEY,
    cargo_id BIGINT REFERENCES public.cargo(id) ON DELETE SET NULL,
    vessel_id BIGINT REFERENCES public.vessels(id) ON DELETE SET NULL,
    route_id TEXT,
    fuel_cost_usd NUMERIC(14, 2),
    operating_cost_usd NUMERIC(14, 2),
    port_cost_usd NUMERIC(14, 2),
    canal_cost_usd NUMERIC(14, 2),
    total_cost_usd NUMERIC(14, 2),
    cost_per_ton_usd NUMERIC(10, 2),
    calculation_basis TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to costs" ON public.costs FOR SELECT USING (true);
CREATE POLICY "Allow insert access to costs" ON public.costs FOR INSERT WITH CHECK (true);

-- 3. Historical Voyages Dataset Table (Module 14 / Rules 28 & 33)
CREATE TABLE IF NOT EXISTS public.historical_voyages (
    id BIGSERIAL PRIMARY KEY,
    vessel_id BIGINT REFERENCES public.vessels(id) ON DELETE SET NULL,
    origin_port_id BIGINT REFERENCES public.ports(id) ON DELETE SET NULL,
    destination_port_id BIGINT REFERENCES public.ports(id) ON DELETE SET NULL,
    departure_time TIMESTAMPTZ,
    arrival_time TIMESTAMPTZ,
    actual_voyage_duration_hours NUMERIC(10, 2),
    actual_total_voyage_cost NUMERIC(14, 2),
    distance_travelled_nm NUMERIC(10, 2),
    average_speed_knots NUMERIC(5, 2),
    cargo_type TEXT,
    cargo_weight_mt NUMERIC(12, 2),
    data_provenance TEXT DEFAULT 'AUTHENTIC_VOYAGE_LOG',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.historical_voyages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to historical_voyages" ON public.historical_voyages FOR SELECT USING (true);
