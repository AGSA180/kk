import React from 'react';
import { Bell, Sparkles, AlertTriangle, CheckCircle, Info, ArrowLeft, Fuel, ShoppingCart, Landmark } from 'lucide-react';
import { SmartAlert } from '../types';

interface SmartAlertsListProps {
  alerts: SmartAlert[];
  onActionClick?: (alert: SmartAlert) => void;
}

export const SmartAlertsList: React.FC<SmartAlertsListProps> = ({ alerts, onActionClick }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              التنبيهات والمستشار المالي الذكي
            </h3>
            <p className="text-xs text-slate-500">
              تنبيهات استباقية ومواعيد تخصيص الميزانية
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
          {alerts.length} تنبيهات نشطة
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {alerts.map((alert) => {
          let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
          let icon = <Info className="w-4 h-4 text-blue-600 shrink-0" />;

          if (alert.type === 'warning') {
            badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
            icon = <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
          } else if (alert.type === 'success') {
            badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            icon = <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />;
          }

          return (
            <div
              key={alert.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col justify-between ${badgeColor}`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-bold text-xs sm:text-sm">{alert.title}</span>
                  </div>
                  {alert.timeLabel && (
                    <span className="text-[11px] font-semibold opacity-75 px-2 py-0.5 rounded-md bg-white/70">
                      {alert.timeLabel}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed opacity-90 font-medium">
                  {alert.message}
                </p>
              </div>

              {alert.actionText && (
                <div className="pt-2.5 mt-1 border-t border-current/10 flex justify-end">
                  <button
                    onClick={() => onActionClick?.(alert)}
                    className="text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer opacity-90 hover:opacity-100"
                  >
                    <span>{alert.actionText}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
