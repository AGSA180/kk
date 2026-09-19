import React from 'react';
import {
  Wallet,
  Coins,
  ShieldCheck,
  Fuel,
  Landmark,
  Layers,
  HelpCircle,
  Plus,
  SlidersHorizontal,
  Bell
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'commitments' | 'envelopes' | 'fuel' | 'savings';
  setActiveTab: (tab: 'home' | 'commitments' | 'envelopes' | 'fuel' | 'savings') => void;
  onOpenCanIBuy: () => void;
  onOpenAddExpense: () => void;
  onOpenSettings: () => void;
  unreadAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCanIBuy,
  onOpenAddExpense,
  onOpenSettings,
  unreadAlertsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-18 gap-3">
          {/* Logo & Identity */}
          <div
            id="brand-logo"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Coins className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 font-['Tajawal']">
                  كم تصرف اليوم؟
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  المدير الذكي
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                حوّل راتبك الشهري إلى قرار يومي آمن
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* The highlighted "Can I Buy This?" button */}
            <button
              id="btn-can-i-buy"
              onClick={onOpenCanIBuy}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm hover:shadow transition-all duration-150 active:scale-95"
            >
              <HelpCircle className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">هل أستطيع شراء هذا؟</span>
              <span className="xs:hidden">استشارة</span>
            </button>

            {/* Quick Add Expense */}
            <button
              id="btn-add-expense-nav"
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all duration-150 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>أضف مصروف</span>
            </button>

            {/* Settings */}
            <button
              id="btn-settings"
              onClick={onOpenSettings}
              title="إعدادات الراتب والميزانية"
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar text-sm font-semibold text-slate-600">
          <button
            id="tab-nav-home"
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'home'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>الرئيسية (اليومية)</span>
          </button>

          <button
            id="tab-nav-commitments"
            onClick={() => setActiveTab('commitments')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'commitments'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>الالتزامات</span>
          </button>

          <button
            id="tab-nav-envelopes"
            onClick={() => setActiveTab('envelopes')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'envelopes'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>المظاريف</span>
          </button>

          <button
            id="tab-nav-fuel"
            onClick={() => setActiveTab('fuel')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'fuel'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Fuel className="w-4 h-4" />
            <span>ميزانية الوقود</span>
          </button>

          <button
            id="tab-nav-savings"
            onClick={() => setActiveTab('savings')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'savings'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>تأمين البيت والادخار</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
