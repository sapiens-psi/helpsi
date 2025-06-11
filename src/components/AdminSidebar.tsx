import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  VideoIcon,
  Users,
  Building,
  Settings,
  Calendar,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  BarChart,
  CreditCard,
  Percent,
  Ticket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/salas-pos-venda', icon: VideoIcon, label: 'Salas Pós-venda' },
    { path: '/admin/salas-pre-venda', icon: VideoIcon, label: 'Salas Pré-venda' },
    { path: '/admin/especialistas', icon: UserCheck, label: 'Especialistas' },
    { path: '/admin/perfil-empresa', icon: Building, label: 'Perfil da Empresa' },
    { path: '/admin/config-agenda', icon: Settings, label: 'Config. Agenda' },
    { path: '/admin/agenda-pos-venda', icon: Calendar, label: 'Agenda Pós-venda' },
    { path: '/admin/agenda-pre-venda', icon: Calendar, label: 'Agenda Pré-venda' },
    { path: '/admin/clientes', icon: Users, label: 'Clientes' },
    { path: '/admin/discount-coupons', icon: Percent, label: 'Cupons de Desconto' },
    { path: '/admin/validation-coupons', icon: Ticket, label: 'Cupons de Validação' }
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={cn(
      "h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.exact);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg transition-colors",
                active 
                  ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" 
                  : "text-gray-600 hover:bg-gray-50",
                isCollapsed && "justify-center"
              )}
            >
              <Icon size={20} />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Botão Voltar à Página Principal no rodapé do sidebar */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <NavLink
          to="/"
          className={cn(
            "flex items-center px-3 py-2 rounded-lg transition-colors",
            "text-gray-600 hover:bg-gray-50",
            isCollapsed && "justify-center"
          )}
        >
          <Home size={20} />
          {!isCollapsed && <span className="ml-3">Voltar à Página Principal</span>}
        </NavLink>

        {/* Botão Sair no rodapé do sidebar */}
        <Button 
          variant="outline" 
          className={cn(
            "w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700",
            isCollapsed && "justify-center"
          )}
          onClick={signOut}
        >
          <LogOut size={20} className={isCollapsed ? "" : "mr-3"} />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
