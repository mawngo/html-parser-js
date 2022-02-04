import { NumberParserEngine, parseNumber } from "../../../src/engine/value/number.js";

describe("parseNumber", () => {
  it("should parse boolean", () => {
    expect(parseNumber(true)).toEqual(1);
    expect(parseNumber(false)).toEqual(0);
  });

  it("should parse non-simple type as default", () => {
    expect(parseNumber({})).toEqual(null);
    expect(parseNumber(null)).toEqual(null);
    expect(parseNumber(undefined)).toEqual(null);

    expect(parseNumber({}, { default: 1 })).toEqual(1);
    expect(parseNumber(() => "", { default: 1 })).toEqual(1);
    expect(parseNumber(null, { default: 1 })).toEqual(1);
  });

  it("should parse number", () => {
    expect(parseNumber(1)).toEqual(1);
  });

  it("should parse string", () => {
    expect(parseNumber("")).toEqual(null);
    expect(parseNumber("not a number")).toEqual(null);
    expect(parseNumber("not a number", { default: 0 })).toEqual(0);
    expect(parseNumber("1000")).toEqual(1000);
    expect(parseNumber("1000.10")).toEqual(1000.10);
  });

  it("should parse to int if enabled", () => {
    expect(parseNumber("10.1", { int: true })).toEqual(10);
    expect(parseNumber("10.9", { int: true })).toEqual(11);
    expect(parseNumber("10.5", { int: true })).toEqual(11);
  });

  it("should use correct round mode", () => {
    expect(parseNumber("10.6", { int: true, roundMode: "floor" })).toEqual(10);
    expect(parseNumber("10.1", { int: true, roundMode: "ceil" })).toEqual(11);
    expect(parseNumber("10.6", { int: true })).toEqual(11);
  });

  it("should use correct format", () => {
    expect(parseNumber("1000.234", { format: "$0,0.00" })).toEqual("$1,000.23");
    expect(parseNumber("100.10", { format: "0.0b" })).toEqual("100.1B");
    expect(parseNumber("100.10", { int: true, roundMode: "floor", format: "0.0b" })).toEqual("100.0B");
    expect(parseNumber("0.1", { format: "0%" })).toEqual("10%");
  });

  it("should support multiple input format", () => {
    expect(parseNumber("10,000.12")).toEqual(10000.12);
    expect(parseNumber("3.467TB")).toEqual(3467000000000);
    expect(parseNumber("2:23:57")).toEqual(8637); // to second
    expect(parseNumber("'-76%")).toEqual(-0.76);
  });

  it("should match correct selector", () => {
    const parser = new NumberParserEngine();
    expect(parser.match({ selector: "hello" })).toEqual(false);
    expect(parser.match({ selector: "hello", number: false })).toEqual(false);
    expect(parser.match({ selector: "hello", number: true })).toEqual(true);
  });
});
