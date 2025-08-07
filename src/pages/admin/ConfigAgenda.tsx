
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings, Clock, Save, Plus, Trash2, Calendar } from 'lucide-react';
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

const ConfigAgenda = () => {
  const [config, setConfig] = useState<ConfigAgendaType>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      // Buscar configuração principal de pós-compra
      const { data: configData, error: configError } = await supabase
        .from('schedule_config_pos_compra')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }

      // Buscar slots de horários específicos para pós-compra
      const { data: slotsData, error: slotsError } = await supabase
        .from('schedule_slots_pos_compra')
        .select('*')
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time');

      if (slotsError) {
        throw slotsError;
      }

      // Organizar dados
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
      // Salvar configuração principal
      const configData = {
        id: config.id,
        diasSemana: JSON.stringify(config.diasSemana),
        duracaoConsulta: config.duracaoConsulta,
        intervaloEntreConsultas: config.intervaloEntreConsultas
      };

      const { data: savedConfig, error: configError } = await supabase
        .from('schedule_config_pos_compra')
        .upsert(configData, { onConflict: 'id' })
        .select()
        .single();

      if (configError) throw configError;

      // Remover slots existentes de pós-compra para este config_id
      const { error: deleteError } = await supabase
        .from('schedule_slots_pos_compra')
        .delete()
        .eq('config_id', savedConfig.id);

      if (deleteError) throw deleteError;

      // Inserir novos slots
      const slotsToInsert = [];
      for (const [dayOfWeek, slots] of Object.entries(config.daySchedules)) {
        if (config.diasSemana[dayOfWeek as keyof DiasSemana]) {
          for (const slot of slots) {
            slotsToInsert.push({
              config_id: savedConfig.id,
              day_of_week: dayOfWeek, // dayOfWeek já é uma string como 'monday', 'tuesday', etc.
              start_time: slot.start_time,
              max_consultations: slot.max_consultations,
              is_active: slot.is_active
            });
          }
        }
      }

      if (slotsToInsert.length > 0) {
        const { error: slotsError } = await supabase
          .from('schedule_slots_pos_compra')
          .insert(slotsToInsert);

        if (slotsError) throw slotsError;
      }

      toast.success('Configuração de pós-compra salva com sucesso!');
      await fetchConfig(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configuração: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações de Agenda - Pós-Compra</h1>
        <div className="text-center text-gray-500 py-8">Carregando configuração...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configurações de Agenda</h1>

      <div className="grid gap-6">
        {/* Dias da Semana */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Dias de Funcionamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(config.diasSemana).map(([dia, ativo]) => (
                <div key={dia} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="capitalize">{dayNames[dia as keyof typeof dayNames]}</span>
                  <Switch
                    checked={ativo}
                    onCheckedChange={(checked) => handleDiaChange(dia, checked)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Consulta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Configurações de Consulta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Duração da Consulta (minutos)</label>
                <Input
                  type="number"
                  value={config.duracaoConsulta}
                  onChange={(e) => setConfig(prev => ({ ...prev, duracaoConsulta: parseInt(e.target.value) || 30 }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horários Específicos por Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Horários Específicos por Dia - Pós-Compra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(config.diasSemana)
              .filter(([_, ativo]) => ativo)
              .map(([dayOfWeek]) => (
                <div key={dayOfWeek} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-lg">{dayNames[dayOfWeek as keyof typeof dayNames]}</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeSlot(dayOfWeek)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Horário
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {(config.daySchedules[dayOfWeek] || []).map((slot, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-xs font-medium mb-1">Horário</label>
                          <Input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) => updateTimeSlot(dayOfWeek, index, 'start_time', e.target.value)}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <label className="block text-xs font-medium mb-1">Máx. Consultas</label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={slot.max_consultations}
                            onChange={(e) => updateTimeSlot(dayOfWeek, index, 'max_consultations', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <Switch
                            checked={slot.is_active}
                            onCheckedChange={(checked) => updateTimeSlot(dayOfWeek, index, 'is_active', checked)}
                          />
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTimeSlot(dayOfWeek, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {(!config.daySchedules[dayOfWeek] || config.daySchedules[dayOfWeek].length === 0) && (
                      <div className="text-center text-gray-500 py-4">
                        Nenhum horário configurado para este dia
                      </div>
                    )}
                  </div>
                </div>
              ))
            }
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          onClick={handleSave} 
          className="w-full md:w-auto" 
          disabled={saving}
        >
          {saving ? 'Salvando...' : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConfigAgenda;
