/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Wallet,
  Calendar,
  Camera,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calculator,
  ArrowDownLeft,
} from 'lucide-react';
import { Envelope } from '../types';
import { parseArabicNumber, toStandardNumerals, compressImage } from '../utils/numberUtils';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  envelopes: Envelope[];
  defaultEnvelopeId?: string;
  onAddExpense: (expense: {
    amount: number;
    description: string;
    envelopeId: string;
    date: string;
    imageUrl?: string;
    remainingAfter?: number;
  }) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  envelopes,
  defaultEnvelopeId,
  onAddExpense,
}) => {
  const [amountRaw, setAmountRaw] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState('env-free');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultEnvelopeId) {
      setSelectedEnvelopeId(defaultEnvelopeId);
    }
  }, [defaultEnvelopeId, isOpen]);

  if (!isOpen) return null;

  // Real-time parsed number from user input (handles both Arabic ٠-٩ and English 0-9)
  const parsedAmount = parseArabicNumber(amountRaw);

  const selectedEnvelope = envelopes.find((e) => e.id === selectedEnvelopeId);
  const currentEnvelopeBalance = selectedEnvelope
    ? Math.max(0, selectedEnvelope.allocatedMonthly - selectedEnvelope.spentAmount)
    : 0;

  // The calculated remaining balance (الباقي)
  const calculatedRemaining = currentEnvelopeBalance - parsedAmount;

  // Handle Amount Text Input - accepts Arabic numerals, English numerals, decimal points
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setAmountRaw(raw);
  };

  // Quick increment buttons (+10, +50, +100...)
  const handleQuickAdd = (increment: number) => {
    const current = parsedAmount;
    const next = current + increment;
    setAmountRaw(next.toString());
  };

  // File processing (drag and drop or click)
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      setIsCompressing(true);
      const compressedDataUrl = await compressImage(file, 900, 900, 0.75);
      setImageUrl(compressedDataUrl);
    } catch (err) {
      console.error('Failed to process receipt image', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processImageFile(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;

    onAddExpense({
      amount: parsedAmount,
      description: description.trim() || 'مصروف عام',
      envelopeId: selectedEnvelopeId,
      date,
      imageUrl: imageUrl || undefined,
      remainingAfter: calculatedRemaining,
    });

    // Reset form
    setAmountRaw('');
    setDescription('');
    setImageUrl(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="add-expense-modal-card"
        className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Tajawal']">
                تسجيل مصروف جديد وحسابه
              </h2>
              <p className="text-xs text-slate-500">
                يقبل الأرقام العربية والإنجليزية مع إرفاق صورة وحساب الباقي فوراً
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

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* 1. Numerical Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                المبلغ المراد صرفه (يقبل الأرقام ٠-٩ و 0-9)
              </label>
              {parsedAmount > 0 && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  القيمة المحسوبة: {parsedAmount.toLocaleString('ar-SA')} ريال
                </span>
              )}
            </div>

            <div className="relative">
              <input
                id="input-expense-amount"
                type="text"
                inputMode="decimal"
                required
                value={amountRaw}
                onChange={handleAmountChange}
                placeholder="0 أو ٠ (أدخل المبلغ هنا)"
                className="w-full text-2xl sm:text-3xl font-black font-['Tajawal'] px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-hidden transition-colors pl-14 text-slate-900"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                ريال
              </span>
            </div>

            {/* Quick Adjustment Increment Buttons */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400 ml-1">إضافة سريعة:</span>
              {[10, 20, 50, 100, 150].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => handleQuickAdd(inc)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  +{inc}
                </button>
              ))}
              {parsedAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setAmountRaw('')}
                  className="px-2 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50 rounded-lg mr-auto cursor-pointer"
                >
                  مسح
                </button>
              )}
            </div>
          </div>

          {/* 2. Choose Target Envelope */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اختر المظروف المخصوم منه
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
              {envelopes.map((env) => {
                const envBal = Math.max(0, env.allocatedMonthly - env.spentAmount);
                const isSelected = selectedEnvelopeId === env.id;
                return (
                  <button
                    key={env.id}
                    type="button"
                    onClick={() => setSelectedEnvelopeId(env.id)}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-white text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold truncate block">{env.name}</span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      الرصيد: {envBal.toLocaleString('ar-SA')} ر.س
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Real-Time Calculation & "اظهار الباقي" Card */}
          <div
            id="expense-calculator-card"
            className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-emerald-200/80 space-y-2.5 shadow-xs"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 border-b border-slate-200/80 pb-2">
              <span className="flex items-center gap-1.5 text-emerald-800">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>الحساب الفوري والباقي:</span>
              </span>
              <span className="text-slate-500">{selectedEnvelope?.name}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">رصيد المظروف</span>
                <span className="font-['Tajawal'] text-xs sm:text-sm font-bold text-slate-800">
                  {currentEnvelopeBalance.toLocaleString('ar-SA')} ريال
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">قيمة المصروف</span>
                <span className="font-['Tajawal'] text-xs sm:text-sm font-bold text-slate-900">
                  {parsedAmount > 0 ? `− ${parsedAmount.toLocaleString('ar-SA')}` : '0'} ريال
                </span>
              </div>

              <div
                className={`p-2 rounded-xl border ${
                  calculatedRemaining >= 0
                    ? 'bg-emerald-500/10 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <span className="text-[10px] block font-extrabold">الباقي بعد الصرف</span>
                <span className="font-['Tajawal'] text-sm sm:text-base font-black">
                  {calculatedRemaining.toLocaleString('ar-SA')} ريال
                </span>
              </div>
            </div>

            {parsedAmount > 0 && calculatedRemaining < 0 && (
              <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  تنبيه: المبلغ يتجاوز المتبقي في هذا المظروف بمقدار{' '}
                  {Math.abs(calculatedRemaining).toLocaleString('ar-SA')} ريال
                </span>
              </div>
            )}
          </div>

          {/* 4. Description & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الوصف أو البيان
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثال: مقاضي السوبرماركت، قهوة، غداء..."
                className="w-full text-xs sm:text-sm font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                التاريخ
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 5. Photo Upload / Camera Feature for Purchases */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>إضافة صورة للمشتريات أو الفاتورة (اختياري)</span>
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>حذف الصورة</span>
                </button>
              )}
            </div>

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 bg-slate-900/5 p-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={imageUrl}
                    alt="معاينة الفاتورة"
                    className="w-16 h-16 object-cover rounded-xl border border-white shadow-xs"
                  />
                  <div>
                    <span className="text-xs font-bold text-emerald-800 block">
                      تم إرفاق صورة المشتريات بنجاح
                    </span>
                    <span className="text-[11px] text-slate-500">
                      محفوظة مع تفاصيل العملية والباقي
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    تغيير
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`p-4 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-2 ${
                  isDragOver
                    ? 'border-emerald-500 bg-emerald-50/60'
                    : 'border-slate-200 hover:border-emerald-300 bg-slate-50/50'
                }`}
              >
                {isCompressing ? (
                  <div className="py-2 text-xs font-bold text-emerald-700 animate-pulse">
                    جاري معالجة وضغط الصورة...
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-white shadow-xs text-slate-600">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-100 shadow-xs text-emerald-700">
                        <Camera className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        اسحب صورة الفاتورة أو المنتج هنا، أو اختر طريقة الإرفاق
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        يدعم التقاط صورة بالكاميرا مباشرة أو اختيار صورة من المعرض
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>اختيار من الجهاز</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>تصوير بالكاميرا</span>
                      </button>
                    </div>
                  </>
                )}

                {/* Hidden file inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={parsedAmount <= 0}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                parsedAmount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-98 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                تسجيل وخصم المصروف ({parsedAmount > 0 ? `${parsedAmount.toLocaleString('ar-SA')} ريال` : '0'})
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
