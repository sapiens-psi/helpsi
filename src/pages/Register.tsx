import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    crp: '',
    cpfCnpj: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de cadastro
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a223a] to-[#18344d] relative">
      {/* Ícone de idioma */}
      <div className="absolute top-6 right-8">
        <span className="text-white text-sm cursor-pointer">🇧🇷 PT</span>
      </div>
      {/* Card de cadastro */}
      <div className="bg-[#11263e] rounded-2xl shadow-lg p-8 w-full max-w-xl flex flex-col items-center">
        {/* Logo */}
        <div className="mb-6">
          <span className="text-4xl font-bold text-green-400">R</span>
        </div>
        {/* Título */}
        <h2 className="text-2xl font-semibold text-white mb-2">Sign up</h2>
        <p className="text-gray-300 mb-6 text-center">
          Crie sua conta para começar a gerenciar!
        </p>
        {/* Formulário */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              name="fullName"
              type="text"
              placeholder="Nome completo"
              className="px-4 py-2 rounded-lg bg-[#1a3552] text-white placeholder-gray-400"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <Input
              name="phone"
              type="tel"
              placeholder="Telefone"
              className="px-4 py-2 rounded-lg bg-[#1a3552] text-white placeholder-gray-400"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              name="crp"
              type="text"
              placeholder="CRP (opcional)"
              className="px-4 py-2 rounded-lg bg-[#1a3552] text-white placeholder-gray-400"
              value={formData.crp}
              onChange={handleChange}
            />
            <Input
              name="cpfCnpj"
              type="text"
              placeholder="CPF/CNPJ"
              className="px-4 py-2 rounded-lg bg-[#1a3552] text-white placeholder-gray-400"
              value={formData.cpfCnpj}
              onChange={handleChange}
              required
            />
          </div>
          <Input
            name="email"
            type="email"
            placeholder="E-mail"
            className="px-4 py-2 rounded-lg bg-[#1a3552] text-white placeholder-gray-400"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              name="password"
              type="password"
              placeholder="Senha"
              className="px-4 py-2 rounded-lg bg-[#1a3552] text-white placeholder-gray-400"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirmar senha"
              className="px-4 py-2 rounded-lg bg-[#1a3552] text-white placeholder-gray-400"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-start space-x-2">
            <input type="checkbox" id="terms" className="mt-1 accent-green-400" required />
            <label htmlFor="terms" className="text-sm text-gray-300">
              Aceito os{' '}
              <Link to="/terms" className="text-green-400 hover:underline">
                termos de uso
              </Link>{' '}
              e{' '}
              <Link to="/privacy" className="text-green-400 hover:underline">
                política de privacidade
              </Link>
            </label>
          </div>
          <Button
            type="submit"
            className="mt-2 bg-green-400 hover:bg-green-500 text-white font-bold py-2 rounded-lg transition"
          >
            Criar Conta
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Já tem conta?{' '}
            <Link to="/login" className="text-green-400 hover:underline font-semibold">
              Faça login aqui
            </Link>
          </p>
        </div>
      </div>
      {/* Onda no rodapé */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        height="80"
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ minWidth: "100vw" }}
      >
        <path
          d="M0 40C360 80 1080 0 1440 40V80H0V40Z"
          fill="#18344d"
        />
      </svg>
      <div className="absolute bottom-2 w-full text-center text-gray-400 text-xs">
        2024 © SuaMarca. Todos os direitos reservados.
      </div>
    </div>
  );
};

export default Register;
