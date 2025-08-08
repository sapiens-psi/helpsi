import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export function useMeetingRooms(type: 'pos-compra' | 'pre-compra') {
  return useQuery({
    queryKey: ['meeting-rooms', type],
    queryFn: async () => {
      const consultationTable = type === 'pre-compra' ? 'consultations_pre_compra' : 'consultations_pos_compra';
      
      // Buscar as salas de reunião
      const { data: rooms, error: roomsError } = await supabase
        .from('meeting_rooms')
        .select('*')
        .eq('type', type)
        .order('scheduled_at', { ascending: false });
      
      if (roomsError) throw roomsError;
      
      // Buscar as consultas relacionadas usando os IDs corretos
      const consultationIdField = type === 'pre-compra' ? 'consultations_pre_compra_id' : 'consultations_pos_compra_id';
      const consultationIds = rooms?.map(room => room[consultationIdField]).filter(Boolean) || [];
      
      if (consultationIds.length === 0) {
        return rooms?.map(room => ({ ...room, status: 'agendada' })) || [];
      }
      
      const { data: consultations, error: consultationsError } = await supabase
        .from(consultationTable)
        .select('id, status')
        .in('id', consultationIds);
      
      if (consultationsError) {
        console.error('Erro ao buscar consultas:', consultationsError);
        return rooms?.map(room => ({ ...room, status: 'agendada' })) || [];
      }
      
      // Mapear os dados para incluir o status da consulta
      const mappedData = rooms?.map(room => {
        const consultationId = room[consultationIdField];
        const consultation = consultations?.find(c => c.id === consultationId);
        return {
          ...room,
          status: consultation?.status || 'agendada'
        };
      });
      
      return mappedData;
    }
  }) as any;
}

export function useCreateMeetingRoom() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  
  return useMutation({
    mutationFn: async (roomData: any) => {
      // Verificar se o usuário é admin antes de criar sala manual
      if (roomData.created_manually && profile?.role !== 'admin') {
        throw new Error('Acesso negado: Apenas administradores podem criar salas manualmente');
      }
      
      const { data, error } = await supabase
        .from('meeting_rooms')
        .insert(roomData)
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
