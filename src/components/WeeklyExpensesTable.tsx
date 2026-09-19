/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Trash2,
  Eye,
  Camera,
  Smartphone,
  PenTool,
  Printer,
  Calendar,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { WeeklyExpense, WeeklyCategory } from '../types';

interface WeeklyExpensesTableProps {
  expenses: WeeklyExpense[];
  categories: WeeklyCategory[];
  onDeleteExpense: (id: string) => void;
  onViewReceipt: (imageUrl: string, description: string) => void;
  onPrint: () => void;
}

export const WeeklyExpensesTable: React.FC<WeeklyExpensesTableProps> = ({
  expenses,
  categories,
  onDeleteExpense,
  onViewReceipt,
  onPrint,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredExpenses = expenses.filter((e) => {
    if (filterCategory === 'all') return true;
    return e.categoryId === filterCategory;
  });

  const totalFilteredSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black font-['Tajawal'] text-slate-900">
              سجل المصروفات الأسبوعية
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredExpenses.length} عمليات
            </span>
          </div>
          <p className="text-xs text-slate-500">
            كشف كامل بما صُرف مع صور الفواتير والباقي المسجل لكل عملية
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex items-center gap-2 flex-wrap print:hidden">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="all">جميع البنود</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                بند {c.name}
              </option>
            ))}
          </select>

          {/* Print Button */}
          <button
            type="button"
            onClick={onPrint}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="طباعة كشف المصروفات"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة الكشف</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      {filteredExpenses.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <FileText className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm font-bold">لا توجد مصروفات مسجلة في هذا البند حتى الآن</p>
          <p className="text-xs">استخدم شريط التسجيل بالأعلى لإضافة المصروفات.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-bold">
                <th className="py-2.5 px-2">التاريخ</th>
                <th className="py-2.5 px-2">البند</th>
                <th className="py-2.5 px-2">البيان / المتجر</th>
                <th className="py-2.5 px-2">طريقة التسجيل</th>
                <th className="py-2.5 px-2">صورة الفاتورة</th>
                <th className="py-2.5 px-2">المبلغ</th>
                <th className="py-2.5 px-2">الباقي بعد العملية</th>
                <th className="py-2.5 px-2 text-center print:hidden">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Date */}
                  <td className="py-3 px-2 text-slate-600 whitespace-nowrap font-medium">
                    {expense.date}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-2 whitespace-nowrap">
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg text-xs">
                      {expense.categoryName}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="py-3 px-2 text-slate-800 font-medium max-w-xs truncate">
                    {expense.description}
                    {expense.rawSmsText && (
                      <span className="block text-[10px] text-slate-400 truncate print:hidden">
                        {expense.rawSmsText}
                      </span>
                    )}
                  </td>

                  {/* Source Badge */}
                  <td className="py-3 px-2 whitespace-nowrap">
                    {expense.source === 'sms' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-bold">
                        <Smartphone className="w-3 h-3" />
                        <span>رسالة بنك</span>
                      </span>
                    ) : expense.source === 'camera' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md font-bold">
                        <Camera className="w-3 h-3" />
                        <span>تصوير فاتورة</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                        <PenTool className="w-3 h-3" />
                        <span>يدوي</span>
                      </span>
                    )}
                  </td>

                  {/* Receipt Image */}
                  <td className="py-3 px-2 whitespace-nowrap">
                    {expense.imageUrl ? (
                      <button
                        type="button"
                        onClick={() =>
                          onViewReceipt(expense.imageUrl!, expense.description)
                        }
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 cursor-pointer print:hidden"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>عرض الفاتورة</span>
                      </button>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                    {/* Print-only indicator */}
                    {expense.imageUrl && (
                      <span className="hidden print:inline text-[11px] text-slate-500">
                        (مرفق صورة فاتورة)
                      </span>
                    )}
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-2 whitespace-nowrap">
                    <span className="font-['Tajawal'] font-bold text-slate-900 text-sm">
                      {expense.amount.toLocaleString('ar-SA')}{' '}
                      <span className="text-[10px] text-slate-400">ريال</span>
                    </span>
                  </td>

                  {/* Remaining After */}
                  <td className="py-3 px-2 whitespace-nowrap">
                    {expense.remainingAfter !== undefined ? (
                      <span
                        className={`font-['Tajawal'] font-bold text-xs ${
                          expense.remainingAfter >= 0
                            ? 'text-emerald-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {expense.remainingAfter.toLocaleString('ar-SA')} ريال
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Delete Action */}
                  <td className="py-3 px-2 text-center whitespace-nowrap print:hidden">
                    <button
                      type="button"
                      onClick={() => onDeleteExpense(expense.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="حذف المصروف وإرجاع المخصص"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 font-bold text-slate-900 bg-slate-50/70">
                <td colSpan={5} className="py-3 px-2 text-left">
                  مجموع المصروفات المحددة:
                </td>
                <td className="py-3 px-2 font-['Tajawal'] text-base text-slate-900 font-black">
                  {totalFilteredSpent.toLocaleString('ar-SA')} ريال
                </td>
                <td colSpan={2} className="py-3 px-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
