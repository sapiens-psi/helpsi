import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useConsultations() {
  return useQuery({
    queryKey: ['consultations'],
    queryFn: async () => {
      // Buscar consultas de pré-compra
      const { data: preCompraData, error: preCompraError } = await supabase
        .from('consultations_pre_compra')
        .select(`
          *, 
          client:profiles(full_name, phone), 
          specialist:specialists(*),
          meeting_room:meeting_rooms(
            id,
            room_token,
            name,
            is_active,
            scheduled_at
          )
        `)
        .order('scheduled_date', { ascending: false });
      
      if (preCompraError) throw preCompraError;
      
      // Buscar consultas de pós-compra
      const { data: posCompraData, error: posCompraError } = await supabase
        .from('consultations_pos_compra')
        .select(`
          *, 
          client:profiles(full_name, phone), 
          specialist:specialists(*),
          meeting_room:meeting_rooms(
            id,
            room_token,
            name,
            is_active,
            scheduled_at
          )
        `)
        .order('scheduled_date', { ascending: false });
      
      if (posCompraError) throw posCompraError;
      
      // Combinar e marcar o tipo
      const allConsultations = [
        ...(preCompraData || []).map(c => ({ ...c, type: 'pre-compra' })),
        ...(posCompraData || []).map(c => ({ ...c, type: 'pos-compra' }))
      ].sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime());
      
      return allConsultations;
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
      const { client_id, type, ...cleanData } = consultationData;
      
      // Determinar a tabela correta baseada no tipo
      const tableName = type === 'pre-compra' ? 'consultations_pre_compra' : 'consultations_pos_compra';
      
      const { data, error } = await supabase
        .from(tableName)
        .insert({
          client_id: user.id,
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
      return { ...data, type };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    }
  });
};

export const useUpdateConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, type, ...updateData }: any) => {
      // Determinar a tabela correta baseada no tipo
      const tableName = type === 'pre-compra' ? 'consultations_pre_compra' : 'consultations_pos_compra';
      
      const { data, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, type };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    }
  });
};
