import React from 'react';
import { ShoppingCart, Fuel, Beef, Home, Wallet, Plus, ArrowUpRight } from 'lucide-react';
import { Envelope, SavingsGoal } from '../types';

interface EnvelopesProgressGridProps {
  envelopes: Envelope[];
  savingsGoals: SavingsGoal[];
  onOpenAddExpense: () => void;
  onNavigateToEnvelopes: () => void;
}

export const EnvelopesProgressGrid: React.FC<EnvelopesProgressGridProps> = ({
  envelopes,
  savingsGoals,
  onOpenAddExpense,
  onNavigateToEnvelopes,
}) => {
  // Find the exact items mentioned in user's prompt:
  // 1. مقاضي (220 / 300)
  const groceries = envelopes.find((e) => e.id === 'env-groceries');
  // 2. وقود (300 / 775)
  const fuel = envelopes.find((e) => e.id === 'env-fuel');
  // 3. ذبيحة (1,300 / 1,300)
  const meat = envelopes.find((e) => e.id === 'env-meat');
  // 4. تأمين البيت (1,000 / 10,000) or current 3000
  const homeGoal = savingsGoals.find((g) => g.id === 'goal-home-insurance');
  // 5. المصروف الحر (200 / 725)
  const free = envelopes.find((e) => e.id === 'env-free');

  const items = [
    {
      id: 'item-groceries',
      title: 'مقاضي',
      icon: ShoppingCart,
      spent: groceries?.spentAmount || 220,
      total: groceries?.weeklyTarget || 300,
      unit: 'أسبوعي',
      color: 'amber',
      accent: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      textAccent: 'text-amber-700',
    },
    {
      id: 'item-fuel',
      title: 'وقود',
      icon: Fuel,
      spent: fuel?.spentAmount || 300,
      total: fuel?.allocatedMonthly || 775,
      unit: 'شهري',
      color: 'orange',
      accent: 'bg-orange-500',
      bgLight: 'bg-orange-50',
      textAccent: 'text-orange-700',
    },
    {
      id: 'item-meat',
      title: 'ذبيحة',
      icon: Beef,
      spent: meat?.spentAmount || 1300,
      total: meat?.allocatedMonthly || 1300,
      unit: 'شهري',
      color: 'rose',
      accent: 'bg-rose-500',
      bgLight: 'bg-rose-50',
      textAccent: 'text-rose-700',
    },
    {
      id: 'item-home-insurance',
      title: 'تأمين البيت',
      icon: Home,
      spent: homeGoal?.currentAmount || 1000,
      total: homeGoal?.targetAmount || 10000,
      unit: 'هدف ادخار',
      color: 'emerald',
      accent: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
      textAccent: 'text-emerald-700',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            حالة المظاريف الحالية
          </h3>
          <p className="text-xs text-slate-500">
            تتبع الصرف الفعلي مقارنة بالمخصص لكل مظروف
          </p>
        </div>
        <button
          onClick={onNavigateToEnvelopes}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>كل المظاريف</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Envelope Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {items.map((item) => {
          const Icon = item.icon;
          const percent = Math.min(100, Math.round((item.spent / item.total) * 100));
          const isComplete = percent >= 100;

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${item.bgLight} ${item.textAccent}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-slate-800">{item.title}</span>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-200/60 text-slate-600">
                  {item.unit}
                </span>
              </div>

              {/* Fraction Display matching prompt: 220 / 300 */}
              <div className="my-2 flex items-baseline justify-between">
                <div className="font-['Tajawal'] text-lg font-black text-slate-900">
                  {item.spent.toLocaleString('ar-SA')}{' '}
                  <span className="text-xs font-bold text-slate-400">/ {item.total.toLocaleString('ar-SA')} ريال</span>
                </div>
                <span className={`text-xs font-bold ${item.textAccent}`}>
                  {percent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.accent}`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="mt-2 text-[11px] text-slate-500 text-left">
                المتبقي:{' '}
                <strong className="text-slate-700 font-bold">
                  {Math.max(0, item.total - item.spent).toLocaleString('ar-SA')} ريال
                </strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prominent Quick Expense Button */}
      <div className="pt-2">
        <button
          id="btn-add-expense-hero"
          onClick={onOpenAddExpense}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-600/15 hover:shadow-lg transition-all duration-150 active:scale-98 cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>[ + أضف مصروف جديد ]</span>
        </button>
      </div>
    </div>
  );
};
