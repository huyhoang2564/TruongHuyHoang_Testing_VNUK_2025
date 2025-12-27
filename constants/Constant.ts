export const Constant = {
  RAILWAY_URL: 'http://railwayb2.somee.com/' as const,

  formatDate(date: Date): string {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  },


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
  },

  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
} as const;
