import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Clock, Video, Mic, PhoneOff, Monitor } from 'lucide-react';
import './VideoConference.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import type { RealtimeChannel } from '@supabase/supabase-js';

const VideoConference = () => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  const navigate = useNavigate();
  const { id: roomId } = useParams();
  const { data: profile } = useProfile();
  const [showConfirm, setShowConfirm] = useState(false);
  const [ending, setEnding] = useState(false);
  
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);

  // STUN servers para conectividade
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

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

  // Inicializar stream local
  const initializeLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      console.log('Local stream initialized');
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  }, []);

  // Criar conexão WebRTC
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(rtcConfig);
    
    // Quando receber stream remoto
    pc.ontrack = (event) => {
      console.log('Received remote stream');
      const [stream] = event.streams;
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };
    
    // Quando candidato ICE for gerado
    pc.onicecandidate = (event) => {
      if (event.candidate && channel) {
        console.log('Sending ICE candidate');
        channel.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            candidate: event.candidate,
            from: profile?.id
          }
        });
      }
    };
    
    // Monitorar estado da conexão
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
    };
    
    return pc;
  }, [channel, profile?.id]);

  // Lidar com sinalização WebRTC
  const handleSignaling = useCallback(async (payload: any) => {
    if (!peerConnection) return;
    
    const { offer, answer, candidate, from } = payload;
    
    if (from === profile?.id) return; // Ignorar próprias mensagens
    
    try {
      if (offer) {
        console.log('Received offer');
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answerDescription = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answerDescription);
        
        if (channel) {
          channel.send({
            type: 'broadcast',
            event: 'answer',
            payload: {
              answer: answerDescription,
              from: profile?.id
            }
          });
        }
      } else if (answer) {
        console.log('Received answer');
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      } else if (candidate) {
        console.log('Received ICE candidate');
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error handling signaling:', error);
    }
  }, [peerConnection, channel, profile?.id]);

  // Iniciar chamada com novo usuário
  const initiateCall = useCallback(async () => {
    if (!peerConnection || !localStream) return;
    
    // Adicionar stream local ao peer connection
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });
    
    // Criar offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    if (channel) {
      console.log('Sending offer');
      channel.send({
        type: 'broadcast',
        event: 'offer',
        payload: {
          offer,
          from: profile?.id
        }
      });
    }
  }, [peerConnection, localStream, channel, profile?.id]);

  // Configurar canal de comunicação em tempo real
  useEffect(() => {
    if (!roomId || !profile?.id) return;

    const roomChannel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: {
          key: profile.id,
        },
      },
    });

    roomChannel
      .on('presence', { event: 'sync' }, () => {
        const state = roomChannel.presenceState();
        const users = Object.keys(state);
        setConnectedUsers(users);
        console.log('Connected users:', users);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log('User joined:', key);
        // Se outro usuário entrou e sou o primeiro, inicio a chamada
        if (connectedUsers.length === 0) {
          setTimeout(() => initiateCall(), 1000);
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('User left:', key);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
        setRemoteStream(null);
      })
      // Sinalização WebRTC
      .on('broadcast', { event: 'offer' }, ({ payload }) => {
        handleSignaling(payload);
      })
      .on('broadcast', { event: 'answer' }, ({ payload }) => {
        handleSignaling(payload);
      })
      .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
        handleSignaling(payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Connected to room channel');
          await roomChannel.track({
            user_id: profile.id,
            user_name: profile.full_name || 'User',
            online_at: new Date().toISOString(),
          });
        }
      });

    setChannel(roomChannel);

    return () => {
      roomChannel.unsubscribe();
    };
  }, [roomId, profile?.id, profile?.full_name, handleSignaling, connectedUsers.length, initiateCall]);

  // Inicializar WebRTC e stream
  useEffect(() => {
    const init = async () => {
      // Criar peer connection
      const pc = createPeerConnection();
      setPeerConnection(pc);
      
      // Inicializar stream local
      await initializeLocalStream();
    };
    
    init();
    
    return () => {
      if (peerConnection) {
        peerConnection.close();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [createPeerConnection, initializeLocalStream]);

  // Load existing chat messages and setup realtime subscription
  useEffect(() => {
    if (!roomId) return;

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
  }, [roomId]);

  const toggleVideo = useCallback(() => {
    setIsVideoOn(!isVideoOn);
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
      }
    }
  }, [isVideoOn, localStream]);

  const toggleAudio = useCallback(() => {
    setIsAudioOn(!isAudioOn);
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
      }
    }
  }, [isAudioOn, localStream]);

  const toggleScreenShare = useCallback(async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true, 
          audio: true 
        });
        
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }
        
        // Substituir track de vídeo na conexão peer
        if (peerConnection) {
          const sender = peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            sender.replaceTrack(stream.getVideoTracks()[0]);
          }
        }
        
        setIsScreenSharing(true);
        
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          setIsScreenSharing(false);
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = null;
          }
          
          // Restaurar câmera
          if (localStream && peerConnection) {
            const sender = peerConnection.getSenders().find(s => 
              s.track && s.track.kind === 'video'
            );
            if (sender) {
              sender.replaceTrack(localStream.getVideoTracks()[0]);
            }
          }
        });
      } catch (err) {
        console.log('Erro ao compartilhar tela:', err);
      }
    } else {
      setIsScreenSharing(false);
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
      
      // Restaurar câmera
      if (localStream && peerConnection) {
        const sender = peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          sender.replaceTrack(localStream.getVideoTracks()[0]);
        }
      }
    }
  }, [isScreenSharing, localStream, peerConnection]);

  const sendMessage = async () => {
    if (chatMessage.trim() && profile && roomId) {
      const sender = profile.full_name || profile.email || 'Usuário';
      
      try {
        // Save message to database
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
    
    // Parar streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Fechar conexão peer
    if (peerConnection) {
      peerConnection.close();
    }
    
    // Atualizar status da sala
    if (roomId) {
      await supabase.from('meeting_rooms').update({ 
        is_active: false, 
        ended_at: new Date().toISOString() 
      }).eq('id', roomId);
    }
    
    setShowConfirm(false);
    setEnding(false);
    
    // Redirecionar baseado no papel do usuário
    if (profile?.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const cancelEndCall = () => {
    setShowConfirm(false);
  };


  // Loading and error states
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

  // Time-based access control
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
              <h1 className="text-lg font-semibold">Consulta - {room.type}</h1>
              <p className="text-sm text-gray-300">
                Sala: {room.name} | Participantes: {connectedUsers.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-white text-sm">
              <Clock className="inline mr-1 h-4 w-4" />
              {scheduledTime ? 
                `Agendado para ${scheduledTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` :
                'Reunião em andamento'
              }
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-4 p-4">
        {/* Área de compartilhamento de tela */}
        {isScreenSharing && (
          <div className="flex-1 flex items-center justify-center">
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-lg w-full max-w-4xl aspect-video">
              <video
                ref={screenVideoRef}
                autoPlay
                muted
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
                Compartilhamento de tela
              </div>
            </div>
          </div>
        )}

        {/* Grade de vídeos */}
        <div className={`${isScreenSharing ? 'w-80 flex flex-col gap-4' : 'flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4'}`}>
          {/* Vídeo local */}
          <div className={`relative bg-gray-800 rounded-lg overflow-hidden ${isScreenSharing ? 'aspect-video' : 'min-h-[300px]'}`}>
            {isVideoOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <div className="text-center text-white">
                  <User className="mx-auto h-16 w-16 mb-2" />
                  <p>Você (Câmera desligada)</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
              Você
              <div className="flex gap-1 mt-1">
                <div className={`w-2 h-2 rounded-full ${isVideoOn ? 'bg-green-500' : 'bg-red-500'}`} />
                <div className={`w-2 h-2 rounded-full ${isAudioOn ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            </div>
          </div>

          {/* Vídeo remoto */}
          {connectedUsers.filter(userId => userId !== profile?.id).length > 0 && (
            <div className={`relative bg-gray-800 rounded-lg overflow-hidden ${isScreenSharing ? 'aspect-video' : 'min-h-[300px]'}`}>
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <div className="text-center text-white">
                    <User className="mx-auto h-16 w-16 mb-2" />
                    <p>Participante</p>
                    <p className="text-sm text-gray-300">Conectando...</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                Participante
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Chat</h3>
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

      {/* Controles */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="flex justify-center space-x-4">
          {/* Controle de áudio */}
          <Button
            onClick={toggleAudio}
            variant="ghost"
            size="icon"
            className={`shadow-lg rounded-full w-16 h-16 flex items-center justify-center transition ${
              isAudioOn 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isAudioOn ? 'Desligar microfone' : 'Ligar microfone'}
          >
            <Mic className="icon-medium" />
          </Button>

          {/* Controle de vídeo */}
          <Button
            onClick={toggleVideo}
            variant="ghost"
            size="icon"
            className={`shadow-lg rounded-full w-16 h-16 flex items-center justify-center transition ${
              isVideoOn 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isVideoOn ? 'Desligar câmera' : 'Ligar câmera'}
          >
            <Video className="icon-medium" />
          </Button>

          {/* Compartilhamento de tela */}
          <Button
            onClick={toggleScreenShare}
            variant="ghost"
            size="icon"
            className={`shadow-lg rounded-full w-16 h-16 flex items-center justify-center transition ${
              isScreenSharing 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
            title={isScreenSharing ? 'Parar compartilhamento' : 'Compartilhar tela'}
          >
            <Monitor className="icon-medium" />
          </Button>

          {/* Encerrar chamada */}
          <Button
            onClick={endCall}
            variant="ghost"
            size="icon"
            className="bg-red-600 hover:bg-red-700 shadow-lg rounded-full w-16 h-16 flex items-center justify-center transition text-white"
            title="Encerrar chamada"
          >
            <PhoneOff className="icon-medium" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoConference;