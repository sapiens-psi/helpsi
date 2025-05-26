
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User } from 'lucide-react';

const Schedule = () => {
  const [selectedType, setSelectedType] = useState<'pos-compra' | 'pre-compra' | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [description, setDescription] = useState('');

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Scheduling:', { selectedType, selectedDate, selectedTime, description });
    // Implementar lógica de agendamento
  };

  const getMinDate = () => {
    const today = new Date();
    const minDays = selectedType === 'pos-compra' ? 7 : 3;
    const minDate = new Date(today.getTime() + minDays * 24 * 60 * 60 * 1000);
    return minDate.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            ConsultaPro
          </Link>
          <Link to="/client-area">
            <Button variant="outline" className="border-blue-200 text-blue-600">
              Área do Cliente
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Agendar Consulta
            </h1>
            <p className="text-gray-600">
              Escolha o tipo de atendimento e selecione o melhor horário para você.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Type Selection */}
            <div className="space-y-6">
              <Card className="border-blue-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800">Tipo de Atendimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedType === 'pos-compra'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedType('pos-compra')}
                  >
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold text-gray-800">Pós-Compra (15min gratuitos)</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Suporte após sua compra. Disponível a partir de 7 dias após a data de compra.
                    </p>
                  </div>

                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedType === 'pre-compra'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => setSelectedType('pre-compra')}
                  >
                    <div className="flex items-center mb-2">
                      <User className="h-5 w-5 text-green-600 mr-2" />
                      <h3 className="font-semibold text-gray-800">Auxílio Pré-Compra</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Orientação antes da compra. Agendamento com 3 dias de antecedência.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {selectedType && (
                <Card className="border-blue-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Descreva sua situação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder={
                        selectedType === 'pos-compra'
                          ? 'Descreva suas dúvidas sobre o produto adquirido...'
                          : 'Conte-nos sobre sua situação e o que você está procurando...'
                      }
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-32 border-gray-200 focus:border-blue-500"
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Date and Time Selection */}
            {selectedType && (
              <div className="space-y-6">
                <Card className="border-blue-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-800">
                      <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                      Selecionar Data e Horário
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Data</Label>
                      <input
                        id="date"
                        type="date"
                        min={getMinDate()}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {selectedDate && (
                      <div className="space-y-2">
                        <Label>Horários Disponíveis</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {availableTimes.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedTime(time)}
                              className={`p-2 text-sm border rounded transition-all ${
                                selectedTime === time
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedDate && selectedTime && (
                  <Card className="border-green-100 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-green-600">Resumo do Agendamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">
                          {selectedType === 'pos-compra' ? 'Pós-Compra' : 'Auxílio Pré-Compra'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data:</span>
                        <span className="font-medium">
                          {new Date(selectedDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Horário:</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duração:</span>
                        <span className="font-medium">
                          {selectedType === 'pos-compra' ? '15 minutos' : '30 minutos'}
                        </span>
                      </div>
                      
                      <Button 
                        onClick={handleSubmit}
                        className="w-full bg-green-600 hover:bg-green-700 mt-4"
                      >
                        Confirmar Agendamento
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
