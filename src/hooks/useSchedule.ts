
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useScheduleConfig() {
  return useQuery({
    queryKey: ['schedule-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedule_config')
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
      // Primeiro, criar a consulta
      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .insert({
          client_id: consultationData.client_id,
          type: consultationData.type,
          scheduled_date: consultationData.scheduled_date,
          scheduled_time: consultationData.scheduled_time,
          description: consultationData.description,
          status: 'agendada'
        })
        .select()
        .single();

      if (consultationError) throw consultationError;

      // Criar a sala automaticamente
      const roomToken = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const { data: room, error: roomError } = await supabase
        .from('meeting_rooms')
        .insert({
          consultation_id: consultation.id,
          room_token: roomToken,
          name: `Consulta ${consultationData.type}`,
          description: consultationData.description || 'Consulta agendada',
          type: consultationData.type,
          scheduled_at: `${consultationData.scheduled_date}T${consultationData.scheduled_time}`,
          is_active: false
        })
        .select()
        .single();

      if (roomError) throw roomError;

      return { consultation, room };
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
