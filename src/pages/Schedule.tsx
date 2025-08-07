
import React, { useState, useEffect } from 'react';
import { ModernNavbar } from '@/components/ModernNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PulsatingButton } from '@/components/magicui/pulsating-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Ticket } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useAvailableSlots, useCreateConsultation } from '@/hooks/useSchedule';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Coupon {
  id: string;
  code: string;
  type: 'discount' | 'validation';
  discount_type: 'percentage' | 'fixed_amount' | null;
  value: number;
  is_active: boolean;
  expires_at: string | null;
  usage_limit: number | null;
  current_usage_count: number;
  individual_usage_limit: number;
  min_purchase_amount: number;
}

const Schedule = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [selectedType, setSelectedType] = useState<'pos-compra' | 'pre-compra' | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [description, setDescription] = useState('');
  // Campos específicos para pós-compra
  const [materialName, setMaterialName] = useState('');
  const [materialDoubt, setMaterialDoubt] = useState('');
  // Campo específico para pré-compra
  const [situationType, setSituationType] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [validatedCoupon, setValidatedCoupon] = useState<Coupon | null>(null);
  const [isCouponValidating, setIsCouponValidating] = useState(false);
  // Use the new hook for available slots
  const { data: availableSlotsData, isLoading: loadingSlots } = useAvailableSlots(
    selectedDate, 
    selectedType || 'pos-compra'
  );
  const availableSlots = availableSlotsData?.slots || [];
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [loadingDays, setLoadingDays] = useState(false);
  const [consultationDuration, setConsultationDuration] = useState<{preCompra: number, posCompra: number}>({preCompra: 30, posCompra: 15});

const { mutateAsync: createConsultation, isPending: isScheduling } = useCreateConsultation();

  // Função para buscar configurações de duração
  const fetchConsultationDurations = async () => {
    try {
      // Buscar configuração pré-compra
      const { data: preCompraConfig } = await supabase
        .from('schedule_config_pre_compra')
        .select('duracaoConsulta')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Buscar configuração pós-compra
      const { data: posCompraConfig } = await supabase
        .from('schedule_config_pos_compra')
        .select('duracaoConsulta')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setConsultationDuration({
        preCompra: preCompraConfig?.duracaoConsulta || 30,
        posCompra: posCompraConfig?.duracaoConsulta || 15
      });
    } catch (error) {
      console.error('Erro ao buscar configurações de duração:', error);
      // Manter valores padrão em caso de erro
    }
   };

  const queryClient = useQueryClient();

  const validateCouponMutation = useMutation<Coupon, Error, string>({
    mutationFn: async (code) => {
      setIsCouponValidating(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('type', 'validation') // Apenas cupons de validação
        .single();

      if (error) {
        throw new Error('Cupom de validação inválido ou não encontrado.');
      }
      if (!data.is_active) {
        throw new Error('Cupom de validação inativo.');
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('Cupom de validação expirado.');
      }
      if (data.usage_limit !== null && data.current_usage_count >= data.usage_limit) {
        throw new Error('Cupom de validação esgotado.');
      }

      // Verificar se é realmente um cupom de validação
      if (data.type !== 'validation') {
        throw new Error('Apenas cupons de validação são aceitos para agendamento.');
      }

      // Verificar uso individual por usuário
      if (user?.id && data.individual_usage_limit > 0) {
        // Buscar uso em ambas as tabelas
        const { data: preCompraUsage, error: preCompraError } = await supabase
          .from('consultations_pre_compra')
          .select('id')
          .eq('client_id', user.id)
          .eq('coupon_id', data.id);

        const { data: posCompraUsage, error: posCompraError } = await supabase
          .from('consultations_pos_compra')
          .select('id')
          .eq('client_id', user.id)
          .eq('coupon_id', data.id);

        if (preCompraError || posCompraError) {
          throw new Error('Erro ao verificar histórico de uso do cupom.');
        }

        const currentUserUsage = (preCompraUsage?.length || 0) + (posCompraUsage?.length || 0);
        if (currentUserUsage >= data.individual_usage_limit) {
          throw new Error(`Você já utilizou este cupom o máximo de ${data.individual_usage_limit} vez(es) permitida(s).`);
        }
      }

      return data as Coupon;
    },
    onSuccess: (data) => {
      setValidatedCoupon(data);
      toast.success(`Cupom \'${data.code}\' validado com sucesso!`);
    },
    onError: (err: any) => {
      setValidatedCoupon(null);
      toast.error('Erro ao validar cupom: ' + err.message);
    },
    onSettled: () => {
      setIsCouponValidating(false);
    }
  });

  // Função para buscar dias disponíveis
  const fetchAvailableDays = async () => {
    if (!selectedType) return;
    
    setLoadingDays(true);
    try {
      const scheduleType = selectedType === 'pos-compra' ? 'pos_compra' : 'pre_compra';
      const today = new Date().toISOString().split('T')[0];
      const twoMonthsLater = new Date();
      twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);
      const endDate = twoMonthsLater.toISOString().split('T')[0];
      
      const { data, error } = await supabase.functions.invoke('get-available-days', {
        body: { 
          scheduleType,
          startDate: today,
          endDate: endDate
        }
      });
      
      if (error) throw error;
      
      const days = data?.availableDays?.map((day: any) => day.available_date) || [];
      setAvailableDays(days);
    } catch (error: any) {
      console.error('Erro ao buscar dias disponíveis:', error);
      toast.error('Erro ao carregar dias disponíveis');
      setAvailableDays([]);
    } finally {
      setLoadingDays(false);
    }
  };

  // Removed fetchAvailableSlots function - now using useAvailableSlots hook
  
  // Effect para buscar dias disponíveis quando o tipo muda
  useEffect(() => {
    if (selectedType) {
      fetchAvailableDays();
      setSelectedDate(''); // Limpar data selecionada
      setSelectedTime(''); // Limpar horário selecionado
    } else {
      setAvailableDays([]);
    }
  }, [selectedType]);

  // Effect para limpar horário selecionado quando a data muda
  useEffect(() => {
    setSelectedTime(''); // Limpar horário selecionado quando a data muda
  }, [selectedDate]);

  // Effect para buscar configurações de duração quando o componente for montado
  useEffect(() => {
    fetchConsultationDurations();
  }, []);

  const handleApplyCoupon = () => {
    if (couponCode) {
      validateCouponMutation.mutate(couponCode);
    } else {
      toast.error('Por favor, insira um código de cupom.');
      setValidatedCoupon(null); // Clear any previously validated coupon
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !selectedDate || !selectedTime || !user?.id) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validação dos campos específicos por tipo
    if (selectedType === 'pos-compra') {
      if (!materialName.trim() || !materialDoubt.trim()) {
         toast.error('Por favor, preencha o nome do material psicológico e a descrição da dúvida.');
         return;
       }
      
      if (!validatedCoupon) {
        toast.error('É obrigatório usar um cupom de validação para agendar consultas pós-compra.');
        return;
      }

      // Verificar se o cupom é do tipo validação
      if (validatedCoupon.type !== 'validation') {
        toast.error('Apenas cupons de validação são aceitos para agendamento de consultas pós-compra.');
        return;
      }
    }

    if (selectedType === 'pre-compra') {
      if (!situationType.trim()) {
        toast.error('Por favor, descreva o tipo de situação para qual você está buscando material psicológico.');
        return;
      }
    }

    let duration = selectedType === 'pos-compra' ? consultationDuration.posCompra : consultationDuration.preCompra;
    let finalCouponCode = validatedCoupon?.code || null;
    let finalCouponId = validatedCoupon?.id || null;

    if (validatedCoupon && validatedCoupon.type === 'validation' && selectedType === 'pos-compra') {
      duration = consultationDuration.posCompra; // Use configured duration for validation coupons on pos-compra
      toast.info('Cupom de validação aplicado: consulta gratuita.');
    } else if (validatedCoupon && validatedCoupon.type !== 'validation') {
      // Implement discount logic here for pricing.
      // For now, just a placeholder. The current system assumes consultations have fixed prices.
      // If prices become dynamic, this is where discount calculations would happen.
      toast.info(`Cupom de desconto aplicado: ${validatedCoupon.value}${validatedCoupon.discount_type === 'percentage' ? '%' : ' R$'}.`);
    }

    // Preparar descrição baseada no tipo de atendimento
    let finalDescription = '';
    if (selectedType === 'pos-compra') {
      finalDescription = `Material: ${materialName}\n\nDúvida: ${materialDoubt}`;
    } else if (selectedType === 'pre-compra') {
      finalDescription = `Tipo de situação: ${situationType}`;
    }

    try {
      await createConsultation({
        client_id: user.id,
        type: selectedType,
        scheduled_date: selectedDate,
        scheduled_time: selectedTime,
        description: finalDescription,
        duration_minutes: duration,
        coupon_code_used: finalCouponCode,
        coupon_id: finalCouponId
      });
      toast.success('Agendamento realizado com sucesso!');
      // Limpar formulário após agendamento
      setSelectedType(null);
      setSelectedDate('');
      setSelectedTime('');
      setDescription('');
      setMaterialName('');
      setMaterialDoubt('');
      setSituationType('');
      setCouponCode('');
      setValidatedCoupon(null);
    } catch (error: any) {
      toast.error('Erro ao agendar consulta: ' + (error.message || 'Verifique sua conexão ou tente novamente.'));
    }
  };

  const getMinDate = () => {
    const today = new Date();
    const minDays = selectedType === 'pos-compra' ? 7 : 3;
    const minDate = new Date(today.getTime() + minDays * 24 * 60 * 60 * 1000);
    return minDate.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <ModernNavbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg">
              Agendar Consulta
            </h1>
            <p className="text-pink-100 text-lg">
              Escolha o tipo de atendimento e selecione o melhor horário para você.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Type Selection */}
            <div className="space-y-6">
              <Card className="border-pink-100 shadow-lg bg-white/90">
                <CardHeader>
                  <CardTitle className="text-pink-500">Tipo de Atendimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedType === 'pos-compra'
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                    onClick={() => {
                      setSelectedType('pos-compra');
                      // Limpar cupom ao trocar de tipo
                      setCouponCode('');
                      setValidatedCoupon(null);
                      // Limpar campos específicos
                      setSituationType('');
                    }}
                  >
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-pink-500 mr-2" />
                      <h3 className="font-semibold text-gray-800">Pós-Compra (15min gratuitos)</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Suporte após sua compra. Disponível a partir de 7 dias após a data de compra.
                    </p>
                  </div>

                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedType === 'pre-compra'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => {
                      setSelectedType('pre-compra');
                      // Limpar cupom ao trocar de tipo
                      setCouponCode('');
                      setValidatedCoupon(null);
                      // Limpar campos específicos
                      setMaterialName('');
                      setMaterialDoubt('');
                    }}
                  >
                    <div className="flex items-center mb-2">
                      <User className="h-5 w-5 text-purple-500 mr-2" />
                      <h3 className="font-semibold text-gray-800">Auxílio Pré-Compra</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Orientação antes da compra. Agendamento com 3 dias de antecedência.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {selectedType === 'pos-compra' && (
                <Card className="border-pink-100 shadow-lg bg-white/90">
                   <CardHeader>
                     <CardTitle className="text-pink-500">Informações sobre o Material Psicológico</CardTitle>
                   </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                       <Label htmlFor="materialName">Nome do Material Psicológico *</Label>
                       <Input
                         id="materialName"
                         type="text"
                         value={materialName}
                         onChange={(e) => setMaterialName(e.target.value)}
                         placeholder="Digite o nome do material psicológico que você tem dúvida"
                         className="border-gray-200 focus:border-pink-500"
                         required
                       />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="materialDoubt">Descrição da Dúvida *</Label>
                      <Textarea
                        id="materialDoubt"
                        value={materialDoubt}
                        onChange={(e) => setMaterialDoubt(e.target.value)}
                        placeholder="Descreva detalhadamente sua dúvida sobre o material"
                        className="min-h-32 border-gray-200 focus:border-pink-500"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedType === 'pre-compra' && (
                <Card className="border-pink-100 shadow-lg bg-white/90">
                  <CardHeader>
                    <CardTitle className="text-pink-500">Tipo de Situação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="situationType">Descreva o tipo de situação *</Label>
                       <Textarea
                         id="situationType"
                         value={situationType}
                         onChange={(e) => setSituationType(e.target.value)}
                         placeholder="Descreva para qual tipo de situação você está buscando material psicológico (ex: ansiedade, depressão, terapia de casal, etc.)"
                         className="min-h-32 border-gray-200 focus:border-pink-500"
                         required
                       />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Coupon Section - Only for pos-compra */}
            {selectedType === 'pos-compra' && (
              <Card className="border-red-100 shadow-lg bg-white/90">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-500">
                    <Ticket className="mr-2 h-5 w-5 text-red-500" />
                    Cupom de Validação (Obrigatório) *
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="mb-3 p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md text-sm">
                    <strong>Atenção:</strong> É obrigatório usar um cupom de validação para agendar consultas pós-compra. Apenas cupons do tipo "validação" são aceitos.
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="couponCode">Código do Cupom de Validação *</Label>
                    <Input
                      id="couponCode"
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Digite seu cupom de validação aqui"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>
                  <Button 
                    onClick={handleApplyCoupon}
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isCouponValidating}
                  >
                    {isCouponValidating ? 'Validando...' : 'Aplicar Cupom de Validação'}
                  </Button>
                  {validatedCoupon && (
                    <div className="mt-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md">
                      ✅ Cupom de validação '{validatedCoupon.code}' aplicado com sucesso! {validatedCoupon.type === 'validation' ? 'Agora você pode agendar sua consulta.' : `Desconto de ${validatedCoupon.value}${validatedCoupon.discount_type === 'percentage' ? '%' : ' R$'}.`}
                    </div>
                  )}
                  {validatedCoupon === null && couponCode !== '' && !isCouponValidating && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
                      ❌ Cupom inválido, expirado ou não é um cupom de validação. Verifique o código e tente novamente.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Date and Time Selection */}
            {selectedType && (
              <div className="space-y-6">
                <Card className="border-pink-100 shadow-lg bg-white/90">
                  <CardHeader>
                    <CardTitle className="flex items-center text-pink-500">
                      <Calendar className="mr-2 h-5 w-5 text-pink-500" />
                      Selecionar Data e Horário
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Data</Label>
                      {loadingDays ? (
                        <div className="text-center py-4 text-gray-500">
                          Carregando dias disponíveis...
                        </div>
                      ) : availableDays.length > 0 ? (
                        <select
                          id="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-pink-500"
                        >
                          <option value="">Selecione uma data disponível</option>
                          {availableDays
                            .filter(date => date >= getMinDate())
                            .map((date, index) => (
                              <option key={`date-${date}-${index}`} value={date}>
                                {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </option>
                            ))
                          }
                        </select>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          Nenhum dia disponível para agendamento no período.
                        </div>
                      )}
                    </div>

                    {selectedDate && (
                      <div className="space-y-2">
                        <Label>Horários Disponíveis</Label>
                        {loadingSlots ? (
                          <div className="text-center py-4 text-gray-500">
                            Carregando horários disponíveis...
                          </div>
                        ) : availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map((slot, index) => {
                              const slotTime = slot.time || slot.slot_time;
                              const displayTime = slot.displayTime || slot.display_time;
                              const availableSpots = slot.availableSpots || slot.available_spots;
                              const maxConsultations = slot.maxConsultations || slot.max_consultations;
                              
                              return (
                                <button
                                  key={`slot-${slotTime}-${index}`}
                                  type="button"
                                  onClick={() => setSelectedTime(slotTime)}
                                  className={`p-2 text-sm border rounded transition-all ${
                                    selectedTime === slotTime
                                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                                      : 'border-gray-200 hover:border-pink-300'
                                  } relative`}
                                  title={`${availableSpots} vaga(s) disponível(is)`}
                                >
                                  <div>{displayTime}</div>
                                  <div className="text-xs text-gray-500">
                                    {availableSpots}/{maxConsultations}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            Nenhum horário disponível para esta data.
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedDate && selectedTime && (
                  <Card className="border-purple-100 shadow-lg bg-white/90">
                    <CardHeader>
                      <CardTitle className="text-purple-500">Resumo do Agendamento</CardTitle>
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
                          {selectedType === 'pos-compra' ? `${consultationDuration.posCompra} minutos` : `${consultationDuration.preCompra} minutos`}
                        </span>
                      </div>
                      
                      <Button 
                        onClick={handleSubmit}
                        className="w-full bg-purple-600 hover:bg-purple-700 mt-4"
                        disabled={isScheduling}
                      >
                        {isScheduling ? 'Agendando...' : 'Confirmar Agendamento'}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Nuvens rodapé */}
      <div className="w-full h-32 relative">
        <svg className="absolute bottom-0 left-0 w-full" height="100" viewBox="0 0 1440 100" fill="none">
          <path
            d="M0 40C360 80 1080 0 1440 40V100H0V40Z"
            fill="#fff"
            fillOpacity="0.7"
          />
        </svg>
      </div>
    </div>
  );
};

export default Schedule;
