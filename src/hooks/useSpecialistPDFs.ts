import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useSpecialistPDFs = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['specialist-pdfs', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Por enquanto, retornar dados mockados até implementar a tabela de PDFs
      // TODO: Implementar busca real quando a tabela de PDFs for criada
      const mockPDFs = [
        {
          id: '1',
          name: 'Manual de Atendimento.pdf',
          description: 'Guia completo para atendimento ao cliente',
          url: '/pdfs/manual-atendimento.pdf',
          category: 'Treinamento',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Protocolo Pré-Venda.pdf',
          description: 'Procedimentos para atendimento pré-venda',
          url: '/pdfs/protocolo-pre-venda.pdf',
          category: 'Pré-venda',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Protocolo Pós-Venda.pdf',
          description: 'Procedimentos para atendimento pós-venda',
          url: '/pdfs/protocolo-pos-venda.pdf',
          category: 'Pós-venda',
          created_at: new Date().toISOString(),
        },
      ];

      return mockPDFs;
    },
    enabled: !!user
  });
};