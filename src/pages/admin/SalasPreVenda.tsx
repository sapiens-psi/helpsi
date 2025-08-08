
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMeetingRooms, useCreateMeetingRoom } from '@/hooks/useMeetingRooms';
import { useUpdateConsultation } from '@/hooks/useConsultations';
import { useClients } from '@/hooks/useClients';
import { useSpecialists } from '@/hooks/useSpecialists';
import { useCreateConsultation } from '@/hooks/useSchedule';
import { VideoIcon, Plus, Clock, Users, RotateCcw, X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const SalasPreVenda = () => {
  const { data: meetingRooms = [], isLoading } = useMeetingRooms('pre-compra');
  const createMeetingRoom = useCreateMeetingRoom();
  const updateConsultation = useUpdateConsultation();
  const { data: clients, isLoading: loadingClients } = useClients();
  const { data: specialists, isLoading: loadingSpecialists } = useSpecialists();
  const { mutateAsync: createConsultation, isPending: isCreating } = useCreateConsultation();
  const [showForm, setShowForm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedSpecialistId, setSelectedSpecialistId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [description, setDescription] = useState('');
  const [situationType, setSituationType] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleRestoreConsultation = async (room: any) => {
    try {
      const consultationId = room.consultations_pre_compra_id;
      if (consultationId) {
        await updateConsultation.mutateAsync({
          id: consultationId,
          type: 'pre-compra',
          status: 'agendada'
        });
      }
    } catch (error) {
      console.error('Erro ao restaurar consulta:', error);
    }
  };

  const handleCancelConsultation = async (room: any) => {
    try {
      const consultationId = room.consultations_pre_compra_id;
      if (consultationId) {
        await updateConsultation.mutateAsync({
          id: consultationId,
          type: 'pre-compra',
          status: 'cancelada'
        });
      }
    } catch (error) {
      console.error('Erro ao cancelar consulta:', error);
    }
  };

  const { toast } = useToast();

  const handleCreateManualConsultation = async () => {
    // Validações
    if (!selectedClientId) {
      toast({
        title: "Erro",
        description: "Selecione um cliente",
        variant: "destructive",
      });
      return;
    }

    if (!scheduledDate) {
      toast({
        title: "Erro",
        description: "Selecione uma data",
        variant: "destructive",
      });
      return;
    }

    if (!scheduledTime) {
      toast({
        title: "Erro",
        description: "Selecione um horário",
        variant: "destructive",
      });
      return;
    }

    if (!situationType.trim()) {
      toast({
        title: "Erro",
        description: "Descreva o tipo de situação",
        variant: "destructive",
      });
      return;
    }

    try {
      const finalDescription = `Tipo de situação: ${situationType}${description ? '\n\nObservações: ' + description : ''}`;
      
      await createConsultation({
        client_id: selectedClientId,
        type: 'pre-compra',
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        description: finalDescription,
        duration_minutes: 30,
        specialist_id: selectedSpecialistId === 'none' ? null : selectedSpecialistId || null
      });

      toast({
        title: "Sucesso",
        description: "Consulta pré-compra criada com sucesso!",
      });
      setShowForm(false);
      setSelectedClientId('');
      setSelectedSpecialistId('');
      setScheduledDate('');
      setScheduledTime('');
      setDescription('');
      setSituationType('');
    } catch (error: any) {
      console.error('Erro ao criar consulta manual:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar consulta",
        variant: "destructive",
      });
    }
  };

  const filteredRooms = meetingRooms.filter((room: any) =>
    room.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Salas Pré-venda</h1>
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
            Criar Consulta Manual
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Criar Nova Consulta Pré-Compra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Cliente *</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingClients ? (
                      <SelectItem value="loading" disabled>Carregando...</SelectItem>
                    ) : (
                      clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {client.full_name} - {client.phone}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="specialist">Especialista (opcional)</Label>
                <Select value={selectedSpecialistId} onValueChange={setSelectedSpecialistId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um especialista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum especialista</SelectItem>
                    {loadingSpecialists ? (
                      <SelectItem value="loading" disabled>Carregando...</SelectItem>
                    ) : (
                      specialists?.map((specialist) => (
                        <SelectItem key={specialist.id} value={specialist.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {specialist.profiles?.full_name} - CRP: {specialist.profiles?.crp}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduledDate">Data *</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <Label htmlFor="scheduledTime">Horário *</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="situationType">Tipo de Situação *</Label>
              <Textarea
                id="situationType"
                value={situationType}
                onChange={(e) => setSituationType(e.target.value)}
                placeholder="Descreva para qual tipo de situação o cliente está buscando material psicológico (ex: ansiedade, depressão, terapia de casal, etc.)"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Observações Adicionais</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Observações adicionais sobre a consulta (opcional)"
                rows={2}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateManualConsultation}
                disabled={isCreating}
              >
                {isCreating ? 'Criando...' : 'Criar Consulta'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  setSelectedClientId('');
                  setSelectedSpecialistId('');
                  setScheduledDate('');
                  setScheduledTime('');
                  setDescription('');
                  setSituationType('');
                }}
              >
                Cancelar
              </Button>
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
                    <Badge className={
                      room.status === 'agendada' ? 'bg-blue-100 text-blue-800' :
                      room.status === 'cancelada' ? 'bg-red-100 text-red-800' :
                      room.status === 'concluida' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {room.status || 'Agendada'}
                    </Badge>
                    {room.created_manually && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Manual
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="mr-1 h-4 w-4" />
                      {room.scheduled_at ? new Date(room.scheduled_at).toLocaleTimeString() : 'Sem horário'}
                    </div>
                    <div className="space-x-2">
                      <Button 
                        onClick={() => navigate(`/conference/${room.id}`)}
                        disabled={!room.is_active || room.status === 'cancelada'}
                        className={(!room.is_active || room.status === 'cancelada') ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : ''}
                      >
                        <VideoIcon className="mr-2 h-4 w-4" />
                        Acessar Sala
                      </Button>
                      {room.status === 'cancelada' ? (
                        <Button 
                          onClick={() => handleRestoreConsultation(room)}
                          disabled={updateConsultation.isPending}
                          variant="outline"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Restaurar Consulta
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleCancelConsultation(room)}
                          disabled={updateConsultation.isPending}
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancelar Consulta
                        </Button>
                      )}
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
