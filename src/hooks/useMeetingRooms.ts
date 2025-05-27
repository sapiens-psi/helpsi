import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMeetingRooms(type: 'pos-compra' | 'pre-compra') {
  return useQuery({
    queryKey: ['meeting-rooms', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_rooms')
        .select('*')
        .eq('type', type)
        .order('scheduled_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  }) as any;
}

export function useCreateMeetingRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roomData: any) => {
      const { data, error } = await supabase
        .from('meeting_rooms')
        .insert(roomData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-rooms'] });
    }
  });
}
