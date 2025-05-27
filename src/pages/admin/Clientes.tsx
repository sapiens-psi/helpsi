import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProfile } from '@/hooks/useProfile';
import { Search, User, Phone, Mail, Calendar } from 'lucide-react';
import { useClients } from '@/hooks/useClients';

const Clientes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: clients = [], isLoading } = useClients();

  const filteredClients = clients.filter((client: any) =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
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

      {isLoading ? (
        <div className="text-center text-gray-500 py-8">Carregando clientes...</div>
      ) : (
        <div className="grid gap-6">
          {filteredClients.map((client: any) => (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      {client.full_name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Cliente desde {client.created_at ? new Date(client.created_at).toLocaleDateString('pt-BR') : '-'}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {/* Aqui você pode exibir o número de consultas se quiser buscar depois */}
                    Cliente
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-gray-400" />
                    <span>{client.email || '-'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-gray-400" />
                    <span>{client.phone || '-'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium mr-2">CPF/CNPJ:</span>
                    <span>{client.cpf_cnpj || '-'}</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-1 h-4 w-4" />
                      {/* Aqui você pode exibir a última consulta se quiser buscar depois */}
                      {/* Última consulta: ... */}
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
      )}
    </div>
  );
};

export default Clientes;
