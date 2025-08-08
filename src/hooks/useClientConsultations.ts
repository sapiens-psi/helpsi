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

      // Buscar consultas de pré-compra
      const { data: preCompraData, error: preCompraError } = await supabase
        .from('consultations_pre_compra')
        .select(`
          id,
          client_id,
          specialist_id,
          slot_id,
          type,
          status,
          scheduled_date,
          scheduled_time,
          duration_minutes,
          description,
          purchase_date,
          meeting_room_id,
          recording_url,
          recording_expires_at,
          coupon_code_used,
          coupon_id,
          created_at,
          updated_at
        `)
        .eq('client_id', user.id)
        .order('scheduled_date', { ascending: false });

      if (preCompraError) throw preCompraError;

      // Buscar consultas de pós-compra
      const { data: posCompraData, error: posCompraError } = await supabase
        .from('consultations_pos_compra')
        .select(`
          id,
          client_id,
          specialist_id,
          slot_id,
          type,
          status,
          scheduled_date,
          scheduled_time,
          duration_minutes,
          description,
          purchase_date,
          meeting_room_id,
          recording_url,
          recording_expires_at,
          coupon_code_used,
          coupon_id,
          created_at,
          updated_at
        `)
        .eq('client_id', user.id)
        .order('scheduled_date', { ascending: false });

      if (posCompraError) throw posCompraError;

      // Combinar e marcar o tipo
      const allConsultations = [
        ...(preCompraData || []).map(c => ({ ...c, type: 'pre-compra' })),
        ...(posCompraData || []).map(c => ({ ...c, type: 'pos-compra' }))
      ].sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime());

      return allConsultations;
    },
    enabled: !!user
  });
};

export const useCancelConsultation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ consultationId, type }: { consultationId: string; type: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Determinar a tabela correta baseada no tipo
      const tableName = type === 'pre-compra' ? 'consultations_pre_compra' : 'consultations_pos_compra';

      // Atualizar o status da consulta
      const { data, error } = await supabase
        .from(tableName)
        .update({ status: 'cancelada' })
        .eq('id', consultationId)
        .eq('client_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return { ...data, type };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-consultations'] });
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['meeting-rooms'] });
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
    mutationFn: async ({ consultationId, newDate, newTime, type }: {
      consultationId: string;
      newDate: string;
      newTime: string;
      type: string;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Determinar a tabela correta baseada no tipo
      const tableName = type === 'pre-compra' ? 'consultations_pre_compra' : 'consultations_pos_compra';

      const { data, error } = await supabase
        .from(tableName)
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

      return { ...data, type };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-consultations'] });
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['meeting-rooms'] });
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

      // Buscar consultas de pré-compra
      const { data: preCompraConsultations, error: preCompraError } = await supabase
        .from('consultations_pre_compra')
        .select('status')
        .eq('client_id', user.id);

      if (preCompraError) throw preCompraError;

      // Buscar consultas de pós-compra
      const { data: posCompraConsultations, error: posCompraError } = await supabase
        .from('consultations_pos_compra')
        .select('status')
        .eq('client_id', user.id);

      if (posCompraError) throw posCompraError;

      // Combinar dados
      const allConsultations = [
        ...(preCompraConsultations || []).map(c => ({ ...c, type: 'pre-compra' })),
        ...(posCompraConsultations || []).map(c => ({ ...c, type: 'pos-compra' }))
      ];

      const stats = {
        total: allConsultations.length,
        agendadas: allConsultations.filter(c => c.status === 'agendada').length,
        concluidas: allConsultations.filter(c => c.status === 'concluida').length,
        canceladas: allConsultations.filter(c => c.status === 'cancelada').length,
        preVenda: (preCompraConsultations || []).length,
        posVenda: (posCompraConsultations || []).length
      };

      return stats;
    },
    enabled: !!user
  });
};