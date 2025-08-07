
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAvailableSlots(date: string, scheduleType: 'pre-compra' | 'pos-compra') {
  return useQuery({
    queryKey: ['available-slots', date, scheduleType],
    queryFn: async () => {
      if (!date) return { slots: [] };
      
      const { data, error } = await supabase.functions.invoke('check-availability', {
        body: {
          date,
          scheduleType: scheduleType === 'pre-compra' ? 'pre_compra' : 'pos_compra',
          action: 'get_available_slots'
        }
      });

      if (error) {
        console.error('Error fetching available slots:', error);
        throw new Error(error.message || 'Erro ao buscar horários disponíveis');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data || { slots: [] };
    },
    enabled: !!date
  });
}

export function useCheckSlotAvailability() {
  return useMutation({
    mutationFn: async ({ date, time, scheduleType }: { date: string; time: string; scheduleType: 'pre-compra' | 'pos-compra' }) => {
      const { data, error } = await supabase.functions.invoke('check-availability', {
        body: {
          date,
          time,
          scheduleType: scheduleType === 'pre-compra' ? 'pre_compra' : 'pos_compra',
          action: 'check_slot_availability'
        }
      });

      if (error) {
        console.error('Error checking slot availability:', error);
        throw new Error(error.message || 'Erro ao verificar disponibilidade');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    }
  });
}

export function useScheduleConfig(type: 'pre-compra' | 'pos-compra' = 'pos-compra') {
  return useQuery({
    queryKey: ['schedule-config', type],
    queryFn: async () => {
      const tableName = type === 'pre-compra' ? 'schedule_config_pre_compra' : 'schedule_config_pos_compra';
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (consultationData: any) => {
      // Log session info for debugging
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);
      console.log('Access token:', session?.access_token);
      console.log('User ID:', session?.user?.id);
      
      // Usar a Edge Function create-consultation para criar a consulta com validação
      const requestBody: any = {
        client_id: consultationData.client_id,
        scheduled_date: consultationData.scheduled_date,
        scheduled_time: consultationData.scheduled_time,
        description: consultationData.description,
        duration_minutes: consultationData.duration_minutes || 60,
        type: consultationData.type
      };

      // Add coupon fields if provided
      if (consultationData.coupon_code_used) {
        requestBody.coupon_code_used = consultationData.coupon_code_used;
      }
      if (consultationData.coupon_id) {
        requestBody.coupon_id = consultationData.coupon_id;
      }

      console.log('Sending request body:', requestBody);

      const { data, error } = await supabase.functions.invoke('create-consultation', {
        body: requestBody
      });

      if (error) {
        console.error('Error calling create-consultation function:', error);
        throw new Error(error.message || 'Erro ao criar consulta');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['meeting-rooms'] });
      toast.success('Consulta agendada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao agendar consulta: ' + error.message);
    }
  });
}
