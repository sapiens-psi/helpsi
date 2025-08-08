import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Calendar, Clock, MessageCircle, PhoneOff } from 'lucide-react';
import './VideoConference.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Declaração do tipo para a API do Jitsi
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const VideoConference = () => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [ending, setEnding] = useState(false);
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { id: roomId } = useParams();
  const { data: profile } = useProfile();

  const [meetingInfo] = useState({
    client: 'João Silva',
    specialist: 'Dra. Maria Santos',
    type: 'Pós-Compra',
    duration: '15 minutos',
    startTime: '14:00'
  });

  // Buscar informações da sala
  const { data: room, isLoading: isLoadingRoom } = useQuery({
    queryKey: ['meeting-room', roomId],
    queryFn: async () => {
      if (!roomId) return null;
      const { data, error } = await supabase
        .from('meeting_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!roomId,
  });

  // Carregar script do Jitsi Meet
  useEffect(() => {
    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        setJitsiLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => setJitsiLoaded(true);
      script.onerror = () => console.error('Erro ao carregar Jitsi Meet');
      document.head.appendChild(script);
    };

    loadJitsiScript();
  }, []);

  // Inicializar Jitsi Meet
  useEffect(() => {
    if (!jitsiLoaded || !roomId || !profile || !jitsiContainerRef.current || jitsiApi) {
      return;
    }

    // Aguardar um pouco para garantir que o container esteja pronto
    const initializeJitsi = () => {
      try {
        const domain = 'meet.jit.si';
        const options = {
          roomName: `helpsi-room-${roomId}`,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            enableClosePage: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            doNotStoreRoom: true
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'desktop',
              'fullscreen',
              'hangup',
              'chat',
              'settings',
              'tileview'
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
            MOBILE_APP_PROMO: false
          },
          userInfo: {
            displayName: profile.full_name || profile.email || 'Usuário',
            email: profile.email
          }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        setJitsiApi(api);

        // Event listeners
        api.addEventListener('readyToClose', () => {
          endCall();
        });

        api.addEventListener('participantLeft', (participant: any) => {
          console.log('Participante saiu:', participant);
        });

        api.addEventListener('participantJoined', (participant: any) => {
          console.log('Participante entrou:', participant);
        });

        api.addEventListener('videoConferenceJoined', () => {
          console.log('Usuário entrou na conferência');
        });

        api.addEventListener('videoConferenceLeft', () => {
          console.log('Usuário saiu da conferência');
        });

        return api;
      } catch (error) {
        console.error('Erro ao inicializar Jitsi:', error);
        return null;
      }
    };

    const timeoutId = setTimeout(() => {
      const api = initializeJitsi();
      if (!api) {
        console.error('Falha ao inicializar Jitsi Meet');
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      if (jitsiApi) {
        try {
          jitsiApi.dispose();
        } catch (error) {
          console.error('Erro ao limpar Jitsi API:', error);
        }
      }
    };
  }, [jitsiLoaded, roomId, profile, jitsiApi]);

  // Setup chat realtime
  useEffect(() => {
    if (!roomId || !profile?.id) return;

    // Load existing messages
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_token', roomId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error loading messages:', error);
        return;
      }
      
      const formattedMessages = data.map(msg => ({
        id: msg.id,
        sender: msg.sender_name,
        message: msg.message,
        time: new Date(msg.created_at).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }));
      
      setChatMessages(formattedMessages);
    };

    loadMessages();

    // Setup realtime subscription for new messages
    const messagesChannel = supabase
      .channel(`chat_messages:room_token=eq.${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_token=eq.${roomId}`
        },
        (payload) => {
          const newMessage = {
            id: payload.new.id,
            sender: payload.new.sender_name,
            message: payload.new.message,
            time: new Date(payload.new.created_at).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          };
          setChatMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      messagesChannel.unsubscribe();
    };
  }, [roomId, profile?.id]);

  const sendMessage = async () => {
    if (chatMessage.trim() && profile && roomId) {
      const sender = profile.full_name || profile.email || 'Usuário';
      
      try {
        const { error } = await supabase
          .from('chat_messages')
          .insert({
            room_token: roomId,
            sender_id: profile.id,
            sender_name: sender,
            message: chatMessage.trim()
          });
        
        if (error) {
          console.error('Error saving message:', error);
          return;
        }
        
        setChatMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const endCall = async () => {
    setShowConfirm(true);
  };

  const confirmEndCall = async () => {
    setEnding(true);
    
    // Dispose Jitsi API
    if (jitsiApi) {
      jitsiApi.dispose();
      setJitsiApi(null);
    }
    
    // Unsubscribe from channel
    if (channel) {
      channel.unsubscribe();
    }
    
    // Update room status to inactive
    if (roomId) {
      await supabase.from('meeting_rooms').update({ 
        is_active: false, 
        ended_at: new Date().toISOString() 
      }).eq('id', roomId);
    }
    
    setShowConfirm(false);
    setEnding(false);
    
    // Redirect based on user role
    if (profile?.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const cancelEndCall = () => {
    setShowConfirm(false);
  };

  // Loading states
  if (isLoadingRoom) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Carregando sala...</div>;
  }

  if (!room || !room.is_active) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white flex-col p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Sala Indisponível</h1>
        <p className="text-lg mb-8">Esta sala de reunião não está ativa ou não existe mais.</p>
        <Button onClick={() => profile?.role === 'admin' ? navigate('/admin') : navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white">
          Voltar
        </Button>
      </div>
    );
  }

  const scheduledTime = room.scheduled_at ? new Date(room.scheduled_at) : null;
  const now = new Date();
  const fiveMinutesBefore = scheduledTime ? new Date(scheduledTime.getTime() - 5 * 60 * 1000) : null;

  // Check if meeting is scheduled and not yet time
  if (scheduledTime && fiveMinutesBefore && now < fiveMinutesBefore) {
    const formattedTime = new Date(scheduledTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const formattedDate = new Date(scheduledTime).toLocaleDateString('pt-BR');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white flex-col p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Aguarde o Horário da Reunião</h1>
        <p className="text-lg mb-8">A sala estará disponível a partir das {formattedTime} em {formattedDate}.</p>
        <Button onClick={() => profile?.role === 'admin' ? navigate('/admin') : navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white">
          Voltar
        </Button>
      </div>
    );
  }

  // Check if meeting has expired
  if (scheduledTime && now > scheduledTime && !room.ended_at && !room.is_active) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white flex-col p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Sala Expirada</h1>
        <p className="text-lg mb-8">O horário da reunião já passou e a sala não está mais ativa.</p>
        <Button onClick={() => profile?.role === 'admin' ? navigate('/admin') : navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white">
          Voltar
        </Button>
      </div>
    );
  }

  if (!jitsiLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando Jitsi Meet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Modal de confirmação */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold mb-4">Deseja realmente encerrar a chamada?</h2>
            <p className="mb-6">Ao encerrar, a sala ficará indisponível para novas entradas.</p>
            <div className="flex justify-center gap-4">
              <Button onClick={confirmEndCall} disabled={ending} className="bg-red-600 hover:bg-red-700 text-white">
                {ending ? 'Encerrando...' : 'Sim, encerrar'}
              </Button>
              <Button onClick={cancelEndCall} variant="outline" disabled={ending}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-white">
              <h1 className="text-lg font-semibold">Consulta - {meetingInfo.type}</h1>
              <p className="text-sm text-gray-300">
                {meetingInfo.client} com {meetingInfo.specialist}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-white text-sm">
              <Clock className="inline mr-1 h-4 w-4" />
              Iniciado às {meetingInfo.startTime}
            </div>
            <Button
              onClick={endCall}
              variant="ghost"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              title="Encerrar chamada"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              Encerrar
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-4 p-4">
        {/* Jitsi Meet Container */}
        <div className="flex-1">
          <div 
            ref={jitsiContainerRef} 
            className="w-full h-full min-h-[600px] bg-black rounded-lg overflow-hidden"
            style={{ height: 'calc(100vh - 200px)' }}
          />
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col rounded-lg">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Chat
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-blue-400 font-medium">{msg.sender}</span>
                  <span className="text-gray-400 text-xs">{msg.time}</span>
                </div>
                <p className="text-gray-300">{msg.message}</p>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="bg-gray-700 border-gray-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage} size="sm">
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConference;
