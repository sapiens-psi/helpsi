
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConsultations } from '@/hooks/useConsultations';
import { Calendar, Clock, Phone, User } from 'lucide-react';

const AgendaPreVenda = () => {
  const { data: consultations = [] } = useConsultations();
  
  const preVendaConsultations = consultations.filter(c => c.type === 'pre-compra');
  const agendadas = preVendaConsultations.filter(c => c.status === 'agendada');
  const concluidas = preVendaConsultations.filter(c => c.status === 'concluida');

  const ConsultationCard = ({ consultation }: { consultation: any }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg flex items-center">
              <User className="mr-2 h-4 w-4" />
              {consultation.client?.full_name || 'Cliente'}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Calendar className="mr-1 h-4 w-4" />
              {consultation.scheduled_date} às {consultation.scheduled_time}
            </div>
          </div>
          <Badge className={
            consultation.status === 'agendada' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }>
            {consultation.status}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div>
            <span className="font-medium">Interesse em:</span>
            <p className="text-gray-600">{consultation.description || 'Não especificado'}</p>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="mr-1 h-4 w-4" />
              {consultation.client?.phone || 'Telefone não informado'}
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="mr-1 h-4 w-4" />
              {consultation.duration_minutes} min
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <Button variant="outline" size="sm">
            Ver Detalhes
          </Button>
          {consultation.status === 'agendada' && (
            <Button size="sm">
              Iniciar Consulta
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Agenda Pré-venda</h1>

      <Tabs defaultValue="agendadas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="agendadas">
            Agendadas ({agendadas.length})
          </TabsTrigger>
          <TabsTrigger value="concluidas">
            Concluídas ({concluidas.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="agendadas" className="space-y-4">
          {agendadas.length > 0 ? (
            agendadas.map((consultation) => (
              <ConsultationCard key={consultation.id} consultation={consultation} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Nenhuma consulta agendada</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="concluidas" className="space-y-4">
          {concluidas.length > 0 ? (
            concluidas.map((consultation) => (
              <ConsultationCard key={consultation.id} consultation={consultation} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Nenhuma consulta concluída</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgendaPreVenda;
