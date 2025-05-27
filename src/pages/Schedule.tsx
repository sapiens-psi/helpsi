
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCreateConsultation, useScheduleConfig } from '@/hooks/useSchedule';
import { useNavigate } from 'react-router-dom';

const Schedule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: scheduleConfig } = useScheduleConfig();
  const createConsultation = useCreateConsultation();
  
  const [formData, setFormData] = useState({
    type: '',
    scheduled_date: '',
    scheduled_time: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.type || !formData.scheduled_date || !formData.scheduled_time) {
      return;
    }

    try {
      await createConsultation.mutateAsync({
        client_id: user.id,
        type: formData.type,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
        description: formData.description,
      });
      
      navigate('/meus-agendamentos');
    } catch (error) {
      console.error('Erro ao agendar consulta:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Gerar horários disponíveis baseado na configuração
  const generateTimeSlots = () => {
    const defaultHorarios = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];
    
    if (scheduleConfig?.horarios) {
      try {
        const configHorarios = JSON.parse(scheduleConfig.horarios);
        return Array.isArray(configHorarios) ? configHorarios : defaultHorarios;
      } catch {
        return defaultHorarios;
      }
    }
    
    return defaultHorarios;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agendar Consulta</h1>
          <p className="text-gray-600">Escolha o tipo de consulta e selecione um horário disponível</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Nova Consulta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Consulta */}
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Consulta</label>
                <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de consulta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-compra">Pré-venda - Orientação antes da compra</SelectItem>
                    <SelectItem value="pos-compra">Pós-venda - Suporte após a compra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Data */}
              <div>
                <label className="block text-sm font-medium mb-2">Data da Consulta</label>
                <Input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => handleChange('scheduled_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Horário */}
              <div>
                <label className="block text-sm font-medium mb-2">Horário</label>
                <Select value={formData.scheduled_time} onValueChange={(value) => handleChange('scheduled_time', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Descreva brevemente o motivo da consulta ou dúvidas específicas..."
                  rows={4}
                />
              </div>

              {/* Informações do usuário */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <User className="mr-2 h-4 w-4" />
                  <span className="font-medium">Seus dados para a consulta:</span>
                </div>
                <p className="text-sm text-gray-600">
                  A consulta será agendada com as informações do seu perfil cadastrado.
                  Certifique-se de que seus dados estão atualizados.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={createConsultation.isPending || !formData.type || !formData.scheduled_date || !formData.scheduled_time}
              >
                {createConsultation.isPending ? 'Agendando...' : 'Agendar Consulta'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => navigate('/meus-agendamentos')}>
            Ver Meus Agendamentos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
