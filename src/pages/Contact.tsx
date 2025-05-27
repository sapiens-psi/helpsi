import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PulsatingButton } from '@/components/magicui/pulsating-button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

const Contact = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const location = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    // Aqui você pode integrar com backend/email
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7b2ff2] via-[#f357a8] to-[#0a223a] flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
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
                <button className="px-4 py-2 rounded-lg bg-white/80 text-pink-500 font-bold hover:bg-white">Login</button>
              </Link>
              <Link to="/auth">
                <button className="px-4 py-2 rounded-lg bg-pink-400 text-white font-bold hover:bg-pink-500">Cadastrar</button>
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

      <div className="container mx-auto px-4 py-16 flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold text-white mb-6 drop-shadow-lg">Contato</h1>
        <div className="max-w-xl w-full bg-white/80 rounded-xl shadow-lg p-8 text-gray-800">
          {sent ? (
            <div className="text-center text-green-600 font-semibold text-lg">
              Mensagem enviada com sucesso! Entraremos em contato em breve.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-pink-200 focus:border-pink-400 focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-pink-200 focus:border-pink-400 focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mensagem</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-pink-200 focus:border-pink-400 focus:outline-none bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 rounded-lg transition"
              >
                Enviar Mensagem
              </button>
            </form>
          )}
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

export default Contact; 