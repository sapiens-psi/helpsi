import React, { useState } from 'react';
import { ModernNavbar } from '@/components/ModernNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    // Aqui você pode integrar com backend/email
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col">
      <ModernNavbar />

      {/* Contact Section */}
      <section className="container mx-auto px-6 py-20 text-center animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
            Entre em
            <span className="block bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent">
              Contato
            </span>
          </h1>
          <p className="text-white/80 text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed">
            Estamos aqui para ajudar! Entre em contato conosco e tire todas as suas dúvidas.
          </p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="glass-card p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Envie sua Mensagem</h2>
            {sent ? (
              <div className="text-center p-8">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                  <strong>Sucesso!</strong> Mensagem enviada com sucesso! Entraremos em contato em breve.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-primary"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-primary"
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-700 font-medium">Mensagem</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="border-gray-300 focus:border-primary"
                    placeholder="Como podemos ajudar você?"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3"
                >
                  Enviar Mensagem
                </Button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Informações de Contato</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-primary to-primary/80 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Mail className="text-white h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">E-mail</h3>
                    <p className="text-gray-600">contato@helpsi.com.br</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-secondary to-secondary/80 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Phone className="text-white h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Telefone</h3>
                    <p className="text-gray-600">(11) 9999-9999</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-accent to-accent/80 w-12 h-12 rounded-lg flex items-center justify-center">
                    <MapPin className="text-white h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Endereço</h3>
                    <p className="text-gray-600">São Paulo, SP - Brasil</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Horário de Atendimento</h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>Segunda a Sexta:</strong> 8h às 18h</p>
                <p><strong>Sábado:</strong> 9h às 15h</p>
                <p><strong>Domingo:</strong> Fechado</p>
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

export default Contact;