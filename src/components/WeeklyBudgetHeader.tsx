/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Wallet,
  TrendingDown,
  Sparkles,
  Printer,
  Sliders,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { WeeklyCategory } from '../types';

interface WeeklyBudgetHeaderProps {
  weekName: string;
  daysLeftInWeek: number;
  categories: WeeklyCategory[];
  onOpenEditModal: () => void;
  onGenerateAiReport: () => void;
  isGeneratingAi: boolean;
  onPrint: () => void;
}

export const WeeklyBudgetHeader: React.FC<WeeklyBudgetHeaderProps> = ({
  weekName,
  daysLeftInWeek,
  categories,
  onOpenEditModal,
  onGenerateAiReport,
  isGeneratingAi,
  onPrint,
}) => {
  const totalAllocated = categories.reduce(
    (sum, c) => sum + (c.weeklyAllocation || 0),
    0
  );
  const totalSpent = categories.reduce((sum, c) => sum + (c.spent || 0), 0);
  const totalRemaining = totalAllocated - totalSpent;
  const spentPercentage =
    totalAllocated > 0 ? Math.min(100, Math.round((totalSpent / totalAllocated) * 100)) : 0;

  const isOverBudget = totalRemaining < 0;

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Top Bar: Title & Action Buttons */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>نظام الميزانية الأسبوعية بالبنود</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-white tracking-tight">
            كم تصرف اليوم — ميزانيتي الأسبوعية
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            سجل ما صرفته يدوياً، أو بالصورة، أو بنسخ رسائل البنك — وشاهد الباقي فوراً حسب كل بند
          </p>
        </div>

        {/* Header Action Buttons (Hidden on Print) */}
        <div className="flex items-center gap-2 flex-wrap print:hidden">
          <button
            type="button"
            onClick={onGenerateAiReport}
            disabled={isGeneratingAi}
            className="px-4 py-2.5 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAi ? 'جاري التحليل بالذكاء...' : 'تقرير الصرف والتطوير الذكي'}</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-all cursor-pointer"
            title="طباعة كشف المصروفات الأسبوعية"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline">طباعة الكشف</span>
          </button>

          <button
            type="button"
            onClick={onOpenEditModal}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-all cursor-pointer"
            title="تعديل مخصصات البنود والأيام"
          >
            <Sliders className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline">تعديل الميزانية</span>
          </button>
        </div>
      </div>

      {/* Main Budget Metrics Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        {/* Metric 1: Total Allocated */}
        <div className="bg-slate-800/60 backdrop-blur-xs rounded-2xl p-4 border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>مخصص الخطة الأسبوعية</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-white">
            {totalAllocated.toLocaleString('ar-SA')}{' '}
            <span className="text-xs font-bold text-slate-400">ريال</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            مجموع مخصصات الـ {categories.length} بنود
          </div>
        </div>

        {/* Metric 2: Total Spent */}
        <div className="bg-slate-800/60 backdrop-blur-xs rounded-2xl p-4 border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>إجمالي المصروف الفعلي</span>
            <TrendingDown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-amber-300">
            {totalSpent.toLocaleString('ar-SA')}{' '}
            <span className="text-xs font-bold text-slate-400">ريال</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            تم استهلاك {spentPercentage}% من ميزانية الأسبوع
          </div>
        </div>

        {/* Metric 3: Total Remaining (Hero) */}
        <div
          className={`rounded-2xl p-4 border transition-all ${
            isOverBudget
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className={isOverBudget ? 'text-rose-300' : 'text-emerald-300'}>
              الباقي لك هذا الأسبوع
            </span>
            {isOverBudget ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black font-['Tajawal'] ${
              isOverBudget ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {totalRemaining.toLocaleString('ar-SA')}{' '}
            <span className="text-xs font-bold">ريال</span>
          </div>
          <div className="text-[11px] font-semibold mt-1">
            {isOverBudget ? '⚠️ عجز أسبوعي يحتاج ضبط' : '🟢 رصيد آمن متاح للصرف'}
          </div>
        </div>

        {/* Metric 4: Days Left & Daily Rate */}
        <div className="bg-slate-800/60 backdrop-blur-xs rounded-2xl p-4 border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>المتبقي من الأسبوع</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-white">
            {daysLeftInWeek}{' '}
            <span className="text-xs font-bold text-slate-400">أيام</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
            المتاح يومياً: {Math.max(0, Math.round(totalRemaining / Math.max(1, daysLeftInWeek))).toLocaleString('ar-SA')} ريال/يوم
          </div>
        </div>
      </div>

      {/* Progress Bar of Total Weekly Budget */}
      <div className="mt-5 pt-4 border-t border-slate-800/70">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-bold">
          <span>استهلاك الميزانية الأسبوعية الإجمالية</span>
          <span>
            {spentPercentage}% ({totalSpent.toLocaleString('ar-SA')} من {totalAllocated.toLocaleString('ar-SA')} ريال)
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              spentPercentage > 95
                ? 'bg-rose-500'
                : spentPercentage > 75
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${spentPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
