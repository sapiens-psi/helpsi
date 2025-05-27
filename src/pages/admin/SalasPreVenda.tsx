
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMeetingRooms, useCreateMeetingRoom } from '@/hooks/useMeetingRooms';
import { VideoIcon, Plus, Clock, Users, User, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const SalasPreVenda = () => {
  const { data: meetingRooms = [], isLoading } = useMeetingRooms('pre-compra');
  const createMeetingRoom = useCreateMeetingRoom();
  const [showForm, setShowForm] = useState(false);
  const [manualRoom, setManualRoom] = useState({
    name: '',
    description: '',
    scheduled_at: '',
  });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleCreateManualRoom = async () => {
    try {
      const payload: any = {
        ...manualRoom,
        type: 'pre-compra',
        created_manually: true,
      };
      if (!manualRoom.scheduled_at) {
        delete payload.scheduled_at;
      }
      await createMeetingRoom.mutateAsync(payload);
      setShowForm(false);
      setManualRoom({ name: '', description: '', scheduled_at: '' });
    } catch (error) {
      console.error('Erro ao criar sala manual:', error);
    }
  };

  const filteredRooms = meetingRooms.filter((room: any) =>
    room.name?.toLowerCase().includes(search.toLowerCase()) ||
    room.consultations?.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const canAccessRoom = (room: any) => {
    return room.is_active || !room.ended_at;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Salas Pré-venda</h1>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Buscar sala ou cliente..."
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Sala Manual
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Nome da Sala</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                  value={manualRoom.name} 
                  onChange={e => setManualRoom({ ...manualRoom, name: e.target.value })} 
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                  value={manualRoom.description} 
                  onChange={e => setManualRoom({ ...manualRoom, description: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data/Hora</label>
                <input 
                  type="datetime-local" 
                  className="px-3 py-2 border border-gray-300 rounded-md" 
                  value={manualRoom.scheduled_at} 
                  onChange={e => setManualRoom({ ...manualRoom, scheduled_at: e.target.value })} 
                />
              </div>
              <Button onClick={handleCreateManualRoom} disabled={createMeetingRoom.isPending}>
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {isLoading ? (
          <div>Carregando salas...</div>
        ) : filteredRooms.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Nenhuma sala de pré-venda encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filteredRooms.map((room: any) => (
            <Card key={room.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      {room.name || 'Sala Manual'}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {room.scheduled_at ? new Date(room.scheduled_at).toLocaleString() : 'Sem data'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={room.created_manually ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                      {room.created_manually ? 'Manual' : 'Agendada'}
                    </Badge>
                    {room.ended_at && (
                      <Badge className="bg-red-100 text-red-800">
                        Concluída
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Descrição:</h4>
                    <p className="text-gray-600">{room.description || 'Sem descrição'}</p>
                  </div>
                  
                  {room.consultations?.profiles && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Informações do Cliente:
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Nome:</strong> {room.consultations.profiles.full_name}</p>
                        <p><strong>Telefone:</strong> {room.consultations.profiles.phone}</p>
                        <p><strong>CPF/CNPJ:</strong> {room.consultations.profiles.cpf_cnpj}</p>
                        {room.consultations.description && (
                          <p><strong>Descrição:</strong> {room.consultations.description}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="mr-1 h-4 w-4" />
                      {room.scheduled_at ? new Date(room.scheduled_at).toLocaleTimeString() : 'Sem horário'}
                    </div>
                    <div className="space-x-2">
                      {room.consultations?.profiles && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <User className="mr-2 h-4 w-4" />
                              Ver Cliente
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Informações do Cliente</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="font-medium">Nome Completo:</label>
                                <p>{room.consultations.profiles.full_name}</p>
                              </div>
                              <div>
                                <label className="font-medium">Telefone:</label>
                                <p className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  {room.consultations.profiles.phone}
                                </p>
                              </div>
                              <div>
                                <label className="font-medium">CPF/CNPJ:</label>
                                <p>{room.consultations.profiles.cpf_cnpj}</p>
                              </div>
                              {room.consultations.description && (
                                <div>
                                  <label className="font-medium">Descrição da Consulta:</label>
                                  <p className="bg-gray-50 p-3 rounded">{room.consultations.description}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      
                      <Button 
                        onClick={() => navigate(`/conference/${room.id}`)}
                        disabled={!canAccessRoom(room)}
                        variant={canAccessRoom(room) ? "default" : "secondary"}
                      >
                        <VideoIcon className="mr-2 h-4 w-4" />
                        {canAccessRoom(room) ? 'Acessar Sala' : 'Sala Encerrada'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SalasPreVenda;
