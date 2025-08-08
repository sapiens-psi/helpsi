
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConsultations } from '@/hooks/useConsultations';
import { useSpecialists } from '@/hooks/useSpecialists';
import { Users, Calendar, Clock, UserCheck } from 'lucide-react';

const Dashboard = () => {
  const { data: consultations = [] } = useConsultations();
  const { data: specialists = [] } = useSpecialists();

  const stats = {
    totalConsultations: consultations.length,
    scheduledConsultations: consultations.filter(c => c.status === 'agendada').length,
    completedConsultations: consultations.filter(c => c.status === 'concluida').length,
    activeSpecialists: specialists.filter(s => s.is_available).length
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Consultas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConsultations}</div>
            <p className="text-xs text-muted-foreground">Total registrado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledConsultations}</div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedConsultations}</div>
            <p className="text-xs text-muted-foreground">Finalizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Especialistas Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSpecialists}</div>
            <p className="text-xs text-muted-foreground">Disponíveis</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Consultations */}
      <Card>
        <CardHeader>
          <CardTitle>Consultas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {consultations.slice(0, 5).map((consultation) => (
              <div key={consultation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Cliente ID: {consultation.client_id || 'Não informado'}</p>
                  <p className="text-sm text-gray-600">{consultation.type} - {consultation.scheduled_date}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  consultation.status === 'agendada' ? 'bg-yellow-100 text-yellow-800' :
                  consultation.status === 'concluida' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {consultation.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
