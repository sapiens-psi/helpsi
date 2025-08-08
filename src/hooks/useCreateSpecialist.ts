import { useMutation, useQueryClient } from '@tanstack/react-query';
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
      // Validar dados antes de enviar
      console.log('Dados recebidos:', data);
      
      if (!data.email || !data.password || !data.fullName || !data.crp) {
        throw new Error('Campos obrigatórios não preenchidos');
      }
      
      const requestBody = {
        email: data.email,
        password: data.password,
        name: data.fullName,
        specialty: Array.isArray(data.specialties) ? data.specialties.join(', ') : data.specialties || '',
        crp: data.crp,
        phone: data.phone || ''
      };
      
      console.log('Dados enviados:', requestBody);
      
      const response = await fetch('https://utoilskthbtlqgpjauui.supabase.co/functions/v1/create-specialist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0b2lsc2t0aGJ0bHFncGphdXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNzM2MjYsImV4cCI6MjA2Mzg0OTYyNn0.ZNLD_MB-Juc1dSJ1UMMmXpT8UzrBH-JFguyQiUZdDqU',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0b2lsc2t0aGJ0bHFncGphdXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNzM2MjYsImV4cCI6MjA2Mzg0OTYyNn0.ZNLD_MB-Juc1dSJ1UMMmXpT8UzrBH-JFguyQiUZdDqU',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar especialista');
      }

      const specialistData = await response.json();
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