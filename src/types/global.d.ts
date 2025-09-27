export {};

export global {
  interface DailyDataTypes {
    date: string;
  }
}

type DateRange = {
  from: Date;
  to: Date;
};
