import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VideoIcon, CalendarIcon, ClockIcon, UserIcon, XIcon, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSpecialistConsultations } from '@/hooks/useSpecialistConsultations';
import { useCancelConsultation } from '@/hooks/useCancelConsultation';
import { useUpdateConsultation } from '@/hooks/useConsultations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const SpecialistAgenda = () => {
  const [dateFilter, setDateFilter] = useState('');
  const { data: consultations = [], isLoading } = useSpecialistConsultations();
  const cancelConsultation = useCancelConsultation();
  const updateConsultation = useUpdateConsultation();
  const navigate = useNavigate();

  const handleCancelConsultation = async (consultationId: string, type: string) => {
    try {
      await cancelConsultation.mutateAsync({ consultationId, type });
      toast.success('Consulta cancelada com sucesso!');
    } catch (error) {
      toast.error('Erro ao cancelar consulta');
    }
  };

  const handleRestoreConsultation = async (consultationId: string, type: string) => {
    try {
      await updateConsultation.mutateAsync({
        id: consultationId,
        type: type,
        status: 'agendada'
      });
      toast.success('Consulta restaurada com sucesso!');
    } catch (error) {
      toast.error('Erro ao restaurar consulta');
    }
  };

  const filteredConsultations = consultations.filter(consultation => {
    if (!dateFilter) return true;
    return consultation.scheduled_date === dateFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-yellow-100 text-yellow-800';
      case 'concluida':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pre-compra':
        return 'bg-blue-100 text-blue-800';
      case 'pos-compra':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Minha Agenda</h1>
        <p className="text-muted-foreground">
          Gerencie seus atendimentos e acesse as salas de conferência
        </p>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 items-center">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="Filtrar por data"
            className="max-w-xs"
          />
          <Button
            variant="outline"
            onClick={() => setDateFilter('')}
          >
            Limpar Filtro
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredConsultations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {dateFilter
                  ? 'Nenhum atendimento encontrado para esta data.'
                  : 'Você não tem atendimentos agendados.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredConsultations.map((consultation) => (
            <Card key={consultation.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {format(new Date(consultation.scheduled_date + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(consultation.status)}>
                      {consultation.status}
                    </Badge>
                    <Badge className={getTypeColor(consultation.type)}>
                      {consultation.type === 'pre-compra' ? 'Pré-venda' : 'Pós-venda'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {consultation.scheduled_time} ({consultation.duration_minutes} min)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Cliente: {consultation.client_name || 'Não informado'}
                      </span>
                    </div>
                    {consultation.description && (
                      <div className="text-sm text-muted-foreground">
                        {consultation.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {consultation.meeting_room_id && consultation.status === 'agendada' && (
                      <Button
                        onClick={() => navigate(`/conference/${consultation.meeting_room_id}`)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <VideoIcon className="mr-2 h-4 w-4" />
                        Acessar Sala
                      </Button>
                    )}
                    {consultation.status === 'agendada' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelConsultation(consultation.id, consultation.type)}
                        disabled={cancelConsultation.isPending}
                      >
                        <XIcon className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    )}
                    {consultation.status === 'cancelada' && (
                      <Button
                        onClick={() => handleRestoreConsultation(consultation.id, consultation.type)}
                        disabled={updateConsultation.isPending}
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restaurar Consulta
                      </Button>
                    )}
                    {!consultation.meeting_room_id && consultation.status === 'agendada' && (
                      <Button size="sm" disabled>
                        Sala não disponível
                      </Button>
                    )}
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

export default SpecialistAgenda;