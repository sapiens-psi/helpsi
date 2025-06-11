
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/layouts/AdminLayout";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClientArea from "./pages/ClientArea";
import Schedule from "./pages/Schedule";
import VideoConference from "./pages/VideoConference";
import NotFound from "./pages/NotFound";
import MeusAgendamentos from './pages/MeusAgendamentos';
import About from "./pages/About";
import Contact from "./pages/Contact";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import SalasPosVenda from "./pages/admin/SalasPosVenda";
import SalasPreVenda from "./pages/admin/SalasPreVenda";
import Especialistas from "./pages/admin/Especialistas";
import PerfilEmpresa from "./pages/admin/PerfilEmpresa";
import ConfigAgenda from "./pages/admin/ConfigAgenda";
import AgendaPosVenda from "./pages/admin/AgendaPosVenda";
import AgendaPreVenda from "./pages/admin/AgendaPreVenda";
import Clientes from "./pages/admin/Clientes";
import DiscountCoupons from "./pages/admin/DiscountCoupons";
import ValidationCoupons from "./pages/admin/ValidationCoupons";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/client-area" 
              element={
                <ProtectedRoute>
                  <ClientArea />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/schedule" 
              element={
                <ProtectedRoute>
                  <Schedule />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/conference/:id" 
              element={
                <ProtectedRoute>
                  <VideoConference />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/meus-agendamentos" 
              element={
                <ProtectedRoute>
                  <MeusAgendamentos />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="salas-pos-venda" element={<SalasPosVenda />} />
              <Route path="salas-pre-venda" element={<SalasPreVenda />} />
              <Route path="especialistas" element={<Especialistas />} />
              <Route path="perfil-empresa" element={<PerfilEmpresa />} />
              <Route path="config-agenda" element={<ConfigAgenda />} />
              <Route path="agenda-pos-venda" element={<AgendaPosVenda />} />
              <Route path="agenda-pre-venda" element={<AgendaPreVenda />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="discount-coupons" element={<DiscountCoupons />} />
              <Route path="validation-coupons" element={<ValidationCoupons />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
