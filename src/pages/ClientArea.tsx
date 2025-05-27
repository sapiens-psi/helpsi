import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PulsatingButton } from '@/components/magicui/pulsating-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

const ClientArea = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const location = useLocation();

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
    <div className="min-h-screen bg-gradient-to-br from-[#7b2ff2] via-[#f357a8] to-[#0a223a] flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" fill="#fff" fillOpacity="0.3" />
              <polygon points="16,6 26,12 26,20 16,26 6,20 6,12" fill="#fff" fillOpacity="0.7" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-xl">COMPANY</div>
            <div className="text-pink-200 text-xs">Slogan line</div>
          </div>
        </div>
        <div className="flex-1 flex justify-center gap-8 items-center text-white font-medium">
          <Link to="/" className={`hover:text-pink-300 transition ${location.pathname === '/' ? 'lamp-effect' : ''}`}>Home</Link>
          <Link to="/about" className={`hover:text-pink-300 transition ${location.pathname === '/about' ? 'lamp-effect' : ''}`}>Sobre</Link>
          <Link to="/contact" className={`hover:text-pink-300 transition ${location.pathname === '/contact' ? 'lamp-effect' : ''}`}>Contato</Link>
          {user && (
            <>
              <Link to="/schedule" className={`hover:text-pink-300 transition ${location.pathname === '/schedule' ? 'lamp-effect' : ''}`}>Agendar</Link>
              <Link to="/client-area" className={`hover:text-pink-300 transition ${location.pathname === '/client-area' ? 'lamp-effect' : ''}`}>Área do Cliente</Link>
            </>
          )}
        </div>
        <div className="flex gap-4 items-center">
          {!user ? (
            <>
              <Link to="/auth">
                <Button variant="outline" className="border-pink-200 text-pink-400 hover:bg-pink-50 ml-2">Login</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-pink-400 hover:bg-pink-500 ml-2">Cadastrar</Button>
              </Link>
            </>
          ) :
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <PulsatingButton
                  pulseColor="#f472b6"
                  className="bg-white/80 text-pink-500 font-bold hover:bg-white"
                >
                  {profile?.full_name || 'Perfil'}
                </PulsatingButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {profile?.role === 'admin' ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Painel Administrativo</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>Sair</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/client-area">Área do Cliente</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>Sair</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          }
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="border-pink-100 shadow-lg bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center text-pink-500">
                  <User className="mr-2 h-5 w-5 text-pink-500" />
                  Meu Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome</label>
                  <p className="text-gray-800">{profile?.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">E-mail</label>
                  <p className="text-gray-800">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Telefone</label>
                  <p className="text-gray-800">{profile?.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">CRP</label>
                  <p className="text-gray-800">{profile?.crp}</p>
                </div>
                <Button className="w-full bg-pink-500 hover:bg-pink-600">
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-pink-100 shadow-lg mt-6 bg-white/90">
              <CardHeader>
                <CardTitle className="text-pink-500">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/schedule">
                  <Button className="w-full bg-pink-500 hover:bg-pink-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    Nova Consulta
                  </Button>
                </Link>
                <Button variant="outline" className="w-full border-pink-200 text-pink-500">
                  <Clock className="mr-2 h-4 w-4" />
                  Histórico Completo
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Meetings List */}
          <div className="lg:col-span-2">
            <Card className="border-pink-100 shadow-lg bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center text-pink-500">
                  <Calendar className="mr-2 h-5 w-5 text-pink-500" />
                  Minhas Consultas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="border border-gray-200 rounded-lg p-4 hover:bg-pink-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{meeting.type}</h3>
                          <p className="text-sm text-gray-600">com {meeting.specialist}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(meeting.status)}`}>
                          {meeting.status}
                        </span>
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
                            <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                              Entrar na Sala
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-200 text-red-600">
                              Cancelar
                            </Button>
                          </>
                        )}
                        {meeting.status === 'Concluída' && meeting.hasRecording && (
                          <Button size="sm" variant="outline" className="border-purple-200 text-purple-600">
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
                      <Button className="bg-pink-500 hover:bg-pink-600">
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

      {/* Nuvens rodapé */}
      <div className="w-full h-32 relative">
        <svg className="absolute bottom-0 left-0 w-full" height="100" viewBox="0 0 1440 100" fill="none">
          <path
            d="M0 40C360 80 1080 0 1440 40V100H0V40Z"
            fill="#fff"
            fillOpacity="0.7"
          />
        </svg>
      </div>
    </div>
  );
};

export default ClientArea;
