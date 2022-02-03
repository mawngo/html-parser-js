import { buildTransformList, extractScope, parseSelectorString, wrapArray } from "../../src/engine/common.js";

describe("parseSelectorString", () => {
  const selectors = [
    ".intro",
    "#firstname",
    "*",
    "p",
    "div, p",
    "div p",
    "div > p",
    "div + p",
    "p ~ ul",
    "[target]",
    "[target=_blank]",
    "[title~=flower]",
    "[lang|=en]",
    "a[href^=\"https\"]",
    "a[href$=\".pdf\"]",
    "a[href*=\"w3schools\"]",
    "a:active",
    "p::after",
    "p::before",
    "input:checked",
    "input:disabled",
    "p:empty",
    "input:enabled",
    "p:first-child",
    "p::first-letter",
    "p::first-line",
    "p:first-of-type",
    "input:focus",
    "a:hover",
    "input:in-range",
    "input:invalid",
    "p:lang(it)",
    "p:last-child",
    "p:last-of-type",
    "a:link",
    ":not(p)",
    "p:nth-child(2)",
    "p:nth-last-child(2)",
    "p:nth-last-of-type(2)",
    "p:nth-of-type(2)",
    "p:only-of-type",
    "p:only-child",
    "input:optional",
    "input:out-of-range",
    "input:read-only",
    "input:read-write",
    "input:required",
    ":root",
    "::selection",
    "#news:target",
    "input:valid",
    "a:visited"
  ];

  it("should extract single element selectors", () => {
    for (const selector of selectors) {
      const parsed = parseSelectorString(selector);
      expect(selector).toEqual(parsed.selector);
      expect(undefined).toEqual(parsed.attribute);
      expect([]).toEqual(parsed.transforms);
    }
  });

  it("should extract any combination of element and attribute selectors", () => {
    for (const selector of selectors) {
      const selectorWithAttr = selector + "@ href";
      const parsed = parseSelectorString(selectorWithAttr);
      expect(selector).toEqual(parsed.selector);
      expect("href").toEqual(parsed.attribute);
      expect([]).toEqual(parsed.transforms);
    }
  });

  it("should extract any combination of element and attribute selectors with spaces and hypens", () => {
    for (const selector of selectors) {
      const selectorWithAttr = selector + " @ data-item";
      const parsed = parseSelectorString(selectorWithAttr);
      expect(selector).toEqual(parsed.selector);
      expect("data-item").toEqual(parsed.attribute);
      expect([]).toEqual(parsed.transforms);
    }
  });

  it("should support a single attribute", () => {
    expect("href").toEqual(parseSelectorString("@ href").attribute);
    expect("href").toEqual(parseSelectorString("@href").attribute);
  });

  it("should support transforms", () => {
    const selector = "a[href][class] @ html | filter1 | filter2";
    const parsed = parseSelectorString(selector);
    expect("a[href][class]").toEqual(parsed.selector);
    expect("html").toEqual(parsed.attribute);
    expect(["filter1", "filter2"]).toEqual(parsed.transforms);
    expect({ transforms: ["last:four"] }).toEqual(parseSelectorString("|last:four"));
  });

  it("should support transforms with arguments", () => {
    const selector = "a[href][class] @ html | filter1: \"%Y %M %d\" | filter2: matt 25";
    const parsed = parseSelectorString(selector);
    expect("a[href][class]").toEqual(parsed.selector);
    expect("html").toEqual(parsed.attribute);
    expect(["filter1: \"%Y %M %d\"", "filter2: matt 25"]).toEqual(parsed.transforms);
  });

  it("should support everything with no spaces", () => {
    const selector = "a@href|href|uppercase";
    const parsed = parseSelectorString(selector);
    expect("a").toEqual(parsed.selector);
    expect("href").toEqual(parsed.attribute);
    expect(["href", "uppercase"]).toEqual(parsed.transforms);
  });
});

describe("wrapArray", () => {
  it("should return empty with null or undefined", () => {
    expect(wrapArray(null)).toEqual([]);
    expect(wrapArray(undefined)).toEqual([]);
  });

  it("should return the same array if array passed", () => {
    expect(wrapArray(["hello"])).toEqual(["hello"]);

    const origin = [1, 2, 3, 4];
    expect(wrapArray(origin) === origin).toEqual(true);
  });

  it("should wrap into array is single value passed", () => {
    expect(wrapArray("one")).toEqual(["one"]);
  });
});

describe("extractScope", () => {
  it("should extract scope", () => {
    expect(extractScope({})).toEqual(["", {}]);
    expect(extractScope(undefined)).toEqual(["", {}]);
    expect(extractScope("")).toEqual(["", {}]);
    expect(extractScope([""])).toEqual([[], {}]);
    expect(extractScope({ scope: "hi" })).toEqual(["hi", { scope: "hi" }]);
    expect(extractScope({ scope: undefined })).toEqual(["", { scope: undefined }]);
    expect(extractScope({ scope: ["hi"] })).toEqual([["hi"], { scope: ["hi"] }]);
    expect(extractScope({ scope: ["hi"], transforms: [] })).toEqual([["hi"], { scope: ["hi"], transforms: [] }]);
    expect(extractScope({ scope: [] })).toEqual([[], { scope: [] }]);
  });

  it("should ignore simple selector", () => {
    expect(extractScope("hello")).toEqual(["hello", {}]);
    expect(extractScope(["hello"])).toEqual([["hello"], {}]);
  });
});

describe("buildTransformList", () => {
  it("should build", () => {
    const builtIns = {
      one(val) {
        return val?.toString() + " one";
      },
      last(val, append) {
        return val?.toString() + ` ${append}.`;
      }
    };
    const transforms = ["one", (val) => val?.toString() + " two", "three", "last:four"];
    const transFormList = buildTransformList(transforms, builtIns);
    expect(transFormList.length).toEqual(3);

    const afterTransform = transFormList.reduce((val: any, transform) => transform(val), "raw value");
    expect(afterTransform).toEqual("raw value one two four.");
  });
});
