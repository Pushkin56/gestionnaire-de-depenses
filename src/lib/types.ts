
export type TransactionType = 'recette' | 'depense';

export interface UserProfile {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  type: TransactionType;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  currency: string;
  converted_amount?: number;
  converted_currency?: string;
  category_id?: string;
  date: string; // ISO date string e.g. "2023-10-26"
  description?: string;
  created_at: string;
  updated_at: string;
  category?: Category; // Optional: for populated data
}

export interface UserPreferences {
  id: string;
  user_id: string;
  primary_currency: string;
  created_at: string;
  updated_at: string;
}

// For mock auth context
export interface User {
  id: string;
  email: string;
  username: string;
  primary_currency?: string;
  aiBudgetAlertsEnabled?: boolean;
  aiForecastEnabled?: boolean;
  aiInsightsEnabled?: boolean; // Fusion des anciennes aiTrendAnalysisEnabled et aiHabitAnalysisEnabled
}

// Props for chart components
export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

export interface TimeSeriesDataPoint {
  date: string; // e.g., "Jan", "Feb", or full date for AreaChart
  value: number;
  value2?: number; // For charts with multiple series like balance (income/expense)
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  category_name: string;
  amount: number;
  currency: string; // e.g. EUR, USD
  currency_symbol: string; // e.g. €, $
  period: 'monthly' | 'weekly' | 'yearly';
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string;
  currency_symbol: string;
  billing_period: 'monthly' | 'yearly' | 'weekly';
  next_billing_date: string; // ISO date string e.g. "2023-10-26"
  category_id?: string; // Optional: link to an expense category
  category_name?: string; // Optional: for display
  created_at: string;
  updated_at: string;
}

export interface SavingGoal {
  id: string;
  user_id: string;
  name: string;
  emoji?: string; // Optional: for visual flair
  target_amount: number;
  current_amount: number;
  currency: string; // e.g. EUR, USD
  currency_symbol: string; // e.g. €, $
  target_date?: string | null; // Optional: ISO date string e.g. "2024-12-31"
  created_at: string;
  updated_at: string;
}

    