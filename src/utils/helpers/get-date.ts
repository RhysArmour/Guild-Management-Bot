import { sub } from 'date-fns';
import ISO8601Duration from 'iso8601-duration';
import { Logger } from '../../logger';

export function currentDate(month: string) {
  const todayDate = new Date();

  const currentYear = todayDate.getUTCFullYear();
  const currentMonth = month === 'long' ? todayDate.toLocaleString('default', { month: 'long' }) : todayDate.getMonth();
  const currentDay = todayDate.getDate();

  return { todayDate, currentDay, currentMonth, currentYear };
}

export function getLastMonthFullDate() {
  const { todayDate } = currentDate('short');

  const thisMonth = todayDate.getMonth();

  const lastMonthDate = new Date();
  lastMonthDate.setMonth(thisMonth - 1);
  lastMonthDate.toISOString();

  return lastMonthDate;
}

export const calculateExpiryThresholdDate = (expiryDuration: string): Date => {
  Logger.info(`Calculating expiry threshold for duration: ${expiryDuration}`);

  // Parse the expiry duration (e.g., "P3W", "P1M")
  const duration = ISO8601Duration.parse(expiryDuration);

  // Calculate the expiry threshold date (current date minus the duration)
  const expiryThresholdDate = sub(new Date(), {
    weeks: duration.weeks || 0,
    days: duration.days || 0,
    months: duration.months || 0,
    years: duration.years || 0,
  });

  Logger.info(`Expiry threshold date calculated: ${expiryThresholdDate.toISOString()}`);
  return expiryThresholdDate;
};
