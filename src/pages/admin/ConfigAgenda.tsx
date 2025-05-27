import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings, Clock, Save } from 'lucide-react';
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

type Horarios = {
  intervaloAlmoco: boolean;
  inicioAlmoco: string;
  fimAlmoco: string;
};

type BusinessHours = {
  [key: string]: [string, string]; // Ex: monday: ['08:00', '18:00']
};

type ConfigAgendaType = {
  id?: string;
  diasSemana: DiasSemana;
  horarios: Horarios;
  business_hours: BusinessHours;
  duracaoConsulta: number;
  intervaloEntreConsultas: number;
};

const defaultConfig: ConfigAgendaType = {
  diasSemana: {
    monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false
  },
  horarios: {
    intervaloAlmoco: false,
    inicioAlmoco: '',
    fimAlmoco: ''
  },
  business_hours: {
    monday: ['08:00', '18:00']
  },
  duracaoConsulta: 30,
  intervaloEntreConsultas: 15
};

const ConfigAgenda = () => {
  const [config, setConfig] = useState<ConfigAgendaType>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      const { data, error } = await supabase.from('schedule_config').select('*').single();
      if (data) {
        const safeConfig: ConfigAgendaType = {
          id: data.id,
          diasSemana: typeof data.diasSemana === 'object' && data.diasSemana !== null ? data.diasSemana : defaultConfig.diasSemana,
          horarios: typeof data.horarios === 'object' && data.horarios !== null ? data.horarios : defaultConfig.horarios,
          business_hours: typeof data.business_hours === 'object' && data.business_hours !== null ? data.business_hours : defaultConfig.business_hours,
          duracaoConsulta: typeof data.duracaoConsulta === 'number' ? data.duracaoConsulta : defaultConfig.duracaoConsulta,
          intervaloEntreConsultas: typeof data.intervaloEntreConsultas === 'number' ? data.intervaloEntreConsultas : defaultConfig.intervaloEntreConsultas
        };
        setConfig(safeConfig);
      }
      setLoading(false);
      if (error) toast.error('Erro ao carregar configuração de agenda: ' + (error.message || JSON.stringify(error)));
    }
    fetchConfig();
  }, []);

  const handleDiaChange = (dia: string, ativo: boolean) => {
    setConfig(prev => ({
      ...prev,
      diasSemana: { ...prev.diasSemana, [dia]: ativo }
    }));
  };

  const handleHorarioChange = (campo: string, valor: string) => {
    setConfig(prev => ({
      ...prev,
      horarios: { ...prev.horarios, [campo]: valor }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { id, diasSemana, horarios, business_hours, duracaoConsulta, intervaloEntreConsultas } = config;
    // Serializar campos JSON
    const upsertData = {
      id: id || undefined,
      diasSemana: diasSemana ? JSON.stringify(diasSemana) : undefined,
      horarios: horarios ? JSON.stringify(horarios) : undefined,
      business_hours: business_hours ? JSON.stringify(business_hours) : undefined,
      duracaoConsulta,
      intervaloEntreConsultas
    };
    const { error } = await supabase.from('schedule_config').upsert(upsertData, { onConflict: 'id' });
    setSaving(false);
    if (error) toast.error('Erro ao salvar configuração: ' + (error.message || JSON.stringify(error)));
    else toast.success('Configuração salva!');
  };

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
            {loading ? (
              <div className="text-center text-gray-500 py-8">Carregando configuração...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(config.diasSemana).map(([dia, ativo]) => (
                  <div key={dia} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="capitalize">{dia}</span>
                    <Switch
                      checked={ativo}
                      onCheckedChange={(checked) => handleDiaChange(dia, checked)}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Horários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Horários de Funcionamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Horário de Início</label>
                <Input
                  type="time"
                  value={config?.business_hours?.monday?.[0] || ''}
                  onChange={e => setConfig((prev: any) => ({
                    ...prev,
                    business_hours: { ...prev.business_hours, monday: [e.target.value, prev.business_hours?.monday?.[1] || '18:00'] }
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Horário de Fim</label>
                <Input
                  type="time"
                  value={config?.business_hours?.monday?.[1] || ''}
                  onChange={e => setConfig((prev: any) => ({
                    ...prev,
                    business_hours: { ...prev.business_hours, monday: [prev.business_hours?.monday?.[0] || '08:00', e.target.value] }
                  }))}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Intervalo para Almoço</span>
                <Switch
                  checked={config?.horarios?.intervaloAlmoco}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({
                      ...prev,
                      horarios: { ...prev.horarios, intervaloAlmoco: checked }
                    }))
                  }
                />
              </div>
              
              {config?.horarios?.intervaloAlmoco && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Início do Almoço</label>
                    <Input
                      type="time"
                      value={config?.horarios?.inicioAlmoco}
                      onChange={(e) => handleHorarioChange('inicioAlmoco', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Fim do Almoço</label>
                    <Input
                      type="time"
                      value={config?.horarios?.fimAlmoco}
                      onChange={(e) => handleHorarioChange('fimAlmoco', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Consulta */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Consulta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Duração da Consulta (minutos)</label>
                <Input
                  type="number"
                  value={config.duracaoConsulta}
                  onChange={(e) => setConfig(prev => ({ ...prev, duracaoConsulta: parseInt(e.target.value) || 30 }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Intervalo Entre Consultas (minutos)</label>
                <Input
                  type="number"
                  value={config.intervaloEntreConsultas}
                  onChange={(e) => setConfig(prev => ({ ...prev, intervaloEntreConsultas: parseInt(e.target.value) || 15 }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" onClick={handleSave} className="w-full md:w-auto" disabled={saving}>
          {saving ? 'Salvando...' : <Save className="mr-2 h-4 w-4" />}
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default ConfigAgenda;
