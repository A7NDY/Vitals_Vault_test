-- ============================================================================
-- Vitals Vault - Google Fit Integration Schema
-- ============================================================================
-- Tables for storing OAuth tokens and wearable vitals data
-- ============================================================================

-- Assuming you have a users table. If not, create it first:
-- CREATE TABLE users (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   email VARCHAR(255) UNIQUE NOT NULL,
--   full_name VARCHAR(255),
--   role VARCHAR(50) NOT NULL DEFAULT 'Patient',
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- ============================================================================
-- Table: google_fit_tokens
-- Description: Stores OAuth tokens for Google Fit integration
-- ============================================================================
CREATE TABLE IF NOT EXISTS google_fit_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to users table
  user_id UUID NOT NULL UNIQUE,
  CONSTRAINT fk_google_fit_tokens_user_id 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE,
  
  -- OAuth tokens from Google
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  
  -- Token expiry timestamp
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Metadata timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Track when tokens were last refreshed
  last_refreshed_at TIMESTAMP WITH TIME ZONE
);

-- Index for fast lookups by user_id
CREATE INDEX IF NOT EXISTS idx_google_fit_tokens_user_id 
  ON google_fit_tokens(user_id);

-- Index for finding expired tokens that need refresh
CREATE INDEX IF NOT EXISTS idx_google_fit_tokens_expiry_date 
  ON google_fit_tokens(expiry_date);

-- ============================================================================
-- Table: wearable_vitals
-- Description: Stores health data synced from wearable devices
-- ============================================================================
CREATE TABLE IF NOT EXISTS wearable_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to users table
  user_id UUID NOT NULL,
  CONSTRAINT fk_wearable_vitals_user_id 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE,
  
  -- Vitals data
  heart_rate INTEGER,                  -- BPM (beats per minute)
  steps INTEGER,                        -- Daily step count
  calories INTEGER,                     -- Calories burned (kcal)
  sleep_minutes INTEGER,                -- Duration of sleep (minutes)
  
  -- Timestamp when the vitals were recorded
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Metadata for tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Source of data (google_fit, apple_health, etc.)
  source VARCHAR(50) DEFAULT 'google_fit',
  
  -- Additional metadata for potential future use
  device_name VARCHAR(255),
  additional_data JSONB
);

-- Index for fast lookups by user_id (most common query)
CREATE INDEX IF NOT EXISTS idx_wearable_vitals_user_id 
  ON wearable_vitals(user_id);

-- Index for time-range queries (e.g., last 7 days)
CREATE INDEX IF NOT EXISTS idx_wearable_vitals_user_recorded 
  ON wearable_vitals(user_id, recorded_at DESC);

-- Index for finding latest vitals per user (for dashboard)
CREATE INDEX IF NOT EXISTS idx_wearable_vitals_recorded_at 
  ON wearable_vitals(recorded_at DESC);

-- Index on source for filtering by device type
CREATE INDEX IF NOT EXISTS idx_wearable_vitals_source 
  ON wearable_vitals(source);

-- ============================================================================
-- Optional: Maintenance Views (Useful for queries)
-- ============================================================================

-- View: Latest wearable vitals per user
CREATE OR REPLACE VIEW latest_wearable_vitals AS
SELECT 
  user_id,
  heart_rate,
  steps,
  calories,
  sleep_minutes,
  recorded_at,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY recorded_at DESC) as row_num
FROM wearable_vitals
WHERE row_num = 1;

-- View: Users with active Google Fit connections
CREATE OR REPLACE VIEW active_google_fit_users AS
SELECT 
  gft.user_id,
  gft.created_at as connected_at,
  gft.last_refreshed_at,
  CASE 
    WHEN gft.expiry_date > CURRENT_TIMESTAMP THEN 'active'
    ELSE 'expired'
  END as token_status
FROM google_fit_tokens gft;

-- ============================================================================
-- Optional: Trigger for updated_at timestamp
-- ============================================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for google_fit_tokens
DROP TRIGGER IF EXISTS update_google_fit_tokens_updated_at ON google_fit_tokens;
CREATE TRIGGER update_google_fit_tokens_updated_at
  BEFORE UPDATE ON google_fit_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for wearable_vitals
DROP TRIGGER IF EXISTS update_wearable_vitals_updated_at ON wearable_vitals;
CREATE TRIGGER update_wearable_vitals_updated_at
  BEFORE UPDATE ON wearable_vitals
  FOR EACH ROW
  EXECUTE FUNCTION update_wearable_vitals_updated_at();

-- ============================================================================
-- Notes
-- ============================================================================
-- 1. Foreign Key Constraints:
--    - Both tables have FOREIGN KEY constraints referencing users(id)
--    - ON DELETE CASCADE ensures data is cleaned up when user is deleted
--
-- 2. Indexes:
--    - user_id: Most queries filter by user_id (required for performance)
--    - recorded_at: Time-range queries and sorting
--    - Combined (user_id, recorded_at): For efficient recent vitals queries
--    - expiry_date: For token refresh maintenance queries
--    - source: For filtering by device type
--
-- 3. Scalability:
--    - UUID primary keys for distributed systems
--    - TIMESTAMP WITH TIME ZONE for timezone-aware storage
--    - JSONB for additional_data allows extensibility
--    - Row-level security can be added with PostgreSQL RLS policies
--
-- 4. To execute this schema:
--    - For Supabase: Use the SQL Editor in Supabase dashboard
--    - For Neon: Use the Neon SQL Editor or connection string
--    - For local PostgreSQL: psql -U username -d database -f schema.sql
-- ============================================================================
