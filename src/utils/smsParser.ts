/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { parseArabicNumber } from './numberUtils';

export interface ParsedSmsResult {
  amount: number;
  merchant: string;
  suggestedCategoryId: string;
  dateStr: string;
  rawSnippet: string;
}

export function parseBankSms(smsText: string): ParsedSmsResult | null {
  if (!smsText || smsText.trim().length === 0) return null;

  const text = smsText.trim();

  // 1. Extract Amount:
  // Examples:
  // "بمبلغ 45.50 ر.س" or "بمبلغ 120 ريال" or "بقيمة SAR 75.00" or "amount 50.00" or "45.50 SAR" or "مبلغ: 80.00"
  let amount = 0;

  // Regex patterns covering Saudi banks (Al Rajhi, SNB, Alinma, Riyad, Albilad, SAB, STC Pay, Urpay, etc.)
  const amountPatterns = [
    /(?:بمبلغ|بقيمة|مبلغ|amount|purchase of|debit of|pos purchase of)[\s:]*([0-9٠-٩]+(?:[.,،][0-9٠-٩]{1,2})?)\s*(?:ر\.?س|ريال|sar|sr)?/i,
    /([0-9٠-٩]+(?:[.,،][0-9٠-٩]{1,2})?)\s*(?:ر\.س|ريال|sar|sr)/i,
    /(?:sar|sr|ر\.س|ريال)[\s:]*([0-9٠-٩]+(?:[.,،][0-9٠-٩]{1,2})?)/i,
  ];

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const parsed = parseArabicNumber(match[1]);
      if (parsed > 0) {
        amount = parsed;
        break;
      }
    }
  }

  // 2. Extract Merchant / Vendor
  // Patterns: "لدى [التاجر]" or "من [التاجر]" or "عند [التاجر]" or "at [Merchant]"
  let merchant = '';
  const merchantPatterns = [
    /(?:لدى|عند|في|لـ|من)\s+([^\n\r,.;:!؟]+?)(?:\s+(?:في|بتاريخ|في تاريخ|بواسطة|عبر|بطاقة|الرصيد|المتبقي|حسابك|يوم|$))/i,
    /at\s+([^\n\r,.;:!]+?)(?:\s+(?:on|date|via|card|bal|ref|$))/i,
  ];

  for (const pattern of merchantPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Filter out noise keywords
      if (!candidate.includes('بطاقة') && !candidate.includes('حساب') && candidate.length > 1) {
        merchant = candidate.replace(/[0-9*#]/g, '').trim();
        break;
      }
    }
  }

  if (!merchant) {
    // If no merchant pattern matched, look for common store names in the text
    if (/بنده|العثيم|كارفور|دانوب|تموينات|سوبرماركت|لولو/i.test(text)) {
      merchant = 'سوبرماركت / مقاضي';
    } else if (/الدريس|ساسكو|محطة|بترومين|نفط|وقود|بنزين/i.test(text)) {
      merchant = 'محطة وقود';
    } else if (/ماكدونالدز|شاورما|مطعم|كافيه|قهوة|بارنز|ستاربكس|بيك|هنقرستيشن|جاهز/i.test(text)) {
      merchant = 'مطعم / كافيه';
    } else if (/صيدلية|النهدي|الدواء/i.test(text)) {
      merchant = 'صيدلية';
    } else {
      merchant = 'مشتريات بطاقة';
    }
  }

  // 3. Category Detection based on Merchant and Text keywords
  const combined = (merchant + ' ' + text).toLowerCase();
  let suggestedCategoryId = 'cat-personal'; // default

  if (
    /بنزين|وقود|محطة|الدريس|ساسكو|نفط|بترومين|توتال|شل|fuel|petrol|gas station/i.test(
      combined
    )
  ) {
    suggestedCategoryId = 'cat-fuel';
  } else if (
    /بنده|العثيم|لولو|كارفور|دانوب|تموينات|سوبرماركت|بقالة|مخبز|خضار|لحوم|أسواق|grocer|hypermarket|supermarket/i.test(
      combined
    )
  ) {
    suggestedCategoryId = 'cat-groceries';
  } else if (
    /مطعم|كافيه|قهوة|بارنز|ستاربكس|شاورما|ماكدونالدز|كنتاكي|برجر|بيك|رومانسية|هنقرستيشن|جاهز|تويو|شيفز|restaurant|cafe|coffee|burger/i.test(
      combined
    )
  ) {
    suggestedCategoryId = 'cat-dining';
  } else if (
    /صيدلية|النهدي|الدواء|علاج|مستشفى|مستوصف|عيادة|طبي|pharmacy|clinic|medical/i.test(
      combined
    )
  ) {
    suggestedCategoryId = 'cat-pharmacy';
  } else if (
    /فاتورة|كهرباء|مياه|اتصالات|stc|موبايلي|زين|سلام|نت|إنترنت|أقساط|bill|telecom/i.test(
      combined
    )
  ) {
    suggestedCategoryId = 'cat-bills';
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return {
    amount,
    merchant,
    suggestedCategoryId,
    dateStr: todayStr,
    rawSnippet: text.slice(0, 120),
  };
}
