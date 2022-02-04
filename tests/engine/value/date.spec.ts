import dayjs from "dayjs";
import { DateParserEngine, parseDate } from "../../../src/engine/value/date.js";

describe("parseDate", () => {
  it("should parse non-simple type as default", () => {
    expect(parseDate({})).toEqual(null);
    expect(parseDate(null)).toEqual(null);
    expect(parseDate(undefined)).toEqual(null);
    expect(parseDate({}, { default: "2018" })).toEqual(new Date("2018-01-01T00:00:00").toISOString());
    expect(parseDate(() => "", { default: "2018" })).toEqual(new Date("2018-01-01T00:00:00").toISOString());
  });

  it("should parse time number", () => {
    expect(parseDate(1577840461000)).toEqual("2020-01-01T01:01:01.000Z");
  });

  it("should parse date | dayjs", () => {
    expect(parseDate(new Date("2020-01-01T01:01:01Z"))).toEqual("2020-01-01T01:01:01.000Z");
    expect(parseDate(dayjs("2020-01-01T01:01:01Z"))).toEqual("2020-01-01T01:01:01.000Z");
  });

  it("should parse string", () => {
    expect(parseDate("2020-01-01T01:01:01Z")).toEqual("2020-01-01T01:01:01.000Z");
    expect(parseDate("2020/01/01 Z", { parse: "YYYY/MM/DD Z" })).toEqual("2020-01-01T00:00:00.000Z");
  });

  it("should return correct format", () => {
    expect(parseDate("2020-01-01T01:01:01Z")).toEqual("2020-01-01T01:01:01.000Z");
    expect(parseDate("2020-01-01T01:01:01Z", { format: "iso" })).toEqual("2020-01-01T01:01:01.000Z");
    expect(parseDate("2020-01-01T01:01:01Z", { format: "YYYY/MM/DD" })).toEqual("2020/01/01");
    expect(parseDate("2020-01-01T01:01:01Z", { format: "timestamp" })).toEqual(1577840461000);
    expect(parseDate("2020-01-01T01:01:01Z", { format: "date" })).toEqual(new Date("2020-01-01T01:01:01Z"));
    expect(parseDate("2020-01-01T01:01:01Z", { format: "dayjs" })).toEqual(dayjs("2020-01-01T01:01:01Z"));
  });

  it("should parse default to correct format", () => {
    expect(parseDate("", { format: "iso", default: "2020-01-01T01:01:01Z" })).toEqual("2020-01-01T01:01:01.000Z");
    expect(parseDate("", { format: "YYYY/MM/DD", default: "2020-01-01T01:01:01Z" })).toEqual("2020/01/01");
    expect(parseDate("", { format: "timestamp", default: "2020-01-01T01:01:01Z" })).toEqual(1577840461000);
    expect(parseDate("", {
      format: "date",
      default: 1577840461000
    })).toEqual(new Date("2020-01-01T01:01:01Z"));
    expect(parseDate("", { format: "dayjs", default: "2020-01-01T01:01:01Z" })).toEqual(dayjs("2020-01-01T01:01:01Z"));
    expect(parseDate("", { format: "YYYY/MM/DD", default: 1577840461000 })).toEqual("2020/01/01");
  });

  it("default value should match correct selector", () => {
    const parser = new DateParserEngine();
    expect(parser.match({ selector: "hello" })).toEqual(false);
    expect(parser.match({ selector: "hello", date: false })).toEqual(false);
    expect(parser.match({ selector: "hello", date: true })).toEqual(true);
    expect(parser.match({ selector: {} })).toEqual(false);
  });
});
