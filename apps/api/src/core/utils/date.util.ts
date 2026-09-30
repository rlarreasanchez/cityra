const DEFAULT_APP_TIMEZONE = "Europe/Madrid";

// Zona horaria en memoria; un futuro endpoint de configuración podrá cambiarla en caliente con setAppTimezone()
let appTimezone = DEFAULT_APP_TIMEZONE;

export function getAppTimezone(): string {
  return appTimezone;
}

export function setAppTimezone(timezone: string): void {
  appTimezone = timezone;
}

// Convierte un instante UTC en una fecha cuya representación serializada refleja la hora en `timezone`
export function toLocalDate(
  date: Date,
  timezone: string = getAppTimezone()
): Date {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const part = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  return new Date(
    Date.UTC(
      part("year"),
      part("month") - 1,
      part("day"),
      part("hour"),
      part("minute"),
      part("second"),
      date.getMilliseconds()
    )
  );
}
