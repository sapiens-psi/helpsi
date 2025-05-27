
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useEndMeetingRoom } from '@/hooks/useMeetingRooms';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import './VideoConference.css';

const VideoConference = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const endMeetingRoom = useEndMeetingRoom();
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const fetchRoomData = async () => {
      try {
        const { data, error } = await supabase
          .from('meeting_rooms')
          .select(`
            *,
            consultations (
              id,
              client_id,
              description,
              status,
              profiles!consultations_client_id_fkey (
                full_name,
                phone
              )
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          toast.error('Sala não encontrada');
          navigate('/');
          return;
        }

        if (!data.is_active && data.ended_at) {
          toast.error('Esta sala já foi encerrada');
          navigate('/');
          return;
        }

        setRoomData(data);
        
        // Ativar a sala quando alguém entrar
        if (!data.is_active) {
          await supabase
            .from('meeting_rooms')
            .update({ 
              is_active: true,
              started_at: new Date().toISOString()
            })
            .eq('id', id);
        }

      } catch (error) {
        console.error('Erro ao carregar sala:', error);
        toast.error('Erro ao acessar a sala');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [id, user, navigate]);

  const handleEndCall = async () => {
    if (!id) return;

    try {
      await endMeetingRoom.mutateAsync(id);
      toast.success('Conferência encerrada');
      
      // Verificar se é admin ou cliente para redirecionamento
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      if (profile?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Erro ao encerrar conferência:', error);
      toast.error('Erro ao encerrar conferência');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Carregando conferência...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Header com informações da sala */}
      <div className="bg-gray-800 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{roomData?.name || 'Conferência'}</h1>
            {roomData?.consultations?.profiles && (
              <p className="text-gray-300">
                Cliente: {roomData.consultations.profiles.full_name}
              </p>
            )}
          </div>
          <div className="text-sm text-gray-400">
            Sala: {roomData?.room_token}
          </div>
        </div>
      </div>

      {/* Área principal de vídeo */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
          {/* Vídeo principal */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-0 h-full flex items-center justify-center">
              <div className="text-center">
                <Video className="icon-giant mx-auto mb-4 text-blue-500" />
                <p className="text-lg">Sua câmera</p>
                {!isVideoOn && <p className="text-red-400 mt-2">Câmera desligada</p>}
              </div>
            </CardContent>
          </Card>

          {/* Vídeo do participante remoto */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-0 h-full flex items-center justify-center">
              <div className="text-center">
                <Video className="icon-giant mx-auto mb-4 text-green-500" />
                <p className="text-lg">Participante remoto</p>
                <p className="text-sm text-gray-400 mt-2">Aguardando conexão...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controles de chamada */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4">
        <div className="flex justify-center space-x-4">
          <Button
            variant={isVideoOn ? "default" : "destructive"}
            size="lg"
            onClick={() => setIsVideoOn(!isVideoOn)}
            className="rounded-full p-4"
          >
            {isVideoOn ? <Video className="icon-medium" /> : <VideoOff className="icon-medium" />}
          </Button>

          <Button
            variant={isAudioOn ? "default" : "destructive"}
            size="lg"
            onClick={() => setIsAudioOn(!isAudioOn)}
            className="rounded-full p-4"
          >
            {isAudioOn ? <Mic className="icon-medium" /> : <MicOff className="icon-medium" />}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowChat(!showChat)}
            className="rounded-full p-4"
          >
            <MessageSquare className="icon-medium" />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={handleEndCall}
            className="rounded-full p-4"
            disabled={endMeetingRoom.isPending}
          >
            <PhoneOff className="icon-medium" />
          </Button>
        </div>
      </div>

      {/* Chat lateral */}
      {showChat && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-gray-800 border-l border-gray-700 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Chat</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
              ×
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto mb-4">
            <p className="text-gray-400 text-center">Nenhuma mensagem ainda...</p>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-gray-700 text-white p-2 rounded"
            />
            <Button size="sm">Enviar</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoConference;
