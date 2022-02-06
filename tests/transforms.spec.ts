import { transforms } from "../src/parser/transforms.js";

describe("transforms: replace", () => {
  it("should work with any value", () => {
    expect(transforms.replace(1, 1, 2)).toEqual(2);
    expect(transforms.replace(true, true, false)).toEqual(false);
    expect(transforms.replace("true", true, false)).toEqual("false");
    expect(transforms.replace("true", "hello", "world")).toEqual("true");
    expect(transforms.replace(null, true, false)).toEqual(null);
  });

  it("should replace all", () => {
    expect(transforms.replace("hello hello hello", "hello", "world")).toEqual("world world world");
  });

  it("should work with array and object", () => {
    expect(transforms.replace(["hello", "hi"], "hello", "world")).toEqual(["world", "hi"]);
    expect(transforms.replace({ hello: "hello", h1: "hi" }, "hello", "world")).toEqual({ hello: "world", h1: "hi" });
  });
});

describe("transforms: split", () => {
  it("should work with any value", () => {
    expect(transforms.split(null)).toEqual(null);
    expect(transforms.split(1)).toEqual(1);
    expect(transforms.split(true)).toEqual(true);
    expect(transforms.split("true")).toEqual(["true"]);
    expect(transforms.split("true,false")).toEqual(["true", "false"]);
    expect(transforms.split("true;false", ";")).toEqual(["true", "false"]);
    expect(transforms.split("true;false,true", "[;,]")).toEqual(["true", "false", "true"]);

  });

  it("should work with array and object", () => {
    expect(transforms.split(["hello,hi", "hi"])).toEqual([["hello", "hi"], ["hi"]]);
    expect(transforms.split({ hello: "hello,hi", h1: "hi" })).toEqual({ hello: ["hello", "hi"], h1: ["hi"] });
  });
});

describe("transforms: join", () => {
  it("should work with any value", () => {
    expect(transforms.join(null)).toEqual(null);
    expect(transforms.join(1)).toEqual(1);
    expect(transforms.join(true)).toEqual(true);
    expect(transforms.join("true")).toEqual("true");
    expect(transforms.join([true, false])).toEqual("true,false");
    expect(transforms.join([true, false], ";")).toEqual("true;false");
    expect(transforms.join(["a", "b", "c"])).toEqual("a,b,c");

  });

  it("should work with object", () => {
    expect(transforms.join({ hello: "hello,hi", h1: "hi" })).toEqual("hello,hi,hi");
  });
});

describe("transforms: toString", () => {
  it("should work with any value", () => {
    expect(transforms.toString(null)).toEqual(null);
    expect(transforms.toString("hi")).toEqual("hi");
    expect(transforms.toString(1)).toEqual("1");
    expect(transforms.toString(true)).toEqual("true");
    expect(transforms.toString(["1", "2"])).toEqual("1,2");
    expect(transforms.toString({ hello: "hi" })).toEqual("[object Object]");
  });
});

describe("transforms: str", () => {
  it("should work with any value", () => {
    expect(transforms.str(null)).toEqual(null);
    expect(transforms.str("hi")).toEqual("hi");
    expect(transforms.str(1)).toEqual("1");
    expect(transforms.str(true)).toEqual("true");
    expect(transforms.str([1, "2", true])).toEqual(["1", "2", "true"]);
    expect(transforms.str({ hello: "hi", hi: true })).toEqual({ hello: "hi", hi: "true" });
  });
});

describe("transforms: json", () => {
  it("should work with any value", () => {
    expect(transforms.json(null)).toEqual(null);
    expect(transforms.json("hi")).toEqual("\"hi\"");
    expect(transforms.json(1)).toEqual("1");
    expect(transforms.json(true)).toEqual("true");
    expect(transforms.json([1, "2", true])).toEqual("[1,\"2\",true]");
    expect(transforms.json({ hello: "hi", hi: true })).toEqual("{\"hello\":\"hi\",\"hi\":true}");
  });
});

describe("transforms: match", () => {
  it("should work with any value", () => {
    expect(transforms.match(null, "hello")).toEqual(null);
    expect(transforms.match(1, "hello")).toEqual(1);
    expect(transforms.match(true, "hello")).toEqual(true);
    expect(transforms.match("hi", "hello")).toEqual(null);
    expect(transforms.match("hello", "hello")).toEqual("hello");
  });

  it("should apply default", () => {
    expect(transforms.match("hi", "hello", "g", "nill")).toEqual("nill");
  });

  it("should work with array and object", () => {
    expect(transforms.match(["hello", "hi"], "hello")).toEqual(["hello", null]);
    expect(transforms.match({ hello: "hello", h1: "hi" }, "hello")).toEqual({ hello: "hello", h1: null });
  });
});

describe("transforms: matchAll", () => {
  it("should work with any value", () => {
    expect(transforms.matchAll(null, "hello")).toEqual(null);
    expect(transforms.matchAll(1, "hello")).toEqual(1);
    expect(transforms.matchAll(true, "hello")).toEqual(true);
    expect(transforms.matchAll("hi", "hello")).toEqual([]);
    expect(transforms.matchAll("hello, hello, hi", "(hello|hi)")).toEqual(["hello", "hello", "hi"]);
  });

  it("should work with array and object", () => {
    expect(transforms.matchAll(["hello", "hi"], "hello")).toEqual([["hello"], []]);
    expect(transforms.matchAll({ hello: "hello", h1: "hi" }, "hello")).toEqual({ hello: ["hello"], h1: [] });
  });
});


describe("transforms: def", () => {
  it("should work with any value", () => {
    expect(transforms.def(null, "hello")).toEqual("hello");
    expect(transforms.def(1, "hello")).toEqual(1);
    expect(transforms.def(true, "hello")).toEqual(true);
    expect(transforms.def("", "hello")).toEqual("");

    expect(transforms.empty(null)).toEqual("");
    expect(transforms.empty(" ")).toEqual("");
  });

  it("should work with mode", () => {
    expect(transforms.def(" ", "hello", "blank")).toEqual("hello");
    expect(transforms.def(" ", "hello", "empty")).toEqual(" ");
    expect(transforms.def("", "hello", "empty")).toEqual("hello");
    expect(transforms.def("", "hello", null)).toEqual("");
    expect(transforms.def(false, "hello", "falsy")).toEqual("hello");
  });

  it("should work with array and object", () => {
    expect(transforms.def([null, "hi"], "hello")).toEqual(["hello", "hi"]);
    expect(transforms.def({ hello: "hello", h1: null }, "hello")).toEqual({ hello: "hello", h1: "hello" });
  });
});


describe("transforms: wrap", () => {
  it("should work with any value", () => {
    expect(transforms.wrap(null)).toEqual([null]);
    expect(transforms.wrap(1)).toEqual([1]);
    expect(transforms.wrap(true)).toEqual([true]);
    expect(transforms.wrap([])).toEqual([[]]);
    expect(transforms.wrap("hi")).toEqual(["hi"]);
  });

  it("should wrap object with key name", () => {
    expect(transforms.wrap(null, "hi")).toEqual({ hi: null });
    expect(transforms.wrap([], "hello")).toEqual({ hello: [] });
    expect(transforms.wrap("hi", 1 as unknown as string)).toEqual({ 1: "hi" });
  });
});

describe("transforms: del", () => {
  it("should work with any value", () => {
    expect(transforms.del(null, 1)).toEqual(null);
    expect(transforms.del(1, 1)).toEqual(null);
    expect(transforms.del("1", 1)).toEqual("1");
  });

  it("should work with array and object", () => {
    expect(transforms.del([null, "hi"], "hi")).toEqual([null]);
    expect(transforms.del([null, "hi"], null)).toEqual(["hi"]);
    expect(transforms.del({ hello: "hi" }, "hi")).toEqual({});
    expect(transforms.del({ hello: "hi", hi: "hello" }, "hi")).toEqual({ hi: "hello" });
  });
});

describe("transforms: flat", () => {
  it("should work with any value", () => {
    expect(transforms.flat(null)).toEqual(null);
    expect(transforms.flat(1)).toEqual(1);
    expect(transforms.flat("1")).toEqual("1");
    expect(transforms.flat({ hello: "hi" })).toEqual({ hello: "hi" });
  });

  it("should flatten array", () => {
    expect(transforms.flat([null, ["hi"]])).toEqual([null, "hi"]);
    expect(transforms.flat([null, ["hi"], [["hello"]]], 2)).toEqual([null, "hi", "hello"]);
  });
});

describe("transforms: unique", () => {
  it("should work with any value", () => {
    expect(transforms.unique(null)).toEqual(null);
    expect(transforms.unique(1)).toEqual(1);
    expect(transforms.unique("1")).toEqual("1");
    expect(transforms.unique({ hello: "hi" })).toEqual({ hello: "hi" });
  });

  it("should unique array", () => {
    expect(transforms.unique(["hi", null, "hi", null])).toEqual(["hi", null]);
    expect(transforms.unique(["hi", "hi", "hi"])).toEqual(["hi"]);
  });
});
