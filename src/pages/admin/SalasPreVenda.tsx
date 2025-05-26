
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConsultations } from '@/hooks/useConsultations';
import { useMeetingRoom, useCreateMeetingRoom } from '@/hooks/useMeetingRooms';
import { VideoIcon, Plus, Clock } from 'lucide-react';

const SalasPreVenda = () => {
  const { data: consultations = [] } = useConsultations();
  const createMeetingRoom = useCreateMeetingRoom();

  const preVendaConsultations = consultations.filter(c => c.type === 'pre-compra');

  const handleCreateRoom = async (consultationId: string) => {
    try {
      await createMeetingRoom.mutateAsync({ consultationId });
    } catch (error) {
      console.error('Erro ao criar sala:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Salas Pré-venda</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Criar Sala Manual
        </Button>
      </div>

      <div className="grid gap-6">
        {preVendaConsultations.map((consultation) => (
          <Card key={consultation.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {consultation.client?.full_name || 'Cliente'}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {consultation.scheduled_date} às {consultation.scheduled_time}
                  </p>
                </div>
                <Badge className={
                  consultation.status === 'agendada' ? 'bg-blue-100 text-blue-800' :
                  consultation.status === 'concluida' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }>
                  {consultation.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Descrição:</h4>
                  <p className="text-gray-600">{consultation.description || 'Sem descrição'}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="mr-1 h-4 w-4" />
                    Duração: {consultation.duration_minutes} minutos
                  </div>
                  
                  <div className="space-x-2">
                    {consultation.status === 'agendada' && (
                      <Button
                        onClick={() => handleCreateRoom(consultation.id)}
                        disabled={createMeetingRoom.isPending}
                      >
                        <VideoIcon className="mr-2 h-4 w-4" />
                        Iniciar Sala
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {preVendaConsultations.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Nenhuma consulta de pré-venda encontrada</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SalasPreVenda;
