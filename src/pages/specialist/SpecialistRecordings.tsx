import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Video, Play, Calendar, Clock, User } from 'lucide-react';
import { useSpecialistRecordings } from '@/hooks/useSpecialistRecordings';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SpecialistRecordings = () => {
  const [dateFilter, setDateFilter] = useState('');
  const { data: recordings = [], isLoading } = useSpecialistRecordings();

  const filteredRecordings = recordings.filter(recording => {
    if (!dateFilter) return true;
    return recording.consultation_date === dateFilter;
  });

  const handlePlayRecording = (url: string) => {
    window.open(url, '_blank');
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
        <h1 className="text-2xl font-bold mb-2">Minhas Gravações</h1>
        <p className="text-muted-foreground">
          Acesse suas gravações de atendimentos anteriores
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
        {filteredRecordings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {dateFilter
                  ? 'Nenhuma gravação encontrada para esta data.'
                  : 'Você ainda não possui gravações.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRecordings.map((recording) => (
            <Card key={recording.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Atendimento - {format(new Date(recording.consultation_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </CardTitle>
                  <Badge className={getTypeColor(recording.consultation_type)}>
                    {recording.consultation_type === 'pre-compra' ? 'Pré-venda' : 'Pós-venda'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(recording.consultation_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {recording.consultation_time} ({recording.duration} min)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Cliente: {recording.client_name || 'Não informado'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <Button
                      onClick={() => handlePlayRecording(recording.recording_url)}
                      disabled={!recording.recording_url}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Reproduzir
                    </Button>
                  </div>
                </div>
                {recording.expires_at && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      Expira em: {format(new Date(recording.expires_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SpecialistRecordings;