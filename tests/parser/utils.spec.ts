import { wrapArray } from "../../src/parser/utils";

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




