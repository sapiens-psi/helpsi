
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMeetingRoom = (consultationId: string) => {
  return useQuery({
    queryKey: ['meeting-room', consultationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_rooms')
        .select('*')
        .eq('consultation_id', consultationId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!consultationId
  });
};

export const useCreateMeetingRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ consultationId }: { consultationId: string }) => {
      const roomToken = `room-${consultationId}-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('meeting_rooms')
        .insert({
          consultation_id: consultationId,
          room_token: roomToken,
          is_active: true,
          started_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-room', data.consultation_id] });
    }
  });
};
