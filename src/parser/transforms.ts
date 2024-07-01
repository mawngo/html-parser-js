import { isObject } from "../engine/common.js";

/**
 * Built-in {@link TransformFunction}
 */
export const transforms = {
  replace(val: any, match: any, replaceBy: any): any | null {
    return applyWithObjectAndArraySupport(val, (input) => {
      if (typeof input !== "string") return input === match ? replaceBy : input;
      const regex = new RegExp(match, "g");
      return input.replace(regex, replaceBy);
    });
  },

  match(val: any, token: string, flag = "g", defaultIfNoMatch: string | null = null): string | null {
    return applyWithObjectAndArraySupport(val, (input) => {
      if (typeof input !== "string") return input;

      const regex = new RegExp(token, flag);
      return regex.exec(input)?.[0] ?? defaultIfNoMatch ?? null;
    });
  },

  matchAll(val: any, token: string, flag = "g"): string[] | null {
    return applyWithObjectAndArraySupport(val, (input) => {
      if (typeof input !== "string") return input;

      const regex = new RegExp(token, flag);
      const result: string[] = [];
      let matches: RegExpMatchArray | null;
      do {
        matches = regex.exec(input);
        if (matches && matches[0]) result.push(matches[0]);
      } while (matches);
      return result;
    });
  },

  split(val: any, token = ",", flag = "g"): string[] | null {
    return applyWithObjectAndArraySupport(val, (input) => {
      if (typeof input !== "string") return input;
      const regex = new RegExp(token, flag);
      return input.split(regex);
    });
  },

  join(val: any, token = ","): string | null {
    if (val == null) return null;
    if (Array.isArray(val)) return val.join(token);
    if (isObject(val)) return Object.values(val).join(token);
    return val;
  },

  empty(val: any, mode: "blank" | "empty" | "falsy" | null = "blank", ...values: any[]): any {
    return transforms.def(val, "", mode, ...values);
  },

  def<T, D>(val: T | null, defaultValue: D, mode: "blank" | "empty" | "falsy" | null = null, ...additionalValuesToDefault: any[]): T | D {
    if (val == null) return defaultValue;

    return applyWithObjectAndArraySupport(val, (input) => {
      if (input == null) return defaultValue;
      if (additionalValuesToDefault.includes(input)) return defaultValue;
      if (mode === "falsy" && !input) return defaultValue;

      if (typeof input === "string") {
        if (mode === "empty" && input === "") return defaultValue;
        if (mode === "blank" && input.trim() === "") return defaultValue;
      }

      return input;
    });
  },

  toString(val: any): string | null {
    if (val == null) return null;
    return val.toString();
  },

  str(val: any): any | null {
    if (val == null) return null;
    return applyWithObjectAndArraySupport(val, (input) => input.toString());
  },

  json(val: any): any | null {
    if (val == null) return null;
    return JSON.stringify(val);
  },

  del(val: any, valueToMatch: any): any | null {
    if (val == null) return null;
    if (Array.isArray(val)) return val.filter(x => x !== valueToMatch);

    if (isObject(val)) {
      const result = {};
      for (const [key, value] of Object.entries(val)) {
        if (value === valueToMatch) continue;
        result[key] = value;
      }
      return result;
    }

    return val === valueToMatch ? null : val;
  },

  wrap(val: any, keyName?: string): any | any[] {
    if (keyName) {
      return {
        [keyName]: val
      };
    }

    return [val];
  },

  flat(val: any, depth = 1): any | null {
    if (val == null) return null;
    if (Array.isArray(val)) return val.flat(depth);
    return val;
  },

  unique(val: any): any | null {
    if (val == null) return null;
    if (Array.isArray(val)) return [...new Set(val)];
    return val;
  },

  lowercase(val: any): any | null {
    return applyWithObjectAndArraySupport(val, (input) => {
      if (typeof input !== "string") return input;
      return input.toLowerCase();
    });
  },

  uppercase(val: any): any | null {
    return applyWithObjectAndArraySupport(val, (input) => {
      if (typeof input !== "string") return input;
      return input.toUpperCase();
    });
  },

  title(val: any): any | null {
    return applyWithObjectAndArraySupport(val, (input) => {
      if (typeof input !== "string") return input;
      return input.split(" ").map(w => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()).join(" ");
    });
  }
};

function applyWithObjectAndArraySupport(val: any, transform: (val: any) => any) {
  if (Array.isArray(val)) return val.map(x => transform(x));
  if (isObject(val)) {
    const result = {};
    for (const [key, value] of Object.entries(val)) {
      result[key] = transform(value);
    }
    return result;
  }
  return transform(val);
}
