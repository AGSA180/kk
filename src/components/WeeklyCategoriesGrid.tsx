/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShoppingCart,
  Fuel,
  UtensilsCrossed,
  ShoppingBag,
  HeartPulse,
  Receipt,
  Layers,
  ArrowDownLeft,
  Plus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { WeeklyCategory } from '../types';

interface WeeklyCategoriesGridProps {
  categories: WeeklyCategory[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  onOpenEditModal: () => void;
}

export const WeeklyCategoriesGrid: React.FC<WeeklyCategoriesGridProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onOpenEditModal,
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingCart':
        return <ShoppingCart className="w-5 h-5" />;
      case 'Fuel':
        return <Fuel className="w-5 h-5" />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-5 h-5" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5" />;
      case 'Receipt':
        return <Receipt className="w-5 h-5" />;
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black font-['Tajawal'] text-slate-900">
            مخصصات البنود الأسبوعية والباقي
          </h2>
          <p className="text-xs text-slate-500">
            اضغط على أي بند لتسجيل مصروف فيه مباشرة ومتابعة المتبقي
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenEditModal}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer print:hidden"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>تعديل مخصصات البنود</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {categories.map((cat) => {
          const remaining = (cat.weeklyAllocation || 0) - (cat.spent || 0);
          const isOver = remaining < 0;
          const pct =
            cat.weeklyAllocation > 0
              ? Math.min(100, Math.round((cat.spent / cat.weeklyAllocation) * 100))
              : 0;
          const isSelected = cat.id === selectedCategoryId;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`rounded-2xl p-4 border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Active selection dot */}
              {isSelected && (
                <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              )}

              {/* Header: Icon & Name */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {cat.name}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      مخصص أسبوعي: {cat.weeklyAllocation.toLocaleString('ar-SA')} ر.س
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isOver
                      ? 'bg-rose-100 text-rose-800'
                      : pct >= 80
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isOver ? 'تجاوز' : `${pct}% مستهلك`}
                </span>
              </div>

              {/* Financial Balance: Spent vs Remaining */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 mb-3">
                <div>
                  <span className="text-[11px] text-slate-400 block">المصروف:</span>
                  <span className="font-['Tajawal'] font-bold text-slate-800 text-sm">
                    {cat.spent.toLocaleString('ar-SA')}{' '}
                    <span className="text-[10px] text-slate-400">ريال</span>
                  </span>
                </div>

                <div className="text-left">
                  <span className="text-[11px] text-slate-400 block">الباقي من المخصص:</span>
                  <span
                    className={`font-['Tajawal'] font-black text-base sm:text-lg block ${
                      isOver ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {remaining.toLocaleString('ar-SA')}{' '}
                    <span className="text-xs font-bold">ريال</span>
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOver
                      ? 'bg-rose-500'
                      : pct >= 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Footer selection hint */}
              <div className="mt-2.5 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {remaining > 0
                    ? `متبقي ${(remaining).toLocaleString('ar-SA')} ريال بالأمان`
                    : `تجاوز المخصص بـ ${Math.abs(remaining).toLocaleString('ar-SA')} ريال`}
                </span>
                <span className="font-bold text-emerald-700 hover:underline">
                  {isSelected ? '✓ البند محدد' : 'اختر للصرف'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
