export const DEFAULT_BIRTH_DATE = '22/11/2008';

export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export interface ParsedDateParts {
  day: number;
  month: number;
  year: number;
  date: Date;
}

export interface ElapsedMonthEntry {
  monthIndex: number;
  name: string;
  daysCount: number;
}

export interface ElapsedTimeResult {
  years: number;
  months: number;
  days: number;
  birth: { day: number; month: number; year: number };
  current: { day: number; month: number; year: number };
  birthDate: Date;
  currentDate: Date;
  currentYear: number;
  currentMonth: number;
  currentDay: number;
  birthLabel: string;
  currentLabel: string;
  elapsedSummary: string;
  timelineYears: number[];
  elapsedMonthSequence: ElapsedMonthEntry[];
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month1Based: number): number {
  if (month1Based === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month1Based) ? 30 : 31;
}

export function parseBrazilianDate(input: string | { day: number; month: number; year: number } = DEFAULT_BIRTH_DATE): ParsedDateParts {
  let day: number;
  let month: number;
  let year: number;
  if (typeof input === 'string') {
    const match = input.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) {
      throw new Error(`Invalid date format "${input}". Expected DD/MM/AAAA.`);
    }
    day = parseInt(match[1], 10);
    month = parseInt(match[2], 10);
    year = parseInt(match[3], 10);
  } else if (input && typeof input === 'object') {
    day = Number(input.day);
    month = Number(input.month);
    year = Number(input.year);
  } else {
    throw new Error('Birth date must be a DD/MM/AAAA string.');
  }

  if (month < 1 || month > 12 || year < 1900) {
    throw new Error(`Invalid month/year in birth date: ${day}/${month}/${year}`);
  }
  const maxD = daysInMonth(year, month);
  if (day < 1 || day > maxD) {
    throw new Error(`Invalid day ${day} for ${month}/${year} (max ${maxD}).`);
  }

  return { day, month, year, date: new Date(year, month - 1, day) };
}

export function formatDatePT(date: Date): string {
  const d = date.getDate();
  const m = MONTH_NAMES_PT[date.getMonth()].toLowerCase();
  const y = date.getFullYear();
  return `${d} de ${m} de ${y}`;
}

export function formatElapsedSummary(years: number, months: number, days: number): string {
  const yLabel = years === 1 ? '1 ano' : `${years} anos`;
  const mLabel = months === 1 ? '1 mês' : `${months} meses`;
  const dLabel = days === 1 ? '1 dia' : `${days} dias`;
  return `${yLabel}, ${mLabel} e ${dLabel}`;
}

export function calculateElapsedTime(
  birthDateInput: string | { day: number; month: number; year: number } = DEFAULT_BIRTH_DATE,
  referenceDate: Date = new Date()
): ElapsedTimeResult {
  const birth = parseBrazilianDate(birthDateInput);
  const nowYear = referenceDate.getFullYear();
  const nowMonth = referenceDate.getMonth() + 1;
  const nowDay = referenceDate.getDate();
  const currentDate = new Date(nowYear, nowMonth - 1, nowDay);

  if (currentDate <= birth.date) {
    return {
      years: 0,
      months: 0,
      days: 0,
      birth: { day: birth.day, month: birth.month, year: birth.year },
      current: { day: nowDay, month: nowMonth, year: nowYear },
      birthDate: birth.date,
      currentDate,
      currentYear: nowYear,
      currentMonth: nowMonth,
      currentDay: nowDay,
      birthLabel: formatDatePT(birth.date),
      currentLabel: formatDatePT(currentDate),
      elapsedSummary: formatElapsedSummary(0, 0, 0),
      timelineYears: [birth.year],
      elapsedMonthSequence: []
    };
  }

  let totalMonths = (nowYear - birth.year) * 12 + (nowMonth - birth.month);
  const clampedNowBirthDay = Math.min(birth.day, daysInMonth(nowYear, nowMonth));
  if (nowDay < clampedNowBirthDay) {
    totalMonths -= 1;
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const anchorTotalMonths = (birth.month - 1) + totalMonths;
  const anchorYear = birth.year + Math.floor(anchorTotalMonths / 12);
  const anchorMonth = (anchorTotalMonths % 12) + 1;
  const anchorDay = Math.min(birth.day, daysInMonth(anchorYear, anchorMonth));

  const utcNow = Date.UTC(nowYear, nowMonth - 1, nowDay);
  const utcAnchor = Date.UTC(anchorYear, anchorMonth - 1, anchorDay);
  const days = Math.max(0, Math.round((utcNow - utcAnchor) / 86400000));

  const timelineYears: number[] = [];
  for (let y = birth.year; y <= nowYear; y++) {
    timelineYears.push(y);
  }

  const elapsedMonthSequence: ElapsedMonthEntry[] = [];
  const count = months > 0 ? months : 12;
  for (let i = 0; i < count; i++) {
    const mIdx = (birth.month - 1 + i) % 12;
    const stepYear = anchorYear - (months > 0 ? Math.floor((months - 1 - i) / 12) : 0);
    elapsedMonthSequence.push({
      monthIndex: mIdx,
      name: MONTH_NAMES_PT[mIdx],
      daysCount: daysInMonth(stepYear, mIdx + 1)
    });
  }

  return {
    years,
    months,
    days,
    birth: { day: birth.day, month: birth.month, year: birth.year },
    current: { day: nowDay, month: nowMonth, year: nowYear },
    birthDate: birth.date,
    currentDate,
    currentYear: nowYear,
    currentMonth: nowMonth,
    currentDay: nowDay,
    birthLabel: formatDatePT(birth.date),
    currentLabel: formatDatePT(currentDate),
    elapsedSummary: formatElapsedSummary(years, months, days),
    timelineYears,
    elapsedMonthSequence
  };
}

export default {
  DEFAULT_BIRTH_DATE,
  MONTH_NAMES_PT,
  isLeapYear,
  daysInMonth,
  parseBrazilianDate,
  formatDatePT,
  formatElapsedSummary,
  calculateElapsedTime
};
