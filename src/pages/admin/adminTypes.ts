export type UserRow = {
  id: string;
  email: string;
  name: string;
  plan: string;
  is_admin: boolean;
  banned?: boolean;
  email_verified_at?: string | null;
  created_at: string;
  updated_at?: string;
  total_paid_inr?: number | string;
  total_paid_usd?: number | string;
  requests_24h?: number;
};

export type UserDetail = {
  user: UserRow & { api_key: string; ip_address?: string | null; last_login_at?: string | null };
  summary: {
    totalRequests: number;
    tokensIn: number;
    tokensOut: number;
    requests24h: number;
  };
  payments: Array<{
    id: number;
    plan: string;
    amount: number;
    currency?: string;
    payment_id: string;
    order_id: string;
    status: string;
    created_at: string;
  }>;
  usage: Array<{
    id: number;
    action: string;
    model: string | null;
    tokens_in: number;
    tokens_out: number;
    status?: string;
    request_ms?: number;
    created_at: string;
  }>;
};

export type ActivityRow = {
  id: string;
  email: string;
  name: string;
  action: string;
  timestamp: string;
  ip_address?: string;
};

export type IPSession = {
  id: string;
  email: string;
  name: string;
  ip_address: string;
  request_count: number;
  last_login_at?: string;
  last_activity?: string;
};

export type PaymentRow = {
  id: number;
  user_id: string;
  email: string;
  name: string;
  amount: number;
  plan: string;
  payment_id: string;
  currency?: string;
  status?: string;
  created_at: string;
};

export type TeamMemoryRow = {
  id: number;
  scope: string;
  policy_name: string;
  policy_text: string;
  is_active: boolean;
  status?: string;
  priority?: number;
  version?: number;
};
