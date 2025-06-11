
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Coupon } from '@/types/supabase';

export function useDiscountCoupons() {
  return useQuery({
    queryKey: ['discountCoupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('type', 'discount')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Coupon[];
    }
  });
}

export function useValidationCoupons() {
  return useQuery({
    queryKey: ['validationCoupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('type', 'validation')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Coupon[];
    }
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (couponData: Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'current_usage_count'>) => {
      const { data, error } = await supabase
        .from('coupons')
        .insert(couponData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      const queryKey = variables.type === 'discount' ? 'discountCoupons' : 'validationCoupons';
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success(`Cupom ${variables.type === 'discount' ? 'de desconto' : 'de validação'} criado com sucesso!`);
    },
    onError: (error: any) => {
      toast.error('Erro ao criar cupom: ' + error.message);
    }
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (couponData: Partial<Coupon> & { id: string }) => {
      const { id, ...updateData } = couponData;
      const { data, error } = await supabase
        .from('coupons')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const queryKey = data.type === 'discount' ? 'discountCoupons' : 'validationCoupons';
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success('Cupom atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar cupom: ' + error.message);
    }
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'discount' | 'validation' }) => {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, type };
    },
    onSuccess: (data) => {
      const queryKey = data.type === 'discount' ? 'discountCoupons' : 'validationCoupons';
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success('Cupom excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir cupom: ' + error.message);
    }
  });
}
