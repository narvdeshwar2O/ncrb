export const getLastNDaysRange = (n: number) => {
  const today = new Date();
  const from = new Date();
  from.setDate(today.getDate() - n);
  return { from, to: today };
};
