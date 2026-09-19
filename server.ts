/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // API Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Smart Spending Analysis & Financial Development Report
  app.post('/api/ai-report', async (req, res) => {
    try {
      const { weeklyBudget, categories, expenses } = req.body;

      // Prepare context summary for Gemini
      const totalAllocated = categories.reduce((sum: number, c: any) => sum + (c.weeklyAllocation || 0), 0);
      const totalSpent = categories.reduce((sum: number, c: any) => sum + (c.spent || 0), 0);
      const totalRemaining = totalAllocated - totalSpent;

      const categoriesSummary = categories.map((c: any) => {
        const remaining = (c.weeklyAllocation || 0) - (c.spent || 0);
        const pct = c.weeklyAllocation > 0 ? Math.round((c.spent / c.weeklyAllocation) * 100) : 0;
        return `- بند "${c.name}": المخصص الأسبوعي ${c.weeklyAllocation} ريال، المصروف ${c.spent} ريال، الباقي ${remaining} ريال (استهلاك ${pct}%)`;
      }).join('\n');

      const recentExpensesSummary = expenses.slice(0, 15).map((e: any) => {
        return `- ${e.date || 'اليوم'}: ${e.amount} ريال لبند [${e.categoryName || e.envelopeName}] - البيان: "${e.description || 'بدون بيان'}"`;
      }).join('\n');

      const prompt = `أنت خبير مالي شخصي ذكي وموجّه مالي محترف لمواطني ومقيمي المملكة العربية السعودية والخليج.
المستخدم يتبع نظام "الميزانية الأسبوعية بالبنود" ولديه البيانات التالية لهذا الأسبوع:

الميزانية الأسبوعية الإجمالية:
- إجمالي المخصص الأسبوعي لجميع البنود: ${totalAllocated} ريال سعودي
- إجمالي ما تم صرفه حتى الآن: ${totalSpent} ريال سعودي
- إجمالي الباقي للأسبوع: ${totalRemaining} ريال سعودي

تفاصيل البنود الأسبوعية:
${categoriesSummary}

سجل العمليات والمصروفات المسجلة:
${recentExpensesSummary || 'لا توجد مصروفات مسجلة حتى الآن.'}

المطلوب: قم بتقديم "تقرير ذكي وشامل للصرف والتطوير المالي" بأسلوب محفّز، مهني، ومباشر باللغة العربية، يحتوي على الأقسام التالية بوضوح:
1. 📊 تقييم أداء الصرف للأسبوع الحالي (درجة الانضباط من 10، وتحديد هل الوضع آمن أم في مرحلة خطر أو تجاوز).
2. 🔍 كشف التسريبات والملاحظات على البنود (أي البنود تم استنزافها بسرعة؟ وأي البنود فيها وفرة وباقي جيد؟).
3. 💡 3 نصائح عملية وحاسمة للأيام المتبقية لتوفير الفائض وتجنب العجز.
4. 🚀 خطة تطوير الميزانية الأسبوعية للأسبوع القادم (اقتراح تعديل المخصصات بناءً على سلوك الصرف الفعلي لتطوير العادات المالية والادخار).

اجعل التقرير عملياً جداً ومقسماً بنقاط جذابة ومختصرة ومفيدة للمستخدم دون إطالة مملة.`;

      const ai = getAiClient();

      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const reportText = response.text || '';
        return res.json({
          report: reportText,
          source: 'gemini',
        });
      }

      // Fallback rule-based intelligent report if GEMINI_API_KEY is not configured yet
      const fallbackReport = generateFallbackReport(totalAllocated, totalSpent, totalRemaining, categories);
      return res.json({
        report: fallbackReport,
        source: 'local_engine',
      });
    } catch (error: any) {
      console.error('Error generating AI report:', error);
      // Fallback to internal engine on any error so app never fails
      const fallbackReport = generateFallbackReport(
        req.body?.weeklyBudget?.totalAllocated || 1200,
        req.body?.weeklyBudget?.totalSpent || 500,
        (req.body?.weeklyBudget?.totalAllocated || 1200) - (req.body?.weeklyBudget?.totalSpent || 500),
        req.body?.categories || []
      );
      return res.json({
        report: fallbackReport,
        source: 'local_engine',
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

function generateFallbackReport(totalAllocated: number, totalSpent: number, totalRemaining: number, categories: any[]): string {
  const spentPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
  const statusScore = totalRemaining >= 0 ? (spentPct <= 70 ? '8.5 / 10 (ممتاز ومنضبط)' : '6.5 / 10 (يحتاج حذر وترشيد)') : '4 / 10 (تجاوز للميزانية)';

  const overspentCats = categories.filter((c: any) => c.spent > c.weeklyAllocation);
  const safeCats = categories.filter((c: any) => c.weeklyAllocation - c.spent > 0);

  return `### 📊 تقييم أداء الصرف للأسبوع الحالي
- **مستوى الالتزام المالي:** ${statusScore}
- **إجمالي المخصص الأسبوعي:** ${totalAllocated.toLocaleString('ar-SA')} ريال
- **ما تم صرفه حتى الآن:** ${totalSpent.toLocaleString('ar-SA')} ريال (${spentPct}%)
- **الباقي المتاح للأسبوع:** ${totalRemaining.toLocaleString('ar-SA')} ريال

---

### 🔍 كشف التسريبات والملاحظات على البنود
${overspentCats.length > 0 
  ? overspentCats.map((c: any) => `- ⚠️ **بند ${c.name}:** تجاوز المخصص بمقدار ${(c.spent - c.weeklyAllocation).toLocaleString('ar-SA')} ريال! يُنصح بوقف الصرف فيه فوراً حتى بداية الأسبوع الجديد.`).join('\n')
  : '- 🟢 **وضع البنود منضبط:** لا توجد بنود تجاوزت مخصصاتها المحددة حتى الآن.'}
${safeCats.length > 0 
  ? safeCats.map((c: any) => `- ✨ **بند ${c.name}:** متبقي فيه ${(c.weeklyAllocation - c.spent).toLocaleString('ar-SA')} ريال (وضع ممتاز).`).join('\n')
  : ''}

---

### 💡 3 نصائح عملية ومحددة لتوفير الفائض
1. **قاعدة التحويل الداخلي بين البنود:** إذا احتجت للشراء في بند قارب على النفاد، قم بتغطيته من فائض بند آخر (مثل الصيدلية أو المصروف الشخصي) دون سحب ريال إضافي خارج ميزانية الأسبوع.
2. **فرملة نهاية الأسبوع:** وجّه المصروف للأولويات الأساسية فقط في آخر يومين من الأسبوع لتحقيق فائض نقدي يمكنك ترحيله للادخار.
3. **مراجعة فواتير المطاعم والمقاضي:** المشتريات الصغيرة المتكررة هي المسبب الأكبر لتبخر الميزانية الأسبوعية دون أن نشعر.

---

### 🚀 خطة تطوير الميزانية للأسبوع القادم
- **زيادة مخصص البنود الحيوية:** إذا تكرر استنزاف بند المقاضي، قم بزيادته بنسبة 10% مقابل تقليص بند المطاعم أو الترفيه.
- **تخصيص فائض أسبوعي للادخار:** تحويل ما تبقى من هذا الأسبوع (${Math.max(0, totalRemaining).toLocaleString('ar-SA')} ريال) مباشرة كحافز لحساب الطوارئ أو الأهداف الشخصية.`;
}

startServer();
