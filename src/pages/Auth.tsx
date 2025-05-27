import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Lock } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({ title: 'Login realizado com sucesso!', description: 'Bem-vindo de volta!' });
      } else {
        const { error } = await signUp(email, password, {
          full_name: fullName,
          phone: phone,
          cpf_cnpj: cpfCnpj
        });
        if (error) throw error;
        toast({ title: 'Conta criada com sucesso!', description: 'Você já pode fazer login.' });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#7b2ff2] via-[#f357a8] to-[#0a223a]">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-10 w-full max-w-sm flex flex-col items-center">
        <div className="bg-white/20 rounded-full p-4 mb-6">
          <User className="text-white" size={48} />
        </div>
        <h2 className="text-xl font-light tracking-widest text-white mb-8">
          {isLogin ? 'LOGIN DO CLIENTE' : 'CADASTRO'}
        </h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          {!isLogin && (
            <>
              <Input
                id="fullName"
                type="text"
                placeholder="Nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="pl-4 pr-4 py-2 rounded bg-transparent border-b border-white/40 text-white placeholder-white/70 focus:outline-none"
              />
              <Input
                id="phone"
                type="tel"
                placeholder="Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="pl-4 pr-4 py-2 rounded bg-transparent border-b border-white/40 text-white placeholder-white/70 focus:outline-none"
              />
              <Input
                id="cpfCnpj"
                type="text"
                placeholder="CPF/CNPJ"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                required
                className="pl-4 pr-4 py-2 rounded bg-transparent border-b border-white/40 text-white placeholder-white/70 focus:outline-none"
              />
            </>
          )}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" size={20} />
            <Input
              id="email"
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 pr-4 py-2 rounded bg-transparent border-b border-white/40 text-white placeholder-white/70 focus:outline-none"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" size={20} />
            <Input
              id="password"
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 pr-4 py-2 rounded bg-transparent border-b border-white/40 text-white placeholder-white/70 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between text-xs mt-2">
            <label className="flex items-center text-white/80">
              <input type="checkbox" className="mr-2 accent-pink-400" />
              Lembrar de mim
            </label>
            {isLogin && (
              <span className="text-white/70 hover:underline cursor-pointer">Esqueceu a senha?</span>
            )}
          </div>
          <Button
            type="submit"
            className="w-full mt-4 bg-white/20 text-white font-bold py-2 rounded-lg tracking-widest hover:bg-white/30 transition"
            disabled={loading}
          >
            {loading ? (isLogin ? 'Entrando...' : 'Cadastrando...') : isLogin ? 'ENTRAR' : 'CADASTRAR'}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-pink-200 hover:underline font-semibold"
          >
            {isLogin ? 'Não tem conta? Cadastre-se aqui' : 'Já tem conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
