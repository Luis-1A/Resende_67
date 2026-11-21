import {
  DEFAULT_BIRTH_DATE,
  MONTH_NAMES_PT,
  isLeapYear,
  daysInMonth,
  parseBrazilianDate,
  formatDatePT,
  formatElapsedSummary,
  calculateElapsedTime,
  type ElapsedTimeResult
} from '../../date-calculator';

export const BIRTH_DATE_STR = DEFAULT_BIRTH_DATE;
export const BIRTH_DATE = parseBrazilianDate(DEFAULT_BIRTH_DATE);

export function calculateExactAge(
  birthInput: string | { day: number; month: number; year: number } = DEFAULT_BIRTH_DATE,
  referenceDate: Date = new Date()
): ElapsedTimeResult {
  return calculateElapsedTime(birthInput, referenceDate);
}

export {
  MONTH_NAMES_PT,
  isLeapYear,
  daysInMonth,
  parseBrazilianDate,
  formatDatePT,
  formatElapsedSummary,
  calculateElapsedTime
};

export default {
  BIRTH_DATE_STR,
  BIRTH_DATE,
  MONTH_NAMES_PT,
  isLeapYear,
  daysInMonth,
  calculateExactAge,
  calculateElapsedTime
};
