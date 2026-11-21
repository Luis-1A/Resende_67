// Real calendar utility for parsing DD/MM/AAAA birth dates and computing exact elapsed years, months, and days

export const DEFAULT_BIRTH_DATE = '22/11/2008';

export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year, month1Based) {
  if (month1Based === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month1Based) ? 30 : 31;
}

/**
 * Parses a Brazilian date string in DD/MM/AAAA format (or { day, month, year } object)
 * and validates calendar bounds (including leap-year Feb 29).
 */
export function parseBrazilianDate(input = DEFAULT_BIRTH_DATE) {
  let day, month, year;
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

export function formatDatePT(date) {
  const d = date.getDate();
  const m = MONTH_NAMES_PT[date.getMonth()].toLowerCase();
  const y = date.getFullYear();
  return `${d} de ${m} de ${y}`;
}

export function formatElapsedSummary(years, months, days) {
  const yLabel = years === 1 ? '1 ano' : `${years} anos`;
  const mLabel = months === 1 ? '1 mês' : `${months} meses`;
  const dLabel = days === 1 ? '1 dia' : `${days} dias`;
  return `${yLabel}, ${mLabel} e ${dLabel}`;
}

/**
 * Calculates exact calendar-accurate elapsed years, months, and remaining days
 * between a DD/MM/AAAA birth date and referenceDate (defaults to today's local date).
 * Handles leap years, variable month lengths (28/29/30/31), and unreached birthdays.
 */
export function calculateElapsedTime(birthDateInput = DEFAULT_BIRTH_DATE, referenceDate = new Date()) {
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

  // Exact anchor date after full elapsed calendar years and months
  const anchorTotalMonths = (birth.month - 1) + totalMonths;
  const anchorYear = birth.year + Math.floor(anchorTotalMonths / 12);
  const anchorMonth = (anchorTotalMonths % 12) + 1;
  const anchorDay = Math.min(birth.day, daysInMonth(anchorYear, anchorMonth));

  const utcNow = Date.UTC(nowYear, nowMonth - 1, nowDay);
  const utcAnchor = Date.UTC(anchorYear, anchorMonth - 1, anchorDay);
  const days = Math.max(0, Math.round((utcNow - utcAnchor) / 86400000));

  const timelineYears = [];
  for (let y = birth.year; y <= nowYear; y++) {
    timelineYears.push(y);
  }

  const elapsedMonthSequence = [];
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
