import React from 'react';
import { ModernNavbar } from '@/components/ModernNavbar';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col">
      <ModernNavbar />

      {/* About Section */}
      <section className="container mx-auto px-6 py-20 text-center animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
            Sobre a
            <span className="block bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent">
              HELPSI
            </span>
          </h1>
          <div className="glass-card p-12 max-w-4xl mx-auto text-left">
            <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
              <p>
                Somos uma plataforma inovadora que conecta clientes a especialistas certificados, oferecendo orientação personalizada antes e depois da compra. Nosso objetivo é proporcionar segurança, confiança e resultados reais para quem busca apoio profissional de qualidade.
              </p>
              <p>
                Nossos diferenciais incluem atendimento humanizado, tecnologia própria de videoconferência, flexibilidade de horários e profissionais com CRP ativo. Acreditamos que o acesso à informação e ao suporte especializado transforma vidas e negócios.
              </p>
              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Nossa Missão</h3>
                  <p>
                    Democratizar o acesso a consultoria especializada, conectando pessoas a profissionais qualificados de forma simples, segura e eficiente.
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Nossa Visão</h3>
                  <p>
                    Ser a principal plataforma de consultoria online do Brasil, reconhecida pela qualidade dos profissionais e excelência no atendimento.
                  </p>
                </div>
              </div>
            </div>
          </div>
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

export default About;