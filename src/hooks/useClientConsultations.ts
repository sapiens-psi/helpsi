import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useClientConsultations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-consultations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          specialist:specialists(
            id,
            specialties,
            profiles!specialists_user_id_fkey(
              full_name
            )
          )
        `)
        .eq('client_id', user.id)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
};

export const useCancelConsultation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (consultationId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('consultations')
        .update({ status: 'cancelada' })
        .eq('id', consultationId)
        .eq('client_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-consultations'] });
      toast.success('Consulta cancelada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao cancelar consulta: ' + error.message);
    }
  });
};

export const useRescheduleConsultation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ consultationId, newDate, newTime }: {
      consultationId: string;
      newDate: string;
      newTime: string;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('consultations')
        .update({
          scheduled_date: newDate,
          scheduled_time: newTime,
          status: 'agendada'
        })
        .eq('id', consultationId)
        .eq('client_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-consultations'] });
      toast.success('Consulta reagendada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao reagendar consulta: ' + error.message);
    }
  });
};

export const useClientStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: consultations, error } = await supabase
        .from('consultations')
        .select('status, type')
        .eq('client_id', user.id);

      if (error) throw error;

      const stats = {
        total: consultations?.length || 0,
        agendadas: consultations?.filter(c => c.status === 'agendada').length || 0,
        concluidas: consultations?.filter(c => c.status === 'concluida').length || 0,
        canceladas: consultations?.filter(c => c.status === 'cancelada').length || 0,
        preVenda: consultations?.filter(c => c.type === 'pre-compra').length || 0,
        posVenda: consultations?.filter(c => c.type === 'pos-compra').length || 0
      };

      return stats;
    },
    enabled: !!user
  });
};