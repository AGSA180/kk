/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Smartphone,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  X,
  AlertCircle,
  Copy,
  Sparkles,
  ArrowDownLeft,
  Store,
  Layers,
} from 'lucide-react';
import { WeeklyCategory } from '../types';
import { parseArabicNumber, compressImage } from '../utils/numberUtils';
import { parseBankSms, ParsedSmsResult } from '../utils/smsParser';

interface UnifiedExpenseRecorderProps {
  categories: WeeklyCategory[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  onAddExpense: (expense: {
    amount: number;
    description: string;
    categoryId: string;
    categoryName: string;
    date: string;
    imageUrl?: string;
    remainingAfter?: number;
    source?: 'manual' | 'sms' | 'camera' | 'upload';
    rawSmsText?: string;
  }) => void;
}

export const UnifiedExpenseRecorder: React.FC<UnifiedExpenseRecorderProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onAddExpense,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'sms'>('manual');

  // Manual Form States
  const [amountRaw, setAmountRaw] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // SMS Form States
  const [smsRawText, setSmsRawText] = useState('');
  const [parsedSms, setParsedSms] = useState<ParsedSmsResult | null>(null);
  const [smsCategoryId, setSmsCategoryId] = useState<string>(selectedCategoryId);

  // Feedback Toast
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Selected category info for manual tab
  const activeCategory =
    categories.find((c) => c.id === selectedCategoryId) || categories[0];
  const activeCategoryRemaining = activeCategory
    ? (activeCategory.weeklyAllocation || 0) - (activeCategory.spent || 0)
    : 0;

  const parsedAmount = parseArabicNumber(amountRaw);
  const remainingAfterExpense = activeCategoryRemaining - parsedAmount;

  // Sync category for SMS tab
  useEffect(() => {
    if (parsedSms?.suggestedCategoryId) {
      setSmsCategoryId(parsedSms.suggestedCategoryId);
    }
  }, [parsedSms]);

  // Handle SMS Auto-parsing when text changes
  const handleSmsChange = (text: string) => {
    setSmsRawText(text);
    if (text.trim().length > 5) {
      const res = parseBankSms(text);
      setParsedSms(res);
      if (res?.suggestedCategoryId) {
        setSmsCategoryId(res.suggestedCategoryId);
      }
    } else {
      setParsedSms(null);
    }
  };

  const handleQuickAddAmount = (val: number) => {
    const next = parsedAmount + val;
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

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0 || !activeCategory) return;

    const todayStr = new Date().toISOString().split('T')[0];
    onAddExpense({
      amount: parsedAmount,
      description: description.trim() || `مصروف ${activeCategory.name}`,
      categoryId: activeCategory.id,
      categoryName: activeCategory.name,
      date: todayStr,
      imageUrl: imageUrl || undefined,
      remainingAfter: remainingAfterExpense,
      source: imageUrl ? 'camera' : 'manual',
    });

    setSuccessMessage(
      `تم تسجيل ${parsedAmount.toLocaleString('ar-SA')} ريال في بند [${activeCategory.name}]. الباقي: ${remainingAfterExpense.toLocaleString('ar-SA')} ريال.`
    );
    setAmountRaw('');
    setDescription('');
    setImageUrl(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleSmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedSms || parsedSms.amount <= 0) return;

    const targetCat =
      categories.find((c) => c.id === smsCategoryId) || activeCategory;
    const catRemaining = (targetCat.weeklyAllocation || 0) - (targetCat.spent || 0);
    const remainingAfter = catRemaining - parsedSms.amount;

    const todayStr = new Date().toISOString().split('T')[0];
    onAddExpense({
      amount: parsedSms.amount,
      description: parsedSms.merchant || 'مشترى من رسالة بنك',
      categoryId: targetCat.id,
      categoryName: targetCat.name,
      date: todayStr,
      remainingAfter,
      source: 'sms',
      rawSmsText: parsedSms.rawSnippet,
    });

    setSuccessMessage(
      `تم استخراج وتسجيل ${parsedSms.amount.toLocaleString('ar-SA')} ريال في بند [${targetCat.name}]. الباقي: ${remainingAfter.toLocaleString('ar-SA')} ريال.`
    );
    setSmsRawText('');
    setParsedSms(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Sample SMS Messages for Instant Testing
  const sampleMessages = [
    {
      label: 'الراجحي (بندة)',
      text: 'شراء عبر مدى: بمبلغ 68.50 ر.س لدى بندة ماركت بواسطة بطاقة مدى رقم 1234. الرصيد: 4320.00 ر.س',
    },
    {
      label: 'الأهلي (محطة الدريس)',
      text: 'عملية شراء بمبلغ 120.00 ر.س بواسطة بطاقة مدى لدى محطة الدريس للمحروقات في 2026-09-19',
    },
    {
      label: 'الإنماء (مطعم)',
      text: 'شراء نقاط بيع بمبلغ 85.00 ريال لدى مطعم الرومانسية بطاقة مدى *4431',
    },
    {
      label: 'STC Pay (صيدلية)',
      text: 'تم دفع مبلغ 42.00 ريال لـ صيدلية النهدي عبر بطاقة مدى الرقمية',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-500/20 shadow-lg shadow-emerald-950/5 print:hidden">
      {/* Mode Tabs */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 flex-wrap">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Tajawal']">
            تسجيل المصروف الفعلي وحساب الباقي
          </h2>
          <p className="text-xs text-slate-500">
            سجل يدوياً مع صورة الفاتورة، أو الصق رسالة البنك ليتم خصمها تلقائياً
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>إدخال يدوي + صورة</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sms')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sms'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>لصق رسائل الجوال والبنك</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* TAB 1: MANUAL INPUT & RECEIPT PHOTO */}
      {activeTab === 'manual' && (
        <form onSubmit={handleManualSubmit} className="pt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Category Selector Buttons */}
            <div className="lg:col-span-12">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اختر البند المخصص للصرف:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {categories.map((cat) => {
                  const isSelected = cat.id === selectedCategoryId;
                  const catRem = (cat.weeklyAllocation || 0) - (cat.spent || 0);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onSelectCategory(cat.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                          isSelected
                            ? 'bg-emerald-800 text-emerald-100'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        باقي: {catRem.toLocaleString('ar-SA')} ر.س
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount Field */}
            <div className="lg:col-span-4 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                المبلغ المصروف (أرقام عربية أو إنجليزية)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amountRaw}
                  onChange={(e) => setAmountRaw(e.target.value)}
                  placeholder="مثال: 50 أو ٥٠"
                  className="w-full text-2xl font-black font-['Tajawal'] px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-hidden text-slate-900 pl-14 transition-colors"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                  ريال
                </span>
              </div>

              {/* Quick Chips */}
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium">إضافة:</span>
                {[10, 20, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleQuickAddAmount(num)}
                    className="px-2 py-0.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 cursor-pointer"
                  >
                    +{num}
                  </button>
                ))}
                {parsedAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmountRaw('')}
                    className="text-xs text-rose-500 hover:text-rose-700 px-1"
                  >
                    مسح
                  </button>
                )}
              </div>
            </div>

            {/* Description & Photo Attachment */}
            <div className="lg:col-span-5 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                بيان المشترى / الفاتورة
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثال: مقاضي خضار، بنزين 91، غداء، صيدلية..."
                className="w-full text-sm font-medium px-3.5 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden text-slate-900"
              />

              {/* Photo upload row */}
              <div className="flex items-center gap-2 pt-1">
                {imageUrl ? (
                  <div className="flex items-center gap-2 p-1.5 pr-2 bg-emerald-50 border border-emerald-200 rounded-xl w-full justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={imageUrl}
                        alt="صورة الفاتورة"
                        className="w-7 h-7 rounded-lg object-cover border border-emerald-300"
                      />
                      <span className="text-xs font-bold text-emerald-800">
                        تم إرفاق صورة الفاتورة بنجاح
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
                      className="flex-1 py-1.5 px-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>تصوير بالكاميرا</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-1.5 px-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>رفع صورة فاتورة</span>
                    </button>
                  </div>
                )}

                {/* Hidden File Inputs */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFile(e.target.files[0])
                  }
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFile(e.target.files[0])
                  }
                />
              </div>
            </div>

            {/* Real-time Calculation & Remaining Box */}
            <div className="lg:col-span-3">
              <div
                className={`p-3.5 rounded-2xl border transition-all text-center h-full flex flex-col justify-center ${
                  parsedAmount > 0
                    ? remainingAfterExpense >= 0
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 ring-2 ring-emerald-500/20'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="text-[11px] font-bold text-slate-500 mb-0.5">
                  الباقي من مخصص [{activeCategory?.name || 'البند'}]:
                </div>
                <div className="text-2xl sm:text-3xl font-black font-['Tajawal'] tracking-tight">
                  {remainingAfterExpense.toLocaleString('ar-SA')}{' '}
                  <span className="text-xs font-bold">ريال</span>
                </div>
                <div className="text-[10px] font-semibold mt-1">
                  {parsedAmount > 0 ? (
                    remainingAfterExpense >= 0 ? (
                      <span className="text-emerald-700">🟢 متبقي بأمان في البند</span>
                    ) : (
                      <span className="text-rose-600 font-bold">⚠️ يتجاوز مخصص هذا البند</span>
                    )
                  ) : (
                    <span className="text-slate-400">
                      رصيد البند المتاح: {activeCategoryRemaining.toLocaleString('ar-SA')} ر.س
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={parsedAmount <= 0}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                parsedAmount > 0
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20 active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {parsedAmount > 0
                  ? `خصم ${parsedAmount.toLocaleString('ar-SA')} ريال من مخصص [${activeCategory?.name}] — الباقي: ${remainingAfterExpense.toLocaleString('ar-SA')} ريال`
                  : 'أدخل المبلغ لتسجيل المصروف وحساب الباقي'}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SMS & MOBILE BANK MESSAGE PASTER */}
      {activeTab === 'sms' && (
        <form onSubmit={handleSmsSubmit} className="pt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                الصق نص رسالة البنك أو تطبيق الجوال هنا (مدى / SMS):
              </label>
              <span className="text-[11px] text-slate-400">
                يقوم باستخراج المبلغ والتاجر واقتراح البند تلقائياً
              </span>
            </div>

            <textarea
              rows={3}
              value={smsRawText}
              onChange={(e) => handleSmsChange(e.target.value)}
              placeholder="مثال: شراء عبر مدى بمبلغ 45.50 ر.س لدى بندة ماركت..."
              className="w-full text-xs sm:text-sm font-medium p-3.5 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden text-slate-900 resize-none leading-relaxed"
            />

            {/* Quick Sample Test Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-semibold">
                جرّب نموذج رسالة:
              </span>
              {sampleMessages.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => handleSmsChange(sample.text)}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 cursor-pointer transition-colors"
                >
                  {sample.label}
                </button>
              ))}
              {smsRawText && (
                <button
                  type="button"
                  onClick={() => handleSmsChange('')}
                  className="text-xs text-rose-500 hover:text-rose-700 px-1.5"
                >
                  مسح
                </button>
              )}
            </div>
          </div>

          {/* Parsed SMS Result Preview Box */}
          {parsedSms && parsedSms.amount > 0 ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>تم تحليل الرسالة وتحديد البيانات بنجاح:</span>
                </div>
                <span className="text-emerald-800 font-black text-sm">
                  {parsedSms.amount.toLocaleString('ar-SA')} ريال
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-slate-400 block text-[10px]">التاجر / المتجر:</span>
                  <span className="font-bold text-slate-800 block truncate">
                    {parsedSms.merchant || 'مشتريات بطاقة'}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-slate-400 block text-[10px]">البند المقترح تلقائياً:</span>
                  <select
                    value={smsCategoryId}
                    onChange={(e) => setSmsCategoryId(e.target.value)}
                    className="w-full font-bold text-emerald-800 bg-transparent focus:outline-hidden text-xs cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (باقي: {(c.weeklyAllocation - c.spent).toLocaleString('ar-SA')} ر.س)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 text-left">
                  <span className="text-slate-400 block text-[10px]">الباقي بعد العملية:</span>
                  {(() => {
                    const targetCat =
                      categories.find((c) => c.id === smsCategoryId) || categories[0];
                    const remaining =
                      (targetCat?.weeklyAllocation || 0) -
                      (targetCat?.spent || 0) -
                      parsedSms.amount;
                    return (
                      <span
                        className={`font-black font-['Tajawal'] text-sm block ${
                          remaining >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {remaining.toLocaleString('ar-SA')} ريال
                      </span>
                    );
                  })()}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>اعتماد وخصم المصروف من الرسالة</span>
              </button>
            </div>
          ) : smsRawText.trim().length > 5 ? (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                لم نتمكن من العثور على مبلغ صريح في النص. يرجى التأكد من احتواء الرسالة على رقم المبلغ أو استخدام الإدخال اليدوي.
              </span>
            </div>
          ) : null}
        </form>
      )}
    </div>
  );
};
