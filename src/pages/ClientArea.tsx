import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PulsatingButton } from '@/components/magicui/pulsating-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Mail, Settings, TrendingUp, FileText, Info, Bell, Video } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useClientConsultations } from '@/hooks/useClientConsultations';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { EditProfileModal } from '@/components/EditProfileModal';
import { ClientStats } from '@/components/ClientStats';
import { ConsultationHistory } from '@/components/ConsultationHistory';
import logo from '@/assets/helpsilogo.png';

const ClientArea = () => {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: consultations = [], isLoading: consultationsLoading } = useClientConsultations();
  const location = useLocation();

  const upcomingConsultations = consultations.filter(c => 
    c.status === 'agendada' && new Date(`${c.scheduled_date}T${c.scheduled_time}`) > new Date()
  ).slice(0, 3);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7b2ff2] via-[#f357a8] to-[#0a223a] flex flex-col">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7b2ff2] via-[#f357a8] to-[#0a223a] flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center">
            <img src={logo} alt="Helpsi Logo" className="h-16 w-auto" />
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
                <CardTitle className="flex items-center justify-between text-pink-500">
                  <span className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-pink-500" />
                    Meu Perfil
                  </span>
                  <EditProfileModal>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-pink-500 hover:bg-pink-50"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </EditProfileModal>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome</label>
                  <p className="text-gray-800">{profile?.full_name || user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">E-mail</label>
                  <p className="text-gray-800">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Telefone</label>
                  <p className="text-gray-800">{profile?.phone || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">CPF/CNPJ</label>
                  <p className="text-gray-800">{profile?.cpf_cnpj || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Estado</label>
                  <p className="text-gray-800">{profile?.estado || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Cidade</label>
                  <p className="text-gray-800">{profile?.cidade || 'Não informado'}</p>
                </div>
                {profile?.crp && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">CRP</label>
                    <p className="text-gray-800">{profile.crp}</p>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Membro desde</span>
                    <span>{new Date(user?.created_at || '').toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-pink-100 shadow-lg mt-6 bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center text-pink-500">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/schedule">
                  <PulsatingButton className="w-full bg-pink-500 hover:bg-pink-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    Nova Consulta
                  </PulsatingButton>
                </Link>
                <Button variant="outline" className="w-full border-pink-200 text-pink-500">
                  <FileText className="mr-2 h-4 w-4" />
                  Histórico Completo
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-200 text-gray-600 hover:bg-gray-50"
                  onClick={() => window.open('/help', '_blank')}
                >
                  <Info className="mr-2 h-4 w-4" />
                  Central de Ajuda
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Estatísticas do Cliente */}
            <ClientStats />

            {/* Próximas Consultas */}
            {upcomingConsultations.length > 0 && (
              <Card className="border-pink-100 shadow-lg mb-6 bg-white/90">
                <CardHeader>
                  <CardTitle className="flex items-center text-pink-500">
                    <Bell className="mr-2 h-5 w-5" />
                    Próximas Consultas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingConsultations.map((consultation) => (
                      <div key={consultation.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {consultation.type === 'pre-compra' ? 'Pré-venda' : 'Pós-venda'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              com {consultation.specialist?.full_name || 'Especialista não informado'}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Agendada
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <Calendar className="mr-1 h-4 w-4" />
                          <span className="mr-4">{new Date(consultation.scheduled_date).toLocaleDateString('pt-BR')}</span>
                          <Clock className="mr-1 h-4 w-4" />
                          <span>{consultation.scheduled_time}</span>
                        </div>

                        <div className="flex space-x-2">
                          <Link to={`/video-conference/${consultation.id}`}>
                            <PulsatingButton size="sm" className="bg-green-500 hover:bg-green-600">
                              <Video className="mr-2 h-4 w-4" />
                              Entrar na Sala
                            </PulsatingButton>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Histórico de Consultas */}
            <ConsultationHistory maxItems={5} />
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
