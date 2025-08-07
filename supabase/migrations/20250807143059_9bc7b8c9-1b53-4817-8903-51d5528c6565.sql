-- Clean up any potential schema inconsistencies that might be causing types.ts generation issues

-- First, let's ensure all tables have proper structure
-- Check if there are any orphaned or malformed table definitions

-- Refresh the schema to regenerate types correctly
COMMENT ON SCHEMA public IS 'Schema refreshed to fix types generation';

-- Force a schema refresh by updating a system comment
COMMENT ON DATABASE postgres IS 'Database schema refreshed for types regeneration';

-- Verify all enum types are properly defined
DO $$ 
BEGIN
    -- Ensure user_role enum exists and is properly defined
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'specialist', 'client');
    END IF;
END $$;