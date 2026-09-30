import { getAppTimezone, setAppTimezone, toLocalDate } from "./date.util.js";

describe("date.util", () => {
  afterEach(() => {
    setAppTimezone("Europe/Madrid");
  });

  it("defaults to Europe/Madrid", () => {
    expect(getAppTimezone()).toBe("Europe/Madrid");
  });

  it("converts a UTC instant to Europe/Madrid in winter (CET, UTC+1)", () => {
    const utcDate = new Date(Date.UTC(2026, 0, 15, 10, 30, 0));

    expect(toLocalDate(utcDate).toISOString()).toBe("2026-01-15T11:30:00.000Z");
  });

  it("converts a UTC instant to Europe/Madrid in summer (CEST, UTC+2)", () => {
    const utcDate = new Date(Date.UTC(2026, 6, 15, 10, 30, 0));

    expect(toLocalDate(utcDate).toISOString()).toBe("2026-07-15T12:30:00.000Z");
  });

  it("allows overriding the timezone explicitly", () => {
    const utcDate = new Date(Date.UTC(2026, 0, 15, 10, 30, 0));

    expect(toLocalDate(utcDate, "America/New_York").toISOString()).toBe(
      "2026-01-15T05:30:00.000Z"
    );
  });

  it("respects a globally configured timezone", () => {
    setAppTimezone("America/New_York");
    const utcDate = new Date(Date.UTC(2026, 0, 15, 10, 30, 0));

    expect(toLocalDate(utcDate).toISOString()).toBe("2026-01-15T05:30:00.000Z");
  });
});
