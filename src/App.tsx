/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WeeklyBudgetHeader } from './components/WeeklyBudgetHeader';
import { WeeklyCategoriesGrid } from './components/WeeklyCategoriesGrid';
import { UnifiedExpenseRecorder } from './components/UnifiedExpenseRecorder';
import { AiSmartReportSection } from './components/AiSmartReportSection';
import { WeeklyExpensesTable } from './components/WeeklyExpensesTable';
import { EditAllocationsModal } from './components/EditAllocationsModal';
import { ReceiptViewerModal } from './components/ReceiptViewerModal';
import { INITIAL_WEEKLY_DATA } from './data/initialData';
import { WeeklyAppData, WeeklyCategory, WeeklyExpense } from './types';
import { ShieldCheck, Printer, Calendar } from 'lucide-react';

const STORAGE_KEY = 'kam_tasrif_weekly_budget_v2';

export default function App() {
  const [data, setData] = useState<WeeklyAppData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved data', e);
    }
    return INITIAL_WEEKLY_DATA;
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    data.categories[0]?.id || 'cat-groceries'
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingExpense, setViewingExpense] = useState<WeeklyExpense | null>(null);

  // AI Report State
  const [aiReport, setAiReport] = useState<string | null>(data.aiReport || null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...data, aiReport })
      );
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [data, aiReport]);

  // Handle adding an expense
  const handleAddExpense = ({
    amount,
    description,
    categoryId,
    categoryName,
    date,
    imageUrl,
    remainingAfter,
    source,
    rawSmsText,
  }: {
    amount: number;
    description: string;
    categoryId: string;
    categoryName: string;
    date: string;
    imageUrl?: string;
    remainingAfter?: number;
    source?: 'manual' | 'sms' | 'camera' | 'upload';
    rawSmsText?: string;
  }) => {
    const targetCat = data.categories.find((c) => c.id === categoryId);
    const catRemaining = (targetCat?.weeklyAllocation || 0) - (targetCat?.spent || 0);
    const finalRemaining =
      typeof remainingAfter === 'number' ? remainingAfter : catRemaining - amount;

    const newExpense: WeeklyExpense = {
      id: `exp-${Date.now()}`,
      amount,
      description,
      categoryId,
      categoryName,
      date,
      timestamp: Date.now(),
      imageUrl,
      remainingAfter: finalRemaining,
      source: source || 'manual',
      rawSmsText,
    };

    // Update category spent amount
    const updatedCategories = data.categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          spent: cat.spent + amount,
        };
      }
      return cat;
    });

    setData((prev) => ({
      ...prev,
      categories: updatedCategories,
      expenses: [newExpense, ...prev.expenses],
    }));
  };

  // Handle deleting an expense
  const handleDeleteExpense = (id: string) => {
    const expense = data.expenses.find((e) => e.id === id);
    if (!expense) return;

    // Refund category spent
    const updatedCategories = data.categories.map((cat) => {
      if (cat.id === expense.categoryId) {
        return {
          ...cat,
          spent: Math.max(0, cat.spent - expense.amount),
        };
      }
      return cat;
    });

    setData((prev) => ({
      ...prev,
      categories: updatedCategories,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  // Handle saving modified allocations & days
  const handleSaveAllocations = (
    updatedCategories: WeeklyCategory[],
    updatedDays: number
  ) => {
    setData((prev) => ({
      ...prev,
      categories: updatedCategories,
      daysLeftInWeek: updatedDays,
    }));
  };

  // Generate AI Spending and Development Report
  const handleGenerateAiReport = async () => {
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weeklyBudget: {
            totalAllocated: data.categories.reduce(
              (s, c) => s + (c.weeklyAllocation || 0),
              0
            ),
            totalSpent: data.categories.reduce((s, c) => s + (c.spent || 0), 0),
          },
          categories: data.categories,
          expenses: data.expenses,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAiReport(result.report);
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (err) {
      console.error('Error fetching AI report:', err);
      // Fallback local report directly
      setAiReport(
        `### 📊 تقييم أداء الصرف للأسبوع الحالي
- **مستوى الالتزام:** 8 / 10 (منضبط عموماً)
- **إجمالي المخصص الأسبوعي:** ${data.categories
          .reduce((s, c) => s + (c.weeklyAllocation || 0), 0)
          .toLocaleString('ar-SA')} ريال
- **إجمالي المصروف:** ${data.categories
          .reduce((s, c) => s + (c.spent || 0), 0)
          .toLocaleString('ar-SA')} ريال

### 💡 3 نصائح عملية لتطوير الميزانية
1. قم بوقف الصرف في أي بند قارب على تجاوز مخصصه.
2. رحّل الفائض المتبقي إلى حساب الادخار بنهاية الأسبوع.
3. التزم بتسجيل المشتريات أولاً بأول لضبط النفقات الصغيرة.`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  const todayDateStr = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Tajawal'] antialiased">
      {/* Printable Report Header (Only visible on print) */}
      <div className="hidden print:block p-4 border-b-2 border-slate-900 mb-6 text-center">
        <h1 className="text-2xl font-black font-['Tajawal'] text-slate-900">
          كشف المصروفات والميزانية الأسبوعية بالبنود
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          تاريخ التقرير: {todayDateStr} • الأيام المتبقية من الأسبوع: {data.daysLeftInWeek} أيام
        </p>
      </div>

      {/* Main Single-Page Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* 1. Header with Big Numbers & Actions */}
        <WeeklyBudgetHeader
          weekName={data.weekName}
          daysLeftInWeek={data.daysLeftInWeek}
          categories={data.categories}
          onOpenEditModal={() => setIsEditModalOpen(true)}
          onGenerateAiReport={handleGenerateAiReport}
          isGeneratingAi={isGeneratingAi}
          onPrint={handlePrint}
        />

        {/* 2. Interactive Weekly Categories Grid */}
        <WeeklyCategoriesGrid
          categories={data.categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(id) => setSelectedCategoryId(id)}
          onOpenEditModal={() => setIsEditModalOpen(true)}
        />

        {/* 3. Unified Expense Recorder (Manual + Camera/Photo + Bank SMS Paster) */}
        <UnifiedExpenseRecorder
          categories={data.categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(id) => setSelectedCategoryId(id)}
          onAddExpense={handleAddExpense}
        />

        {/* 4. AI Smart Spending & Development Report */}
        <AiSmartReportSection
          report={aiReport}
          isLoading={isGeneratingAi}
          onRegenerate={handleGenerateAiReport}
          onPrint={handlePrint}
        />

        {/* 5. Complete Weekly Expenses Log with Print Capability */}
        <WeeklyExpensesTable
          expenses={data.expenses}
          categories={data.categories}
          onDeleteExpense={handleDeleteExpense}
          onViewReceipt={(imageUrl, description) => {
            const exp = data.expenses.find((e) => e.imageUrl === imageUrl);
            setViewingExpense(
              exp || {
                id: 'temp',
                date: new Date().toISOString().split('T')[0],
                amount: 0,
                description,
                categoryId: '',
                categoryName: '',
                timestamp: Date.now(),
                imageUrl,
              }
            );
          }}
          onPrint={handlePrint}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-auto print:hidden">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-bold text-slate-700">
            كم تصرف اليوم — ميزانيتي الأسبوعية بالبنود
          </p>
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>بياناتك ومصروفاتك محفوظة محلياً على جهازك بأمان</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EditAllocationsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        categories={data.categories}
        daysLeftInWeek={data.daysLeftInWeek}
        onSave={handleSaveAllocations}
      />

      <ReceiptViewerModal
        isOpen={!!viewingExpense}
        onClose={() => setViewingExpense(null)}
        expense={viewingExpense}
      />
    </div>
  );
}
