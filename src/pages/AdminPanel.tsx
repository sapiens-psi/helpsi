import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Clock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [specialists] = useState([
    {
      id: 1,
      name: 'Dra. Maria Santos',
      crp: 'CRP 01/12345',
      email: 'maria@consultapro.com',
      phone: '(11) 99999-1111',
      available: true
    },
    {
      id: 2,
      name: 'Dr. Pedro Oliveira',
      crp: 'CRP 01/67890',
      email: 'pedro@consultapro.com',
      phone: '(11) 99999-2222',
      available: false
    }
  ]);

  const [meetings] = useState([
    {
      id: 1,
      client: 'João Silva',
      specialist: 'Dra. Maria Santos',
      date: '2024-05-28',
      time: '14:00',
      type: 'Pós-Compra',
      status: 'Agendada'
    },
    {
      id: 2,
      client: 'Ana Costa',
      specialist: 'Dr. Pedro Oliveira',
      date: '2024-05-25',
      time: '10:30',
      type: 'Auxílio Pré-Compra',
      status: 'Concluída'
    }
  ]);

  const [stats] = useState({
    totalMeetings: 45,
    completedMeetings: 38,
    scheduledMeetings: 7,
    activeSpecialists: 5
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Painel Administrativo</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Reuniões</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalMeetings}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Concluídas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedMeetings}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Agendadas</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.scheduledMeetings}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Especialistas Ativos</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.activeSpecialists}</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Specialists Management */}
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-gray-800">
                <span className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-blue-600" />
                  Especialistas
                </span>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {specialists.map((specialist) => (
                  <div key={specialist.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{specialist.name}</h3>
                        <p className="text-sm text-gray-600">{specialist.crp}</p>
                      </div>
                      <Badge className={specialist.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {specialist.available ? 'Disponível' : 'Indisponível'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <Mail className="mr-1 h-3 w-3" />
                        {specialist.email}
                      </div>
                      <p>{specialist.phone}</p>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button size="sm" variant="outline" className="text-blue-600 border-blue-200">
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" className="text-gray-600 border-gray-200">
                        Horários
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Meetings Management */}
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                Reuniões Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{meeting.client}</h3>
                        <p className="text-sm text-gray-600">com {meeting.specialist}</p>
                      </div>
                      <Badge className={
                        meeting.status === 'Agendada' ? 'bg-blue-100 text-blue-800' : 
                        meeting.status === 'Concluída' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }>
                        {meeting.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{meeting.type}</span> - {new Date(meeting.date).toLocaleDateString('pt-BR')} às {meeting.time}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="text-blue-600 border-blue-200">
                        Detalhes
                      </Button>
                      {meeting.status === 'Agendada' && (
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
