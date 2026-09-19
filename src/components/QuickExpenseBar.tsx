/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Plus,
  Camera,
  Image as ImageIcon,
  Calculator,
  CheckCircle2,
  Trash2,
  Sparkles,
  ArrowDownLeft,
  X,
} from 'lucide-react';
import { Envelope } from '../types';
import { parseArabicNumber, compressImage } from '../utils/numberUtils';

interface QuickExpenseBarProps {
  currentBalance: number;
  envelopes: Envelope[];
  onAddExpense: (expense: {
    amount: number;
    description: string;
    envelopeId: string;
    date: string;
    imageUrl?: string;
    remainingAfter?: number;
  }) => void;
}

export const QuickExpenseBar: React.FC<QuickExpenseBarProps> = ({
  currentBalance,
  envelopes,
  onAddExpense,
}) => {
  const [amountRaw, setAmountRaw] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState('env-free');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const parsedAmount = parseArabicNumber(amountRaw);

  const targetEnvelope = envelopes.find((e) => e.id === selectedEnvelopeId);
  const envelopeBalance = targetEnvelope
    ? Math.max(0, targetEnvelope.allocatedMonthly - targetEnvelope.spentAmount)
    : currentBalance;

  // The calculated remaining balance
  const remaining = envelopeBalance - parsedAmount;

  const quickButtons = [10, 20, 50, 100, 200];

  const handleQuickAdd = (num: number) => {
    const next = parsedAmount + num;
    setAmountRaw(next.toString());
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      setIsCompressing(true);
      const dataUrl = await compressImage(file, 800, 800, 0.7);
      setImageUrl(dataUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSave = () => {
    if (parsedAmount <= 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    onAddExpense({
      amount: parsedAmount,
      description: description.trim() || 'مشترى سريع',
      envelopeId: selectedEnvelopeId,
      date: todayStr,
      imageUrl: imageUrl || undefined,
      remainingAfter: remaining,
    });

    // Reset fields
    setAmountRaw('');
    setDescription('');
    setImageUrl(null);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-500/20 shadow-lg shadow-emerald-900/5 relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-emerald-600 text-white shadow-sm">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Tajawal']">
              ⚡ تسجيل سريع: أدخل المبلغ وشاهد الباقي فوراً
            </h2>
            <p className="text-xs text-slate-500">
              بدون تعقيد — اكتب الرقم، أرفق صورة الفاتورة، واحسب الباقي بنقرة واحدة
            </p>
          </div>
        </div>

        {/* Live Balance Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold self-start sm:self-auto">
          <span>المتاح الحالي:</span>
          <span className="text-emerald-700 font-black text-sm">
            {envelopeBalance.toLocaleString('ar-SA')} ريال
          </span>
        </div>
      </div>

      {/* Main Input Area */}
      <div className="pt-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* 1. Large Input for Amount */}
          <div className="lg:col-span-5 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              المبلغ (يقبل الأرقام ٠-٩ و 0-9)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={amountRaw}
                onChange={(e) => setAmountRaw(e.target.value)}
                placeholder="أدخل المبلغ (مثال: 50)"
                className="w-full text-2xl font-black font-['Tajawal'] px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-hidden text-slate-900 pl-14 transition-colors"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                ريال
              </span>
            </div>

            {/* Quick Chips */}
            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">أزرار سريعة:</span>
              {quickButtons.map((btn) => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handleQuickAdd(btn)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 cursor-pointer transition-colors"
                >
                  +{btn}
                </button>
              ))}
              {parsedAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setAmountRaw('')}
                  className="text-xs text-rose-500 hover:text-rose-700 px-1.5 py-0.5 cursor-pointer"
                >
                  مسح
                </button>
              )}
            </div>
          </div>

          {/* 2. Description and Photo Buttons */}
          <div className="lg:col-span-4 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              بيان المشترى أو الفاتورة
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: مقاضي، غداء، بنزين، عشاء..."
              className="w-full text-sm font-medium px-3.5 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden text-slate-900"
            />

            {/* Photo Attachment Row */}
            <div className="flex items-center gap-2 pt-1">
              {imageUrl ? (
                <div className="flex items-center gap-2 p-1.5 pr-2.5 bg-emerald-50 border border-emerald-200 rounded-xl w-full justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={imageUrl}
                      alt="مرفق"
                      className="w-7 h-7 rounded-lg object-cover border border-emerald-300"
                    />
                    <span className="text-xs font-bold text-emerald-800">
                      تم إرفاق صورة الفاتورة
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    title="حذف الصورة"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 py-1.5 px-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>تصوير بالكاميرا</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>إرفاق صورة</span>
                  </button>
                </div>
              )}

              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          </div>

          {/* 3. Real-Time Calculation & "الباقي" Result Box */}
          <div className="lg:col-span-3">
            <div
              className={`p-3.5 rounded-2xl border transition-all text-center ${
                parsedAmount > 0
                  ? remaining >= 0
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 ring-2 ring-emerald-500/20'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-500 mb-0.5">
                الباقي بعد الصرف:
              </div>
              <div className="text-2xl sm:text-3xl font-black font-['Tajawal'] tracking-tight">
                {remaining.toLocaleString('ar-SA')}{' '}
                <span className="text-xs font-bold">ريال</span>
              </div>
              <div className="text-[10px] font-semibold mt-1">
                {parsedAmount > 0 ? (
                  remaining >= 0 ? (
                    <span className="text-emerald-700">🟢 متبقي بأمان في رصيدك</span>
                  ) : (
                    <span className="text-rose-600 font-bold">⚠️ يتجاوز رصيدك الحالي</span>
                  )
                ) : (
                  <span className="text-slate-400">أدخل أي مبلغ لحساب الباقي</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={parsedAmount <= 0}
            onClick={handleSave}
            className={`flex-1 py-3 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
              parsedAmount > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 active:scale-98'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {parsedAmount > 0
                ? `احفظ وخصم ${parsedAmount.toLocaleString('ar-SA')} ريال (الباقي: ${remaining.toLocaleString('ar-SA')} ريال)`
                : 'أدخل المبلغ لحساب الباقي والحفظ'}
            </span>
          </button>

          {/* Quick Envelope selector dropdown if they want to change envelope */}
          <select
            value={selectedEnvelopeId}
            onChange={(e) => setSelectedEnvelopeId(e.target.value)}
            className="text-xs font-bold px-3 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden"
            title="المظروف"
          >
            {envelopes.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name} ({Math.max(0, env.allocatedMonthly - env.spentAmount)} ر.س)
              </option>
            ))}
          </select>
        </div>

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>تم تسجيل المصروف بنجاح وتحديث الباقي والحد اليومي فوراً!</span>
          </div>
        )}
      </div>
    </div>
  );
};
