# Html Parser

Parse html to json object using predefined schema. Inspired by [x-ray](https://github.com/matthewmueller/x-ray)
and [scrape-it](https://github.com/IonicaBizau/scrape-it)

## Installation

```sh
# Using npm
npm install --save @lanatools/html-parser
```

## Usage

Scraping using html-parser with axios

```ts
import { Parser } from "@lanatools/html-parser";
import axios from "axios";

const parser = new Parser();

async function main() {
  const html = (await axios.get("https://github.com/topics/html")).data;
  const data = await parser.parseHtml(html, {
    selector: {
      title: "h3 a:last-child",
      user: {
        selector: "a:first-child",
        scope: "h3" // find first element using this scope selector. then apply the selector on this element
      },
      stars: {
        selector: "span#repo-stars-counter-star",
        number: true // parse value as number
      }
    },
    scope: [".col-md-8 > article"] // find all element using this scope selector. then apply the selector on each element
  });

  console.log(data);
  // [
  //   { title: "bootstrap", user: "twbs", stars: 155000 },
  //   { title: "electron", user: "electron", stars: 100000 },
  //   { title: "storybook", user: "storybookjs", stars: 68600 },
  //   { title: "Front-End-Checklist", user: "thedaviddias", stars: 58000 },
  //   { title: "html5-boilerplate", user: "h5bp", stars: 52300 },
  //    ...
  // ];
}

main();
```

Simplify selector schema using helpers

```ts
import { num, obj, Parser, str } from "@lanatools/html-parser";
import axios from "axios";

const parser = new Parser();

async function main() {
  const html = (await axios.get("https://github.com/topics/html")).data;
  const data = await parser.parseHtml(html,
    obj({
      title: "h3 a:last-child",
      user: str("a:first-child", "h3"),
      stars: num("span#repo-stars-counter-star")
    }, [".col-md-8 > article"])
  );

  console.log(data);
  // [
  //   { title: "bootstrap", user: "twbs", stars: 155000 },
  //   { title: "electron", user: "electron", stars: 100000 },
  //   { title: "storybook", user: "storybookjs", stars: 68600 },
  //   { title: "Front-End-Checklist", user: "thedaviddias", stars: 58000 },
  //   { title: "html5-boilerplate", user: "h5bp", stars: 52300 },
  //    ...
  // ];
}

main();

```

## Documentation

### API

### ```new Parser<P>(options: ParserOptions<P>)```

Create new parser instance

#### ```options: ParserOptions<P>```

- ```engines?: ParserEngine<P>[]```: Array of custom engines
- ```nodeFactory?: NodeFactory```: factory class to create nodes. default parser use Cheerio backed node factory
- ```transforms?: { [key: string]: TransformFunction }```: map of transform function (```built-in transforms```)
- ```objTransforms?: { [key: string]: TransformFunction }```: map of transform function that apply to object selector
- ``P`` additional custom selector to support

```ts
import { Parser, BasicParser } from "@lanatools/html-parser"
// Default parser
// included ObjectParserEngine, BooleanParserEngine, NumberParserEngine, DateParserEngine, DefaultParserEngine (StringParserEngine)
new Parser();

// Basic parser, only include ObjectParserEngine and DefaultParserEngine (StringParserEngine)
new BasicParser();

// Advanced usage with custom engine
new Parser<MyCustomSelector>({
  engines: [new MyCustomEngine()]
});

interface MyCustomSelector extends ValueSelector {
  me: true;
}

class MyCustomEngine extends ValueParserEngine<MyCustomSelector> {
  match(selector: any): boolean {
    return selector?.me === true;
  }

  protected parseValue(value: any, _: MyCustomSelector): Promise<any> {
    // just an example. this engine does nothing
    return Promise.resolve(value);
  }
}
```

### ```parser.parseHtml<T>(html, selector): Promise<T>```

Parse html

```T``` specify the return type

```html: string``` the html to parse

```selector: string | string[] | GeneralSelector<P>``` the selector schema

### Selector Schema

The selector can be a string, or array of single string follow the
format ```[selector]@[attribute] | [built-in transform]```
where the ``[selector]`` is a Jquery selector.

```ts
import { Parser } from "@lanatools/html-parser"

const html = "<h1>Hello</h1> <h1>World</h1>";
const parser = new Parser();

parser.parseHtml(html, "h1"); // "Hello"
parser.parseHtml(html, "h1@text"); // "Hello"
parser.parseHtml(html, ["h1"]); // ["Hello", "World"]
parser.parseHtml(html, "h1@innerHTML"); // "Hello" (the innerHTML of h1 element)
parser.parseHtml(html, "h1@html"); // "Hello" (the innerHTML of h1 element)
parser.parseHtml(html, "h1@outerHTML"); // "<h1>Hello</h1>"
```

The selector can also an object. Structure of the selector object based on the Selector that parser support or the
engines that passed to engines options. Common selector properties are:

- ```selector: string | string[] | MapSelector```: The actual selector
- ```scope?: string | string []```: scope of selector. transform to ```$(scope).find(selector)```
- ```trim?: boolean```: trim the value before process. default to ```true```
- ```transforms?: (string | TransformFunction)[]```: list of transform to apply. transform can be a function that take
  current value and return another value, or name of ```built-in transforms```

### Built-in engines

Built-in engines to convert parsed data into various data types like date, number, boolean

#### DefaultParserEngine / StringParserEngine

Parse value into string, or match string value

```ts
interface DefaultSelector {
  selector: string | string[];
  string?: boolean; // require true if using StringParserEngine. optional if using DefaultParserEngine
  default?: string | null; // default value
  defaultIfEmpty?: string | null; // default value if value is empty
  match?: string | RegExp;  // match the value and return match
  defaultIfNoMatch?: string | null; // default value if there is no match
}
```

- if complex type or null passed, the parser return default value

#### ObjectParserEngine

Enable support for nested selector map

```ts
interface ObjectSelector {
  selector: { [key: string]: GeneralSelector };// GeneralSelector can be any supported selector
  trim?: boolean; // apply trim for all sub selector (only if sub selector trim property is not specified)
  transforms?: (string | TransformFunction)[]; // apply transforms for all sub selector (apply after sub selector transform)
  objTransforms?: (string | TransformFunction)[]; // apply transform to the object result;
}
```

#### BooleanParserEngine

Parse value into boolean

```ts
interface BooleanSelector {
  selector: string | string[];
  boolean: true; // required
  truthy?: string | string[]; // list of value to parse as true.
  falsy?: string | string[];  // list of value to parse as false
  default?: boolean | null;   // default value
}
```

- if complex type or null passed, the parser return default value
- if number passed the parser parse 0 as false, others as true
- if falsy, and truthy not provided, the parser parse non-empty string as true, empty string as false
- if only falsy provided, the parser parse falsy string as false, otherwise true
- if only truthy provided, the parser parse truthy string as true, otherwise false
- if both passed, the parser parse truthy string as true, falsy string as false, otherwise default value

#### NumberParserEngine

Parse value into number. Use [numeral.js](https://www.npmjs.com/package/numeral) for numeric parsing and formatting, can
handler various input string format like "$10,000.00", "3.467TB", "76%", ...

```ts
interface NumberSelector {
  selector: string | string[];
  number: true; // required
  int?: boolean; // mode used to round value to int
  default?: number | null; // default value
  format?: "number" | string; // if format string passed then format number to that format (as string)
  roundMode?: "round" | "floor" | "ceil"; // mode used to round value to int
}
```

- if invalid number passed, the parser return default value
- if complex type or null passed, the parser return default value
- if boolean passed, the parser return 0 for false and 1 for true
- if format options is 'number', the parser return value as number (default)
- if format options is other string, the parser return formatted number string
- [list of number format](http://numeraljs.com/#format)

#### DateParserEngine

Parse value into date. use [day.js](https://www.npmjs.com/package/dayjs) for date parsing and formatting

```ts
interface NumberSelector {
  selector: string | string[];
  date: true; // required
  parse?: string | string[]; // format for parsing input string into date
  format?: "iso" | "date" | "dayjs" | "timestamp" | string;  // output format
  default?: string | Date | number; // default value
}
```

- if invalid date passed, the parser return default value
- if complex type or null passed, the parser return default value
- the parse options can be an array of string, for parsing different format
- if number passed, the parser parse the number as timestamp
- if format options is 'iso', the parser return value as iso date string (default)
- if format options is 'date', the parser return value as Date object
- if format options is 'timestamp', the parser return value as timestamp number
- if format options is 'dayjs', the parser return value as dayjs instance
- if format options is other string, the parser return formatted date string
- [list of date format token](https://day.js.org/docs/en/parse/string-format#list-of-all-available-parsing-tokens)

### Schema Helpers

Using schema helpers function to reduce nesting of your selector. example

```ts
import { date, num, obj, Parser } from "@lanatools/html-parser";

const parser = new Parser();

// using schema only
parser.parseHtml(html, {
  selector: {
    number: {
      selector: "pagination li",
      number: true // required for parsing number
    },
    date: {
      selector: "span.date",
      date: true // required for parsing date
    },
    scoped: {
      selector: ".title",
      scope: ["article"]
    }
  }
});

// using helpers
parser.parseHtml(html,
  obj({
    number: num("pagination li"),
    date: date("span.date"),
    scoped: str(".title", ["article"])
  })
);
```

List of available helpers

- ```obj(selector: { [key: string]: GeneralSelector }, scopeOrOptions?): ObjectSelector```
- ```num(selector: string | string[], scopeOrOptions?, default?): NumberSelector```
- ```int(selector: string | string[], scopeOrOptions?, default?): NumberSelector```
- ```str(selector: string | string[], scopeOrOptions?, default?): StringSelector```
- ```bool(selector: string | string[], scopeOrOptions?, truthy?, falsy?): BooleanSelector```
- ```date(selector: string | string[], scopeOrOptions?, parse?, format?, default?): DateSelector```

## License

MIT
