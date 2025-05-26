
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, User, Calendar } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">ConsultaPro</div>
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">Sobre</Link>
            <Link to="/schedule" className="text-gray-700 hover:text-blue-600 transition-colors">Agendar</Link>
            <Link to="/client-area" className="text-gray-700 hover:text-blue-600 transition-colors">Área do Cliente</Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contato</Link>
          </nav>
          <div className="flex space-x-3">
            <Link to="/login">
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Assistência Especializada
            <span className="text-blue-600 block">Pós-Venda e Pré-Compra</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Conecte-se com especialistas certificados para tirar suas dúvidas sobre produtos 
            e receber orientação personalizada através de videoconferências profissionais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/schedule">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Consulta
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 text-lg px-8 py-4">
                Saiba Mais
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Nossos Tipos de Atendimento
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Pós-Compra (15min gratuitos)
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Após sua compra, agende uma sessão gratuita de 15 minutos com nossos especialistas 
                  para esclarecer dúvidas e otimizar o uso do seu produto.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Disponível a partir de 7 dias após a compra</li>
                  <li>• Especialistas certificados com CRP</li>
                  <li>• Sessão gravada para consulta posterior</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Auxílio Pré-Compra
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Receba orientação especializada antes de fazer sua compra. Entenda qual produto 
                  melhor se adapta às suas necessidades específicas.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Agendamento com 3 dias de antecedência</li>
                  <li>• Análise personalizada do seu caso</li>
                  <li>• Recomendações baseadas em evidências</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Por que Escolher Nosso Serviço?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Especialistas Certificados</h3>
              <p className="text-gray-600">
                Todos os nossos profissionais possuem CRP ativo e experiência comprovada na área.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Flexibilidade de Horários</h3>
              <p className="text-gray-600">
                Agende no horário que for mais conveniente para você, incluindo fins de semana.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Tecnologia Avançada</h3>
              <p className="text-gray-600">
                Plataforma própria de videoconferência com gravação e compartilhamento de tela.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            O que nossos clientes dizem
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-blue-100">
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4 italic">
                  "O atendimento pós-compra foi excepcional. A especialista me ajudou a configurar 
                  tudo corretamente e esclareceu todas as minhas dúvidas em apenas 15 minutos."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Maria Silva</p>
                    <p className="text-sm text-gray-500">Cliente verificada</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100">
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4 italic">
                  "Antes de comprar, tive uma consulta que me ajudou a escolher exatamente o que 
                  precisava. Economizei tempo e dinheiro com a orientação profissional."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">João Santos</p>
                    <p className="text-sm text-gray-500">Cliente verificado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Cadastre-se agora e agende sua primeira consulta com nossos especialistas certificados.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
              Criar Conta Gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ConsultaPro</h3>
              <p className="text-gray-400">
                Conectando você aos melhores especialistas para orientação profissional 
                personalizada.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Serviços</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Consulta Pós-Compra</li>
                <li>Auxílio Pré-Compra</li>
                <li>Videoconferência</li>
                <li>Gravação de Sessões</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">Sobre Nós</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contato</Link></li>
                <li>Termos de Uso</li>
                <li>Política de Privacidade</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400">
                <li>contato@consultapro.com</li>
                <li>(11) 99999-9999</li>
                <li>São Paulo, SP</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ConsultaPro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
