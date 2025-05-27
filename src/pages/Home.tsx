import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PulsatingButton } from '@/components/magicui/pulsating-button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, User, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

const Home = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7b2ff2] via-[#f357a8] to-[#0a223a] flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            {/* Logo hexágono */}
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
        {/* Centralizar links principais */}
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
        {/* Botão de perfil/menu à direita */}
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
                  className="border-pink-200 text-pink-400 flex items-center gap-2 ml-2 font-semibold bg-white/80 hover:bg-white"
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
                      <Link to="/client-area">Minha Conta</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/meus-agendamentos">Meus Agendamentos</Link>
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

      {/* Hero Section */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-between px-10 md:px-24 py-10">
        {/* Texto */}
        <div className="max-w-xl">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
            <span className="italic">Boost <span className="text-pink-300 font-bold not-italic">x2</span></span>
            <br />
            Your Business
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Phasellus non mauris massa. Curabitur eget mauris ac dui mattis ornare.
            Integer fringilla leo at nunc venenatis semper.
          </p>
          <a
            href="#"
            className="inline-block bg-pink-400 hover:bg-pink-500 text-white font-bold px-8 py-3 rounded-full shadow-lg transition"
          >
            Get started now
          </a>
        </div>
      </div>

      {/* Seção de apresentação/benefícios */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Nossos Tipos de Atendimento
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/80 rounded-xl shadow-lg p-8 border border-pink-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-pink-400 text-3xl font-bold">+</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Pós-Compra (15min gratuitos)
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Após sua compra, agende uma sessão gratuita de 15 minutos com nossos especialistas para esclarecer dúvidas e otimizar o uso do seu produto.
              </p>
              <ul className="text-sm text-green-600 space-y-2">
                <li>• Disponível a partir de 7 dias após a compra</li>
                <li>• Especialistas certificados com CRP</li>
                <li>• Sessão gravada para consulta posterior</li>
              </ul>
            </div>
            <div className="bg-white/80 rounded-xl shadow-lg p-8 border border-pink-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-purple-400 text-3xl font-bold">?</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Auxílio Pré-Compra
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Receba orientação especializada antes de fazer sua compra. Entenda qual produto melhor se adapta às suas necessidades específicas.
              </p>
              <ul className="text-sm text-purple-600 space-y-2">
                <li>• Agendamento com 3 dias de antecedência</li>
                <li>• Análise personalizada do seu caso</li>
                <li>• Recomendações baseadas em evidências</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de diferenciais/benefícios */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Por que Escolher Nosso Serviço?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-pink-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">CRP</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Especialistas Certificados</h3>
              <p className="text-pink-100">
                Todos os nossos profissionais possuem CRP ativo e experiência comprovada na área.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">⏰</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Flexibilidade de Horários</h3>
              <p className="text-pink-100">
                Agende no horário que for mais conveniente para você, incluindo fins de semana.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">🎥</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Tecnologia Avançada</h3>
              <p className="text-pink-100">
                Plataforma própria de videoconferência com gravação e compartilhamento de tela.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de depoimentos */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            O que nossos clientes dizem
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/80 rounded-xl shadow-lg p-6 border border-pink-100">
              <p className="text-gray-600 mb-4 italic">
                "O atendimento pós-compra foi excepcional. A especialista me ajudou a configurar tudo corretamente e esclareceu todas as minhas dúvidas em apenas 15 minutos."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-pink-400 font-bold text-lg">M</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Maria Silva</p>
                  <p className="text-sm text-gray-500">Cliente verificada</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 rounded-xl shadow-lg p-6 border border-pink-100">
              <p className="text-gray-600 mb-4 italic">
                "Antes de comprar, tive uma consulta que me ajudou a escolher exatamente o que precisava. Economizei tempo e dinheiro com a orientação profissional."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-400 font-bold text-lg">J</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">João Santos</p>
                  <p className="text-sm text-gray-500">Cliente verificado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-pink-400 to-purple-500">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Cadastre-se agora e agende sua primeira consulta com nossos especialistas certificados.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-pink-500 hover:bg-gray-100 text-lg px-8 py-4 font-bold">
              Criar Conta Gratuita
            </Button>
          </Link>
        </div>
      </section>

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

export default Home;
