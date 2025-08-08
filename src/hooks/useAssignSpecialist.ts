import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAssignSpecialist = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ consultationId, specialistId, type }: {
      consultationId: string;
      specialistId: string;
      type: 'pre-compra' | 'pos-compra';
    }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('assign-specialist', {
        body: {
          consultationId,
          specialistId,
          type
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to assign specialist');
      }

      if (data?.error) {
        console.error('Function response error:', data.error);
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidar as queries relacionadas para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['specialist-consultations'] });
    },
    onError: (error) => {
      console.error('Assign specialist mutation error:', error);
    }
  });
};