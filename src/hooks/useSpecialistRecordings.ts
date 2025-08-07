import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useSpecialistRecordings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['specialist-recordings', user?.id],
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

        // Buscar consultas concluídas de pré-compra que têm gravação
        const { data: preCompraData, error: preCompraError } = await supabase
          .from('consultations_pre_compra')
          .select(`
            *,
            profiles!consultations_pre_compra_client_id_fkey (
              full_name
            )
          `)
          .eq('specialist_id', specialist.id)
          .eq('status', 'concluida')
          .not('recording_url', 'is', null)
          .order('scheduled_date', { ascending: false });

        // Buscar consultas concluídas de pós-compra que têm gravação
        const { data: posCompraData, error: posCompraError } = await supabase
          .from('consultations_pos_compra')
          .select(`
            *,
            profiles!consultations_pos_compra_client_id_fkey (
              full_name
            )
          `)
          .eq('specialist_id', specialist.id)
          .eq('status', 'concluida')
          .not('recording_url', 'is', null)
          .order('scheduled_date', { ascending: false });

        if (preCompraError || posCompraError) {
          console.error('Erro ao buscar gravações:', preCompraError || posCompraError);
          return [];
        }

        // Combinar e mapear dados
        const preCompraRecordings = (preCompraData || []).map(consultation => ({
          id: consultation.id,
          consultation_date: consultation.scheduled_date,
          consultation_time: consultation.scheduled_time,
          consultation_type: 'pre-compra',
          client_name: consultation.profiles?.full_name || 'Nome não informado',
          recording_url: consultation.recording_url,
          duration: consultation.duration_minutes,
          expires_at: consultation.recording_expires_at,
        }));

        const posCompraRecordings = (posCompraData || []).map(consultation => ({
          id: consultation.id,
          consultation_date: consultation.scheduled_date,
          consultation_time: consultation.scheduled_time,
          consultation_type: 'pos-compra',
          client_name: consultation.profiles?.full_name || 'Nome não informado',
          recording_url: consultation.recording_url,
          duration: consultation.duration_minutes,
          expires_at: consultation.recording_expires_at,
        }));

        // Combinar e ordenar por data (mais recente primeiro)
        const allRecordings = [...preCompraRecordings, ...posCompraRecordings];
        return allRecordings.sort((a, b) => {
          const dateA = new Date(`${a.consultation_date}T${a.consultation_time}`);
          const dateB = new Date(`${b.consultation_date}T${b.consultation_time}`);
          return dateB.getTime() - dateA.getTime();
        });
      } catch (error) {
        console.error('Erro na busca de gravações:', error);
        return [];
      }
    },
    enabled: !!user
  });
};