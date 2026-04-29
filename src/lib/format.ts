export const formatCurrency = (amount: number, currency = "PKR") => {
  try {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `Rs ${amount.toFixed(0)}`;
  }
};

export const formatCompact = (amount: number) =>
  new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(amount);

const pad = (value: number) => String(value).padStart(2, "0");

export const localDateFrom = (date: Date | string) => {
  if (date instanceof Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const monthMatch = /^(\d{4})-(\d{2})$/.exec(date);
  if (monthMatch) {
    const [, year, month] = monthMatch;
    return new Date(Number(year), Number(month) - 1, 1);
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

export const monthKey = (date: Date | string) => {
  const d = localDateFrom(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
};

export const monthShort = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "short" });
};

export const previousMonth = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return monthKey(d);
};

export const todayISO = () => {
  const today = new Date();
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
};

export const formatDate = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions,
  locale = "en-US",
) => localDateFrom(date).toLocaleDateString(locale, options);
