import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { User, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        setError('E-mail ou senha inválidos.');
        setLoading(false);
        return;
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setError('Erro inesperado ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#7b2ff2] via-[#f357a8] to-[#0a223a]">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-10 w-full max-w-sm flex flex-col items-center">
        {/* Ícone de usuário */}
        <div className="bg-white/20 rounded-full p-4 mb-6">
          <User className="text-white" size={48} />
        </div>
        {/* Título */}
        <h2 className="text-xl font-light tracking-widest text-white mb-8">LOGIN DO CLIENTE</h2>
        {/* Formulário */}
        {error && (
          <div className="mb-2 text-red-400 text-center text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" size={20} />
            <Input
              type="email"
              placeholder="E-mail"
              className="pl-10 pr-4 py-2 rounded bg-transparent border-b border-white/40 text-white placeholder-white/70 focus:outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" size={20} />
            <Input
              type="password"
              placeholder="Senha"
              className="pl-10 pr-4 py-2 rounded bg-transparent border-b border-white/40 text-white placeholder-white/70 focus:outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between text-xs mt-2">
            <label className="flex items-center text-white/80">
              <input type="checkbox" className="mr-2 accent-pink-400" />
              Lembrar de mim
            </label>
            <Link to="/forgot-password" className="text-white/70 hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full mt-4 bg-white/20 text-white font-bold py-2 rounded-lg tracking-widest hover:bg-white/30 transition"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'ENTRAR'}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-white/80">
            Não tem conta?{' '}
            <Link to="/register" className="text-pink-200 hover:underline font-semibold">
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
