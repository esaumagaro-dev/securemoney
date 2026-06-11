export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role?: string;
  mfa_enabled: boolean;
  created_at: string;
}

export interface Wallet {
  wallet_id: string;
  currency: string;
  balance: string;
}

export interface Transaction {
  id: string;
  from_wallet_id?: string;
  to_wallet_id?: string;
  amount: string;
  currency: string;
  type: string;
  status: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  message: string;
  resource_id?: string;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  ip: string;
  created_at: string;
}

export interface Analytics {
  total_users: number;
  total_transactions: number;
  total_wallets: number;
  recent_users: { id: string; email: string; created_at: string }[];
}

export interface Role {
  id: string;
  name: string;
  permissions: Record<string, any>;
}
