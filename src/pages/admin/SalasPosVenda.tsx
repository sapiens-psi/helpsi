import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMeetingRooms, useCreateMeetingRoom } from '@/hooks/useMeetingRooms';
import { VideoIcon, Plus, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SalasPosVenda = () => {
  const { data: meetingRooms = [], isLoading } = useMeetingRooms('pos-compra');
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
        type: 'pos-compra',
        created_manually: true,
        room_token: 'manual-' + Date.now(),
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
    room.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Salas Pós-venda</h1>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Buscar sala..."
            className="input"
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
                <input type="text" className="input" value={manualRoom.name} onChange={e => setManualRoom({ ...manualRoom, name: e.target.value })} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <input type="text" className="input" value={manualRoom.description} onChange={e => setManualRoom({ ...manualRoom, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data/Hora</label>
                <input type="datetime-local" className="input" value={manualRoom.scheduled_at} onChange={e => setManualRoom({ ...manualRoom, scheduled_at: e.target.value })} />
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
              <p className="text-gray-500">Nenhuma sala de pós-venda encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filteredRooms.map((room: any) => (
            <Card key={room.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      {room.name || 'Sala Manual'}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {room.scheduled_at ? new Date(room.scheduled_at).toLocaleString() : 'Sem data'}
                    </p>
                  </div>
                  <Badge className={room.created_manually ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}>
                    {room.created_manually ? 'Manual' : 'Agendada'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Descrição:</h4>
                    <p className="text-gray-600">{room.description || 'Sem descrição'}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="mr-1 h-4 w-4" />
                      {room.scheduled_at ? new Date(room.scheduled_at).toLocaleTimeString() : 'Sem horário'}
                    </div>
                    <div className="space-x-2">
                      <Button onClick={() => navigate(`/conference/${room.id}`)}>
                        <VideoIcon className="mr-2 h-4 w-4" />
                        Acessar Sala
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

export default SalasPosVenda;
