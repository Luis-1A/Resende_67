// Adapter connecting Anderson's time journey to js/date-calculator.js

import {
  DEFAULT_BIRTH_DATE,
  MONTH_NAMES_PT,
  isLeapYear,
  daysInMonth,
  parseBrazilianDate,
  formatDatePT,
  formatElapsedSummary,
  calculateElapsedTime
} from '../../date-calculator.js';

export const BIRTH_DATE_STR = DEFAULT_BIRTH_DATE;
export const BIRTH_DATE = parseBrazilianDate(DEFAULT_BIRTH_DATE);

export function calculateExactAge(birthInput = DEFAULT_BIRTH_DATE, referenceDate = new Date()) {
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
