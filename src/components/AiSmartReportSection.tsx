/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Printer,
  Copy,
  Check,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AiSmartReportSectionProps {
  report: string | null;
  isLoading: boolean;
  onRegenerate: () => void;
  onPrint: () => void;
}

export const AiSmartReportSection: React.FC<AiSmartReportSectionProps> = ({
  report,
  isLoading,
  onRegenerate,
  onPrint,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!report && !isLoading) {
    return (
      <div className="bg-linear-to-r from-emerald-900/10 via-teal-900/10 to-indigo-900/10 rounded-3xl p-6 border border-emerald-500/20 text-center space-y-3 print:hidden">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-black font-['Tajawal'] text-slate-900">
            التقرير الذكي للصرف والتطوير المالي
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
            يقوم الذكاء بتحليل نمط صرفك في كل بند أسبوعي، وتحديد التسريبات، وتقديم 3 نصائح عملية مع خطة تطوير للأسبوع القادم
          </p>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>توليد التقرير الذكي الآن</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-5 sm:p-7 shadow-lg shadow-emerald-950/5 space-y-4 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-linear-to-br from-emerald-600 to-teal-700 text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black font-['Tajawal'] text-slate-900">
                التقرير الذكي للصرف والتطوير
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                تحليل ذكي فوري
              </span>
            </div>
            <p className="text-xs text-slate-500">
              توجيه مالي شخصي مبني على ميزانيتك الأسبوعية ومصروفاتك الفعلية
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap print:hidden">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!report || isLoading}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="نسخ التقرير"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="طباعة التقرير"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة</span>
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="تحديث التحليل"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'جاري التحليل...' : 'تحديث التقرير'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title={isExpanded ? 'طي التقرير' : 'توسيع التقرير'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            الذكاء يقوم الآن بدراسة مصروفاتك الأسبوعية وصياغة خطة التطوير المالي...
          </p>
        </div>
      ) : isExpanded ? (
        <div className="pt-2 text-slate-800 text-sm leading-relaxed space-y-4 whitespace-pre-wrap font-medium">
          {report}
        </div>
      ) : (
        <div className="text-xs text-slate-500 py-1">
          تم طي التقرير. اضغط على زر التوسيع لقراءته.
        </div>
      )}
    </div>
  );
};
