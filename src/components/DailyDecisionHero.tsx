import React from 'react';
import { Sparkles, Calendar, DollarSign, TrendingUp, HelpCircle, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface DailyDecisionHeroProps {
  dailyLimit: number;
  weeklyAvailable: number;
  weekRemainingDays: number;
  currentFreeAvailable: number;
  onOpenCanIBuy: () => void;
  onOpenAddExpense: () => void;
}

export const DailyDecisionHero: React.FC<DailyDecisionHeroProps> = ({
  dailyLimit,
  weeklyAvailable,
  weekRemainingDays,
  currentFreeAvailable,
  onOpenCanIBuy,
  onOpenAddExpense,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 shadow-xl shadow-slate-900/10 border border-slate-700/50">
      {/* Subtle background glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Main Daily Decision Display */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>👋 ميزانيتك وقرارك اليومي</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span
              id="hero-daily-limit"
              className="text-5xl sm:text-7xl font-black tracking-tight text-white font-['Tajawal']"
            >
              {dailyLimit}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-400">ريال</span>
          </div>

          <p className="text-base sm:text-lg font-medium text-slate-300">
            الحد المسموح للصرف اليوم لتظل في أمان مالي تام
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/40 text-emerald-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              🟢 المتبقي هذا الأسبوع: {weeklyAvailable} ريال
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              المتبقي من الأسبوع: {weekRemainingDays} أيام
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 font-medium">
              📌 الحد اليومي: {dailyLimit} ريال
            </span>
          </div>
        </div>

        {/* Action Panel & Simulation Card */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[240px] shrink-0">
          {/* Quick status mini-card */}
          <div className="bg-slate-800/80 backdrop-blur-xs rounded-2xl p-4 border border-slate-700/70">
            <div className="text-xs text-slate-400 font-medium mb-1">المتاح الإجمالي للمصروف الحر</div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white font-['Tajawal']">
                {currentFreeAvailable} <span className="text-sm font-semibold text-slate-400">ريال</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-semibold">
                جاهز للصرف
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>مقتطع منه جميع الالتزامات والادخار</span>
            </div>
          </div>

          {/* Core Decision Button: "Can I Buy This?" */}
          <button
            id="btn-hero-can-i-buy"
            onClick={onOpenCanIBuy}
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-amber-500/20 transition-all duration-150 active:scale-98 cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 stroke-[2.2]" />
            <span>هل أستطيع شراء هذا الآن؟</span>
          </button>
        </div>
      </div>
    </div>
  );
};
