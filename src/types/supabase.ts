
export interface Coupon {
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
  created_at: string;
  updated_at: string;
}
