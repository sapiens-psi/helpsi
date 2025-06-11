import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PulsatingButton } from '@/components/magicui/pulsating-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Ticket } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useCreateConsultation } from '@/hooks/useSchedule';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/helpsilogo.png';
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
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const location = useLocation();
  const [selectedType, setSelectedType] = useState<'pos-compra' | 'pre-compra' | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [description, setDescription] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [validatedCoupon, setValidatedCoupon] = useState<Coupon | null>(null);
  const [isCouponValidating, setIsCouponValidating] = useState(false);

  const { mutateAsync: createConsultation, isPending: isScheduling } = useCreateConsultation();

  const queryClient = useQueryClient();

  const validateCouponMutation = useMutation<Coupon, Error, string>({
    mutationFn: async (code) => {
      setIsCouponValidating(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (error) {
        throw new Error('Cupom inválido ou não encontrado.');
      }
      if (!data.is_active) {
        throw new Error('Cupom inativo.');
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('Cupom expirado.');
      }
      if (data.usage_limit !== null && data.current_usage_count >= data.usage_limit) {
        throw new Error('Cupom esgotado.');
      }

      // Check individual usage limit (if applicable, for future)
      // This requires tracking user's past coupon usage, which is not implemented yet.
      // For now, validation coupons have individual_usage_limit: 1 set in DB schema.
      // Discount coupons could have higher.

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

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

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

    let duration = selectedType === 'pos-compra' ? 15 : 30;
    let finalCouponCode = validatedCoupon?.code || null;
    let finalCouponId = validatedCoupon?.id || null;

    if (validatedCoupon && validatedCoupon.type === 'validation' && selectedType === 'pos-compra') {
      duration = 15; // Ensure 15 minutes for validation coupons on pos-compra
      toast.info('Cupom de validação aplicado: consulta de 15 minutos gratuita.');
    } else if (validatedCoupon && validatedCoupon.type === 'discount') {
      // Implement discount logic here for pricing.
      // For now, just a placeholder. The current system assumes consultations have fixed prices.
      // If prices become dynamic, this is where discount calculations would happen.
      toast.info(`Cupom de desconto aplicado: ${validatedCoupon.value}${validatedCoupon.discount_type === 'percentage' ? '%' : ' R$'}.`);
    }

    try {
      await createConsultation({
        client_id: user.id,
        type: selectedType,
        scheduled_date: selectedDate,
        scheduled_time: selectedTime,
        description,
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
    <div className="min-h-screen bg-gradient-to-br from-[#7b2ff2] via-[#f357a8] to-[#0a223a] flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center">
            <img src={logo} alt="Helpsi Logo" className="h-16 w-auto" />
          </div>
        </div>
        {/* Centralizar links principais */}
        <div className="flex-1 flex justify-center gap-8 items-center text-white font-medium">
          <Link to="/" className={`hover:text-pink-300 transition ${location.pathname === '/' ? 'lamp-effect' : ''}`}>Home</Link>
          <Link to="/about" className={`hover:text-pink-300 transition ${location.pathname === '/about' ? 'lamp-effect' : ''}`}>Sobre</Link>
          <Link to="/contact" className={`hover:text-pink-300 transition ${location.pathname === '/contact' ? 'lamp-effect' : ''}`}>Contato</Link>
          {user && (
            <>
              <Link to="/schedule" className={`hover:text-pink-300 transition ${location.pathname === '/schedule' ? 'lamp-effect' : ''}`}>Agendar</Link>
              <Link to="/client-area" className={`hover:text-pink-300 transition ${location.pathname === '/client-area' ? 'lamp-effect' : ''}`}>Área do Cliente</Link>
            </>
          )}
        </div>
        {/* Botão de perfil/menu à direita */}
        <div className="flex gap-4 items-center">
          {!user ? (
            <>
              <Link to="/auth">
                <button className="px-4 py-2 rounded-lg bg-white/80 text-pink-500 font-bold hover:bg-white">Login</button>
              </Link>
              <Link to="/auth">
                <button className="px-4 py-2 rounded-lg bg-pink-400 text-white font-bold hover:bg-pink-500">Cadastrar</button>
              </Link>
            </>
          ) :
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <PulsatingButton
                  pulseColor="#f472b6"
                  className="bg-white/80 text-pink-500 font-bold hover:bg-white"
                >
                  {profile?.full_name || 'Perfil'}
                </PulsatingButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {profile?.role === 'admin' ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Painel Administrativo</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>Sair</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/client-area">Área do Cliente</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>Sair</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          }
        </div>
      </nav>

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
                    onClick={() => setSelectedType('pos-compra')}
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
                    onClick={() => setSelectedType('pre-compra')}
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

              {selectedType && (
                <Card className="border-pink-100 shadow-lg bg-white/90">
                  <CardHeader>
                    <CardTitle className="text-pink-500">Descreva sua situação</CardTitle>
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
                      className="min-h-32 border-gray-200 focus:border-pink-500"
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Coupon Section */}
            <Card className="border-blue-100 shadow-lg bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-500">
                  <Ticket className="mr-2 h-5 w-5 text-blue-500" />
                  Possui um Cupom?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="couponCode">Código do Cupom</Label>
                  <Input
                    id="couponCode"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Digite seu cupom aqui"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <Button 
                  onClick={handleApplyCoupon}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isCouponValidating}
                >
                  {isCouponValidating ? 'Validando...' : 'Aplicar Cupom'}
                </Button>
                {validatedCoupon && (
                  <div className="mt-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md">
                    Cupom \'{validatedCoupon.code}\' aplicado! {validatedCoupon.type === 'validation' ? 'Ganhe 15 minutos gratuitos.' : `Desconto de ${validatedCoupon.value}${validatedCoupon.discount_type === 'percentage' ? '%' : ' R$'}.`}
                  </div>
                )}
                {validatedCoupon === null && couponCode !== '' && !isCouponValidating && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
                    Cupom inválido ou não aplicável.
                  </div>
                )}
              </CardContent>
            </Card>

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
                      <input
                        id="date"
                        type="date"
                        min={getMinDate()}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-pink-500"
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
                                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                                  : 'border-gray-200 hover:border-pink-300'
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
                          {selectedType === 'pos-compra' ? '15 minutos' : '30 minutos'}
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

          <div className="flex-1 flex justify-center items-center">
            <div className="relative w-full max-w-md h-auto">
              <img src={logo} alt="Helpsi Logo" className="h-16 w-auto mx-auto" />
            </div>
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
