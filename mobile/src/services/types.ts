export type FinancialType = 'receita' | 'despesa';

export type User = {
  id: number;
  name: string;
  email: string;
};

export type LoginResponse = {
  message: string;
  user: User;
};

export type FinancialProfile = {
  id: number;
  user_id: number;
  monthly_income: string | number;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: number;
  user_id: number;
  name: string;
  category_type: FinancialType | 'income' | 'expense';
  created_at: string;
};

export type Entry = {
  id: number;
  user_id: number;
  category_id: number | null;
  description: string;
  amount: string | number;
  entry_type: FinancialType | 'income' | 'expense';
  entry_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
