import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConsultationHistory } from '@/components/ConsultationHistory';
import { ClientStats } from '@/components/ClientStats';
import { ArrowLeft, Calendar } from 'lucide-react';

const MeusAgendamentos = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/client-area" className="inline-flex items-center text-gray-600 hover:text-pink-500 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Área do Cliente
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-pink-500" />
            Meus Agendamentos
          </h1>
          <p className="text-gray-600">
            Gerencie todas as suas consultas agendadas, visualize o histórico e acompanhe o status.
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <ClientStats />
        </div>

        {/* Full Consultation History */}
        <Card className="shadow-lg">
          <ConsultationHistory showAll={true} />
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <Link to="/schedule">
            <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 text-lg">
              <Calendar className="h-5 w-5 mr-2" />
              Agendar Nova Consulta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MeusAgendamentos;