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

        // Buscar consultas concluídas do especialista que têm gravação
        const { data, error } = await supabase
          .from('consultations')
          .select(`
            *,
            profiles!consultations_client_id_fkey (
              full_name
            )
          `)
          .eq('specialist_id', specialist.id)
          .eq('status', 'concluida')
          .not('recording_url', 'is', null)
          .order('scheduled_date', { ascending: false });

        if (error) {
          console.error('Erro ao buscar gravações:', error);
          return [];
        }

        return data.map(consultation => ({
          id: consultation.id,
          consultation_date: consultation.scheduled_date,
          consultation_time: consultation.scheduled_time,
          consultation_type: consultation.type,
          client_name: consultation.profiles?.full_name || 'Nome não informado',
          recording_url: consultation.recording_url,
          duration: consultation.duration_minutes,
          expires_at: consultation.recording_expires_at,
        }));
      } catch (error) {
        console.error('Erro na busca de gravações:', error);
        return [];
      }
    },
    enabled: !!user
  });
};