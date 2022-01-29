import { DefaultValueParser, StringValueParser } from "../../../src/parser/value/string";

describe("parseString", () => {
  const parser = new StringValueParser();
  const parseString = parser.parse;

  it("should parse non-simple type as default", () => {
    expect(parseString({})).toEqual(null);
    expect(parseString(null)).toEqual(null);
    expect(parseString(undefined)).toEqual(null);
    expect(parseString({}, { default: "1" })).toEqual("1");
    expect(parseString(() => "", { default: "1" })).toEqual("1");
  });

  it("should parse simple type", () => {
    expect(parseString("1")).toEqual("1");
    expect(parseString(1)).toEqual("1");
    expect(parseString(1.1)).toEqual("1.1");
    expect(parseString(true)).toEqual("true");
    expect(parseString(false)).toEqual("false");
  });

  it("should return defaultIfEmpty value if empty", () => {
    expect(parseString("")).toEqual("");
    expect(parseString("", { defaultIfEmpty: "boo" })).toEqual("boo");
  });

  it("should return first match or default", () => {
    expect(parseString("foo bar foo", { match: "foo" })).toEqual("foo");
    expect(parseString("foo bar foo", { match: /foo/ })).toEqual("foo");
    expect(parseString("bar bar bar", { match: "foo" })).toEqual(null);
    expect(parseString("bar bar bar", { match: "foo", defaultIfNoMatch: "foooo" })).toEqual("foooo");
  });

  it("should match correct selector", () => {
    expect(parser.match({})).toEqual(false);
    expect(parser.match({ string: false })).toEqual(false);
    expect(parser.match({ string: true })).toEqual(true);
  });

  it("default value should match correct selector", () => {
    const parser = new DefaultValueParser();
    expect(parser.match({})).toEqual(true);
    expect(parser.match({ string: false })).toEqual(true);
    expect(parser.match({ string: true })).toEqual(true);
  });
});
