import { Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SpecialistSidebar } from '@/components/SpecialistSidebar';

const SpecialistLayout = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  if (!user || profile?.role !== 'specialist') {
    return <div>Acesso negado</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SpecialistSidebar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SpecialistLayout;