import {
  BooleanParserEngine,
  BooleanSelector,
  CoreParser,
  DateParserEngine,
  DateSelector,
  DefaultParserEngine,
  GeneralSelector,
  NumberParserEngine,
  NumberSelector,
  ObjectParserEngine,
  ParserEngine,
  StringParserEngine,
  StringSelector
} from "../src/index.js";
import dayjs from "dayjs";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { BasicParser, CheerioNodeFactory } from "../src/parser/basic.js";


function createParser<P extends GeneralSelector>(engine: ParserEngine<P>) {
  return new CoreParser({
    engines: [engine],
    nodeFactory: new CheerioNodeFactory()
  });
}

describe("Core parser", () => {
  it("should throw if no engines provided", () => {
    expect(() => {
      new CoreParser({
        engines: [],
        nodeFactory: new CheerioNodeFactory()
      });
    }).toThrow();
  });
});

describe("Default/String engine", () => {
  for (const engine of [new DefaultParserEngine(), new StringParserEngine()]) {
    const parser = createParser<StringSelector>(engine);
    const html = "<h1>Hello World</h1>";

    it("should parse", async () => {
      expect(await parser.parseHtml(html, { selector: "h1", string: true })).toEqual("Hello World");
      expect(await parser.parseHtml("", { selector: "h1", string: true })).toEqual(null);
    });

    it("should apply default", async () => {
      expect(await parser.parseHtml("", { selector: "h1", string: true, default: "empty" })).toEqual("empty");
      expect(await parser.parseHtml("<h1></h1>", {
        selector: "h1",
        string: true,
        defaultIfEmpty: "empty"
      })).toEqual("empty");
    });

    it("should apply match", async () => {
      expect(await parser.parseHtml(html, {
        selector: "h1",
        string: true,
        match: "Halu",
        defaultIfNoMatch: "empty"
      })).toEqual("empty");

      expect(await parser.parseHtml(html, {
        selector: "h1",
        string: true,
        match: "Halu"
      })).toEqual(null);


      expect(await parser.parseHtml(html, {
        selector: "h1",
        string: true,
        match: "Hello"
      })).toEqual("Hello");

      expect(await parser.parseHtml(html, {
        selector: "h1",
        string: true,
        match: /Hello/
      })).toEqual("Hello");
    });
  }
});


describe("Number engine", () => {
  const parser = createParser<NumberSelector>(new NumberParserEngine());
  const html = "<h1>1</h1><h1>1.6</h1><h1>not number</h1>";
  it("should parse", async () => {
    expect(await parser.parseHtml(html, { selector: ["h1"], number: true })).toEqual([1, 1.6, null]);
    expect(await parser.parseHtml(html, { selector: "h1", number: true })).toEqual(1);
  });

  it("should apply default", async () => {
    expect(await parser.parseHtml(html, { selector: ["h1"], number: true, default: 0 })).toEqual([1, 1.6, 0]);
  });

  it("should apply int", async () => {
    expect(await parser.parseHtml(html, {
      selector: ["h1"],
      number: true,
      default: 1.5,
      int: true
    })).toEqual([1, 2, 1.5]);

    expect(await parser.parseHtml(html, {
      selector: ["h1"],
      number: true,
      default: 1.5,
      int: true,
      roundMode: "floor"
    })).toEqual([1, 1, 1.5]);
  });
});

describe("Boolean engine", () => {
  const parser = createParser<BooleanSelector>(new BooleanParserEngine());
  const html = "<h1>true</h1><h1>false</h1><h1>falsy</h1><h1>blah</h1>";
  it("should parse", async () => {
    expect(await parser.parseHtml(html, {
      selector: ["h1"],
      boolean: true,
      truthy: "true",
      falsy: ["false", "falsy"]
    })).toEqual([true, false, false, null]);

    expect(await parser.parseHtml(html, {
      selector: ["h1"],
      boolean: true,
      truthy: "true"
    })).toEqual([true, false, false, false]);
    expect(await parser.parseHtml(html, {
      selector: ["h1"],
      boolean: true,
      falsy: ["false", "falsy"]
    })).toEqual([true, false, false, true]);
  });

  it("should apply default", async () => {
    expect(await parser.parseHtml(html, {
      selector: ["h1"],
      boolean: true,
      truthy: "true",
      falsy: ["false"],
      default: true
    })).toEqual([true, false, true, true]);
  });
});

describe("Date engine", () => {
  const parser = createParser<DateSelector>(new DateParserEngine());
  it("should parse", async () => {
    expect(await parser.parseHtml("<h1>2020-01-02</h1>", {
      selector: "h1",
      date: true
    })).toEqual(new Date("2020-01-02T00:00:00").toISOString());

    expect(await parser.parseHtml("<h1>nanaha</h1>", {
      selector: "h1",
      date: true
    })).toEqual(null);

    expect(await parser.parseHtml("<h1>2020 01 02</h1>", {
      selector: "h1",
      date: true
    })).toEqual(new Date("2020-01-02T00:00:00").toISOString());
  });

  it("should apply default", async () => {
    expect(await parser.parseHtml("<h1>nanaha</h1>", {
      selector: "h1",
      date: true,
      default: new Date("2020-03-01"),
      format: "YYYY/MM/DD"
    })).toEqual("2020/03/01");

    expect(await parser.parseHtml("<h1>nanaha</h1>", {
      selector: "h1",
      date: true,
      default: "2020-03-01"
    })).toEqual(new Date("2020-03-01T00:00:00").toISOString());

    expect(await parser.parseHtml("<h1>nanaha</h1>", {
      selector: "h1",
      date: true,
      default: "Invalid date"
    })).toEqual(null);

    expect(await parser.parseHtml("<h1>nanaha</h1>", {
      selector: "h1",
      date: true,
      default: 1577840461000,
      format: "date"
    })).toEqual(new Date("2020-01-01T01:01:01.000Z"));
  });

  it("should parse multi format", async () => {
    expect(await parser.parseHtml("<h1>2020/01/02</h1>", {
      selector: "h1",
      date: true,
      parse: "YYYY/MM/DD"
    })).toEqual(new Date("2020-01-02T00:00:00").toISOString());

    expect(await parser.parseHtml("<h1>2020-01</h1><h1>2020/01/02</h1>", {
      selector: ["h1"],
      date: true,
      parse: ["YYYY/MM/DD", "YYYY-MM"]
    })).toEqual([new Date("2020-01-01T00:00:00").toISOString(), new Date("2020-01-02T00:00:00").toISOString()]);
  });

  it("should output multi format", async () => {
    expect(await parser.parseHtml("<h1>2020-01-02</h1>", {
      selector: "h1",
      date: true,
      format: "dayjs"
    })).toEqual(dayjs("2020-01-02T00:00:00"));

    expect(await parser.parseHtml("<h1>2020-01-02</h1>", {
      selector: "h1",
      date: true,
      format: "date"
    })).toEqual(new Date("2020-01-02T00:00:00"));

    expect(await parser.parseHtml("<h1>2020-01-02</h1>", {
      selector: "h1",
      date: true,
      format: "timestamp"
    })).toEqual(new Date("2020-01-02T00:00:00").getTime());

    expect(await parser.parseHtml("<h1>2020-01-02</h1>", {
      selector: "h1",
      date: true,
      format: "YYYY-MM"
    })).toEqual("2020-01");

    expect(await parser.parseHtml("<h1>2020-01-02</h1>", {
      selector: "h1",
      date: true,
      format: "MM-DD-YYYY HH:mm:ss"
    })).toEqual("01-02-2020 00:00:00");
  });
});


describe("Object engine", () => {
  it("should require other engines", () => {
    const engine = new ObjectParserEngine();
    expect(() => engine.config({ engines: [] })).toThrow();
    expect(() => engine.config({ engines: [engine] })).toThrow();
  });

  const parser = new BasicParser();
  it("should parse", async () => {
    expect(await parser.parseHtml("<h1>Hello</h1><h1>World</h1>", {
      selector: {
        hello: "h1"
      },
      scope: "h2"
    })).toEqual(null);

    expect(await parser.parseHtml("<h1>Hello</h1><h1>World</h1>", {
      selector: {
        hello: {
          selector: {
            text: "h1",
            world: {
              selector: {
                text: "h1:last-child"
              }
            }
          }
        }
      }
    })).toEqual({
      hello: {
        text: "Hello",
        world: {
          text: "World"
        }
      }
    });

    const html = await readFile(resolve("tests/assets/static.html"), "utf8");
    expect(await parser.parseHtml(html, {
      selector: {
        result: {
          selector: {
            li: ["li:nth-child(odd)"]
          },
          scope: ["ul"]
        }
      }
    })).toEqual({
      result: [
        { li: ["Tuo vero id quidem, inquam, arbitratu."] },
        { li: ["Indicant pueri, in quibus ut in speculis natura cernitur.", "Aufert enim sensus actionemque tollit omnem."] },
        { li: ["Multoque hoc melius nos veriusque quam Stoici."] },
        { li: ["Omnes enim iucundum motum, quo sensus hilaretur.", "Itaque si aut requietem natura non quaereret aut eam posset alia quadam ratione consequi."] },
        { li: ["Omnia contraria, quos etiam insanos esse vultis.", "Tu enim ista lenius, hic Stoicorum more nos vexat.", "Hosne igitur laudas et hanc eorum, inquam, sententiam sequi nos censes oportere?"] },
        { li: ["Sed tempus est, si videtur, et recta quidem ad me.", "Aliter enim nosmet ipsos nosse non possumus."] },
        { li: ["Suo genere perveniant ad extremum;", "Stulti autem malorum memoria torquentur, sapientes bona praeterita grata recordatione renovata delectant."] },
        { li: ["Atque hoc loco similitudines eas, quibus illi uti solent, dissimillimas proferebas.", "Atqui, inquam, Cato, si istud optinueris, traducas me ad te totum licebit."] }
      ]
    });
  });
});
