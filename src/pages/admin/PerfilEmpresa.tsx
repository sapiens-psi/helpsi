import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Building, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PerfilEmpresa = () => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    site: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchCompany() {
      setLoading(true);
      const { data, error } = await supabase.from('company_profile').select('*').single();
      if (data) {
        setFormData({
          id: data.id,
          name: data.name || '',
          cnpj: data.cnpj || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          description: data.description || '',
          site: data.site || ''
        });
      }
      setLoading(false);
      if (error) toast.error('Erro ao carregar dados da empresa.');
    }
    fetchCompany();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const upsertData = formData.id
      ? [{ ...formData }]
      : [{ ...formData, id: undefined }];
    if (!formData.id) delete upsertData[0].id;
    const { error } = await supabase.from('company_profile').upsert(upsertData, { onConflict: 'id' });
    setSaving(false);
    if (error) {
      toast.error('Erro ao salvar dados da empresa: ' + (error.message || 'Erro desconhecido'));
    } else {
      toast.success('Dados da empresa salvos com sucesso!');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Perfil da Empresa</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Informações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-gray-500 py-8">Carregando dados...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Empresa</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Digite o nome da empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CNPJ</label>
                  <Input
                    value={formData.cnpj}
                    onChange={(e) => handleChange('cnpj', e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Site</label>
                  <Input
                    value={formData.site}
                    onChange={(e) => handleChange('site', e.target.value)}
                    placeholder="https://www.empresa.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Endereço</label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Endereço completo da empresa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descrição da Empresa</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Descreva a empresa, seus serviços e missão"
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar Informações'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerfilEmpresa;
