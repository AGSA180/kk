/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeeklyCategory {
  id: string;
  name: string;
  weeklyAllocation: number; // المخصص الأسبوعي للبند
  spent: number;            // ما تم صرفه هذا الأسبوع
  icon: string;             // الأيقونة
  color: string;            // لون التمييز
}

export interface WeeklyExpense {
  id: string;
  date: string;
  amount: number;
  description: string;
  categoryId: string;
  categoryName: string;
  timestamp: number;
  imageUrl?: string;
  remainingAfter?: number;  // الباقي من مخصص البند بعد العملية
  source?: 'manual' | 'sms' | 'camera' | 'upload';
  rawSmsText?: string;
}

export interface WeeklyAppData {
  weekName: string;
  daysLeftInWeek: number;
  categories: WeeklyCategory[];
  expenses: WeeklyExpense[];
  aiReport?: string;
  aiReportTimestamp?: number;
}

// Backwards compatibility types
export type Frequency = 'monthly' | 'weekly' | 'days_interval';

export interface Commitment {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  intervalDays?: number;
  monthlyEquivalent: number;
  category: 'loan' | 'debt' | 'bills' | 'living' | 'fuel' | 'savings' | 'other';
  dueDateDay?: number;
  icon?: string;
  isPaidThisMonth?: boolean;
}

export interface Envelope {
  id: string;
  name: string;
  allocatedMonthly: number;
  spentAmount: number;
  icon: string;
  color: string;
  cyclePeriod?: 'weekly' | 'monthly';
  weeklyTarget?: number;
  description?: string;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  description: string;
  envelopeId: string;
  envelopeName: string;
  timestamp: number;
  imageUrl?: string;
  remainingAfter?: number;
}

export interface FuelSettings {
  cycleDays: number;
  amountPerRefuel: number;
  lastRefuelDate: string;
  monthlyBudget: number;
  totalSpentThisMonth: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  icon: string;
  note?: string;
}

export interface SmartAlert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  title: string;
  message: string;
  timeLabel?: string;
  actionText?: string;
}

export interface AppData {
  salary: number;
  monthCycleStartDay: number;
  weekRemainingDays: number;
  daysRemainingInMonth: number;
  commitments: Commitment[];
  envelopes: Envelope[];
  expenses: Expense[];
  fuelSettings: FuelSettings;
  savingsGoals: SavingsGoal[];
}
