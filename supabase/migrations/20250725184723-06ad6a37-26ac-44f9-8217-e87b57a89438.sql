-- Phase 1: Critical Security Fixes

-- 1. Enable RLS on schedule_prices table
ALTER TABLE public.schedule_prices ENABLE ROW LEVEL SECURITY;

-- Create policy for schedule_prices - only admins can manage
CREATE POLICY "Only admins can manage schedule prices"
ON public.schedule_prices
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'::user_role
  )
);

-- 2. Create secure role management function
CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id UUID,
  new_role user_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow admins to change roles
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'::user_role
  ) THEN
    RAISE EXCEPTION 'Access denied: Only admins can change user roles';
  END IF;
  
  -- Prevent changing own role
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Cannot change your own role';
  END IF;
  
  -- Update the role
  UPDATE public.profiles
  SET role = new_role, updated_at = NOW()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- 3. Remove role from profiles update policy and create restricted version
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile (restricted)"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND role = OLD.role  -- Prevent role changes through normal updates
);

-- 4. Restrict coupon management to admins only
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.coupons;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.coupons;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.coupons;

-- Create admin-only policies for coupons
CREATE POLICY "Only admins can manage coupons"
ON public.coupons
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'::user_role
  )
);

-- Keep read access for validation coupons
CREATE POLICY "Users can view validation coupons"
ON public.coupons
FOR SELECT
USING (
  type = 'validation' 
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > NOW())
);

-- 5. Create audit log function for sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.security_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'::user_role
  )
);

-- 6. Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action TEXT,
  p_table_name TEXT DEFAULT NULL,
  p_record_id TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values
  );
END;
$$;