export function currentDate() {
  const currentYear = new Date().getUTCFullYear();
  const currentMonth = new Date().getMonth();
  const currentDay = new Date().getDate();

  const todayDate = new Date();

  return { todayDate, currentDay, currentMonth, currentYear };
}

export function getLastMonthFullDate() {
  const { todayDate } = currentDate();

  const thisMonth = todayDate.getMonth();

  const lastMonthDate = new Date();
  lastMonthDate.setMonth(thisMonth - 1);
  lastMonthDate.toISOString();

  return lastMonthDate;
}
