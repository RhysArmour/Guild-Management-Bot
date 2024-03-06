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
