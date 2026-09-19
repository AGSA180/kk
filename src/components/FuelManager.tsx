import React, { useState } from 'react';
import { Fuel, Calendar, Clock, CheckCircle, PlusCircle, AlertCircle, RefreshCw, ChevronRight, Gauge } from 'lucide-react';
import { FuelSettings, Expense } from '../types';
import { calculateFuelStatus } from '../utils/calculations';
import { parseArabicNumber } from '../utils/numberUtils';

interface FuelManagerProps {
  fuelSettings: FuelSettings;
  expenses: Expense[];
  onRefuel: (amount: number, date?: string) => void;
  onUpdateFuelSettings: (settings: FuelSettings) => void;
}

export const FuelManager: React.FC<FuelManagerProps> = ({
  fuelSettings,
  expenses,
  onRefuel,
  onUpdateFuelSettings,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [cycleDays, setCycleDays] = useState(fuelSettings.cycleDays.toString());
  const [amountPerRefuel, setAmountPerRefuel] = useState(fuelSettings.amountPerRefuel.toString());
  const [customRefuelAmount, setCustomRefuelAmount] = useState(fuelSettings.amountPerRefuel.toString());

  const status = calculateFuelStatus(fuelSettings);
  const fuelExpenses = expenses.filter((e) => e.envelopeId === 'env-fuel');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const days = Math.max(1, Math.round(parseArabicNumber(cycleDays)) || 6);
    const amount = parseArabicNumber(amountPerRefuel) || 150;
    // Calculate monthly equivalent (31 / days * amount)
    const monthlyBudget = Math.round((31 / days) * amount);

    onUpdateFuelSettings({
      ...fuelSettings,
      cycleDays: days,
      amountPerRefuel: amount,
      monthlyBudget,
    });
    setIsEditing(false);
  };

  const handleQuickRefuel = () => {
    const amount = parseArabicNumber(customRefuelAmount) || fuelSettings.amountPerRefuel;
    onRefuel(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-400/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-bold">
              <Fuel className="w-3.5 h-3.5" />
              <span>⛽ نظام وميزانية الوقود المستقلة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-['Tajawal']">
              السيارة تستهلك {fuelSettings.amountPerRefuel} ريال كل {fuelSettings.cycleDays} أيام
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
              ميزانية ذكية تعزل مصروف البنزين وتتنبأ بموعد التعبئة القادمة تلقائياً لإبعاد مفاجآت الطريق.
            </p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/30 backdrop-blur-xs transition-colors cursor-pointer"
          >
            {isEditing ? 'إلغاء التعديل' : 'تعديل وتيرة الوقود'}
          </button>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <form
          onSubmit={handleSaveSettings}
          className="bg-white rounded-3xl p-6 border-2 border-orange-400/40 shadow-md space-y-4 animate-in fade-in duration-200"
        >
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-orange-600" />
            <span>تخصيص استهلاك السيارة</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                كم تصرف في كل تعبئة؟ (ريال)
              </label>
              <input
                type="number"
                min="20"
                value={amountPerRefuel}
                onChange={(e) => setAmountPerRefuel(e.target.value)}
                className="w-full text-sm font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تستهلك هذا المبلغ كل كم يوم؟
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={cycleDays}
                onChange={(e) => setCycleDays(e.target.value)}
                className="w-full text-sm font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs cursor-pointer"
            >
              حفظ الإعدادات وإعادة الحساب
            </button>
          </div>
        </form>
      )}

      {/* 3 Main Stat Cards as specified in User Prompt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: المتاح */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold text-slate-600">المتاح لميزانية الوقود</span>
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="font-['Tajawal'] text-4xl font-black text-slate-900">
              {status.remainingBudget.toLocaleString('ar-SA')}{' '}
              <span className="text-base font-bold text-slate-400">ريال</span>
            </span>
            <p className="text-xs text-slate-500 mt-1">
              من إجمالي الميزانية الشهرية ({status.monthlyBudget.toLocaleString('ar-SA')} ريال)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
            صُرف هذا الشهر: <strong className="text-slate-900 font-bold">{status.totalSpentThisMonth} ريال</strong>
          </div>
        </div>

        {/* Card 2: التعبئة القادمة */}
        <div
          className={`rounded-3xl p-6 border shadow-xs flex flex-col justify-between ${
            status.isDueSoon
              ? 'bg-amber-50/70 border-amber-300 text-amber-950'
              : 'bg-white border-slate-200/90 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600">التعبئة القادمة</span>
            <div
              className={`p-2 rounded-xl ${
                status.isDueSoon ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="font-['Tajawal'] text-3xl font-black">
              {status.daysUntilNext === 0
                ? 'اليوم (حان الموعد)'
                : status.daysUntilNext === 1
                ? 'غداً'
                : `بعد ${status.daysUntilNext} أيام`}
            </span>
            <p className="text-xs opacity-75 mt-1">
              آخر تعبئة كانت قبل {status.daysSinceRefuel} أيام
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-current/10 text-xs font-semibold">
            {status.isDueSoon ? '⚠️ جهّز مبلغ التعبئة بالسيارة' : '✅ الاستهلاك يسير وفق الجدول'}
          </div>
        </div>

        {/* Card 3: المبلغ المتوقع */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold text-slate-600">المبلغ المتوقع للتعبئة</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="font-['Tajawal'] text-4xl font-black text-slate-900">
              {status.expectedAmount.toLocaleString('ar-SA')}{' '}
              <span className="text-base font-bold text-slate-400">ريال</span>
            </span>
            <p className="text-xs text-slate-500 mt-1">
              يكفي السيارة لمدة {fuelSettings.cycleDays} أيام قادمة
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
            معدل الصرف اليومي للوقود: <strong className="text-slate-900 font-bold">{Math.round(status.expectedAmount / fuelSettings.cycleDays)} ريال/يوم</strong>
          </div>
        </div>
      </div>

      {/* Quick Action: "وإذا عبّيت بـ150، يسجلها ويعيد حساب الميزانية" */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl p-6 border border-orange-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-orange-600" />
            <span>تسجيل تعبئة وقود جديدة</span>
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            عند التعبئة، اضغط لتسجيل العملية وإعادة ضبط مؤقت الأيام والميزانية فوراً
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="number"
            value={customRefuelAmount}
            onChange={(e) => setCustomRefuelAmount(e.target.value)}
            className="w-24 text-center font-bold text-sm px-3 py-2.5 rounded-xl border border-orange-300 bg-white focus:outline-hidden"
          />
          <button
            id="btn-fuel-refuel-action"
            onClick={handleQuickRefuel}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/20 active:scale-98 transition-all cursor-pointer whitespace-nowrap"
          >
            سجّل تعبئة ({customRefuelAmount} ريال)
          </button>
        </div>
      </div>

      {/* Fuel Expenses History */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">سجل تعبئات الوقود هذا الشهر</h3>
        {fuelExpenses.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">لا توجد تعبئات مسجلة بعد</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {fuelExpenses.map((exp) => (
              <div key={exp.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                    <Fuel className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{exp.description}</span>
                    <span className="text-[11px] text-slate-400">{exp.date}</span>
                  </div>
                </div>
                <span className="font-['Tajawal'] font-black text-slate-900 text-base">
                  {exp.amount} ريال
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
