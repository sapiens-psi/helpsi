
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSpecialists } from '@/hooks/useSpecialists';
import { useCreateSpecialist } from '@/hooks/useCreateSpecialist';
import { Plus, Edit, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

const Especialistas = () => {
  const { data: specialists = [] } = useSpecialists();
  const { mutate: createSpecialist, isPending } = useCreateSpecialist();
  const [showForm, setShowForm] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    crp: '',
    bio: '',
    specialties: '',
    filial: '',
    funcao: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const specialtiesArray = formData.specialties
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    createSpecialist({
      ...formData,
      specialties: specialtiesArray,
      funcao: formData.funcao
    });

    // Resetar formulário
    setFormData({
      fullName: '',
      email: '',
      password: '',
      phone: '',
      crp: '',
      bio: '',
      specialties: '',
      filial: '',
      funcao: []
    });
    setShowForm(false);
  };

  const handleFuncaoChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      funcao: prev.funcao.includes(value)
        ? prev.funcao.filter(f => f !== value)
        : [...prev.funcao, value]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Especialistas</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Especialista
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Especialista</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  placeholder="Nome completo" 
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
                <Input 
                  placeholder="CRP" 
                  value={formData.crp}
                  onChange={(e) => setFormData(prev => ({ ...prev, crp: e.target.value }))}
                  required
                />
                <Input 
                  type="email"
                  placeholder="E-mail" 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
                <Input 
                  type="password"
                  placeholder="Senha" 
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
                <Input 
                  placeholder="Telefone" 
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
                <Input 
                  placeholder="Filial onde trabalha" 
                  value={formData.filial}
                  onChange={(e) => setFormData(prev => ({ ...prev, filial: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Função:</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.funcao.includes('pre-venda')}
                      onChange={() => handleFuncaoChange('pre-venda')}
                      className="rounded"
                    />
                    <span>Pré-venda</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.funcao.includes('pos-venda')}
                      onChange={() => handleFuncaoChange('pos-venda')}
                      className="rounded"
                    />
                    <span>Pós-venda</span>
                  </label>
                </div>
              </div>

              <Textarea 
                placeholder="Biografia do especialista" 
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
              
              <Input 
                placeholder="Especialidades (separadas por vírgula)" 
                value={formData.specialties}
                onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
              />
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {specialists.map((specialist) => (
          <Card key={specialist.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {specialist.profiles?.full_name || 'Nome não disponível'}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    CRP: {specialist.profiles?.crp || 'Não informado'}
                  </p>
                </div>
                <Badge className={
                  specialist.is_available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }>
                  {specialist.is_available ? 'Disponível' : 'Indisponível'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Biografia:</h4>
                  <p className="text-gray-600">{specialist.bio || 'Sem biografia'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Especialidades:</h4>
                  <div className="flex flex-wrap gap-2">
                    {specialist.specialties?.map((specialty, index) => (
                      <Badge key={index} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Phone className="mr-1 h-4 w-4" />
                      {specialist.profiles?.phone || 'Não informado'}
                    </div>
                  </div>
                  
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-1 h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      Horários
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {specialists.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Nenhum especialista cadastrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Especialistas;
