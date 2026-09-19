import React from 'react';
import { Landmark, Fuel, ShoppingCart, Beef, PiggyBank, Wallet, ArrowLeftRight, Calculator } from 'lucide-react';

interface MonthlySummaryTableProps {
  salary: number;
  commitmentsTotal: number;
  fuelMonthly: number;
  groceriesMonthly: number;
  meatMonthly: number;
  savingsMonthly: number;
  initialDiscretionary: number;
  onNavigateToCommitments: () => void;
  onNavigateToFuel: () => void;
  onNavigateToSavings: () => void;
}

export const MonthlySummaryTable: React.FC<MonthlySummaryTableProps> = ({
  salary,
  commitmentsTotal,
  fuelMonthly,
  groceriesMonthly,
  meatMonthly,
  savingsMonthly,
  initialDiscretionary,
  onNavigateToCommitments,
  onNavigateToFuel,
  onNavigateToSavings,
}) => {
  const rows = [
    {
      id: 'row-commitments',
      label: 'الالتزامات',
      amount: commitmentsTotal,
      icon: Landmark,
      color: 'text-slate-700 bg-slate-100',
      note: 'القسط، الديون، الفواتير الثابتة',
      onClick: onNavigateToCommitments,
    },
    {
      id: 'row-fuel',
      label: 'الوقود',
      amount: fuelMonthly,
      icon: Fuel,
      color: 'text-amber-700 bg-amber-100',
      note: '150 ريال كل 6 أيام',
      onClick: onNavigateToFuel,
    },
    {
      id: 'row-groceries',
      label: 'المقاضي',
      amount: groceriesMonthly,
      icon: ShoppingCart,
      color: 'text-blue-700 bg-blue-100',
      note: '300 ريال أسبوعياً',
    },
    {
      id: 'row-meat',
      label: 'الذبيحة',
      amount: meatMonthly,
      icon: Beef,
      color: 'text-rose-700 bg-rose-100',
      note: 'مؤونة اللحوم الشهرية',
    },
    {
      id: 'row-savings',
      label: 'الادخار',
      amount: savingsMonthly,
      icon: PiggyBank,
      color: 'text-emerald-700 bg-emerald-100',
      note: 'تأمين البيت وحصالة الطوارئ',
      onClick: onNavigateToSavings,
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header with Salary */}
      <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-100/60 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <span>خارطة توزيع الميزانية الشهرية</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            توزيع الدخل إلى التزامات ومظاريف مسبقة لحماية قراراتك اليومية
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200">
          <span className="text-xs font-semibold text-emerald-800">راتب الشهر:</span>
          <span className="text-lg font-black text-emerald-950 font-['Tajawal']">
            {salary.toLocaleString('ar-SA')} <span className="text-xs font-bold text-emerald-700">ريال</span>
          </span>
        </div>
      </div>

      {/* The Exact Table requested by user */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 bg-slate-50/50">
              <th className="py-3.5 px-6">المؤشر والتصنيف</th>
              <th className="py-3.5 px-6 hidden sm:table-cell">التفاصيل والوتيرة</th>
              <th className="py-3.5 px-6 text-left">المبلغ (ريال)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {rows.map((row) => {
              const Icon = row.icon;
              return (
                <tr
                  key={row.id}
                  onClick={row.onClick}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    row.onClick ? 'cursor-pointer' : ''
                  }`}
                >
                  <td className="py-3.5 px-6 font-semibold text-slate-800 flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${row.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{row.label}</span>
                  </td>
                  <td className="py-3.5 px-6 text-xs text-slate-500 hidden sm:table-cell">
                    {row.note}
                  </td>
                  <td className="py-3.5 px-6 text-left font-bold text-slate-900 font-['Tajawal']">
                    {row.amount.toLocaleString('ar-SA')}
                  </td>
                </tr>
              );
            })}

            {/* Prominently Highlighted Free Spending Row */}
            <tr className="bg-emerald-50/70 border-t-2 border-emerald-500/30 text-emerald-950 font-bold">
              <td className="py-4 px-6 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-base font-extrabold text-emerald-900">المتاح للمصروف</span>
                  <p className="text-xs text-emerald-700 font-normal">المبلغ الحر المتبقي للصرف اليومي</p>
                </div>
              </td>
              <td className="py-4 px-6 text-xs text-emerald-700 hidden sm:table-cell font-medium">
                الدخل − جميع الالتزامات = المال القابل للصرف
              </td>
              <td className="py-4 px-6 text-left">
                <span className="text-xl font-black text-emerald-900 font-['Tajawal']">
                  {initialDiscretionary.toLocaleString('ar-SA')}
                </span>
                <span className="text-xs font-semibold text-emerald-700 mr-1.5">ريال</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Technical Equation Footnote */}
      <div className="p-4 bg-slate-900 text-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
            معادلة القرار اليومي
          </span>
          <span className="text-slate-300 font-medium">
            (الدخل − الالتزامات − المصاريف − الادخار) ÷ الأيام المتبقية = <strong className="text-emerald-400 font-bold">الحد اليومي للصرف</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
