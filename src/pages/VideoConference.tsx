import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User, Calendar, Clock, MessageCircle, Video, Mic, PhoneOff, Monitor, CircleDot, Volume2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import './VideoConference.css';

const VideoConference = () => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<any[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Sistema', message: 'Bem-vindo à sala de conferência!', time: '14:00' },
    { id: 2, sender: 'Dra. Maria Santos', message: 'Olá! Como posso ajudá-lo hoje?', time: '14:01' }
  ]);

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
    setIsVideoOn(!isVideoOn);
    console.log('Video toggled:', !isVideoOn);
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    console.log('Audio toggled:', !isAudioOn);
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
          screenVideoRef.current.play?.();
        }
        setIsScreenSharing(true);
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          setIsScreenSharing(false);
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = null;
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

  const sendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        sender: 'Você',
        message: chatMessage,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage('');
    }
  };

  const endCall = () => {
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
    alert('Chamada encerrada!');
    // Aqui você pode redirecionar ou atualizar o status da sala no backend
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

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Elementos ocultos para gravação composta */}
      <video ref={remoteVideoRef} style={{ display: 'none' }} />
      <video ref={screenVideoRef} style={{ display: 'none' }} />
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

      <div className="flex-1 flex">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              {isVideoOn ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Botão de tela cheia */}
                  <button
                    className="absolute top-2 right-2 bg-black/60 text-white rounded p-1 hover:bg-black/80"
                    onClick={() => handleFullscreen(videoRef)}
                    title="Tela cheia"
                  >
                    ⛶
                  </button>
                  {/* Aviso de compartilhamento */}
                  {isScreenSharing && (
                    <div className="absolute bottom-2 left-2 bg-yellow-600/80 text-white px-3 py-1 rounded flex items-center gap-2">
                      <span>Você está compartilhando a tela</span>
                      <Button size="sm" variant="destructive" onClick={toggleScreenShare}>Parar</Button>
                    </div>
                  )}
                </>
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
              </div>
            </div>

            {/* Remote Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <div className="text-center text-white">
                  <User className="mx-auto h-16 w-16 mb-2" />
                  <p>{meetingInfo.specialist}</p>
                  <p className="text-sm text-gray-300">Conectando...</p>
                </div>
              </div>
              {/* Botão de tela cheia para o vídeo remoto (simulado) */}
              <button
                className="absolute top-2 right-2 bg-black/60 text-white rounded p-1 hover:bg-black/80"
                onClick={() => handleFullscreen(videoRef)}
                title="Tela cheia"
              >
                ⛶
              </button>
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {meetingInfo.specialist}
              </div>
            </div>
          </div>

          {/* Screen Sharing Area */}
          {isScreenSharing && (
            <div className="h-64 bg-gray-800 rounded-lg m-4 flex items-center justify-center">
              <div className="text-center text-white">
                <Calendar className="mx-auto h-12 w-12 mb-2" />
                <p>Compartilhamento de tela ativo</p>
                <p className="text-sm text-gray-300">Conteúdo sendo compartilhado...</p>
              </div>
            </div>
          )}

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
                onClick={toggleScreenShare}
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
    </div>
  );
};

export default VideoConference;
