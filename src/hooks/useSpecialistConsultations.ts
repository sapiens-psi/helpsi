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

        // Buscar consultas do especialista
        const { data, error } = await supabase
          .from('consultations')
          .select(`
            *,
            profiles!consultations_client_id_fkey (
              full_name
            )
          `)
          .eq('specialist_id', specialist.id)
          .order('scheduled_date', { ascending: true })
          .order('scheduled_time', { ascending: true });

        if (error) {
          console.error('Erro ao buscar consultas:', error);
          return [];
        }

        return data.map(consultation => ({
          ...consultation,
          client_name: consultation.profiles?.full_name || 'Nome não informado'
        }));
      } catch (error) {
        console.error('Erro na busca de consultas:', error);
        return [];
      }
    },
    enabled: !!user
  });
};