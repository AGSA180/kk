/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  X,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  ShoppingBag,
  Camera,
  Image as ImageIcon,
  Trash2,
  Calculator,
} from 'lucide-react';
import { simulatePurchaseImpact } from '../utils/calculations';
import { parseArabicNumber, compressImage } from '../utils/numberUtils';

interface CanIBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFreeAvailable: number;
  currentDailyLimit: number;
  remainingDays: number;
  onConfirmPurchase: (amount: number, description: string, imageUrl?: string) => void;
}

export const CanIBuyModal: React.FC<CanIBuyModalProps> = ({
  isOpen,
  onClose,
  currentFreeAvailable,
  currentDailyLimit,
  remainingDays,
  onConfirmPurchase,
}) => {
  const [amountRaw, setAmountRaw] = useState('250');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const parsedAmount = parseArabicNumber(amountRaw);
  const simulation = simulatePurchaseImpact(
    parsedAmount,
    currentFreeAvailable,
    currentDailyLimit,
    remainingDays
  );

  const quickAmounts = [50, 100, 150, 250, 400, 500];

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      setIsCompressing(true);
      const compressed = await compressImage(file, 900, 900, 0.75);
      setImageUrl(compressed);
    } catch (err) {
      console.error('Failed to process image', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleConfirm = () => {
    if (parsedAmount <= 0) return;
    onConfirmPurchase(
      parsedAmount,
      description.trim() || 'شراء بعد استشارة ماليّة',
      imageUrl || undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="can-i-buy-modal-card"
        className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800">
              <HelpCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-['Tajawal']">
                هل أستطيع شراء هذا؟
              </h2>
              <p className="text-xs text-slate-500">
                أدخل قيمة السلعة وصورتها لحساب الباقي والأثر اليومي قبل الشراء
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <div className="space-y-4 pt-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                كم سعر الشيء الذي تريد شراءه؟ (أرقام ٠-٩ أو 0-9)
              </label>
              {parsedAmount > 0 && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  {parsedAmount.toLocaleString('ar-SA')} ريال
                </span>
              )}
            </div>

            <div className="relative">
              <input
                id="input-purchase-amount"
                type="text"
                inputMode="decimal"
                value={amountRaw}
                onChange={(e) => setAmountRaw(e.target.value)}
                placeholder="أدخل المبلغ (مثال: 250 أو ٢٥٠)"
                className="w-full text-2xl sm:text-3xl font-black font-['Tajawal'] px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:outline-hidden transition-colors pl-14 text-slate-900"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                ريال
              </span>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmountRaw(q.toString())}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    parsedAmount === q
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {q} ريال
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ما هو هذا الشيء؟ (اختياري)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: حذاء رياضي، عطر، طاولة، عشاء..."
              className="w-full text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-hidden text-slate-900"
            />
          </div>

          {/* Optional Photo Attachment */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-600" />
                <span>صورة السلعة أو بطاقة السعر (اختياري)</span>
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>حذف</span>
                </button>
              )}
            </div>

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-amber-300 bg-amber-50/40 p-2 flex items-center gap-3">
                <img
                  src={imageUrl}
                  alt="صورة السلعة"
                  className="w-14 h-14 object-cover rounded-xl border border-white"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-800 block">تم إرفاق صورة السلعة</span>
                  <span className="text-[11px] text-slate-500">جاهزة للحفظ مع الشراء</span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  تغيير
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>اختيار صورة</span>
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 py-2 px-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-600" />
                  <span>تصوير الآن</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && processImageFile(e.target.files[0])}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && processImageFile(e.target.files[0])}
                />
              </div>
            )}
          </div>

          {/* Instant Simulation Result Box with "اظهار الباقي" */}
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-extrabold text-slate-500 flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-amber-600" />
                <span>حساب المتبقي (الباقي) والأثر المالي</span>
              </span>
              <span className="text-slate-400">متبقي للشهر: {remainingDays} يوماً</span>
            </div>

            {/* Breakdown: المتاح للمصروف، قيمة المشتريات، سيبقى بعد الشراء */}
            <div className="space-y-2 text-sm font-semibold">
              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-slate-400" />
                  <span>المتاح للمصروف الحر حالياً:</span>
                </span>
                <span className="font-['Tajawal'] font-bold text-slate-900">
                  {currentFreeAvailable.toLocaleString('ar-SA')} ريال
                </span>
              </div>

              <div className="flex justify-between items-center text-amber-700">
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  <span>قيمة المشتريات المراد شراؤها:</span>
                </span>
                <span className="font-['Tajawal'] font-bold text-amber-800">
                  − {parsedAmount.toLocaleString('ar-SA')} ريال
                </span>
              </div>

              {/* Highlighting the Remaining Balance (الباقي) */}
              <div className="flex justify-between items-center text-slate-900 border-t border-slate-200 pt-2 font-bold">
                <span className="text-sm">الباقي بعد الشراء:</span>
                <span
                  className={`font-['Tajawal'] text-lg font-black px-2.5 py-0.5 rounded-lg ${
                    simulation.remainingAfter >= 0
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-rose-100 text-rose-900'
                  }`}
                >
                  {simulation.remainingAfter.toLocaleString('ar-SA')} ريال
                </span>
              </div>
            </div>

            {/* Advisory message */}
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                simulation.canAfford
                  ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  simulation.canAfford ? 'text-amber-600' : 'text-rose-600'
                }`}
              />
              <div className="text-xs sm:text-sm">
                <strong className="block font-bold mb-0.5">
                  {simulation.canAfford ? 'أثر الشراء على قرارك اليومي:' : 'غير متاح للشراء!'}
                </strong>
                <p className="font-medium leading-relaxed">
                  {simulation.adviceMessage}
                </p>
              </div>
            </div>

            {/* Comparison Metrics */}
            {simulation.canAfford && (
              <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">حدك اليومي الحالي</span>
                  <span className="font-['Tajawal'] text-base sm:text-lg font-bold text-slate-800">
                    {currentDailyLimit} ريال/يوم
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] text-amber-700 block">حدك اليومي الجديد بعد الشراء</span>
                  <span className="font-['Tajawal'] text-base sm:text-lg font-black text-amber-900">
                    {simulation.newDailyLimit} ريال/يوم
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              id="btn-confirm-purchase"
              disabled={!simulation.canAfford || parsedAmount <= 0}
              onClick={handleConfirm}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                simulation.canAfford && parsedAmount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-98 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تنفيذ الشراء وخصمه ({parsedAmount} ريال)</span>
            </button>

            <button
              onClick={onClose}
              className="py-3 px-5 rounded-2xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              تراجع (حفظ الميزانية)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
