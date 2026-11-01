import { eventDateValue, formatEventDate } from "../event-date";

it("keeps calendar dates stable regardless of device timezone", () => {
  expect(eventDateValue("2026-12-12T00:00:00.000Z")).toBe("2026-12-12");
  expect(formatEventDate("2026-12-12", "en-US")).toBe("December 12");
  expect(formatEventDate("2026-12-12T00:00:00.000Z", "en-US")).toBe(
    "December 12",
  );
});
it("omits absent and invalid dates instead of displaying misleading values", () => {
  for (const date of [undefined, null, "", "bad", "2026-02-29", "2026-04-31"]) {
    expect(eventDateValue(date)).toBeNull();
    expect(formatEventDate(date, "en")).toBe("");
  }
  expect(eventDateValue("2028-02-29")).toBe("2028-02-29");
});
