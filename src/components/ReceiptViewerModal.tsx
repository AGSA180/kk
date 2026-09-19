/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Calendar, Tag, Wallet, CheckCircle, Receipt } from 'lucide-react';
import { WeeklyExpense } from '../types';

interface ReceiptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: WeeklyExpense | null;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  isOpen,
  onClose,
  expense,
}) => {
  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
      <div
        id="receipt-viewer-modal-card"
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Tajawal']">
                فاتورة / صورة المشتريات
              </h3>
              <p className="text-xs text-slate-500">{expense.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pt-4">
          {/* Receipt Image */}
          {expense.imageUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center max-h-72">
              <img
                src={expense.imageUrl}
                alt={expense.description}
                className="max-h-72 w-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              لا توجد صورة مرفقة لهذه العملية
            </div>
          )}

          {/* Details & Remaining */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-slate-400" />
                <span>المبلغ المصروف:</span>
              </span>
              <span className="font-['Tajawal'] font-black text-slate-900 text-lg">
                {expense.amount.toLocaleString('ar-SA')} ريال
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-slate-400" />
                <span>البند المخصوم منه:</span>
              </span>
              <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {expense.categoryName}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>تاريخ العملية:</span>
              </span>
              <span className="font-medium text-slate-700">{expense.date}</span>
            </div>

            {typeof expense.remainingAfter === 'number' && (
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>الباقي من مخصص البند بعد العملية:</span>
                </span>
                <span
                  className={`font-['Tajawal'] font-black text-sm px-2.5 py-1 rounded-lg ${
                    expense.remainingAfter >= 0
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-rose-100 text-rose-900'
                  }`}
                >
                  {expense.remainingAfter.toLocaleString('ar-SA')} ريال
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
