
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings, Clock, Save } from 'lucide-react';

const ConfigAgenda = () => {
  const [config, setConfig] = useState({
    diasSemana: {
      segunda: true,
      terca: true,
      quarta: true,
      quinta: true,
      sexta: true,
      sabado: false,
      domingo: false
    },
    horarios: {
      inicio: '08:00',
      fim: '18:00',
      intervaloAlmoco: true,
      inicioAlmoco: '12:00',
      fimAlmoco: '13:00'
    },
    duracaoConsulta: 30,
    intervaloEntreConsultas: 15
  });

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

  const handleSave = () => {
    console.log('Configurações salvas:', config);
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
                  value={config.horarios.inicio}
                  onChange={(e) => handleHorarioChange('inicio', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Horário de Fim</label>
                <Input
                  type="time"
                  value={config.horarios.fim}
                  onChange={(e) => handleHorarioChange('fim', e.target.value)}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Intervalo para Almoço</span>
                <Switch
                  checked={config.horarios.intervaloAlmoco}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({
                      ...prev,
                      horarios: { ...prev.horarios, intervaloAlmoco: checked }
                    }))
                  }
                />
              </div>
              
              {config.horarios.intervaloAlmoco && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Início do Almoço</label>
                    <Input
                      type="time"
                      value={config.horarios.inicioAlmoco}
                      onChange={(e) => handleHorarioChange('inicioAlmoco', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Fim do Almoço</label>
                    <Input
                      type="time"
                      value={config.horarios.fimAlmoco}
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

        <Button onClick={handleSave} className="w-full md:w-auto">
          <Save className="mr-2 h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default ConfigAgenda;
