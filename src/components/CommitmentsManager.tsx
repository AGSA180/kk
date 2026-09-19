import React, { useState } from 'react';
import { Landmark, Plus, Trash2, Edit2, CheckCircle2, Circle, Calendar, Clock, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { Commitment, Frequency } from '../types';
import { calculateMonthlyEquivalent } from '../utils/calculations';
import { parseArabicNumber } from '../utils/numberUtils';

interface CommitmentsManagerProps {
  commitments: Commitment[];
  onAddCommitment: (commitment: Omit<Commitment, 'id' | 'monthlyEquivalent'>) => void;
  onDeleteCommitment: (id: string) => void;
  onTogglePaid: (id: string) => void;
}

export const CommitmentsManager: React.FC<CommitmentsManagerProps> = ({
  commitments,
  onAddCommitment,
  onDeleteCommitment,
  onTogglePaid,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [intervalDays, setIntervalDays] = useState('6');
  const [category, setCategory] = useState<Commitment['category']>('loan');
  const [dueDateDay, setDueDateDay] = useState('');

  const totalMonthlyCommitments = commitments.reduce(
    (sum, c) => sum + c.monthlyEquivalent,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseArabicNumber(amount);
    if (!name || parsed <= 0) return;

    onAddCommitment({
      name,
      amount: parsed,
      frequency,
      intervalDays: frequency === 'days_interval' ? parseInt(intervalDays) || 6 : undefined,
      category,
      dueDateDay: dueDateDay ? parseInt(dueDateDay) : undefined,
      isPaidThisMonth: false,
    });

    setName('');
    setAmount('');
    setShowAddForm(false);
  };

  const getFrequencyLabel = (c: Commitment) => {
    if (c.frequency === 'monthly') return 'شهري';
    if (c.frequency === 'weekly') return 'أسبوعي (يعادل شهرياً × 4.33)';
    if (c.frequency === 'days_interval') return `كل ${c.intervalDays || 6} أيام`;
    return 'شهري';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold mb-2">
            <Landmark className="w-3.5 h-3.5 text-emerald-400" />
            <span>شاشة الالتزامات المالية الثابتة</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Tajawal']">
            إجمالي الالتزامات الشهرية المحسوبة
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            تُخصم كل التزاماتك تلقائياً من راتبك قبل حساب الحد اليومي للصرف حتى لا تُفاجأ بأي عجز مالي.
          </p>
        </div>

        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl px-5 py-4 shrink-0 text-left">
          <span className="text-xs text-slate-400 block font-medium">المجموع الشهري المعادل:</span>
          <span className="text-3xl font-black text-emerald-400 font-['Tajawal']">
            {totalMonthlyCommitments.toLocaleString('ar-SA')}{' '}
            <span className="text-sm font-semibold text-slate-300">ريال / شهر</span>
          </span>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            قائمة الالتزامات (المحسوبة تلقائياً)
          </h3>
          <p className="text-xs text-slate-500">
            تضاف مرة واحدة ويتولى التطبيق موازنة وتيرتها شهرياً
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'إلغاء' : 'إضافة التزام جديد'}</span>
        </button>
      </div>

      {/* Add Commitment Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-500/30 shadow-md space-y-4 animate-in fade-in duration-200"
        >
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>إضافة التزام مالي جديد</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم الالتزام
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: قسط السيارة، إيجار، فاتورة..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المبلغ
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="مثال: 5600"
                  className="w-full text-sm font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden pl-12"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ريال
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الدورية والوتيرة
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Frequency)}
                className="w-full text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden bg-white"
              >
                <option value="monthly">شهري</option>
                <option value="weekly">أسبوعي</option>
                <option value="days_interval">كل عدد محدد من الأيام (كالوقود)</option>
              </select>
            </div>

            {frequency === 'days_interval' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كل كم يوم؟
                </label>
                <input
                  type="number"
                  min="1"
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(e.target.value)}
                  placeholder="مثال: 6 للوقود"
                  className="w-full text-sm font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                التصنيف
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Commitment['category'])}
                className="w-full text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden bg-white"
              >
                <option value="loan">قسط وتمويل</option>
                <option value="debt">ديون</option>
                <option value="bills">فواتير وخدمات</option>
                <option value="living">معيشة وتموين</option>
                <option value="fuel">وقود ومواصلات</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                يوم الاستحقاق الشهري (اختياري)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDateDay}
                onChange={(e) => setDueDateDay(e.target.value)}
                placeholder="مثال: 28 أو 1"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden"
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
              حفظ الالتزام
            </button>
          </div>
        </form>
      )}

      {/* List of Commitments */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100">
          {commitments.map((c) => (
            <div
              key={c.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3">
                <button
                  onClick={() => onTogglePaid(c.id)}
                  title={c.isPaidThisMonth ? 'تم السداد لهذا الشهر' : 'اضغط لتحديده كمسدد'}
                  className="mt-1 sm:mt-0 p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  {c.isPaidThisMonth ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold text-sm sm:text-base ${
                        c.isPaidThisMonth ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {c.name}
                    </span>
                    {c.dueDateDay && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        يوم {c.dueDateDay} بالشهر
                      </span>
                    )}
                    {c.isPaidThisMonth && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold">
                        تم الدفع
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span>{getFrequencyLabel(c)}</span>
                    <span>•</span>
                    <span>المبلغ الأصلي: {c.amount.toLocaleString('ar-SA')} ريال</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div className="text-left">
                  <span className="text-[11px] text-slate-400 block">المعادل الشهري</span>
                  <span className="font-['Tajawal'] text-lg font-black text-slate-900">
                    {c.monthlyEquivalent.toLocaleString('ar-SA')}{' '}
                    <span className="text-xs font-semibold text-slate-500">ريال/شهر</span>
                  </span>
                </div>

                <button
                  onClick={() => onDeleteCommitment(c.id)}
                  title="حذف الالتزام"
                  className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
