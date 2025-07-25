import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateSpecialistData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  crp: string;
  bio: string;
  specialties: string[];
  filial: string;
  funcao: string[];
}

export const useCreateSpecialist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSpecialistData) => {
      // 1. Criar usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
            crp: data.crp
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // 2. Atualizar perfil com dados completos e role de specialist
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          phone: data.phone,
          crp: data.crp,
          role: 'specialist',
          cpf_cnpj: '00000000000' // Valor temporário, pode ser editado depois
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // 3. Criar registro de especialista
      const { data: specialistData, error: specialistError } = await supabase
        .from('specialists')
        .insert({
          user_id: authData.user.id,
          bio: data.bio,
          specialties: data.specialties,
          is_available: true
        })
        .select()
        .single();

      if (specialistError) throw specialistError;

      // 4. Criar configuração padrão de horários
      await supabase.rpc('create_default_specialist_schedule', {
        p_specialist_id: authData.user.id // Usar user_id em vez do specialist.id
      });

      return specialistData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialists'] });
      toast.success('Especialista cadastrado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao cadastrar especialista:', error);
      toast.error('Erro ao cadastrar especialista: ' + error.message);
    }
  });
};