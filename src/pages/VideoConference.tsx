import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User, Calendar, Clock, MessageCircle, Video, Mic, PhoneOff, Monitor, Volume2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import './VideoConference.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface PeerConnection {
  userId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

const VideoConference = () => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const screenShareRef = useRef<HTMLVideoElement>(null);
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [peerConnections, setPeerConnections] = useState<Map<string, PeerConnection>>(new Map());

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
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, { video: boolean; audio: boolean; screen: boolean }>>(new Map());

  // ICE servers configuration for better connectivity
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ];

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

  // Initialize local media stream
  const initializeLocalStream = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: isVideoOn,
        audio: selectedAudioDeviceId ? 
          { deviceId: { exact: selectedAudioDeviceId } } : 
          isAudioOn
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Update existing peer connections with new stream
      peerConnections.forEach((peerConn) => {
        const senders = peerConn.connection.getSenders();
        stream.getTracks().forEach(track => {
          const sender = senders.find(s => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            peerConn.connection.addTrack(track, stream);
          }
        });
      });

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  }, [isVideoOn, isAudioOn, selectedAudioDeviceId, peerConnections]);

  // Create peer connection
  const createPeerConnection = useCallback((userId: string): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection({ iceServers });

    // Handle incoming stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream from:', userId);
      const [remoteStream] = event.streams;
      const videoElement = remoteVideoRefs.current.get(userId);
      if (videoElement) {
        videoElement.srcObject = remoteStream;
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && channel) {
        channel.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            candidate: event.candidate,
            targetUserId: userId,
            fromUserId: profile?.id
          }
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${userId}:`, peerConnection.connectionState);
      if (peerConnection.connectionState === 'failed') {
        console.log('Connection failed, attempting to restart ICE');
        peerConnection.restartIce();
      }
    };

    return peerConnection;
  }, [channel, profile?.id]);

  // Handle WebRTC signaling
  const handleSignaling = useCallback(async (payload: any) => {
    const { fromUserId, offer, answer, candidate } = payload;
    
    if (!fromUserId || fromUserId === profile?.id) return;

    let peerConn = peerConnections.get(fromUserId);
    
    if (!peerConn) {
      const connection = createPeerConnection(fromUserId);
      peerConn = { userId: fromUserId, connection };
      setPeerConnections(prev => new Map(prev).set(fromUserId, peerConn!));
      
      // Add local stream to the connection
      if (localStream) {
        localStream.getTracks().forEach(track => {
          connection.addTrack(track, localStream);
        });
      }
    }

    if (offer) {
      await peerConn.connection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConn.connection.createAnswer();
      await peerConn.connection.setLocalDescription(answer);
      
      if (channel) {
        channel.send({
          type: 'broadcast',
          event: 'webrtc-answer',
          payload: {
            answer,
            targetUserId: fromUserId,
            fromUserId: profile?.id
          }
        });
      }
    }

    if (answer) {
      await peerConn.connection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    if (candidate) {
      await peerConn.connection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }, [peerConnections, createPeerConnection, localStream, channel, profile?.id]);

  // Initialize offer to new user
  const initiateCall = useCallback(async (targetUserId: string) => {
    if (targetUserId === profile?.id) return;

    const connection = createPeerConnection(targetUserId);
    const peerConn = { userId: targetUserId, connection };
    setPeerConnections(prev => new Map(prev).set(targetUserId, peerConn));

    // Add local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        connection.addTrack(track, localStream);
      });
    }

    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);

    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'webrtc-offer',
        payload: {
          offer,
          targetUserId,
          fromUserId: profile?.id
        }
      });
    }
  }, [createPeerConnection, localStream, channel, profile?.id]);

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
        const newConnectedUsers = new Set(users);
        
        // Initiate calls to newly joined users
        newConnectedUsers.forEach(userId => {
          if (userId !== profile.id && !connectedUsers.has(userId)) {
            console.log('New user joined, initiating call:', userId);
            initiateCall(userId);
          }
        });

        setConnectedUsers(newConnectedUsers);
        console.log('Connected users:', users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        // Clean up peer connection
        const peerConn = peerConnections.get(key);
        if (peerConn) {
          peerConn.connection.close();
          setPeerConnections(prev => {
            const newMap = new Map(prev);
            newMap.delete(key);
            return newMap;
          });
        }
        remoteVideoRefs.current.delete(key);
      })
      // Handle WebRTC signaling
      .on('broadcast', { event: 'webrtc-offer' }, ({ payload }) => {
        if (payload.targetUserId === profile.id) {
          handleSignaling(payload);
        }
      })
      .on('broadcast', { event: 'webrtc-answer' }, ({ payload }) => {
        if (payload.targetUserId === profile.id) {
          handleSignaling(payload);
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
        if (payload.targetUserId === profile.id) {
          handleSignaling(payload);
        }
      })
      // Handle media state changes
      .on('broadcast', { event: 'media_state' }, (payload) => {
        const { userId, videoEnabled, audioEnabled, screenSharing } = payload.payload;
        if (userId !== profile.id) {
          setRemoteStreams(prev => new Map(prev).set(userId, {
            video: videoEnabled,
            audio: audioEnabled,
            screen: screenSharing
          }));
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
  }, [roomId, profile?.id, profile?.full_name, profile?.email, initiateCall, handleSignaling, connectedUsers, peerConnections]);

  // Initialize local stream
  useEffect(() => {
    initializeLocalStream();
  }, [initializeLocalStream]);

  // Load device lists
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const mics = devices.filter(device => device.kind === 'audioinput');
      setAudioDevices(mics);
      if (!selectedAudioDeviceId && mics.length > 0) {
        setSelectedAudioDeviceId(mics[0].deviceId);
      }

      const outputs = devices.filter(device => device.kind === 'audiooutput');
      setAudioOutputDevices(outputs);
      if (!selectedAudioOutputDeviceId && outputs.length > 0) {
        setSelectedAudioOutputDeviceId(outputs[0].deviceId);
      }
    });
  }, [selectedAudioDeviceId, selectedAudioOutputDeviceId]);

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
    const newVideoState = !isVideoOn;
    setIsVideoOn(newVideoState);
    
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = newVideoState;
      }
    }
    
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
  }, [isVideoOn, localStream, channel, profile?.id, isAudioOn, isScreenSharing]);

  const toggleAudio = useCallback(() => {
    const newAudioState = !isAudioOn;
    setIsAudioOn(newAudioState);
    
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = newAudioState;
      }
    }
    
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
  }, [isAudioOn, localStream, channel, profile?.id, isVideoOn, isScreenSharing]);

  const toggleScreenShare = useCallback(async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true, 
          audio: true 
        });
        
        setScreenStream(stream);
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = stream;
        }
        
        // Replace video track in all peer connections
        peerConnections.forEach((peerConn) => {
          const videoSender = peerConn.connection.getSenders().find(
            sender => sender.track?.kind === 'video'
          );
          if (videoSender) {
            videoSender.replaceTrack(stream.getVideoTracks()[0]);
          }
        });
        
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
          setScreenStream(null);
          if (screenShareRef.current) {
            screenShareRef.current.srcObject = null;
          }
          
          // Restore camera video track
          if (localStream) {
            peerConnections.forEach((peerConn) => {
              const videoSender = peerConn.connection.getSenders().find(
                sender => sender.track?.kind === 'video'
              );
              if (videoSender) {
                videoSender.replaceTrack(localStream.getVideoTracks()[0]);
              }
            });
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
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
      
      // Restore camera video track
      if (localStream) {
        peerConnections.forEach((peerConn) => {
          const videoSender = peerConn.connection.getSenders().find(
            sender => sender.track?.kind === 'video'
          );
          if (videoSender) {
            videoSender.replaceTrack(localStream.getVideoTracks()[0]);
          }
        });
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
  }, [isScreenSharing, screenStream, localStream, peerConnections, channel, profile?.id, isVideoOn, isAudioOn]);

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
    
    // Stop all streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    
    // Close all peer connections
    peerConnections.forEach((peerConn) => {
      peerConn.connection.close();
    });
    
    // Update room status
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

  // Helper function to create video element refs for remote users
  const createRemoteVideoRef = useCallback((userId: string) => {
    return (el: HTMLVideoElement | null) => {
      if (el) {
        remoteVideoRefs.current.set(userId, el);
      } else {
        remoteVideoRefs.current.delete(userId);
      }
    };
  }, []);

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
                Sala: {room.name} | Participantes: {connectedUsers.size}
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
        {/* Screen sharing area when active */}
        {isScreenSharing && (
          <div className="flex-1 flex items-center justify-center">
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-lg w-full max-w-4xl aspect-video">
              <video
                ref={screenShareRef}
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

        {/* Video grid */}
        <div className={`${isScreenSharing ? 'w-80 flex flex-col gap-4' : 'flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4'}`}>
          {/* Local Video */}
          <div className={`relative bg-gray-800 rounded-lg overflow-hidden ${isScreenSharing ? 'aspect-video' : ''}`}>
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
                {isScreenSharing && <div className="w-2 h-2 rounded-full bg-blue-500" />}
              </div>
            </div>
          </div>

          {/* Remote Videos */}
          {Array.from(connectedUsers).filter(userId => userId !== profile?.id).map(userId => {
            const userStreamState = remoteStreams.get(userId) || { video: false, audio: false, screen: false };
            return (
              <div key={userId} className={`relative bg-gray-800 rounded-lg overflow-hidden ${isScreenSharing ? 'aspect-video' : ''}`}>
                {userStreamState.video ? (
                  <video
                    ref={createRemoteVideoRef(userId)}
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <div className="text-center text-white">
                      <User className="mx-auto h-16 w-16 mb-2" />
                      <p>Participante</p>
                      <p className="text-sm text-gray-300">Câmera desligada</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  Participante
                  <div className="flex gap-1 mt-1">
                    <div className={`w-2 h-2 rounded-full ${userStreamState.video ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className={`w-2 h-2 rounded-full ${userStreamState.audio ? 'bg-green-500' : 'bg-red-500'}`} />
                    {userStreamState.screen && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* Controls */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="flex justify-center space-x-4">
          {/* Audio Control */}
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
                    className={selectedAudioDeviceId === device.deviceId ? 'bg-blue-100' : ''}
                  >
                    {device.label || `Microfone ${device.deviceId.slice(0, 8)}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Video Control */}
          <Button
            onClick={toggleVideo}
            variant="ghost"
            size="icon"
            className={`bg-white shadow-lg rounded-full w-16 h-16 flex items-center justify-center hover:bg-blue-100 transition ${isVideoOn ? 'text-blue-700' : 'text-red-600'}`}
            title={isVideoOn ? 'Desligar câmera' : 'Ligar câmera'}
          >
            <Video className="icon-medium" />
          </Button>

          {/* Screen Share Control */}
          <Button
            onClick={toggleScreenShare}
            variant="ghost"
            size="icon"
            className={`bg-white shadow-lg rounded-full w-16 h-16 flex items-center justify-center hover:bg-blue-100 transition ${isScreenSharing ? 'text-blue-700' : 'text-gray-700'}`}
            title={isScreenSharing ? 'Parar compartilhamento' : 'Compartilhar tela'}
          >
            <Monitor className="icon-medium" />
          </Button>

          {/* Audio Output Control */}
          <div className="relative flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white shadow-lg rounded-full w-16 h-16 flex items-center justify-center hover:bg-blue-100 transition text-gray-700"
              title="Configurar alto-falante"
            >
              <Volume2 className="icon-medium" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -right-2 -bottom-2 w-8 h-8 bg-white border border-gray-200 shadow rounded-full flex items-center justify-center p-0"
                  title="Selecionar alto-falante"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {audioOutputDevices.length === 0 && (
                  <DropdownMenuItem disabled>Nenhum alto-falante encontrado</DropdownMenuItem>
                )}
                {audioOutputDevices.map(device => (
                  <DropdownMenuItem
                    key={device.deviceId}
                    onClick={() => setSelectedAudioOutputDeviceId(device.deviceId)}
                    className={selectedAudioOutputDeviceId === device.deviceId ? 'bg-blue-100' : ''}
                  >
                    {device.label || `Alto-falante ${device.deviceId.slice(0, 8)}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* End Call */}
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