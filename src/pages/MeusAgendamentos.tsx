import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
// TODO: implementar o hook useMyConsultations para buscar os agendamentos do usuário

const MeusAgendamentos = () => {
  // const { data: agendamentos, isLoading } = useMyConsultations();
  // Mock temporário:
  const agendamentos = [
    { id: 1, data: '2024-06-01', hora: '14:00', especialista: 'Dra. Ana', status: 'Confirmado' },
    { id: 2, data: '2024-06-10', hora: '09:30', especialista: 'Dr. João', status: 'Pendente' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">Meus Agendamentos</h1>
        {/* {isLoading ? (
          <div>Carregando...</div>
        ) : ( */}
        <ul className="space-y-4">
          {agendamentos.map((ag) => (
            <li key={ag.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-gray-800">{ag.data} às {ag.hora}</div>
                <div className="text-gray-600 text-sm">Especialista: {ag.especialista}</div>
              </div>
              <div className="mt-2 md:mt-0">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ag.status === 'Confirmado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{ag.status}</span>
              </div>
            </li>
          ))}
        </ul>
        {/* )} */}
      </div>
    </div>
  );
};

export default MeusAgendamentos; 