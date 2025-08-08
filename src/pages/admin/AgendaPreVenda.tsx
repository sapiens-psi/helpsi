
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConsultations } from '@/hooks/useConsultations';
import { useSpecialists } from '@/hooks/useSpecialists';
import { useAssignSpecialist } from '@/hooks/useAssignSpecialist';
import { Calendar, Clock, Phone, User, Video, Filter, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AgendaPreVenda = () => {
  const { data: consultations = [] } = useConsultations();
  const { data: specialists = [] } = useSpecialists();
  const assignSpecialist = useAssignSpecialist();
  const navigate = useNavigate();
  
  // Debug logs
  console.log('Total specialists loaded:', specialists.length);
  console.log('Specialists data:', specialists);
  const validSpecialists = specialists.filter(s => s.profiles?.id);
  console.log('Valid specialists (with profile_id):', validSpecialists.length);
  console.log('Valid specialists data:', validSpecialists);
  
  // Estados para filtros
  const [dateFilter, setDateFilter] = useState('');
  const [specialistFilter, setSpecialistFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const preVendaConsultations = consultations.filter(c => c.type === 'pre-compra');
  
  // Aplicar filtros
  const filteredConsultations = preVendaConsultations.filter(consultation => {
    const matchesDate = !dateFilter || consultation.scheduled_date === dateFilter;
    const matchesSpecialist = specialistFilter === 'all' || consultation.specialist_id === specialistFilter;
    const matchesTime = !timeFilter || consultation.scheduled_time.includes(timeFilter);
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
    
    return matchesDate && matchesSpecialist && matchesTime && matchesStatus;
  });
  
  const agendadas = filteredConsultations.filter(c => c.status === 'agendada');
  const concluidas = filteredConsultations.filter(c => c.status === 'concluida');
  
  // Função para atribuir especialista
  const handleAssignSpecialist = async (consultationId: string, specialistId: string) => {
    console.log('handleAssignSpecialist called with:', { consultationId, specialistId });
    
    try {
      console.log('Calling assignSpecialist.mutateAsync...');
      const result = await assignSpecialist.mutateAsync({
        consultationId,
        specialistId,
        type: 'pre-compra'
      });
      console.log('Assignment result:', result);
      toast.success('Especialista atribuído com sucesso!');
    } catch (error) {
      console.error('Error assigning specialist:', error);
      toast.error('Erro ao atribuir especialista');
    }
  };

  const ConsultationCard = ({ consultation }: { consultation: any }) => {
    const assignedSpecialist = specialists.find(s => s.profiles?.id === consultation.specialist_id);
    
    return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg flex items-center">
              <User className="mr-2 h-4 w-4" />
              Cliente ID: {consultation.client_id || 'Não informado'}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Calendar className="mr-1 h-4 w-4" />
              {consultation.scheduled_date} às {consultation.scheduled_time}
            </div>
          </div>
          <Badge className={
            consultation.status === 'agendada' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }>
            {consultation.status}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div>
            <span className="font-medium">Interesse em:</span>
            <p className="text-gray-600">{consultation.description || 'Não especificado'}</p>
          </div>
          
          {assignedSpecialist && (
            <div className="p-2 bg-green-50 rounded-lg">
              <div className="flex items-center text-sm text-green-700">
                <User className="mr-2 h-4 w-4" />
                <span className="font-medium">Especialista:</span>
                <span className="ml-2">{assignedSpecialist.profiles?.full_name || 'Nome não disponível'}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="mr-1 h-4 w-4" />
              Telefone não disponível
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="mr-1 h-4 w-4" />
              {consultation.duration_minutes} min
            </div>
          </div>
          
          {consultation.meeting_room_id && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center text-sm text-blue-700">
                <Video className="mr-2 h-4 w-4" />
                <span className="font-medium">Sala de Conferência:</span>
                <span className="ml-2">Sala {consultation.meeting_room_id}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button variant="outline" size="sm">
            Ver Detalhes
          </Button>
          
          {!consultation.specialist_id && (
            <Select onValueChange={(value) => {
              console.log('Selected specialist ID:', value);
              console.log('Consultation ID:', consultation.id);
              if (value && value !== 'undefined') {
                handleAssignSpecialist(consultation.id, value);
              } else {
                console.error('Invalid specialist ID selected:', value);
                toast.error('Erro: ID do especialista inválido');
              }
            }}>
              <SelectTrigger className="w-[200px] h-8">
                <UserPlus className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Atribuir Especialista" />
              </SelectTrigger>
              <SelectContent>
                {specialists
                  .filter((specialist) => specialist.profiles?.id) // Filtrar apenas especialistas com profile_id válido
                  .map((specialist) => {
                    const profileId = specialist.profiles?.id;
                    console.log('Specialist:', specialist.profiles?.full_name, 'Profile ID:', profileId);
                    return (
                      <SelectItem 
                        key={specialist.id} 
                        value={profileId}
                      >
                        {specialist.profiles?.full_name || 'Nome não disponível'}
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          )}
          
          {consultation.specialist_id && (
            <Select onValueChange={(value) => {
              if (value && value !== 'undefined') {
                handleAssignSpecialist(consultation.id, value);
              } else {
                toast.error('Erro: ID do especialista inválido');
              }
            }}>
              <SelectTrigger className="w-[200px] h-8">
                <User className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Trocar Especialista" />
              </SelectTrigger>
              <SelectContent>
                {specialists
                  .filter((specialist) => specialist.profiles?.id && specialist.profiles?.id !== consultation.specialist_id)
                  .map((specialist) => {
                    const profileId = specialist.profiles?.id;
                    return (
                      <SelectItem 
                        key={specialist.id} 
                        value={profileId}
                      >
                        {specialist.profiles?.full_name || 'Nome não disponível'}
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          )}
          
          {consultation.status === 'agendada' && consultation.meeting_room_id && (
            <Button 
              size="sm" 
              onClick={() => navigate(`/conference/${consultation.meeting_room_id}`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Video className="mr-2 h-4 w-4" />
              Acessar Sala
            </Button>
          )}
          {consultation.status === 'agendada' && !consultation.meeting_room_id && (
            <Button size="sm" disabled>
              Sala não disponível
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Agenda Pré-venda</h1>
      
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Data</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filtrar por data"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Especialista</label>
              <Select value={specialistFilter} onValueChange={setSpecialistFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os especialistas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os especialistas</SelectItem>
                  {specialists.map((specialist) => (
                    <SelectItem key={specialist.id} value={specialist.id}>
                      {specialist.profiles?.full_name || 'Nome não disponível'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Horário</label>
              <Input
                type="time"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                placeholder="Filtrar por horário"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(dateFilter || specialistFilter !== 'all' || timeFilter || statusFilter !== 'all') && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setDateFilter('');
                  setSpecialistFilter('all');
                  setTimeFilter('');
                  setStatusFilter('all');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="agendadas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="agendadas">
            Agendadas ({agendadas.length})
          </TabsTrigger>
          <TabsTrigger value="concluidas">
            Concluídas ({concluidas.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="agendadas" className="space-y-4">
          {agendadas.length > 0 ? (
            agendadas.map((consultation) => (
              <ConsultationCard key={consultation.id} consultation={consultation} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Nenhuma consulta agendada</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="concluidas" className="space-y-4">
          {concluidas.length > 0 ? (
            concluidas.map((consultation) => (
              <ConsultationCard key={consultation.id} consultation={consultation} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Nenhuma consulta concluída</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgendaPreVenda;
