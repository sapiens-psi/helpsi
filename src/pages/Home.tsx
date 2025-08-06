import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PulsatingButton } from '@/components/magicui/pulsating-button';
import { Clock, User } from 'lucide-react';
import { ModernNavbar } from '@/components/ModernNavbar';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col">
      <ModernNavbar />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
            Conecte-se com
            <span className="block bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent">
              especialistas certificados
            </span>
          </h1>
          <p className="text-white/80 text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed">
            Receba orientação personalizada antes e depois da compra com profissionais qualificados e experientes.
          </p>
          <Link to="/auth">
            <PulsatingButton 
              className="btn-gradient text-lg px-10 py-4 font-bold shadow-glow hover:scale-105 transition-transform"
              pulseColor="hsl(var(--primary-glow))"
            >
              Comece agora gratuitamente
            </PulsatingButton>
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Nossos Serviços
          </h2>
          <p className="text-white/70 text-xl max-w-2xl mx-auto">
            Oferecemos suporte especializado para todas as suas necessidades
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Pós-Compra Service */}
          <div className="glass-card p-8 hover:scale-105 transition-all duration-300 animate-scale-in">
            <div className="bg-gradient-to-br from-secondary to-secondary/80 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Clock className="text-white h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              Pós-Compra
              <span className="block text-lg font-medium text-secondary">15min gratuitos</span>
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Já fez sua compra e precisa de orientação? Nossos especialistas estão aqui para te ajudar!
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                Suporte pós-compra especializado
              </li>
              <li className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                15 minutos gratuitos de consultoria
              </li>
              <li className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                Especialistas com CRP ativo
              </li>
              <li className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                Agendamento com 7 dias de antecedência
              </li>
            </ul>
            <Link to="/auth">
              <Button className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold py-3">
                Agendar consulta
              </Button>
            </Link>
          </div>

          {/* Pré-Compra Service */}
          <div className="glass-card p-8 hover:scale-105 transition-all duration-300 animate-scale-in">
            <div className="bg-gradient-to-br from-primary to-primary/80 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <User className="text-white h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              Auxílio Pré-Compra
              <span className="block text-lg font-medium text-primary">Consultoria especializada</span>
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Precisa de orientação antes de fazer uma compra importante? Estamos aqui para te guiar!
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                Consultoria antes da compra
              </li>
              <li className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                Análise personalizada de necessidades
              </li>
              <li className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                Comparação de produtos e serviços
              </li>
              <li className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                Agendamento com 3 dias de antecedência
              </li>
            </ul>
            <Link to="/auth">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3">
                Solicitar orientação
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Por que Escolher a HELPSI?
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center glass-card p-8">
            <div className="bg-gradient-to-br from-secondary to-secondary/80 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl font-bold">CRP</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Especialistas Certificados</h3>
            <p className="text-gray-600">
              Todos os nossos profissionais possuem CRP ativo e experiência comprovada na área.
            </p>
          </div>
          <div className="text-center glass-card p-8">
            <div className="bg-gradient-to-br from-primary to-primary/80 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="text-white h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Flexibilidade de Horários</h3>
            <p className="text-gray-600">
              Agende no horário que for mais conveniente para você, incluindo fins de semana.
            </p>
          </div>
          <div className="text-center glass-card p-8">
            <div className="bg-gradient-to-br from-accent to-accent/80 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl font-bold">🎥</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Tecnologia Avançada</h3>
            <p className="text-gray-600">
              Plataforma própria de videoconferência com gravação e compartilhamento de tela.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="glass-card p-12 max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Cadastre-se agora e agende sua primeira consulta com nossos especialistas certificados.
          </p>
          <Link to="/auth">
            <PulsatingButton 
              className="btn-gradient text-lg px-10 py-4 font-bold"
              pulseColor="hsl(var(--primary-glow))"
            >
              Criar Conta Gratuita
            </PulsatingButton>
          </Link>
        </div>
      </section>

      {/* Footer Wave */}
      <div className="w-full h-32 relative mt-auto">
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