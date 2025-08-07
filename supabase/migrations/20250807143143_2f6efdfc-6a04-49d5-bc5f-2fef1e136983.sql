-- Enable RLS on tables that are missing it to fix types generation issues

-- Enable RLS on schedule tables
ALTER TABLE public.schedule_config_pre_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_config_pos_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_slots_pre_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_slots_pos_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations_pre_compra ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for schedule config tables
CREATE POLICY "Allow read access to schedule config pre compra" 
ON public.schedule_config_pre_compra FOR SELECT 
USING (true);

CREATE POLICY "Allow admin manage schedule config pre compra" 
ON public.schedule_config_pre_compra FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  )
);

CREATE POLICY "Allow read access to schedule config pos compra" 
ON public.schedule_config_pos_compra FOR SELECT 
USING (true);

CREATE POLICY "Allow admin manage schedule config pos compra" 
ON public.schedule_config_pos_compra FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  )
);

-- Create RLS policies for schedule slots
CREATE POLICY "Allow read access to schedule slots pre compra" 
ON public.schedule_slots_pre_compra FOR SELECT 
USING (true);

CREATE POLICY "Allow admin manage schedule slots pre compra" 
ON public.schedule_slots_pre_compra FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  )
);

CREATE POLICY "Allow read access to schedule slots pos compra" 
ON public.schedule_slots_pos_compra FOR SELECT 
USING (true);

CREATE POLICY "Allow admin manage schedule slots pos compra" 
ON public.schedule_slots_pos_compra FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  )
);

-- Create RLS policies for consultations pre compra
CREATE POLICY "Allow Edge Functions to manage pre_compra consultations" 
ON public.consultations_pre_compra FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view own pre_compra consultations" 
ON public.consultations_pre_compra FOR SELECT 
USING (auth.uid() = client_id OR auth.uid() = specialist_id);

CREATE POLICY "Allow admins to manage all pre_compra consultations" 
ON public.consultations_pre_compra FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  )
);