import React, { useState } from 'react';
import { Layers, Landmark, ReceiptText, Beef, ShoppingCart, Fuel, PiggyBank, Wallet, Plus, ArrowDown, ChevronRight, Check } from 'lucide-react';
import { Envelope } from '../types';

interface EnvelopesManagerProps {
  envelopes: Envelope[];
  salary: number;
  onOpenAddExpenseWithEnvelope: (envelopeId: string) => void;
  onUpdateEnvelope: (envelope: Envelope) => void;
}

export const EnvelopesManager: React.FC<EnvelopesManagerProps> = ({
  envelopes,
  salary,
  onOpenAddExpenseWithEnvelope,
  onUpdateEnvelope,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAllocation, setNewAllocation] = useState<string>('');

  const totalAllocated = envelopes.reduce((sum, e) => sum + e.allocatedMonthly, 0);
  const totalSpent = envelopes.reduce((sum, e) => sum + e.spentAmount, 0);

  const getIcon = (id: string) => {
    switch (id) {
      case 'env-commitments':
        return Landmark;
      case 'env-bills':
        return ReceiptText;
      case 'env-meat':
        return Beef;
      case 'env-groceries':
        return ShoppingCart;
      case 'env-fuel':
        return Fuel;
      case 'env-savings':
        return PiggyBank;
      case 'env-free':
      default:
        return Wallet;
    }
  };

  const handleStartEdit = (env: Envelope) => {
    setEditingId(env.id);
    setNewAllocation(env.allocatedMonthly.toString());
  };

  const handleSaveEdit = (env: Envelope) => {
    const val = parseFloat(newAllocation);
    if (!isNaN(val) && val >= 0) {
      onUpdateEnvelope({
        ...env,
        allocatedMonthly: val,
      });
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>نظام المظاريف الافتراضية (Envelope Budgeting)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Tajawal']">
            تقسيم الراتب الكامل ({salary.toLocaleString('ar-SA')} ريال) إلى مظاريف ذكية
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            بدل أن ترى الراتب في حساب واحد مهدداً بالضياع، يتم عزله في مظاريف محددة ويبقى لك «المصروف الحر» الحقيقي.
          </p>
        </div>

        <div className="flex gap-4 shrink-0">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-center">
            <span className="text-xs text-slate-400 block font-medium">مجموع التخصيص</span>
            <span className="text-2xl font-black text-indigo-300 font-['Tajawal']">
              {totalAllocated.toLocaleString('ar-SA')} <span className="text-xs font-normal">ريال</span>
            </span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-center">
            <span className="text-xs text-slate-400 block font-medium">المصروف الفعلي</span>
            <span className="text-2xl font-black text-amber-400 font-['Tajawal']">
              {totalSpent.toLocaleString('ar-SA')} <span className="text-xs font-normal">ريال</span>
            </span>
          </div>
        </div>
      </div>

      {/* Envelope Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {envelopes.map((env) => {
          const Icon = getIcon(env.id);
          const remaining = Math.max(0, env.allocatedMonthly - env.spentAmount);
          const percent = env.allocatedMonthly > 0
            ? Math.min(100, Math.round((env.spentAmount / env.allocatedMonthly) * 100))
            : 0;

          const isEditingThis = editingId === env.id;

          return (
            <div
              key={env.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-800">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {env.name}
                      </h4>
                      {env.description && (
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {env.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartEdit(env)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold p-1"
                  >
                    تعديل
                  </button>
                </div>

                {/* Amount allocation */}
                <div className="my-3">
                  {isEditingThis ? (
                    <div className="flex items-center gap-2 my-1">
                      <input
                        type="number"
                        value={newAllocation}
                        onChange={(e) => setNewAllocation(e.target.value)}
                        className="w-28 px-3 py-1.5 text-sm font-bold border rounded-lg border-indigo-500 focus:outline-hidden"
                      />
                      <button
                        onClick={() => handleSaveEdit(env)}
                        className="p-2 bg-indigo-600 text-white rounded-lg text-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">المخصص الشهري</span>
                        <span className="font-['Tajawal'] text-2xl font-black text-slate-900">
                          {env.allocatedMonthly.toLocaleString('ar-SA')}{' '}
                          <span className="text-xs font-bold text-slate-400">ريال</span>
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="text-xs text-slate-400 block font-medium">المتبقي بالمظروف</span>
                        <span className="font-['Tajawal'] text-lg font-extrabold text-emerald-600">
                          {remaining.toLocaleString('ar-SA')}{' '}
                          <span className="text-xs font-bold text-slate-400">ريال</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>صُرف: {env.spentAmount.toLocaleString('ar-SA')} ريال</span>
                    <span className="font-bold">{percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percent >= 100
                          ? 'bg-rose-500'
                          : percent > 80
                          ? 'bg-amber-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onOpenAddExpenseWithEnvelope(env.id)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>خصم مصروف من هذا المظروف</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
