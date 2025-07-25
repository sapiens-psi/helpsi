import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ConsultationHistory } from '@/components/ConsultationHistory';
import { ClientStats } from '@/components/ClientStats';
import { 
  ArrowLeft,
  ChevronDown,
  Home,
  Info,
  Phone,
  UserPlus,
  LogOut,
  Shield,
  Calendar,
  TrendingUp
} from 'lucide-react';
import logo from '@/assets/helpsilogo.png';

const ClientHistory = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7b2ff2] via-[#f357a8] to-[#0a223a] flex flex-col">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-pink-100 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <img src={logo} alt="Helpsi" className="h-8 w-auto" />
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-gray-600 hover:text-pink-500 transition-colors flex items-center">
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </Link>
                <Link to="/about" className="text-gray-600 hover:text-pink-500 transition-colors flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  Sobre
                </Link>
                <Link to="/contact" className="text-gray-600 hover:text-pink-500 transition-colors flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  Contato
                </Link>
                <Link to="/schedule" className="text-gray-600 hover:text-pink-500 transition-colors flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Agendar
                </Link>
                <Link to="/client-area" className="text-pink-500 font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Área do Cliente
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-gray-700 hover:text-pink-500">
                      <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden md:block">{user.email}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/client-area" className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Área do Cliente
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Painel Admin
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut} className="flex items-center text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/auth">
                    <Button variant="ghost" className="text-gray-600 hover:text-pink-500">
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Cadastrar
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/client-area" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Área do Cliente
              </Link>
              <h1 className="text-3xl font-bold text-white mb-2">
                Histórico Completo de Consultas
              </h1>
              <p className="text-white/80">
                Visualize todas as suas consultas, filtre por status e tipo, e gerencie seus agendamentos.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <ClientStats />
        </div>

        {/* Full History */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl">
          <ConsultationHistory showAll={true} />
        </div>
      </div>

      {/* Decorative SVG */}
      <div className="fixed bottom-0 left-0 w-full pointer-events-none">
        <svg viewBox="0 0 1440 320" className="w-full h-auto">
          <path 
            fill="url(#gradient)" 
            fillOpacity="0.1" 
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,106.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          >
          </path>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default ClientHistory;