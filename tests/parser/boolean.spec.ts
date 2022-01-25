import { parseBoolean } from "../../src/parser/boolean";

describe("parseBoolean", () => {
  it("should parse number", () => {
    const zero = parseBoolean(0);
    expect(zero).toEqual(false);

    const nonZero = parseBoolean(2);
    expect(nonZero).toEqual(true);
  });

  it("should parse non-simple type as default", () => {
    expect(parseBoolean(null)).toEqual(null);
    expect(parseBoolean(undefined)).toEqual(null);
    expect(parseBoolean({})).toEqual(null);
    expect(parseBoolean({}, { default: true })).toEqual(true);
    expect(parseBoolean(() => "", { default: true })).toEqual(true);
  });

  it("should parse boolean", () => {
    expect(parseBoolean(false)).toEqual(false);
    expect(parseBoolean(true)).toEqual(true);
  });

  it("should parse string as empty an none empty", () => {
    expect(parseBoolean("")).toEqual(false);
    expect(parseBoolean("non empty")).toEqual(true);
  });

  it("should parse string with custom truthy", () => {
    expect(parseBoolean("this is false", { truthy: "this is true" })).toEqual(false);
    expect(parseBoolean("this is true", { truthy: "this is true" })).toEqual(true);

    expect(parseBoolean("false", { truthy: ["false", "true"] })).toEqual(true);
    expect(parseBoolean("true", { truthy: ["false", "true"] })).toEqual(true);
  });

  it("should parse string with custom falsy", () => {
    expect(parseBoolean("this is false", { falsy: "this is false" })).toEqual(false);
    expect(parseBoolean("this is true", { falsy: "this is false" })).toEqual(true);

    expect(parseBoolean("false", { falsy: ["false", "true"] })).toEqual(false);
    expect(parseBoolean("true", { falsy: ["false", "true"] })).toEqual(false);
  });

  it("should parse string and ignore default is falsy or truthy provided", () => {
    const truthyAndDefaultProvided = { truthy: "this is true", default: true };
    expect(parseBoolean("this is false", truthyAndDefaultProvided)).toEqual(false);
    expect(parseBoolean("this is true", truthyAndDefaultProvided)).toEqual(true);

    const falsyAndDefaultProvided = { falsy: "this is false", default: false };
    expect(parseBoolean("this is false", falsyAndDefaultProvided)).toEqual(false);
    expect(parseBoolean("this is true", falsyAndDefaultProvided)).toEqual(true);
  });

  it("should parse string and fallback to default if not falsy or truthy", () => {
    const allProvided = { falsy: "this is false", truthy: "this is true" };
    expect(parseBoolean("this is", allProvided)).toEqual(null);
    expect(parseBoolean("this is true", allProvided)).toEqual(true);
    expect(parseBoolean("this is false", allProvided)).toEqual(false);
  });
});
