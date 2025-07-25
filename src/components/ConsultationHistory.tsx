import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientConsultations, useCancelConsultation } from '@/hooks/useClientConsultations';
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  Download, 
  Search, 
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface ConsultationHistoryProps {
  showAll?: boolean;
  maxItems?: number;
}

export const ConsultationHistory = ({ showAll = false, maxItems = 5 }: ConsultationHistoryProps) => {
  const { data: consultations = [], isLoading } = useClientConsultations();
  const cancelConsultation = useCancelConsultation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'agendada': { 
        label: 'Agendada', 
        variant: 'default' as const, 
        icon: Clock,
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      'concluida': { 
        label: 'Concluída', 
        variant: 'default' as const, 
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      'cancelada': { 
        label: 'Cancelada', 
        variant: 'destructive' as const, 
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200'
      },
      'reagendada': { 
        label: 'Reagendada', 
        variant: 'default' as const, 
        icon: RotateCcw,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      'em_andamento': { 
        label: 'Em Andamento', 
        variant: 'default' as const, 
        icon: AlertCircle,
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.agendada;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return type === 'pre-compra' ? (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        Pré-venda
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Pós-venda
      </Badge>
    );
  };

  const canCancelConsultation = (consultation: any) => {
    if (consultation.status !== 'agendada') return false;
    
    const consultationDate = new Date(`${consultation.scheduled_date}T${consultation.scheduled_time}`);
    const now = new Date();
    const hoursDifference = (consultationDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursDifference > 24; // Pode cancelar se faltam mais de 24 horas
  };

  const handleCancelConsultation = async (consultationId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar esta consulta?')) {
      try {
        await cancelConsultation.mutateAsync(consultationId);
      } catch (error) {
        console.error('Erro ao cancelar consulta:', error);
      }
    }
  };

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = !searchTerm || 
      consultation.specialist?.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.specialist?.specialties?.join(', ')?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
    const matchesType = typeFilter === 'all' || consultation.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const displayedConsultations = showAll ? filteredConsultations : filteredConsultations.slice(0, maxItems);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando consultas...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-pink-500" />
            {showAll ? 'Histórico Completo' : 'Minhas Consultas'}
          </span>
          {!showAll && filteredConsultations.length > maxItems && (
            <Link to="/client/history">
              <Button variant="outline" size="sm">
                Ver Todas ({filteredConsultations.length})
              </Button>
            </Link>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showAll && (
          <div className="mb-6 space-y-4">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por especialista ou especialização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                  <SelectItem value="reagendada">Reagendada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="pre-compra">Pré-venda</SelectItem>
                  <SelectItem value="pos-compra">Pós-venda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Limpar filtros */}
            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </div>
        )}

        {displayedConsultations.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Nenhuma consulta encontrada com os filtros aplicados.'
                : 'Você ainda não possui consultas agendadas.'}
            </p>
            <Link to="/schedule">
              <Button className="bg-pink-500 hover:bg-pink-600">
                Agendar Primeira Consulta
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedConsultations.map((consultation) => (
              <Card key={consultation.id} className="border-l-4 border-l-pink-500 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getTypeBadge(consultation.type)}
                        {getStatusBadge(consultation.status)}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span className="font-medium">
                          {consultation.specialist?.profiles?.full_name || 'Especialista não informado'}
                        </span>
                        {consultation.specialist?.specialties && (
                          <span className="ml-2 text-gray-500">
                            • {consultation.specialist.specialties.join(', ')}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {format(parseISO(consultation.scheduled_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                        <Clock className="h-4 w-4 ml-4 mr-2" />
                        <span>{consultation.scheduled_time}</span>
                        {consultation.duration_minutes && (
                          <span className="ml-2 text-gray-500">
                            ({consultation.duration_minutes} min)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      {consultation.status === 'agendada' && (() => {
                        const consultationDateTime = new Date(`${consultation.scheduled_date}T${consultation.scheduled_time}`);
                        const now = new Date();
                        const fiveMinutesBefore = new Date(consultationDateTime.getTime() - 5 * 60 * 1000);
                        const isRoomAvailable = now >= fiveMinutesBefore;
                        
                        return isRoomAvailable ? (
                          <Link to={`/video-conference/${consultation.id}`}>
                            <Button size="sm" className="bg-green-500 hover:bg-green-600 w-full sm:w-auto">
                              <Video className="h-4 w-4 mr-2" />
                              Entrar na Sala
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" disabled className="bg-gray-400 w-full sm:w-auto" title={`Sala disponível 5 minutos antes do horário agendado`}>
                            <Clock className="h-4 w-4 mr-2" />
                            Sala Indisponível
                          </Button>
                        );
                      })()}
                      
                      {consultation.recording_url && consultation.status === 'concluida' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(consultation.recording_url, '_blank')}
                          className="w-full sm:w-auto"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Gravação
                        </Button>
                      )}
                      
                      {canCancelConsultation(consultation) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelConsultation(consultation.id)}
                          disabled={cancelConsultation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};