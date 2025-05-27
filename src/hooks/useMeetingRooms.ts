
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMeetingRooms(type: 'pos-compra' | 'pre-compra') {
  return useQuery({
    queryKey: ['meeting-rooms', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_rooms')
        .select(`
          *,
          consultations (
            id,
            client_id,
            description,
            scheduled_date,
            scheduled_time,
            status,
            profiles!consultations_client_id_fkey (
              full_name,
              phone,
              cpf_cnpj
            )
          )
        `)
        .eq('type', type)
        .order('scheduled_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });
}

export function useCreateMeetingRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roomData: any) => {
      const roomToken = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const { data, error } = await supabase
        .from('meeting_rooms')
        .insert({
          ...roomData,
          room_token: roomToken
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-rooms'] });
    }
  });
}

export function useEndMeetingRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roomId: string) => {
      const { error } = await supabase
        .from('meeting_rooms')
        .update({ 
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('id', roomId);
      if (error) throw error;

      // Atualizar status da consulta se existir
      const { error: consultationError } = await supabase
        .from('consultations')
        .update({ status: 'concluida' })
        .eq('meeting_room_id', roomId);
      
      if (consultationError) console.error('Erro ao atualizar consulta:', consultationError);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    }
  });
}
