import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Save } from 'lucide-react';

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

const ValidationCoupons = () => {
  const queryClient = useQueryClient();
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    type: 'validation',
    is_active: true,
    individual_usage_limit: 1, // Validation coupons are typically single-use per user
    min_purchase_amount: 0, // Not applicable for validation coupons
    value: 0, // Value is implicitly 15 minutes for validation coupons
    discount_type: null, // Not applicable for validation coupons
  });
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const { data: coupons, isLoading, error } = useQuery<Coupon[]>({ 
    queryKey: ['validationCoupons'],
    queryFn: async () => {
      const { data, error } = await supabase.from('coupons').select('*').eq('type', 'validation');
      if (error) throw error;
      return data;
    }
  });

  const createCouponMutation = useMutation<any, Error, Partial<Coupon>>({
    mutationFn: async (couponData) => {
      const { data, error } = await supabase.from('coupons').insert(couponData).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validationCoupons'] });
      toast.success('Cupom de validação criado com sucesso!');
      setNewCoupon({
        type: 'validation',
        code: '',
        is_active: true,
        individual_usage_limit: 1,
        min_purchase_amount: 0,
        value: 0,
        discount_type: null,
        expires_at: null,
        usage_limit: null,
      });
    },
    onError: (err) => {
      toast.error('Erro ao criar cupom: ' + err.message);
    }
  });

  const updateCouponMutation = useMutation<any, Error, Coupon>({
    mutationFn: async (couponData) => {
      const { data, error } = await supabase.from('coupons').update(couponData).eq('id', couponData.id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validationCoupons'] });
      toast.success('Cupom de validação atualizado com sucesso!');
      setEditingCoupon(null);
    },
    onError: (err) => {
      toast.error('Erro ao atualizar cupom: ' + err.message);
    }
  });

  const deleteCouponMutation = useMutation<any, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validationCoupons'] });
      toast.success('Cupom de validação excluído com sucesso!');
    },
    onError: (err) => {
      toast.error('Erro ao excluir cupom: ' + err.message);
    }
  });

  const handleCreateCoupon = () => {
    if (!newCoupon.code) {
      toast.error('Por favor, preencha o código do cupom.');
      return;
    }
    createCouponMutation.mutate(newCoupon);
  };

  const handleUpdateCoupon = (coupon: Coupon) => {
    if (!coupon.code) {
      toast.error('Por favor, preencha o código do cupom.');
      return;
    }
    updateCouponMutation.mutate(coupon);
  };

  const handleDeleteCoupon = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cupom?')) {
      deleteCouponMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Carregando cupons de validação...</div>;
  if (error) return <div>Erro ao carregar cupons: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gerenciar Cupons de Validação</h1>

      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Cupom de Validação</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código do Cupom</Label>
            <Input
              id="code"
              value={newCoupon.code || ''}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
              placeholder="EX: CUPOMGRATIS"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expires_at">Data de Expiração (Opcional)</Label>
            <Input
              id="expires_at"
              type="datetime-local"
              value={newCoupon.expires_at || ''}
              onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usage_limit">Limite de Uso Total (Opcional)</Label>
            <Input
              id="usage_limit"
              type="number"
              value={newCoupon.usage_limit === null || newCoupon.usage_limit === undefined ? '' : newCoupon.usage_limit}
              onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: parseInt(e.target.value) || null })}
              placeholder="EX: 100"
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
          <Button onClick={handleCreateCoupon} disabled={createCouponMutation.isPending}>
            {createCouponMutation.isPending ? 'Criando...' : <><Plus className="mr-2 h-4 w-4" /> Criar Cupom</>}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cupons de Validação Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ativo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expira Em</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usos/Limite</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons?.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCoupon?.id === coupon.id ? (
                        <Input
                          value={editingCoupon.code}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                        />
                      ) : (
                        coupon.code
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCoupon?.id === coupon.id ? (
                        <Switch
                          checked={editingCoupon.is_active}
                          onCheckedChange={(checked) => setEditingCoupon({ ...editingCoupon, is_active: checked })}
                        />
                      ) : (
                        coupon.is_active ? 'Sim' : 'Não'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCoupon?.id === coupon.id ? (
                        <Input
                          type="datetime-local"
                          value={editingCoupon.expires_at || ''}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, expires_at: e.target.value })}
                        />
                      ) : (
                        coupon.expires_at ? new Date(coupon.expires_at).toLocaleString() : 'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {coupon.current_usage_count}/{coupon.usage_limit || '∞'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingCoupon?.id === coupon.id ? (
                        <Button onClick={() => handleUpdateCoupon(editingCoupon)} className="mr-2" size="sm" disabled={updateCouponMutation.isPending}>
                          {updateCouponMutation.isPending ? 'Salvando...' : <Save className="h-4 w-4" />}
                        </Button>
                      ) : (
                        <Button onClick={() => setEditingCoupon(coupon)} className="mr-2" variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button onClick={() => handleDeleteCoupon(coupon.id)} variant="destructive" size="sm" disabled={deleteCouponMutation.isPending}>
                        {deleteCouponMutation.isPending ? 'Excluindo...' : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidationCoupons; 