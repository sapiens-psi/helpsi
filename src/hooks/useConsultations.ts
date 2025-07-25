import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useConsultations() {
  return useQuery({
    queryKey: ['consultations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select('*, client:profiles(full_name, phone), specialist:specialists(*)')
        .order('scheduled_date', { ascending: false });
      if (error) throw error;
      return data;
    }
  });
}

export const useCreateConsultation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (consultationData: any) => {
      if (!user) throw new Error('User not authenticated');
      
      // Remove client_id from consultationData if it exists to avoid conflicts
      const { client_id, ...cleanData } = consultationData;
      
      const { data, error } = await supabase
        .from('consultations')
        .insert({
          client_id: user.id,
          type: cleanData.type,
          scheduled_date: cleanData.scheduled_date,
          scheduled_time: cleanData.scheduled_time,
          description: cleanData.description,
          duration_minutes: cleanData.duration_minutes,
          coupon_code_used: cleanData.coupon_code_used,
          coupon_id: cleanData.coupon_id,
          status: 'agendada'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    }
  });
};

export const useUpdateConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      const { data, error } = await supabase
        .from('consultations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    }
  });
};
