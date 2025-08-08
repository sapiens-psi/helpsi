import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User, Calendar, Clock, MessageCircle, Video, Mic, PhoneOff, Monitor, CircleDot, Volume2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<any[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [meetingInfo] = useState({
    client: 'João Silva',
    specialist: 'Dra. Maria Santos',
    type: 'Pós-Compra',
    duration: '15 minutos',
    startTime: '14:00'
  });

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<string | undefined>(undefined);

  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioOutputDeviceId, setSelectedAudioOutputDeviceId] = useState<string | undefined>(undefined);

  const navigate = useNavigate();
  const { id: roomId } = useParams();
  const { data: profile } = useProfile();
  const [showConfirm, setShowConfirm] = useState(false);
  const [ending, setEnding] = useState(false);
  
  // Realtime states
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(false);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(false);
  const [remoteScreenSharing, setRemoteScreenSharing] = useState(false);

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

  // Setup Realtime channel for communication
  useEffect(() => {
    if (!roomId || !profile?.id) return;

    const roomChannel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: {
          key: profile.id,
        },
      },
    });

    // Handle presence changes (users joining/leaving)
    roomChannel
      .on('presence', { event: 'sync' }, () => {
        const state = roomChannel.presenceState();
        const users = Object.keys(state);
        setConnectedUsers(users);
        console.log('Connected users:', users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      // Handle media state changes only (chat messages are handled via database realtime)
      // Handle video/audio state changes
      .on('broadcast', { event: 'media_state' }, (payload) => {
        const { userId, videoEnabled, audioEnabled, screenSharing } = payload.payload;
        if (userId !== profile.id) {
          setRemoteVideoEnabled(videoEnabled);
          setRemoteAudioEnabled(audioEnabled);
          setRemoteScreenSharing(screenSharing);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully connected to room channel');
          // Track presence
          await roomChannel.track({
            user_id: profile.id,
            user_name: profile.full_name || profile.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    setChannel(roomChannel);

    return () => {
      roomChannel.unsubscribe();
    };
  }, [roomId, profile?.id, profile?.full_name, profile?.email]);

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

  useEffect(() => {
    // Simular inicialização da câmera
    if (videoRef.current && isVideoOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.log('Erro ao acessar câmera:', err));
    }
  }, [isVideoOn]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const mics = devices.filter(device => device.kind === 'audioinput');
      setAudioDevices(mics);
      if (!selectedAudioDeviceId && mics.length > 0) {
        setSelectedAudioDeviceId(mics[0].deviceId);
      }
    });
  }, []);

  useEffect(() => {
    if (isVideoOn && selectedAudioDeviceId) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: { deviceId: selectedAudioDeviceId } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.log('Erro ao acessar câmera/microfone:', err));
    }
  }, [selectedAudioDeviceId, isVideoOn]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const outputs = devices.filter(device => device.kind === 'audiooutput');
      setAudioOutputDevices(outputs);
      if (!selectedAudioOutputDeviceId && outputs.length > 0) {
        setSelectedAudioOutputDeviceId(outputs[0].deviceId);
      }
    });
  }, []);

  useEffect(() => {
    if (videoRef.current && selectedAudioOutputDeviceId && typeof videoRef.current.setSinkId === 'function') {
      videoRef.current.setSinkId(selectedAudioOutputDeviceId).catch((err: any) => {
        console.warn('Erro ao definir saída de áudio:', err);
      });
    }
  }, [selectedAudioOutputDeviceId]);

  const toggleVideo = () => {
    const newVideoState = !isVideoOn;
    setIsVideoOn(newVideoState);
    console.log('Video toggled:', newVideoState);
    
    // Broadcast video state change
    if (channel && profile?.id) {
      channel.send({
        type: 'broadcast',
        event: 'media_state',
        payload: {
          userId: profile.id,
          videoEnabled: newVideoState,
          audioEnabled: isAudioOn,
          screenSharing: isScreenSharing
        }
      });
    }
  };

  const toggleAudio = () => {
    const newAudioState = !isAudioOn;
    setIsAudioOn(newAudioState);
    console.log('Audio toggled:', newAudioState);
    
    // Broadcast audio state change
    if (channel && profile?.id) {
      channel.send({
        type: 'broadcast',
        event: 'media_state',
        payload: {
          userId: profile.id,
          videoEnabled: isVideoOn,
          audioEnabled: newAudioState,
          screenSharing: isScreenSharing
        }
      });
    }
  };

  const toggleScreenShare = async () => {
    console.log('toggleScreenShare chamado');
    if (!isScreenSharing) {
      try {
        console.log('Solicitando getDisplayMedia...');
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        console.log('getDisplayMedia retornou stream:', stream);
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
          screenVideoRef.current.play?.();
          console.log('Stream atribuído ao screenVideoRef:', screenVideoRef.current, stream);
          setTimeout(() => {
            console.log('Dentro do setTimeout, screenVideoRef.current:', screenVideoRef.current);
            if (screenVideoRef.current) {
              console.log('screenVideoRef.current.paused:', screenVideoRef.current.paused);
              console.log('screenVideoRef.current.srcObject:', screenVideoRef.current.srcObject);
              if (screenVideoRef.current.paused) {
                screenVideoRef.current.play().then(() => {
                  console.log('Forçou play no vídeo de compartilhamento!');
                }).catch(err => {
                  console.warn('Erro ao forçar play:', err);
                });
              }
            } else {
              console.warn('screenVideoRef.current está null dentro do setTimeout!');
            }
          }, 1000);
        }
        setIsScreenSharing(true);
        
        // Broadcast screen sharing state
        if (channel && profile?.id) {
          channel.send({
            type: 'broadcast',
            event: 'media_state',
            payload: {
              userId: profile.id,
              videoEnabled: isVideoOn,
              audioEnabled: isAudioOn,
              screenSharing: true
            }
          });
        }
        
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          setIsScreenSharing(false);
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = null;
          }
          
          // Broadcast screen sharing stopped
          if (channel && profile?.id) {
            channel.send({
              type: 'broadcast',
              event: 'media_state',
              payload: {
                userId: profile.id,
                videoEnabled: isVideoOn,
                audioEnabled: isAudioOn,
                screenSharing: false
              }
            });
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
      
      // Broadcast screen sharing stopped
      if (channel && profile?.id) {
        channel.send({
          type: 'broadcast',
          event: 'media_state',
          payload: {
            userId: profile.id,
            videoEnabled: isVideoOn,
            audioEnabled: isAudioOn,
            screenSharing: false
          }
        });
      }
    }
  };

  const drawToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, canvas.width, canvas.height); // DEBUG: canvas deve ficar vermelho
    console.log('drawToCanvas chamado');
    if (videoRef.current && videoRef.current.srcObject) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width / 2, canvas.height / 2);
      console.log('Desenhando vídeo local no canvas');
    }
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      ctx.drawImage(remoteVideoRef.current, canvas.width / 2, 0, canvas.width / 2, canvas.height / 2);
      console.log('Desenhando vídeo remoto no canvas');
    }
    if (
      screenVideoRef.current &&
      screenVideoRef.current.srcObject &&
      !screenVideoRef.current.paused &&
      !screenVideoRef.current.ended
    ) {
      ctx.drawImage(screenVideoRef.current, 0, canvas.height / 2, canvas.width, canvas.height / 2);
      console.log('Desenhando compartilhamento de tela no canvas');
    }
    requestAnimationFrame(drawToCanvas);
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = 1280;
      canvas.height = 720;
      drawToCanvas();
      const canvasStream = canvas.captureStream(30);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();
      let localStream = videoRef.current?.srcObject as MediaStream;
      if (localStream) {
        try {
          const localAudioSource = audioContext.createMediaStreamSource(localStream);
          localAudioSource.connect(destination);
        } catch {}
      }
      let remoteStream = remoteVideoRef.current?.srcObject as MediaStream;
      if (remoteStream) {
        try {
          const remoteAudioSource = audioContext.createMediaStreamSource(remoteStream);
          remoteAudioSource.connect(destination);
        } catch {}
      }
      let screenStream = screenVideoRef.current?.srcObject as MediaStream;
      if (screenStream) {
        try {
          const screenAudioSource = audioContext.createMediaStreamSource(screenStream);
          screenAudioSource.connect(destination);
        } catch {}
      }
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...destination.stream.getAudioTracks()
      ]);
      const recorder = new MediaRecorder(combinedStream);
      setRecordedChunks([]);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } else if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

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
    // Encerra todos os streams de vídeo/áudio
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (screenVideoRef.current && screenVideoRef.current.srcObject) {
      const tracks = (screenVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      screenVideoRef.current.srcObject = null;
    }
    // Atualiza status da sala para indisponível
    if (roomId) {
      await supabase.from('meeting_rooms').update({ is_active: false, ended_at: new Date().toISOString() }).eq('id', roomId);
    }
    setShowConfirm(false);
    setEnding(false);
    // Redireciona conforme o tipo de usuário
    if (profile?.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const cancelEndCall = () => {
    setShowConfirm(false);
  };

  // Função para entrar em tela cheia
  const handleFullscreen = (ref: React.RefObject<HTMLVideoElement>) => {
    if (ref.current) {
      if (ref.current.requestFullscreen) {
        ref.current.requestFullscreen();
      } else if ((ref.current as any).webkitRequestFullscreen) {
        (ref.current as any).webkitRequestFullscreen();
      } else if ((ref.current as any).msRequestFullscreen) {
        (ref.current as any).msRequestFullscreen();
      }
    }
  };

  // Se a sala não existe ou não está ativa, exibe mensagem
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

  // Se a sala tem horário agendado e ainda não chegou a 5 minutos antes
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

  // Se a reunião já passou do horário agendado e ainda não foi encerrada manualmente, mas já deveria estar encerrada
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
      {/* Elementos ocultos para gravação composta */}
      <video ref={remoteVideoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
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
            {isRecording && (
              <div className="flex items-center text-red-400">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                Gravando
              </div>
            )}
            <div className="text-white text-sm">
              <Clock className="inline mr-1 h-4 w-4" />
              Iniciado às {meetingInfo.startTime}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-4 p-4">
        {/* Câmeras à esquerda (quando compartilhando tela) */}
        {isScreenSharing && (
          <div className="flex flex-col gap-4 justify-start">
            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-xl overflow-hidden w-48 h-36">
              {isVideoOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <div className="text-center text-white">
                    <User className="mx-auto h-12 w-12 mb-2" />
                    <p>Você (Câmera desligada)</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">Você</div>
              {/* Botão tela cheia para câmera local */}
              <button
                className="absolute top-2 right-2 bg-black/60 text-white rounded p-1 hover:bg-black/80 z-10"
                onClick={() => handleFullscreen(videoRef)}
                title="Tela cheia"
                type="button"
              >
                ⛶
              </button>
            </div>
            {/* Remote Video */}
            <div className="relative bg-gray-800 rounded-xl overflow-hidden w-48 h-36">
              {connectedUsers.length > 1 && remoteVideoEnabled ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <div className="text-center text-white">
                    <User className="mx-auto h-12 w-12 mb-2" />
                    <p>{meetingInfo.specialist}</p>
                    <p className="text-xs text-gray-300">
                      {connectedUsers.length > 1 ? 'Câmera desligada' : 'Conectando...'}
                    </p>
                  </div>
                </div>
              )}
              {/* Status indicators */}
              <div className="absolute top-2 left-2 flex gap-1">
                {connectedUsers.length > 1 && (
                  <>
                    <div className={`w-2 h-2 rounded-full ${remoteVideoEnabled ? 'bg-green-500' : 'bg-red-500'}`} title={remoteVideoEnabled ? 'Vídeo ligado' : 'Vídeo desligado'} />
                    <div className={`w-2 h-2 rounded-full ${remoteAudioEnabled ? 'bg-green-500' : 'bg-red-500'}`} title={remoteAudioEnabled ? 'Áudio ligado' : 'Áudio desligado'} />
                    {remoteScreenSharing && <div className="w-2 h-2 rounded-full bg-blue-500" title="Compartilhando tela" />}
                  </>
                )}
              </div>
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {meetingInfo.specialist} {connectedUsers.length > 1 ? '(Online)' : '(Offline)'}
              </div>
              {/* Botão tela cheia para câmera remota */}
              <button
                className="absolute top-2 right-2 bg-black/60 text-white rounded p-1 hover:bg-black/80 z-10"
                onClick={() => handleFullscreen(remoteVideoRef)}
                title="Tela cheia"
                type="button"
              >
                ⛶
              </button>
            </div>
          </div>
        )}

        {/* Compartilhamento de tela centralizado */}
        <div
          className={
            isScreenSharing
              ? "flex-1 flex items-center justify-center"
              : "fixed bottom-6 left-6 z-50"
          }
        >
          <div
            className={
              isScreenSharing
                ? "relative rounded-2xl overflow-hidden bg-gray-900 shadow-lg w-full max-w-3xl aspect-video flex items-center justify-center border-4 border-white/10"
                : "relative rounded-lg overflow-hidden shadow-lg bg-black/80 w-24 h-16 opacity-50 pointer-events-none"
            }
          >
            <video
              ref={screenVideoRef}
              autoPlay
              muted={!isScreenSharing}
              className="w-full h-full object-contain"
              style={{ background: '#222' }}
            />
            {/* Botão tela cheia para compartilhamento */}
            <button
              className="absolute top-2 right-2 bg-black/60 text-white rounded p-1 hover:bg-black/80 z-10"
              onClick={() => handleFullscreen(screenVideoRef)}
              title="Tela cheia"
              type="button"
            >
              ⛶
            </button>
          </div>
        </div>

        {/* Layout padrão (sem compartilhamento): grid de vídeos */}
        {!isScreenSharing && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              {isVideoOn ? (
                <video
                  ref={videoRef}
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
              {/* Botão tela cheia para câmera local */}
              <button
                className="absolute top-2 right-2 bg-black/60 text-white rounded p-1 hover:bg-black/80 z-10"
                onClick={() => handleFullscreen(videoRef)}
                title="Tela cheia"
                type="button"
              >
                ⛶
              </button>
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">Você</div>
            </div>
            {/* Remote Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              {connectedUsers.length > 1 && remoteVideoEnabled ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <div className="text-center text-white">
                    <User className="mx-auto h-16 w-16 mb-2" />
                    <p>{meetingInfo.specialist}</p>
                    <p className="text-sm text-gray-300">
                      {connectedUsers.length > 1 ? 'Câmera desligada' : 'Conectando...'}
                    </p>
                    {/* Status indicators */}
                    {connectedUsers.length > 1 && (
                      <div className="flex justify-center space-x-2 mt-2">
                        <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded ${
                          remoteVideoEnabled ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          <Video className="w-3 h-3" />
                          <span>{remoteVideoEnabled ? 'On' : 'Off'}</span>
                        </div>
                        <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded ${
                          remoteAudioEnabled ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          <Mic className="w-3 h-3" />
                          <span>{remoteAudioEnabled ? 'On' : 'Off'}</span>
                        </div>
                        {remoteScreenSharing && (
                          <div className="flex items-center space-x-1 text-xs px-2 py-1 rounded bg-blue-600">
                            <Monitor className="w-3 h-3" />
                            <span>Sharing</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Botão tela cheia para câmera remota */}
              <button
                className="absolute top-2 right-2 bg-black/60 text-white rounded p-1 hover:bg-black/80 z-10"
                onClick={() => handleFullscreen(remoteVideoRef)}
                title="Tela cheia"
                type="button"
              >
                ⛶
              </button>
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {meetingInfo.specialist}
                {connectedUsers.length > 1 && (
                  <span className="ml-2 text-green-400">●</span>
                )}
              </div>
            </div>
          </div>
        )}

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

      {/* Controls */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="flex justify-center space-x-4">
          <div className="relative flex items-center">
            <Button
              onClick={toggleAudio}
              variant="ghost"
              size="icon"
              className={`bg-white shadow-lg rounded-full w-16 h-16 flex items-center justify-center hover:bg-blue-100 transition ${isAudioOn ? 'text-blue-700' : 'text-red-600'}`}
              title={isAudioOn ? 'Desligar microfone' : 'Ligar microfone'}
            >
              <Mic className="icon-medium" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -right-2 -bottom-2 w-8 h-8 bg-white border border-gray-200 shadow rounded-full flex items-center justify-center p-0"
                  title="Selecionar microfone"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {audioDevices.length === 0 && (
                  <DropdownMenuItem disabled>Nenhum microfone encontrado</DropdownMenuItem>
                )}
                {audioDevices.map(device => (
                  <DropdownMenuItem
                    key={device.deviceId}
                    onClick={() => setSelectedAudioDeviceId(device.deviceId)}
                    className={selectedAudioDeviceId === device.deviceId ? 'font-bold text-blue-600' : ''}
                  >
                    {device.label || `Microfone ${device.deviceId.slice(-4)}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="relative flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className={`bg-white shadow-lg rounded-full w-16 h-16 flex items-center justify-center hover:bg-blue-100 transition text-blue-700`}
              title="Selecionar saída de áudio"
              disabled={audioOutputDevices.length === 0}
            >
              <Volume2 className="icon-medium" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -right-2 -bottom-2 w-8 h-8 bg-white border border-gray-200 shadow rounded-full flex items-center justify-center p-0"
                  title="Selecionar saída de áudio"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {audioOutputDevices.length === 0 && (
                  <DropdownMenuItem disabled>Nenhum dispositivo de saída encontrado</DropdownMenuItem>
                )}
                {audioOutputDevices.map(device => (
                  <DropdownMenuItem
                    key={device.deviceId}
                    onClick={() => setSelectedAudioOutputDeviceId(device.deviceId)}
                    className={selectedAudioOutputDeviceId === device.deviceId ? 'font-bold text-blue-600' : ''}
                  >
                    {device.label || `Saída ${device.deviceId.slice(-4)}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            onClick={toggleVideo}
            variant="ghost"
            size="icon"
            className={`bg-white shadow-lg rounded-full w-16 h-16 flex items-center justify-center hover:bg-blue-100 transition ${isVideoOn ? 'text-blue-700' : 'text-red-600'}`}
            title={isVideoOn ? 'Desligar vídeo' : 'Ligar vídeo'}
          >
            <Video className="icon-medium" />
          </Button>
          <Button
            onClick={() => { console.log('Botão compartilhar tela clicado'); toggleScreenShare(); }}
            variant="ghost"
            size="icon"
            className={`bg-white shadow-lg rounded-full w-16 h-16 flex items-center justify-center hover:bg-blue-100 transition ${isScreenSharing ? 'text-green-700' : 'text-blue-700'}`}
            title={isScreenSharing ? 'Parar compartilhamento' : 'Compartilhar tela'}
          >
            <Monitor className="icon-medium" />
          </Button>
          <Button
            onClick={toggleRecording}
            variant="ghost"
            size="icon"
            className={`bg-white shadow-lg rounded-full w-16 h-16 flex items-center justify-center hover:bg-blue-100 transition ${isRecording ? 'text-red-600' : 'text-blue-700'}`}
            title={isRecording ? 'Parar gravação' : 'Iniciar gravação'}
          >
            <CircleDot className="icon-medium" />
          </Button>
          <Button
            onClick={endCall}
            variant="ghost"
            size="icon"
            className="bg-white shadow-lg rounded-full w-16 h-16 flex items-center justify-center hover:bg-red-100 text-red-600 transition"
            title="Desligar chamada"
          >
            <PhoneOff className="icon-medium" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoConference;
