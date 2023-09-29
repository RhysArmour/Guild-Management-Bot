export function currentDate() {
  const year = new Date().getUTCFullYear()
  const month = new Date().toLocaleString('default', { month: 'long' });
  const day = new Date().getDate();

  return { day, month, year };
}
