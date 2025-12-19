// constants/Constant.ts
export const Constant = {
  RAILWAY_URL: 'http://railwayb2.somee.com/' as const,

  /**
   * Format date giống Java DateTimeFormatter trong project Railway (thường là M/d/yyyy).
   * Ví dụ: 1/5/2026
   */
  formatDate(date: Date): string {
    const d = new Date(date);
    const month = d.getMonth() + 1; // 1-12
    const day = d.getDate();        // 1-31
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  },

  /**
   * Parse text ngày từ bảng "Depart Date" về Date (date-only).
   * Expected: M/d/yyyy
   */
  parseDate(text: string): Date {
    const t = text.trim();

    // M/d/yyyy
    const match = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) {
      throw new Error(`Invalid date format: "${text}". Expected M/d/yyyy`);
    }

    const month = Number.parseInt(match[1], 10);
    const day = Number.parseInt(match[2], 10);
    const year = Number.parseInt(match[3], 10);

    const d = new Date(year, month - 1, day);
    d.setHours(0, 0, 0, 0);
    return d;
  }
} as const;
