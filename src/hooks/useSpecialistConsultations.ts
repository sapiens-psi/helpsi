import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useSpecialistConsultations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['specialist-consultations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        // Primeiro, buscar o specialist_id do usuário logado
        const { data: specialist, error: specialistError } = await supabase
          .from('specialists')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (specialistError || !specialist) {
          console.log('Especialista não encontrado ou erro:', specialistError);
          return [];
        }

        // Buscar consultas de pré-compra
        const { data: preCompraData, error: preCompraError } = await supabase
          .from('consultations_pre_compra')
          .select(`
            *,
            profiles!consultations_pre_compra_client_id_fkey (
              full_name
            )
          `)
          .eq('specialist_id', specialist.id)
          .order('scheduled_date', { ascending: true })
          .order('scheduled_time', { ascending: true });

        // Buscar consultas de pós-compra
        const { data: posCompraData, error: posCompraError } = await supabase
          .from('consultations_pos_compra')
          .select(`
            *,
            profiles!consultations_pos_compra_client_id_fkey (
              full_name
            )
          `)
          .eq('specialist_id', specialist.id)
          .order('scheduled_date', { ascending: true })
          .order('scheduled_time', { ascending: true });

        if (preCompraError || posCompraError) {
          console.error('Erro ao buscar consultas:', preCompraError || posCompraError);
          return [];
        }

        // Combinar e adicionar tipo
        const preCompraConsultations = (preCompraData || []).map(consultation => ({
          ...consultation,
          type: 'pre-compra',
          client_name: consultation.profiles?.full_name || 'Nome não informado'
        }));

        const posCompraConsultations = (posCompraData || []).map(consultation => ({
          ...consultation,
          type: 'pos-compra',
          client_name: consultation.profiles?.full_name || 'Nome não informado'
        }));

        // Combinar e ordenar por data/hora
        const allConsultations = [...preCompraConsultations, ...posCompraConsultations];
        return allConsultations.sort((a, b) => {
          const dateA = new Date(`${a.scheduled_date}T${a.scheduled_time}`);
          const dateB = new Date(`${b.scheduled_date}T${b.scheduled_time}`);
          return dateA.getTime() - dateB.getTime();
        });
      } catch (error) {
        console.error('Erro na busca de consultas:', error);
        return [];
      }
    },
    enabled: !!user
  });
};