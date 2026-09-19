/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, Sliders, Plus, Trash2 } from 'lucide-react';
import { WeeklyCategory } from '../types';
import { parseArabicNumber } from '../utils/numberUtils';

interface EditAllocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: WeeklyCategory[];
  daysLeftInWeek: number;
  onSave: (updatedCategories: WeeklyCategory[], updatedDays: number) => void;
}

export const EditAllocationsModal: React.FC<EditAllocationsModalProps> = ({
  isOpen,
  onClose,
  categories,
  daysLeftInWeek,
  onSave,
}) => {
  const [items, setItems] = useState<WeeklyCategory[]>(categories);
  const [days, setDays] = useState<number>(daysLeftInWeek);
  const [newCatName, setNewCatName] = useState('');
  const [newCatAmount, setNewCatAmount] = useState('');

  if (!isOpen) return null;

  const handleUpdateAllocation = (id: string, rawVal: string) => {
    const num = parseArabicNumber(rawVal);
    setItems((prev) =>
      prev.map((c) => (c.id === id ? { ...c, weeklyAllocation: num } : c))
    );
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const amount = parseArabicNumber(newCatAmount) || 100;
    const newCat: WeeklyCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      weeklyAllocation: amount,
      spent: 0,
      icon: 'Layers',
      color: 'emerald',
    };
    setItems((prev) => [...prev, newCat]);
    setNewCatName('');
    setNewCatAmount('');
  };

  const handleDeleteCategory = (id: string) => {
    setItems((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = () => {
    onSave(items, days);
    onClose();
  };

  const totalAllocated = items.reduce((sum, c) => sum + (c.weeklyAllocation || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-['Tajawal'] text-slate-900">
                تعديل مخصصات البنود الأسبوعية
              </h3>
              <p className="text-xs text-slate-500">
                حدد المبلغ المخصص لكل بند أسبوعياً وعدد الأيام المتبقية
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Days Left Controller */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              عدد الأيام المتبقية في الأسبوع الحالي:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDays(Math.max(1, days - 1))}
                className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
              >
                -
              </button>
              <span className="font-['Tajawal'] font-bold text-sm w-8 text-center text-slate-900">
                {days}
              </span>
              <button
                type="button"
                onClick={() => setDays(Math.min(7, days + 1))}
                className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
              >
                +
              </button>
              <span className="text-xs text-slate-500 mr-1">أيام</span>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700">
              مخصص كل بند (ريال أسبوعياً):
            </label>
            {items.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 bg-white"
              >
                <span className="text-xs font-bold text-slate-800 flex-1 truncate">
                  {cat.name}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    defaultValue={cat.weeklyAllocation}
                    onChange={(e) => handleUpdateAllocation(cat.id, e.target.value)}
                    className="w-24 text-center font-['Tajawal'] font-bold text-sm px-2 py-1.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden"
                  />
                  <span className="text-xs text-slate-400">ريال</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
                    title="حذف البند"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Category Box */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              إضافة بند أسبوعي جديد:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="اسم البند (مثال: ترفيه، ملابس...)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden"
              />
              <input
                type="text"
                placeholder="المخصص (ريال)"
                value={newCatAmount}
                onChange={(e) => setNewCatAmount(e.target.value)}
                className="w-24 text-center text-xs font-medium px-2 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                إضافة
              </button>
            </div>
          </div>

          {/* Total Summary */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center justify-between">
            <span>إجمالي الميزانية الأسبوعية الجديدة:</span>
            <span className="text-sm font-['Tajawal'] font-black">
              {totalAllocated.toLocaleString('ar-SA')} ريال
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>حفظ المخصصات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
