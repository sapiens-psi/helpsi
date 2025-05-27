import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSpecialists() {
  return useQuery({
    queryKey: ['specialists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('specialists')
        .select('*, profiles(full_name, phone, crp)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });
}

export const useSpecialistSchedules = (specialistId: string) => {
  return useQuery({
    queryKey: ['specialist-schedules', specialistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('specialist_schedules')
        .select('*')
        .eq('specialist_id', specialistId)
        .eq('is_available', true)
        .order('day_of_week')
        .order('start_time');
      
      if (error) throw error;
      return data;
    },
    enabled: !!specialistId
  });
};
