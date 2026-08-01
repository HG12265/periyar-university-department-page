import dayjs from 'dayjs';

export function parseDateToMonthYear(d: any): [string, string] {
  if (!d) return ['', ''];
  
  const dStr = String(d).trim();
  if (dStr === '' || dStr === '0000-00-00' || dStr === '1970-01-01') {
    return ['', ''];
  }

  // Handle standard Date object
  if (d instanceof Date) {
    const dj = dayjs(d);
    return [dj.format('MMMM'), dj.format('YYYY')];
  }

  // Parse string
  const dj = dayjs(dStr);
  if (dj.isValid()) {
    return [dj.format('MMMM'), dj.format('YYYY')];
  }

  return ['', ''];
}

export function safeIntYear(val: any): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return Math.floor(val);
  const digits = String(val).replace(/\D/g, '');
  if (digits.length === 0) return 0;
  const parsed = parseInt(digits, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function extractYearFromText(val: any): number {
  if (!val) return 0;
  const match = String(val).match(/\b(19\d\d|20\d\d)\b/);
  if (match) {
    const year = parseInt(match[1], 10);
    return isNaN(year) ? 0 : year;
  }
  return 0;
}

export function safeStrStrip(val: any): string {
  if (val === undefined || val === null) return '';
  if (val instanceof Date) {
    return dayjs(val).format('YYYY-MM-DD');
  }
  return String(val).trim();
}
