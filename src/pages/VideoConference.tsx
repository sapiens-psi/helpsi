
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User, Calendar, Clock } from 'lucide-react';

const VideoConference = () => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Sistema', message: 'Bem-vindo à sala de conferência!', time: '14:00' },
    { id: 2, sender: 'Dra. Maria Santos', message: 'Olá! Como posso ajudá-lo hoje?', time: '14:01' }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [meetingInfo] = useState({
    client: 'João Silva',
    specialist: 'Dra. Maria Santos',
    type: 'Pós-Compra',
    duration: '15 minutos',
    startTime: '14:00'
  });

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

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    console.log('Video toggled:', !isVideoOn);
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    console.log('Audio toggled:', !isAudioOn);
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    console.log('Screen sharing toggled:', !isScreenSharing);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    console.log('Recording toggled:', !isRecording);
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
    console.log('Call ended');
    // Implementar lógica para encerrar chamada
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
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
              <Button
                onClick={toggleAudio}
                variant={isAudioOn ? "default" : "destructive"}
                size="lg"
                className="rounded-full w-12 h-12 p-0"
              >
                🎤
              </Button>
              
              <Button
                onClick={toggleVideo}
                variant={isVideoOn ? "default" : "destructive"}
                size="lg"
                className="rounded-full w-12 h-12 p-0"
              >
                📹
              </Button>
              
              <Button
                onClick={toggleScreenShare}
                variant={isScreenSharing ? "secondary" : "outline"}
                size="lg"
                className="rounded-full w-12 h-12 p-0"
              >
                📺
              </Button>
              
              <Button
                onClick={toggleRecording}
                variant={isRecording ? "destructive" : "outline"}
                size="lg"
                className="rounded-full w-12 h-12 p-0"
              >
                ⏺️
              </Button>
              
              <Button
                onClick={endCall}
                variant="destructive"
                size="lg"
                className="rounded-full w-12 h-12 p-0"
              >
                📞
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
