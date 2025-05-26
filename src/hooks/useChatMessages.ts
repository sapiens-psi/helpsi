
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useChatMessages = (consultationId: string) => {
  return useQuery({
    queryKey: ['chat-messages', consultationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:sender_id (full_name)
        `)
        .eq('consultation_id', consultationId)
        .order('sent_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!consultationId
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ consultationId, message }: { consultationId: string; message: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          consultation_id: consultationId,
          sender_id: user.id,
          message
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', data.consultation_id] });
    }
  });
};
