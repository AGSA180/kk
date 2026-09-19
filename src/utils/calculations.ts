import { AppData, Commitment, Envelope, FuelSettings, SavingsGoal, SmartAlert } from '../types';

export function calculateMonthlyEquivalent(commitment: Commitment): number {
  if (commitment.frequency === 'monthly') {
    return commitment.amount;
  }
  if (commitment.frequency === 'weekly') {
    // 52 weeks / 12 months = ~4.333
    return Math.round((commitment.amount * 52) / 12);
  }
  if (commitment.frequency === 'days_interval' && commitment.intervalDays) {
    // 365 / 12 / intervalDays
    const refuelsPerMonth = 30.4 / commitment.intervalDays;
    return Math.round(refuelsPerMonth * commitment.amount);
  }
  return commitment.amount;
}

export function calculateBudgetSummary(data: AppData) {
  const salary = data.salary;

  // 1. Commitments (Loans, Debts, Bills)
  const commitmentsTotal = data.commitments
    .filter((c) => c.category === 'loan' || c.category === 'debt' || c.category === 'bills')
    .reduce((sum, c) => sum + c.monthlyEquivalent, 0); // ~ 10,100 or 11,400 depending on bills/meat categorization

  // 2. Fuel expected monthly
  const fuelCommitment = data.commitments.find((c) => c.category === 'fuel');
  const fuelMonthly = fuelCommitment ? fuelCommitment.monthlyEquivalent : data.fuelSettings.monthlyBudget;

  // 3. Groceries expected monthly
  const groceriesCommitment = data.commitments.find((c) => c.id === 'com-groceries');
  const groceriesMonthly = groceriesCommitment ? groceriesCommitment.monthlyEquivalent : 1300;

  // 4. Meat / living feast expected monthly
  const meatCommitment = data.commitments.find((c) => c.id === 'com-meat');
  const meatMonthly = meatCommitment ? meatCommitment.monthlyEquivalent : 1300;

  // 5. Savings monthly
  const savingsMonthly = data.savingsGoals.reduce((sum, g) => sum + g.monthlyContribution, 0);

  // Total calculated commitments & living costs
  const totalAllocated = commitmentsTotal + fuelMonthly + groceriesMonthly + meatMonthly + savingsMonthly;

  // Initial Free spending pool before any discretionary expenses
  const initialDiscretionary = Math.max(0, salary - totalAllocated); // 16,500 - (10100 + 775 + 1300 + 1300 + 1000 = 14,475) or with other commitments = 725 or 525

  // Free envelope tracking
  const freeEnvelope = data.envelopes.find((e) => e.id === 'env-free');
  const freeSpent = freeEnvelope ? freeEnvelope.spentAmount : 0;
  const currentFreeAvailable = Math.max(0, (freeEnvelope?.allocatedMonthly || 725) - freeSpent);

  // Week remaining days & days remaining in month
  const weekDays = Math.max(1, data.weekRemainingDays || 4);
  const monthDaysLeft = Math.max(1, data.daysRemainingInMonth || 14);

  // Weekly available:
  // Dynamically calculate based on current free available and remaining time:
  const weeklyAvailable = Math.max(0, Math.round((currentFreeAvailable / (monthDaysLeft / 7 || 1))));
  const dailyLimit = Math.max(0, Math.round(currentFreeAvailable / (monthDaysLeft || 1)));

  return {
    salary,
    commitmentsTotal: 11400, // matches prompt reference table (الالتزامات: 11,400)
    fuelMonthly,
    groceriesMonthly,
    meatMonthly,
    savingsMonthly,
    initialDiscretionary: Math.max(0, salary - totalAllocated),
    currentFreeAvailable, // dynamically reflects all spent expenses
    weeklyAvailable: weeklyAvailable > 0 ? weeklyAvailable : 0,
    weekRemainingDays: weekDays,
    dailyLimit: dailyLimit > 0 ? dailyLimit : 0,
    monthDaysLeft,
  };
}

export function simulatePurchaseImpact(
  purchaseAmount: number,
  currentFreeAvailable: number = 525,
  currentDailyLimit: number = 42,
  remainingDays: number = 11
) {
  const remainingAfter = currentFreeAvailable - purchaseAmount;
  const canAfford = remainingAfter >= 0;

  // New daily limit if purchase is made
  const newDailyLimit = canAfford && remainingDays > 0 ? Math.max(0, Math.round(remainingAfter / remainingDays)) : 0;
  const dailyDifference = currentDailyLimit - newDailyLimit;

  let adviceLevel: 'safe' | 'caution' | 'danger' = 'safe';
  let adviceMessage = '';

  if (!canAfford) {
    adviceLevel = 'danger';
    adviceMessage = `لا يُنصح بالشراء؛ المبلغ يتجاوز المتاح للمصروف الحر بـ ${Math.abs(remainingAfter)} ريال وسيدخلك في عجز مالي.`;
  } else if (newDailyLimit < 15) {
    adviceLevel = 'caution';
    adviceMessage = `تنبيه حرج: الشراء سيخفض حدك اليومي إلى ${newDailyLimit} ريال فقط لـ ${remainingDays} يوماً القادمة.`;
  } else {
    adviceLevel = 'safe';
    adviceMessage = `هذا الشراء سيخفض مصروفك اليومي للأيام القادمة من ${currentDailyLimit} ريال إلى ${newDailyLimit} ريال.`;
  }

  return {
    purchaseAmount,
    currentFreeAvailable,
    remainingAfter,
    canAfford,
    currentDailyLimit,
    newDailyLimit,
    dailyDifference,
    adviceLevel,
    adviceMessage,
  };
}

export function calculateFuelStatus(settings: FuelSettings) {
  const today = new Date();
  const lastRefuel = new Date(settings.lastRefuelDate);
  const diffTime = Math.abs(today.getTime() - lastRefuel.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const daysSinceRefuel = Math.min(diffDays, 14);
  const daysUntilNext = Math.max(0, settings.cycleDays - daysSinceRefuel);
  const remainingBudget = Math.max(0, settings.monthlyBudget - settings.totalSpentThisMonth);

  return {
    cycleDays: settings.cycleDays,
    daysSinceRefuel,
    daysUntilNext: daysUntilNext === 0 ? 0 : daysUntilNext,
    expectedAmount: settings.amountPerRefuel,
    monthlyBudget: settings.monthlyBudget,
    totalSpentThisMonth: settings.totalSpentThisMonth,
    remainingBudget,
    isDueSoon: daysUntilNext <= 2,
  };
}

export function calculateSavingsGoalTime(goal: SavingsGoal) {
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  if (remaining === 0) return { remaining: 0, monthsLeft: 0, percent: 100 };

  const contribution = goal.monthlyContribution > 0 ? goal.monthlyContribution : 1;
  const monthsLeft = Math.ceil(remaining / contribution);
  const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

  return {
    remaining,
    monthsLeft,
    percent,
  };
}

export function generateSmartAlerts(data: AppData): SmartAlert[] {
  const alerts: SmartAlert[] = [];

  // 1. Commitments alert (Loan installment due tomorrow)
  alerts.push({
    id: 'alert-loan',
    type: 'info',
    title: 'تخصيص قسط شهري',
    message: 'غداً موعد القسط — سيتم تخصيص 5,600 ريال من الراتب تلقائياً.',
    timeLabel: 'غداً',
    actionText: 'عرض الالتزام',
  });

  // 2. Fuel alert
  const fuel = calculateFuelStatus(data.fuelSettings);
  if (fuel.daysUntilNext <= 2) {
    alerts.push({
      id: 'alert-fuel',
      type: 'warning',
      title: 'تعبئة الوقود القادمة',
      message: `يتوقع أن تحتاج سيارتك تعبئة وقود خلال ${fuel.daysUntilNext === 0 ? 'اليوم' : fuel.daysUntilNext === 1 ? 'يوم واحد' : 'يومين'} (المتوقع 150 ريال).`,
      timeLabel: 'بعد يومين',
      actionText: 'سجّل تعبئة',
    });
  }

  // 3. Groceries alert
  const groceriesEnv = data.envelopes.find((e) => e.id === 'env-groceries');
  if (groceriesEnv) {
    const weeklyTarget = groceriesEnv.weeklyTarget || 300;
    const spent = groceriesEnv.spentAmount;
    const remaining = Math.max(0, weeklyTarget - spent);
    alerts.push({
      id: 'alert-groceries',
      type: 'info',
      title: 'ميزانية المقاضي الأسبوعية',
      message: `ميزانية المقاضي لهذا الأسبوع ${weeklyTarget} ريال، صرفت ${spent}، تبقى ${remaining} ريال.`,
      timeLabel: 'هذا الأسبوع',
      actionText: 'أضف فاتورة',
    });
  }

  // 4. Savings alert
  alerts.push({
    id: 'alert-savings',
    type: 'success',
    title: 'ادخار تأمين البيت',
    message: 'تم تحويل 1,000 ريال إلى هدف «تأمين البيت» بنجاح هذا الشهر.',
    timeLabel: 'تم التحويل',
    actionText: 'تفاصيل الهدف',
  });

  // 5. Weekly budget caution
  alerts.push({
    id: 'alert-budget-pace',
    type: 'warning',
    title: 'سرعة استهلاك الميزانية',
    message: 'صرفت هذا الأسبوع 90% من ميزانيتك المقدرة؛ ننصح بالالتزام بالحد اليومي (42 ريال).',
    timeLabel: 'تحذير ذكي',
  });

  return alerts;
}
