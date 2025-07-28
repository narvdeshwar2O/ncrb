export const getLastNDaysRange = (n: number) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date(end);
  start.setDate(start.getDate() - (n - 1));
  start.setHours(0, 0, 0, 0);

  return { from: start, to: end };
};
