const currentDate = () => {
  const month = new Date().toLocaleString('default', { month: 'long' });
  const day = new Date().getDate();

  return { day, month };
};

module.exports = {
    currentDate,
}