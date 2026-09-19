import React, { useState } from 'react';
import { ShieldCheck, Home, Plus, Calendar, TrendingUp, CheckCircle, PiggyBank, Sparkles, DollarSign } from 'lucide-react';
import { SavingsGoal } from '../types';
import { calculateSavingsGoalTime } from '../utils/calculations';
import { parseArabicNumber } from '../utils/numberUtils';

interface SavingsGoalsManagerProps {
  savingsGoals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onDepositToGoal: (goalId: string, amount: number) => void;
}

export const SavingsGoalsManager: React.FC<SavingsGoalsManagerProps> = ({
  savingsGoals,
  onAddGoal,
  onDepositToGoal,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [note, setNote] = useState('');

  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('1000');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseArabicNumber(targetAmount);
    if (!name || target <= 0) return;

    onAddGoal({
      name,
      targetAmount: target,
      currentAmount: parseArabicNumber(currentAmount) || 0,
      monthlyContribution: parseArabicNumber(monthlyContribution) || 500,
      icon: 'Home',
      note: note || undefined,
    });

    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setMonthlyContribution('');
    setNote('');
    setShowAddForm(false);
  };

  const handleDeposit = (goalId: string) => {
    const val = parseArabicNumber(depositAmount);
    if (val > 0) {
      onDepositToGoal(goalId, val);
      setDepositGoalId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>🏠 أهداف الادخار وحماية المستقبل</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Tajawal']">
            تأمين البيت والأهداف المالية الذاتية
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            تُحتسب مخصصات الادخار مسبقاً وتُستقطع من الراتب، لتعرف بدقة متى تصل لهدفك دون التضحية بمصروفك اليومي.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'إلغاء' : 'إضافة هدف جديد'}</span>
        </button>
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-6 border-2 border-emerald-500/30 shadow-md space-y-4 animate-in fade-in duration-200"
        >
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>إضافة هدف ادخار مالي</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الهدف</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: تأمين البيت، صيانة السيارة، طوارئ..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المستهدف (ريال)</label>
              <input
                type="number"
                required
                min="100"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="مثال: 10000"
                className="w-full text-sm font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ الموجود حالياً (ريال)</label>
              <input
                type="number"
                min="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="مثال: 3000"
                className="w-full text-sm font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الادخار الشهري المخصص (ريال)</label>
              <input
                type="number"
                required
                min="50"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                placeholder="مثال: 1000"
                className="w-full text-sm font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
            >
              حفظ الهدف
            </button>
          </div>
        </form>
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savingsGoals.map((goal) => {
          const stats = calculateSavingsGoalTime(goal);

          return (
            <div
              key={goal.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700">
                      <Home className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900 font-['Tajawal']">
                        🏠 {goal.name}
                      </h3>
                      {goal.note && <p className="text-xs text-slate-500">{goal.note}</p>}
                    </div>
                  </div>

                  <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {stats.percent}%
                  </span>
                </div>

                {/* The 4 numbers requested in Section 7 */}
                <div className="grid grid-cols-3 gap-2 my-5 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-400 block font-semibold mb-0.5">الهدف</span>
                    <span className="font-['Tajawal'] text-lg font-black text-slate-900">
                      {goal.targetAmount.toLocaleString('ar-SA')}
                    </span>
                    <span className="text-[10px] text-slate-500 block">ريال</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                    <span className="text-xs text-emerald-700 block font-semibold mb-0.5">الموجود</span>
                    <span className="font-['Tajawal'] text-lg font-black text-emerald-800">
                      {goal.currentAmount.toLocaleString('ar-SA')}
                    </span>
                    <span className="text-[10px] text-emerald-600 block">ريال</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-400 block font-semibold mb-0.5">المتبقي</span>
                    <span className="font-['Tajawal'] text-lg font-black text-slate-700">
                      {stats.remaining.toLocaleString('ar-SA')}
                    </span>
                    <span className="text-[10px] text-slate-500 block">ريال</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${stats.percent}%` }}
                  />
                </div>

                {/* Expected completion callout */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-800 block font-medium">
                      ادخار {goal.monthlyContribution.toLocaleString('ar-SA')} ريال شهرياً
                    </span>
                    <strong className="text-sm font-extrabold text-emerald-950 block mt-0.5">
                      متوقع الوصول للهدف: بعد {stats.monthsLeft} أشهر
                    </strong>
                  </div>
                  <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>
              </div>

              {/* Quick Deposit Action */}
              <div className="pt-2 border-t border-slate-100">
                {depositGoalId === goal.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="المبلغ"
                      className="w-28 text-sm font-bold px-3 py-2 rounded-xl border border-emerald-500 focus:outline-hidden"
                    />
                    <button
                      onClick={() => handleDeposit(goal.id)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                    >
                      تأكيد الإيداع
                    </button>
                    <button
                      onClick={() => setDepositGoalId(null)}
                      className="py-2 px-3 rounded-xl bg-slate-100 text-slate-600 text-xs"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDepositGoalId(goal.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PiggyBank className="w-4 h-4 text-emerald-600" />
                    <span>إيداع مبلغ إضافي في الهدف</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
