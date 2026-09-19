import React, { useState } from 'react';
import { X, SlidersHorizontal, RotateCcw, Check, Sparkles } from 'lucide-react';
import { AppData } from '../types';
import { INITIAL_DATA } from '../data/initialData';
import { parseArabicNumber } from '../utils/numberUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onSaveSettings: (settings: {
    salary: number;
    monthCycleStartDay: number;
    weekRemainingDays: number;
    daysRemainingInMonth: number;
  }) => void;
  onResetToDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  data,
  onSaveSettings,
  onResetToDefaults,
}) => {
  const [salary, setSalary] = useState(data.salary.toString());
  const [monthCycleStartDay, setMonthCycleStartDay] = useState(data.monthCycleStartDay.toString());
  const [weekRemainingDays, setWeekRemainingDays] = useState(data.weekRemainingDays.toString());
  const [daysRemainingInMonth, setDaysRemainingInMonth] = useState(data.daysRemainingInMonth.toString());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      salary: parseArabicNumber(salary) || 16500,
      monthCycleStartDay: Math.round(parseArabicNumber(monthCycleStartDay)) || 27,
      weekRemainingDays: Math.round(parseArabicNumber(weekRemainingDays)) || 4,
      daysRemainingInMonth: Math.round(parseArabicNumber(daysRemainingInMonth)) || 14,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-800">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Tajawal']">
                إعدادات الراتب والدورة الشهرية
              </h2>
              <p className="text-xs text-slate-500">
                ضبط الراتب الشهري وعدد الأيام المتبقية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              راتب الشهر (ريال)
            </label>
            <input
              type="number"
              min="1000"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full text-lg font-black font-['Tajawal'] px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-800 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المتبقي من الأسبوع (أيام)
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={weekRemainingDays}
                onChange={(e) => setWeekRemainingDays(e.target.value)}
                className="w-full text-sm font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المتبقي من الشهر (أيام)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={daysRemainingInMonth}
                onChange={(e) => setDaysRemainingInMonth(e.target.value)}
                className="w-full text-sm font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              يوم نزول الراتب الشهري
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={monthCycleStartDay}
              onChange={(e) => setMonthCycleStartDay(e.target.value)}
              className="w-full text-sm font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-800 focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              عادة يوم 27 من كل شهر ميلادي
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              حفظ التعديلات
            </button>

            <button
              type="button"
              onClick={() => {
                onResetToDefaults();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة بيانات العرض الأصلية (راتب 16,500 ريال)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
