import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PulsatingButton } from '@/components/magicui/pulsating-button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { HelpsiLogo } from '@/components/HelpsiLogo';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, className, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'relative px-4 py-2 text-white/90 font-medium transition-all duration-300 hover:text-white',
        'hover:scale-105 transform',
        isActive && 'lamp-effect text-white',
        className
      )}
    >
      {children}
    </Link>
  );
};

export const ModernNavbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Main Navbar */}
      <nav className="glass border-b border-white/10 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <HelpsiLogo size="lg" className="hover:scale-105 transition-transform duration-300" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/about">Sobre</NavLink>
              <NavLink to="/contact">Contato</NavLink>
              {user && (
                <>
                  <NavLink to="/schedule">Agendar</NavLink>
                  <NavLink to="/client-area">Área do Cliente</NavLink>
                </>
              )}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {!user ? (
                <>
                  <Button 
                    asChild
                    variant="ghost" 
                    className="btn-glass border-white/20 hover:bg-white/20"
                  >
                    <Link to="/auth">Login</Link>
                  </Button>
                  <Link to="/auth">
                    <PulsatingButton 
                      className="btn-gradient font-semibold"
                      pulseColor="hsl(var(--primary-glow))"
                    >
                      Cadastrar
                    </PulsatingButton>
                  </Link>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <PulsatingButton
                      pulseColor="hsl(var(--primary-glow))"
                      className="btn-glass font-semibold border-white/30"
                    >
                      {profile?.full_name || 'Perfil'}
                    </PulsatingButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="glass-card border-white/20 backdrop-blur-xl"
                  >
                    {profile?.role === 'admin' ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="cursor-pointer">
                            Painel Administrativo
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/20" />
                        <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                          Sair
                        </DropdownMenuItem>
                      </>
                    ) : profile?.role === 'specialist' ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/specialist" className="cursor-pointer">
                            Painel do Especialista
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/20" />
                        <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                          Sair
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/client-area" className="cursor-pointer">
                            Área do Cliente
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/20" />
                        <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                          Sair
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden glass p-2 rounded-lg border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div className="relative glass-card border-l-0 rounded-l-none h-full w-64 ml-auto p-6 space-y-6 animate-slide-in">
            <div className="flex justify-between items-center">
              <HelpsiLogo size="md" />
              <button
                onClick={closeMobileMenu}
                className="text-white hover:text-primary transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <NavLink to="/" onClick={closeMobileMenu} className="block">
                Home
              </NavLink>
              <NavLink to="/about" onClick={closeMobileMenu} className="block">
                Sobre
              </NavLink>
              <NavLink to="/contact" onClick={closeMobileMenu} className="block">
                Contato
              </NavLink>
              {user && (
                <>
                  <NavLink to="/schedule" onClick={closeMobileMenu} className="block">
                    Agendar
                  </NavLink>
                  <NavLink to="/client-area" onClick={closeMobileMenu} className="block">
                    Área do Cliente
                  </NavLink>
                </>
              )}
            </div>

            {!user ? (
              <div className="space-y-3 pt-6 border-t border-white/20">
                <Button 
                  asChild
                  variant="ghost" 
                  className="w-full btn-glass border-white/20"
                  onClick={closeMobileMenu}
                >
                  <Link to="/auth">Login</Link>
                </Button>
                <Link to="/auth" onClick={closeMobileMenu}>
                  <PulsatingButton 
                    className="w-full btn-gradient"
                    pulseColor="hsl(var(--primary-glow))"
                  >
                    Cadastrar
                  </PulsatingButton>
                </Link>
              </div>
            ) : (
              <div className="pt-6 border-t border-white/20">
                <div className="text-white/80 mb-4">
                  {profile?.full_name || user.email}
                </div>
                <div className="space-y-2">
                  {profile?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={closeMobileMenu}
                      className="block w-full text-left py-2 px-4 rounded-lg hover:bg-white/10 transition-colors text-white"
                    >
                      Painel Administrativo
                    </Link>
                  )}
                  {profile?.role === 'specialist' && (
                    <Link 
                      to="/specialist" 
                      onClick={closeMobileMenu}
                      className="block w-full text-left py-2 px-4 rounded-lg hover:bg-white/10 transition-colors text-white"
                    >
                      Painel do Especialista
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      signOut();
                      closeMobileMenu();
                    }}
                    className="block w-full text-left py-2 px-4 rounded-lg hover:bg-white/10 transition-colors text-white"
                  >
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};