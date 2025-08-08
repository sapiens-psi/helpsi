import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCancelConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ consultationId, type }: { consultationId: string; type: string }) => {
      const tableName = type === 'pre-compra' ? 'consultations_pre_compra' : 'consultations_pos_compra';
      
      const { data, error } = await supabase
        .from(tableName)
        .update({ status: 'cancelada' })
        .eq('id', consultationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidar as queries relacionadas para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ['specialist-consultations'] });
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });
};