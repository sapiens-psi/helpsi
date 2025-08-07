import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings, Clock, Save, Plus, Trash2, Calendar, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type DiasSemana = {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
};

type TimeSlot = {
  id?: string;
  start_time: string;
  max_consultations: number;
  is_active: boolean;
};

type DaySchedule = {
  [key: string]: TimeSlot[];
};

type ConfigAgendaType = {
  id?: string;
  diasSemana: DiasSemana;
  duracaoConsulta: number;
  intervaloEntreConsultas: number;
  daySchedules: DaySchedule;
};

const defaultConfig: ConfigAgendaType = {
  diasSemana: {
    monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false
  },
  duracaoConsulta: 30,
  intervaloEntreConsultas: 15,
  daySchedules: {}
};

const dayNames = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

const ConfigAgendaPreCompra = () => {
  const [config, setConfig] = useState<ConfigAgendaType>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      // Buscar configuração principal de pré-compra
      const { data: configData, error: configError } = await supabase
        .from('schedule_config_pre_compra')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }

      // Buscar slots de horários específicos para pré-compra
      const { data: slotsData, error: slotsError } = await supabase
        .from('schedule_slots_pre_compra')
        .select('*')
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time');

      if (slotsError) {
        throw slotsError;
      }

      // Organizar dados - usar nomes dos dias como chaves
      const daySchedules: DaySchedule = {};
      if (slotsData) {
        slotsData.forEach(slot => {
          if (!daySchedules[slot.day_of_week]) {
            daySchedules[slot.day_of_week] = [];
          }
          daySchedules[slot.day_of_week].push({
            id: slot.id,
            start_time: slot.start_time,
            max_consultations: slot.max_consultations,
            is_active: slot.is_active
          });
        });
      }

      if (configData) {
        setConfig({
          id: configData.id,
          diasSemana: configData.diasSemana ? 
            (typeof configData.diasSemana === 'object' ? configData.diasSemana : JSON.parse(configData.diasSemana)) : 
            defaultConfig.diasSemana,
          duracaoConsulta: configData.duracaoConsulta || defaultConfig.duracaoConsulta,
          intervaloEntreConsultas: configData.intervaloEntreConsultas || defaultConfig.intervaloEntreConsultas,
          daySchedules
        });
      } else {
        setConfig({ ...defaultConfig, daySchedules });
      }
    } catch (error: any) {
      console.error('Erro ao carregar configuração:', error);
      toast.error('Erro ao carregar configuração: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDiaChange = (dia: string, ativo: boolean) => {
    setConfig(prev => ({
      ...prev,
      diasSemana: { ...prev.diasSemana, [dia]: ativo }
    }));
  };

  const addTimeSlot = (dayOfWeek: string) => {
    setConfig(prev => ({
      ...prev,
      daySchedules: {
        ...prev.daySchedules,
        [dayOfWeek]: [
          ...(prev.daySchedules[dayOfWeek] || []),
          {
            start_time: '09:00',
            max_consultations: 1,
            is_active: true
          }
        ]
      }
    }));
  };

  const removeTimeSlot = (dayOfWeek: string, index: number) => {
    setConfig(prev => ({
      ...prev,
      daySchedules: {
        ...prev.daySchedules,
        [dayOfWeek]: prev.daySchedules[dayOfWeek]?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const updateTimeSlot = (dayOfWeek: string, index: number, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      daySchedules: {
        ...prev.daySchedules,
        [dayOfWeek]: prev.daySchedules[dayOfWeek]?.map((slot, i) => 
          i === index ? { ...slot, [field]: value } : slot
        ) || []
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Salvar configuração principal (se necessário)
      const configData = {
        id: config.id,
        diasSemana: JSON.stringify(config.diasSemana),
        duracaoConsulta: config.duracaoConsulta,
        intervaloEntreConsultas: config.intervaloEntreConsultas
      };

      const { data: savedConfig, error: configError } = await supabase
        .from('schedule_config_pre_compra')
        .upsert(configData, { onConflict: 'id' })
        .select()
        .single();

      if (configError) throw configError;

      // Remover slots existentes de pré-compra para este config_id
      const { error: deleteError } = await supabase
        .from('schedule_slots_pre_compra')
        .delete()
        .eq('config_id', savedConfig.id);

      if (deleteError) throw deleteError;

      // Inserir novos slots de pré-compra
      const slotsToInsert: any[] = [];
      
      Object.entries(config.daySchedules).forEach(([dayOfWeek, slots]) => {
        slots.forEach(slot => {
          const slotData = {
            config_id: savedConfig.id,
            day_of_week: dayOfWeek, // dayOfWeek já é o nome do dia (monday, tuesday, etc.)
            start_time: slot.start_time,
            max_consultations: slot.max_consultations,
            is_active: slot.is_active
          };
          
          // Verificar se já existe um slot com a mesma combinação
          const exists = slotsToInsert.find(existing => 
            existing.day_of_week === slotData.day_of_week && 
            existing.start_time === slotData.start_time
          );
          
          if (!exists) {
            slotsToInsert.push(slotData);
          }
        });
      });
      
      console.log('Slots to insert:', slotsToInsert);

      if (slotsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('schedule_slots_pre_compra')
          .insert(slotsToInsert);

        if (insertError) throw insertError;
      }

      toast.success('Configuração de pré-compra salva com sucesso!');
      await fetchConfig();
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração: ' + error.message);
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-pink-100 rounded-lg">
            <ShoppingCart className="h-8 w-8 text-pink-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuração de Agenda - Pré-Compra</h1>
            <p className="text-gray-600 mt-1">Configure os horários disponíveis para consultas de pré-compra</p>
          </div>
        </div>

        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração da Consulta (minutos)
                </label>
                <Input
                  type="number"
                  value={config.duracaoConsulta}
                  onChange={(e) => setConfig(prev => ({ ...prev, duracaoConsulta: parseInt(e.target.value) || 30 }))}
                  min="15"
                  max="120"
                  step="15"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dias de Funcionamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dias de Funcionamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(dayNames).map(([key, name]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Switch
                    checked={config.diasSemana[key as keyof DiasSemana]}
                    onCheckedChange={(checked) => handleDiaChange(key, checked)}
                  />
                  <label className="text-sm font-medium">{name}</label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Horários por Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários Específicos por Dia - Pré-Compra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(dayNames).map(([dayKey, dayName]) => {
              const daySlots = config.daySchedules[dayKey] || []; // usar dayKey diretamente
              
              return (
                <div key={dayKey} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{dayName}</h3>
                    <Button
                      onClick={() => addTimeSlot(dayKey)}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Horário
                    </Button>
                  </div>
                  
                  {daySlots.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhum horário configurado para este dia</p>
                  ) : (
                    <div className="space-y-3">
                      {daySlots.map((slot, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Horário</label>
                            <Input
                              type="time"
                              value={slot.start_time}
                              onChange={(e) => updateTimeSlot(dayKey, index, 'start_time', e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Máx. Consultas</label>
                            <Input
                              type="number"
                              value={slot.max_consultations}
                              onChange={(e) => updateTimeSlot(dayKey, index, 'max_consultations', parseInt(e.target.value) || 1)}
                              min="1"
                              max="10"
                              className="w-full"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={slot.is_active}
                              onCheckedChange={(checked) => updateTimeSlot(dayKey, index, 'is_active', checked)}
                            />
                            <span className="text-xs text-gray-600">Ativo</span>
                          </div>
                          <Button
                            onClick={() => removeTimeSlot(dayKey, index)}
                            size="sm"
                            variant="destructive"
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfigAgendaPreCompra;