
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Mail } from 'lucide-react';

const ClientArea = () => {
  const [user] = useState({
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    crp: 'CRP 01/12345'
  });

  const [meetings] = useState([
    {
      id: 1,
      date: '2024-05-28',
      time: '14:00',
      type: 'Pós-Compra',
      status: 'Agendada',
      specialist: 'Dra. Maria Santos',
      hasRecording: false
    },
    {
      id: 2,
      date: '2024-05-25',
      time: '10:30',
      type: 'Auxílio Pré-Compra',
      status: 'Concluída',
      specialist: 'Dr. Pedro Oliveira',
      hasRecording: true
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendada':
        return 'bg-blue-100 text-blue-800';
      case 'Concluída':
        return 'bg-green-100 text-green-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            ConsultaPro
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Olá, {user.name}</span>
            <Button variant="outline" className="border-blue-200 text-blue-600">
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800">
                  <User className="mr-2 h-5 w-5 text-blue-600" />
                  Meu Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome</label>
                  <p className="text-gray-800">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">E-mail</label>
                  <p className="text-gray-800">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Telefone</label>
                  <p className="text-gray-800">{user.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">CRP</label>
                  <p className="text-gray-800">{user.crp}</p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-blue-100 shadow-lg mt-6">
              <CardHeader>
                <CardTitle className="text-gray-800">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/schedule">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Calendar className="mr-2 h-4 w-4" />
                    Nova Consulta
                  </Button>
                </Link>
                <Button variant="outline" className="w-full border-blue-200 text-blue-600">
                  <Clock className="mr-2 h-4 w-4" />
                  Histórico Completo
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Meetings List */}
          <div className="lg:col-span-2">
            <Card className="border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800">
                  <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                  Minhas Consultas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{meeting.type}</h3>
                          <p className="text-sm text-gray-600">com {meeting.specialist}</p>
                        </div>
                        <Badge className={getStatusColor(meeting.status)}>
                          {meeting.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span className="mr-4">{new Date(meeting.date).toLocaleDateString('pt-BR')}</span>
                        <Clock className="mr-1 h-4 w-4" />
                        <span>{meeting.time}</span>
                      </div>

                      <div className="flex space-x-2">
                        {meeting.status === 'Agendada' && (
                          <>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Entrar na Sala
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-200 text-red-600">
                              Cancelar
                            </Button>
                          </>
                        )}
                        {meeting.status === 'Concluída' && meeting.hasRecording && (
                          <Button size="sm" variant="outline" className="border-green-200 text-green-600">
                            Download Gravação
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {meetings.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      Nenhuma consulta agendada
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Agende sua primeira consulta com nossos especialistas.
                    </p>
                    <Link to="/schedule">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Agendar Consulta
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientArea;
