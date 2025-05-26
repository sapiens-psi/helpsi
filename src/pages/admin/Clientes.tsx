
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProfile } from '@/hooks/useProfile';
import { Search, User, Phone, Mail, Calendar } from 'lucide-react';

const Clientes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - em produção viria do hook useClients
  const clients = [
    {
      id: '1',
      full_name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-1111',
      cpf_cnpj: '123.456.789-00',
      created_at: '2024-01-15',
      consultations_count: 3,
      last_consultation: '2024-01-20'
    },
    {
      id: '2',
      full_name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '(11) 99999-2222',
      cpf_cnpj: '987.654.321-00',
      created_at: '2024-01-10',
      consultations_count: 1,
      last_consultation: '2024-01-18'
    }
  ];

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    {client.full_name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Cliente desde {new Date(client.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Badge variant="outline">
                  {client.consultations_count} consulta{client.consultations_count !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-4 w-4 text-gray-400" />
                  <span>{client.email}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Phone className="mr-2 h-4 w-4 text-gray-400" />
                  <span>{client.phone}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <span className="font-medium mr-2">CPF:</span>
                  <span>{client.cpf_cnpj}</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-1 h-4 w-4" />
                    Última consulta: {new Date(client.last_consultation).toLocaleDateString('pt-BR')}
                  </div>
                  
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">
                      Ver Histórico
                    </Button>
                    <Button variant="outline" size="sm">
                      Nova Consulta
                    </Button>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredClients.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Clientes;
