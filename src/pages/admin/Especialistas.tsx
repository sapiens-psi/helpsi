
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSpecialists } from '@/hooks/useSpecialists';
import { Plus, Edit, Mail, Phone } from 'lucide-react';

const Especialistas = () => {
  const { data: specialists = [] } = useSpecialists();
  const [showForm, setShowForm] = useState(false);

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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Nome completo" />
              <Input placeholder="CRP" />
              <Input placeholder="Email" />
              <Input placeholder="Telefone" />
            </div>
            <Textarea placeholder="Biografia do especialista" />
            <Input placeholder="Especialidades (separadas por vírgula)" />
            <div className="flex space-x-2">
              <Button>Salvar</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
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
