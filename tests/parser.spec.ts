import { Parser } from "../src/index.js";
import { readFile } from "fs/promises";
import { resolve } from "path";

describe("Default Parser", () => {
  let html = "";
  beforeAll(async () => {
    html = await readFile(resolve("tests/assets/static.html"), "utf8");
  });

  it("should work with selectors", async () => {
    const parser = new Parser();
    const data = await parser.parseHtml<any>(html, {
      selector: {
        nonExist: "h1.somefakeclass",
        nonExistAttr: "h1@nonexist",
        title: "h1",
        titleWithoutAttr: "h1@text",
        titleButUsingComplexSelector: {
          selector: "h1@text"
        },
        scoped: {
          selector: {
            moreNested: {
              selector: {
                i: "i"
              }
            },
            href: "a@href",
            html: "a@html",
            innerHTML: "a@innerHTML",
            outerHTML: "a@outerHTML",
            flattened: {
              selector: {
                flattenedKey: "a@href"
              },
              flat: true
            }
          },
          scope: "p:nth-of-type(4)"
        },
        scopedButFlat: {
          selector: "i",
          scope: "p:nth-of-type(4)"
        }
      }
    });
    expect(data.nonExist).toEqual(null);
    expect(data.nonExistAttr).toEqual(null);
    expect(data.title).toEqual("Intentionally Static: This page will never change");
    expect(data.titleWithoutAttr).toEqual("Intentionally Static: This page will never change");
    expect(data.titleButUsingComplexSelector).toEqual("Intentionally Static: This page will never change");
    expect(data.scopedButFlat).toEqual("Quo modo?");
    expect(data.scoped).toEqual({
      moreNested: {
        i: "Quo modo?"
      },
      href: "https://loripsum.net/",
      html: "Fortemne possumus dicere eundem illum Torquatum?",
      innerHTML: "Fortemne possumus dicere eundem illum Torquatum?",
      outerHTML: "<a href=\"https://loripsum.net/\" target=\"_blank\">Fortemne possumus dicere eundem illum Torquatum?</a>",
      flattenedKey: "https://loripsum.net/"
    });
  });

  it("should work with array selector", async () => {
    const parser = new Parser();
    const data = await parser.parseHtml<any>(html, {
      selector: {
        list: ["h4"],
        scopedAsListOfFirstElement: {
          selector: "li",
          scope: ["ul"]
        },
        scopedWithArraySelector: {
          selector: ["li"],
          scope: "ul"
        },
        listOfList: {
          selector: ["li:nth-child(odd)"],
          scope: ["ul"]
        },
        nonExistScope: {
          selector: "li",
          scope: "ul.classthatdoesnotexist"
        },
        nonExistScopeArray: {
          selector: "li",
          scope: ["ul.classthatdoesnotexist"]
        }
      }
    });
    expect(data.list).toEqual([
      "Nunc dicam de voluptate, nihil scilicet novi, ea tamen, quae te ipsum probaturum esse confidam.",
      "Nescio quo modo praetervolavit oratio.",
      "Ut id aliis narrare gestiant?"
    ]);
    expect(data.scopedAsListOfFirstElement).toEqual([
      "Tuo vero id quidem, inquam, arbitratu.",
      "Indicant pueri, in quibus ut in speculis natura cernitur.",
      "Multoque hoc melius nos veriusque quam Stoici.",
      "Omnes enim iucundum motum, quo sensus hilaretur.",
      "Omnia contraria, quos etiam insanos esse vultis.",
      "Sed tempus est, si videtur, et recta quidem ad me.",
      "Suo genere perveniant ad extremum;",
      "Atque hoc loco similitudines eas, quibus illi uti solent, dissimillimas proferebas."
    ]);
    expect(data.scopedWithArraySelector).toEqual([
      "Tuo vero id quidem, inquam, arbitratu.",
      "Quamquam te quidem video minime esse deterritum."
    ]);
    expect(data.listOfList).toEqual([
      ["Tuo vero id quidem, inquam, arbitratu."],
      ["Indicant pueri, in quibus ut in speculis natura cernitur.", "Aufert enim sensus actionemque tollit omnem."],
      ["Multoque hoc melius nos veriusque quam Stoici."],
      ["Omnes enim iucundum motum, quo sensus hilaretur.", "Itaque si aut requietem natura non quaereret aut eam posset alia quadam ratione consequi."],
      ["Omnia contraria, quos etiam insanos esse vultis.", "Tu enim ista lenius, hic Stoicorum more nos vexat.", "Hosne igitur laudas et hanc eorum, inquam, sententiam sequi nos censes oportere?"],
      ["Sed tempus est, si videtur, et recta quidem ad me.", "Aliter enim nosmet ipsos nosse non possumus."],
      ["Suo genere perveniant ad extremum;", "Stulti autem malorum memoria torquentur, sapientes bona praeterita grata recordatione renovata delectant."],
      ["Atque hoc loco similitudines eas, quibus illi uti solent, dissimillimas proferebas.", "Atqui, inquam, Cato, si istud optinueris, traducas me ad te totum licebit."]
    ]);
    expect(data.nonExistScope).toEqual(null);
    expect(data.nonExistScopeArray).toEqual([]);
  });

  it("should auto scoping if scope is empty array or array with empty string when using simple selector", async () => {
    const parser = new Parser();
    const actual = [
      ["Tuo vero id quidem, inquam, arbitratu."],
      ["Indicant pueri, in quibus ut in speculis natura cernitur.", "Aufert enim sensus actionemque tollit omnem."],
      ["Multoque hoc melius nos veriusque quam Stoici."],
      ["Omnes enim iucundum motum, quo sensus hilaretur.", "Itaque si aut requietem natura non quaereret aut eam posset alia quadam ratione consequi."],
      ["Omnia contraria, quos etiam insanos esse vultis.", "Tu enim ista lenius, hic Stoicorum more nos vexat.", "Hosne igitur laudas et hanc eorum, inquam, sententiam sequi nos censes oportere?"],
      ["Sed tempus est, si videtur, et recta quidem ad me.", "Aliter enim nosmet ipsos nosse non possumus."],
      ["Suo genere perveniant ad extremum;", "Stulti autem malorum memoria torquentur, sapientes bona praeterita grata recordatione renovata delectant."],
      ["Atque hoc loco similitudines eas, quibus illi uti solent, dissimillimas proferebas.", "Atqui, inquam, Cato, si istud optinueris, traducas me ad te totum licebit."]
    ];
    expect(await parser.parseHtml(html, { selector: ["ul li:nth-child(odd)"], scope: [] })).toEqual(actual);
    expect(await parser.parseHtml(html, { selector: ["ul li:nth-child(odd)"], scope: [""] })).toEqual(actual);
    expect(await parser.parseHtml(html, {
      selector: ["h1:nth-child(1)"],
      scope: []
    })).toEqual([["Intentionally Static: This page will never change"]]);
    expect(await parser.parseHtml(html, {
      selector: "h1:nth-child(1)",
      scope: []
    })).toEqual(["Intentionally Static: This page will never change"]);
  });

  it("should reject invalid selector", () => {
    const parser = new Parser();
    expect(parser.parseHtml(html, { selector: "" })).rejects.toThrow();
    expect(parser.parseHtml(html, { selector: [""] })).rejects.toThrow();
    expect(parser.parseHtml(html, { selector: "@text" })).rejects.toThrow();

    // invalid selector for auto scoping
    expect(parser.parseHtml(html, { selector: [""], scope: [] })).rejects.toThrow();
    expect(parser.parseHtml(html, { selector: "", scope: [] })).rejects.toThrow();
  });

  it("should throw if scope is empty array or array with empty string when using object selector", () => {
    const parser = new Parser();
    expect(parser.parseHtml(html, { selector: { h1: "h1" }, scope: [] })).rejects.toThrow();
    expect(parser.parseHtml(html, { selector: { h1: "h1" }, scope: [""] })).rejects.toThrow();
  });

  it("should ignore scope if empty", async () => {
    const parser = new Parser();
    const data = await parser.parseHtml<string>(html, {
      selector: "h1",
      scope: ""
    });
    expect(data).toEqual("Intentionally Static: This page will never change");
  });

  it("should throw if selector is empty", () => {
    const parser = new Parser();
    expect(parser.parseHtml(html, { selector: { h1: "" } })).rejects.toThrow();
    expect(parser.parseHtml(html, "")).rejects.toThrow();
    expect(parser.parseHtml(html, [""])).rejects.toThrow();
    expect(parser.parseHtml(html, [])).rejects.toThrow();
  });

  it("should work with simple selector", async () => {
    const parser = new Parser();
    expect(await parser.parseHtml(html, { selector: "h1" })).toEqual("Intentionally Static: This page will never change");
    expect(await parser.parseHtml(html, "h1")).toEqual("Intentionally Static: This page will never change");
    expect(await parser.parseHtml(html, "h1")).toEqual("Intentionally Static: This page will never change");
    expect(await parser.parseHtml(html, ["h1"])).toEqual([
      "Intentionally Static: This page will never change",
      "Atque ita re simpliciter primo collocata reliqua subtilius persequentes corporis bona facilem quandam rationem habere censebant;",
      "Te ipsum, dignissimum maioribus tuis, voluptasne induxit, ut adolescentulus eriperes P."
    ]);
  });

  it("should apply transform", async () => {
    const parser = new Parser({
      transforms: {
        one(val) {
          return val?.toString() + " one";
        },
        last(val, append) {
          return val?.toString() + ` ${append}.`;
        }
      }
    });

    expect(await parser.parseHtml<string>(html, {
      selector: "h1",
      transforms: [(val) => val?.toString() + " two"]
    })).toEqual("Intentionally Static: This page will never change two");

    expect(await parser.parseHtml<string>(html, {
      selector: "h1 | one | three | last:four",
      transforms: [(val) => val?.toString() + " two"]
    })).toEqual("Intentionally Static: This page will never change one four. two");

    expect(await parser.parseHtml<string>(html, {
      selector: "h1 | one | three | last:four"
    })).toEqual("Intentionally Static: This page will never change one four.");

    expect(await parser.parseHtml<string>(html, {
      selector: "h1",
      transforms: ["one", "three", "last:four"]
    })).toEqual("Intentionally Static: This page will never change one four.");
  });

  it("should apply object transform", async () => {
    const parser = new Parser({
      objTransforms: {
        one(val) {
          val.one = true;
          return val;
        },
        last(val, append) {
          val.last = append;
          return val;
        },
        lastH1(val, append) {
          val.h1 = (val.h1 || "") + ` ${append}.`;
          return val;
        }
      }
    });

    expect(await parser.parseHtml<string>(html, {
      selector: {
        h1: "h1"
      },
      objTransforms: [(val) => {
        val.two = true;
        return val;
      }]
    })).toEqual({
      h1: "Intentionally Static: This page will never change",
      two: true
    });

    expect(await parser.parseHtml<string>(html, {
      selector: {
        h1: "h1"
      },
      objTransforms: [(val) => {
        val.two = true;
        return val;
      }, "one", "three", "last:four"]
    })).toEqual({
      h1: "Intentionally Static: This page will never change",
      one: true,
      two: true,
      last: "four"
    });

    expect(await parser.parseHtml<string>(html, {
      selector: {
        h1: "h1"
      },
      objTransforms: ["one", "three", "last:four"]
    })).toEqual({
      h1: "Intentionally Static: This page will never change",
      one: true,
      last: "four"
    });

    expect(await parser.parseHtml<string>(html, {
      selector: {
        h1: "h1"
      },
      objTransforms: [(val) => {
        val.h1 = (val.h1 || "") + " two";
        return val;
      }, "lastH1:four"]
    })).toEqual({
      h1: "Intentionally Static: This page will never change two four."
    });
  });

  it("object transform and trim options should pass down to selector", async () => {
    const parser = new Parser({
      transforms: {
        one(val) {
          return val?.toString() + " one";
        }
      }
    });

    const html = "<h1>hello </h1>";

    expect(await parser.parseHtml<string>(html, {
      selector: { h1: "h1" },
      transforms: ["one"]
    })).toEqual({
      h1: "hello one"
    });

    expect(await parser.parseHtml<string>(html, {
      selector: { h1: "h1" },
      trim: false
    })).toEqual({
      h1: "hello "
    });

    expect(await parser.parseHtml<string>(html, {
      selector: {
        h1: {
          selector: "h1",
          trim: true
        }
      },
      trim: false
    })).toEqual({
      h1: "hello"
    });

    expect(await parser.parseHtml<string>(html, {
      selector: {
        h1: {
          selector: "h1",
          transforms: [(val) => val?.toString() + " two"]
        }
      },
      transforms: ["one"]
    })).toEqual({
      h1: "hello two one"
    });
  });

  it("should support types", async () => {
    const parser = new Parser();
    expect(await parser.parseHtml<boolean>("<h1>hello</h1> <h1>World</h1> <h1>Hi</h1>", {
      selector: ["h1"],
      boolean: true,
      truthy: ["hello"],
      falsy: "World"
    })).toEqual([true, false, null]);

    expect(await parser.parseHtml<string>("<h1>1</h1> <h1>1.5</h1> <h1>Hi</h1>", {
      selector: ["h1"],
      number: true
    })).toEqual([1, 1.5, null]);

    expect(await parser.parseHtml<string>("<h1>2020-01-01T00:00:00</h1> <h1>Hi</h1>", {
      selector: ["h1"],
      date: true,
      format: "YYYY-MM-DD HH:mm:ss"
    })).toEqual(["2020-01-01 00:00:00", null]);
  });
});
