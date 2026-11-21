// Real calendar math & timeline sequence from Anderson's birth date (22/11/2008) to current local date

export const BIRTH_DATE = { day: 22, month: 11, year: 2008 };

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
 * Computes exact elapsed calendar years, remaining full months, and remaining days
 * honoring leap years, variable month lengths (28/29/30/31), local date, and
 * unreached anniversaries in the current year. Never approximates with / 365.
 */
export function calculateExactAge(birth = BIRTH_DATE, referenceDate = new Date()) {
  const nowYear = referenceDate.getFullYear();
  const nowMonth = referenceDate.getMonth() + 1;
  const nowDay = referenceDate.getDate();

  const bDate = new Date(birth.year, birth.month - 1, birth.day);
  const cDate = new Date(nowYear, nowMonth - 1, nowDay);

  if (cDate <= bDate) {
    return {
      years: 0,
      months: 0,
      days: 0,
      birthDate: bDate,
      currentDate: cDate,
      currentYear: nowYear,
      currentMonth: nowMonth,
      currentDay: nowDay,
      birthLabel: formatBirthDatePT(birth),
      currentLabel: formatDatePT(cDate),
      elapsedSummary: '0 anos, 0 meses e 0 dias',
      timelineYears: [birth.year],
      elapsedMonthSequence: []
    };
  }

  let totalMonths = (nowYear - birth.year) * 12 + (nowMonth - birth.month);
  const clampedAnchorDay = Math.min(birth.day, daysInMonth(nowYear, nowMonth));
  if (nowDay < clampedAnchorDay) {
    totalMonths -= 1;
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  // Compute exact anchor date = birth + totalMonths in real calendar months
  const anchorRawMonth = (birth.month - 1) + totalMonths;
  const anchorYear = birth.year + Math.floor(anchorRawMonth / 12);
  const anchorMonth1 = (anchorRawMonth % 12) + 1;
  const anchorDay = Math.min(birth.day, daysInMonth(anchorYear, anchorMonth1));
  const anchorDate = new Date(anchorYear, anchorMonth1 - 1, anchorDay);

  // Exact day difference between midnight local dates
  const utcNow = Date.UTC(nowYear, nowMonth - 1, nowDay);
  const utcAnchor = Date.UTC(anchorYear, anchorMonth1 - 1, anchorDay);
  const days = Math.max(0, Math.round((utcNow - utcAnchor) / 86400000));

  const timelineYears = [];
  for (let y = birth.year; y <= nowYear; y++) {
    timelineYears.push(y);
  }

  // Build ordered real-calendar month list covering the current year/remaining months
  const elapsedMonthSequence = [];
  const startMonth = birth.month;
  const count = months > 0 ? months : 12;
  for (let i = 0; i < count; i++) {
    const mIdx = ((startMonth - 1 + i) % 12);
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
    birthDate: bDate,
    currentDate: cDate,
    currentYear: nowYear,
    currentMonth: nowMonth,
    currentDay: nowDay,
    birthLabel: formatBirthDatePT(birth),
    currentLabel: formatDatePT(cDate),
    elapsedSummary: formatElapsedSummary(years, months, days),
    timelineYears,
    elapsedMonthSequence
  };
}

export function formatBirthDatePT(birth = BIRTH_DATE) {
  return `${birth.day} de ${MONTH_NAMES_PT[birth.month - 1].toLowerCase()} de ${birth.year}`;
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

export default {
  BIRTH_DATE,
  MONTH_NAMES_PT,
  isLeapYear,
  daysInMonth,
  calculateExactAge,
  formatBirthDatePT,
  formatDatePT,
  formatElapsedSummary
};
