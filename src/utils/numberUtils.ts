/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Converts Eastern Arabic numerals (٠-٩) and Persian numerals (۰-۹)
 * as well as Arabic commas/decimal separators to standard ASCII digits.
 */
export function toStandardNumerals(str: string): string {
  if (!str) return '';
  
  // Mapping of Eastern Arabic & Persian digits
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const persianNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  let result = str;

  // Replace Arabic-Indic numerals
  for (let i = 0; i < 10; i++) {
    result = result.replaceAll(arabicNumerals[i], i.toString());
    result = result.replaceAll(persianNumerals[i], i.toString());
  }

  // Replace Arabic comma (،) with decimal point (.)
  result = result.replaceAll('،', '.');
  result = result.replaceAll(',', '.');

  return result;
}

/**
 * Parses any string with Arabic or English digits into a safe floating-point number.
 */
export function parseArabicNumber(input: string | number): number {
  if (typeof input === 'number') {
    return isNaN(input) ? 0 : input;
  }
  if (!input) return 0;

  const normalized = toStandardNumerals(input.trim());
  // Remove any characters except digits and decimal point
  const cleaned = normalized.replace(/[^0-9.]/g, '');
  
  // Handle case with multiple decimal points
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    const validStr = `${parts[0]}.${parts.slice(1).join('')}`;
    const parsed = parseFloat(validStr);
    return isNaN(parsed) ? 0 : parsed;
  }

  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

/**
 * Compresses an image file client-side to save space in localStorage
 * while maintaining good visual fidelity for receipts or product photos.
 */
export function compressImage(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
