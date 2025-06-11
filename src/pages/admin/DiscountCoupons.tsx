
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useDiscountCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '@/hooks/useCoupons';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import type { Coupon } from '@/types/supabase';

const DiscountCoupons = () => {
  const { data: coupons, isLoading, error } = useDiscountCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'discount' as const,
    discount_type: 'percentage' as 'percentage' | 'fixed_amount',
    value: 0,
    is_active: true,
    expires_at: '',
    usage_limit: '',
    individual_usage_limit: 1,
    min_purchase_amount: 0,
  });

  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const handleCreateCoupon = () => {
    if (!newCoupon.code || !newCoupon.discount_type || newCoupon.value <= 0) {
      return;
    }

    createCoupon.mutate({
      code: newCoupon.code.toUpperCase(),
      type: 'discount',
      discount_type: newCoupon.discount_type,
      value: newCoupon.value,
      is_active: newCoupon.is_active,
      expires_at: newCoupon.expires_at || null,
      usage_limit: newCoupon.usage_limit ? parseInt(newCoupon.usage_limit) : null,
      individual_usage_limit: newCoupon.individual_usage_limit,
      min_purchase_amount: newCoupon.min_purchase_amount,
    });

    setNewCoupon({
      code: '',
      type: 'discount',
      discount_type: 'percentage',
      value: 0,
      is_active: true,
      expires_at: '',
      usage_limit: '',
      individual_usage_limit: 1,
      min_purchase_amount: 0,
    });
  };

  const handleUpdateCoupon = (coupon: Coupon) => {
    updateCoupon.mutate(coupon);
    setEditingCoupon(null);
  };

  const handleDeleteCoupon = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cupom?')) {
      deleteCoupon.mutate({ id, type: 'discount' });
    }
  };

  if (isLoading) return <div className="p-6">Carregando cupons de desconto...</div>;
  if (error) return <div className="p-6 text-red-600">Erro ao carregar cupons: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gerenciar Cupons de Desconto</h1>

      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Cupom de Desconto</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código do Cupom</Label>
            <Input
              id="code"
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
              placeholder="EX: DESCONTO10"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="discount_type">Tipo de Desconto</Label>
            <Select
              value={newCoupon.discount_type}
              onValueChange={(value: 'percentage' | 'fixed_amount') => 
                setNewCoupon({ ...newCoupon, discount_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                <SelectItem value="fixed_amount">Valor Fixo (R$)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">
              Valor {newCoupon.discount_type === 'percentage' ? '(%)' : '(R$)'}
            </Label>
            <Input
              id="value"
              type="number"
              min="0"
              step={newCoupon.discount_type === 'percentage' ? '1' : '0.01'}
              value={newCoupon.value}
              onChange={(e) => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) || 0 })}
              placeholder={newCoupon.discount_type === 'percentage' ? '10' : '50.00'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires_at">Data de Expiração (Opcional)</Label>
            <Input
              id="expires_at"
              type="datetime-local"
              value={newCoupon.expires_at}
              onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usage_limit">Limite de Uso Total (Opcional)</Label>
            <Input
              id="usage_limit"
              type="number"
              min="1"
              value={newCoupon.usage_limit}
              onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: e.target.value })}
              placeholder="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_purchase_amount">Valor Mínimo de Compra (R$)</Label>
            <Input
              id="min_purchase_amount"
              type="number"
              min="0"
              step="0.01"
              value={newCoupon.min_purchase_amount}
              onChange={(e) => setNewCoupon({ ...newCoupon, min_purchase_amount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={newCoupon.is_active}
              onCheckedChange={(checked) => setNewCoupon({ ...newCoupon, is_active: checked })}
            />
            <Label htmlFor="is_active">Ativo</Label>
          </div>
        </CardContent>
        
        <CardContent>
          <Button 
            onClick={handleCreateCoupon} 
            disabled={createCoupon.isPending || !newCoupon.code || !newCoupon.discount_type || newCoupon.value <= 0}
          >
            {createCoupon.isPending ? 'Criando...' : <><Plus className="mr-2 h-4 w-4" /> Criar Cupom</>}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cupons de Desconto Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          {!coupons || coupons.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum cupom de desconto encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expira</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCoupon?.id === coupon.id ? (
                          <Input
                            value={editingCoupon.code}
                            onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                            className="w-32"
                          />
                        ) : (
                          <span className="font-mono font-semibold">{coupon.code}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCoupon?.id === coupon.id ? (
                          <Select
                            value={editingCoupon.discount_type || ''}
                            onValueChange={(value: 'percentage' | 'fixed_amount') => 
                              setEditingCoupon({ ...editingCoupon, discount_type: value })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Porcentagem</SelectItem>
                              <SelectItem value="fixed_amount">Valor Fixo</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          coupon.discount_type === 'percentage' ? 'Porcentagem' : 'Valor Fixo'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCoupon?.id === coupon.id ? (
                          <Input
                            type="number"
                            value={editingCoupon.value}
                            onChange={(e) => setEditingCoupon({ ...editingCoupon, value: parseFloat(e.target.value) || 0 })}
                            className="w-24"
                          />
                        ) : (
                          <span className="font-semibold">
                            {coupon.discount_type === 'percentage' ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2)}`}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCoupon?.id === coupon.id ? (
                          <Switch
                            checked={editingCoupon.is_active}
                            onCheckedChange={(checked) => setEditingCoupon({ ...editingCoupon, is_active: checked })}
                          />
                        ) : (
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            coupon.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {coupon.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {coupon.current_usage_count}/{coupon.usage_limit || '∞'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCoupon?.id === coupon.id ? (
                          <Input
                            type="datetime-local"
                            value={editingCoupon.expires_at || ''}
                            onChange={(e) => setEditingCoupon({ ...editingCoupon, expires_at: e.target.value })}
                            className="w-44"
                          />
                        ) : (
                          <span className="text-sm text-gray-600">
                            {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('pt-BR') : 'Sem expiração'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {editingCoupon?.id === coupon.id ? (
                            <>
                              <Button 
                                onClick={() => handleUpdateCoupon(editingCoupon)} 
                                size="sm" 
                                disabled={updateCoupon.isPending}
                              >
                                {updateCoupon.isPending ? 'Salvando...' : <Save className="h-4 w-4" />}
                              </Button>
                              <Button 
                                onClick={() => setEditingCoupon(null)} 
                                variant="outline" 
                                size="sm"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                onClick={() => setEditingCoupon(coupon)} 
                                variant="outline" 
                                size="sm"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                onClick={() => handleDeleteCoupon(coupon.id)} 
                                variant="destructive" 
                                size="sm"
                                disabled={deleteCoupon.isPending}
                              >
                                {deleteCoupon.isPending ? 'Excluindo...' : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountCoupons;
