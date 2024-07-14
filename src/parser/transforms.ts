import { isObject } from "../engine/common.js";

/**
 * Built-in {@link TransformFunction}
 */
export const transforms = {
  /**
   * Replace matched in string (match is treated as regex)
   */
  replace(val: any, match: any, replaceBy: any): any | null {
    return applyWithObjectAndArraySupport(val, (input) => {
      if (typeof input !== "string") return input === match ? replaceBy : input;
      const regex = new RegExp(match, "g");
      return input.replace(regex, replaceBy);
    });
  },

  /**
   * Match string (match is treated as regex), return matched value.
   */
  match(val: any, token: string, flag = "g", defaultIfNoMatch: string | null = null): string | null {
    return applyWithObjectAndArraySupport(val, (input) => {
      if (typeof input !== "string") return input;

      const regex = new RegExp(token, flag);
      return regex.exec(input)?.[0] ?? defaultIfNoMatch ?? null;
    });
  },

  /**
   * like {@link match} but return all matched value as array (empty array if not match).
   */
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

  /**
   * Split string by token (token is treated as regex). return array of string.
   */
  split(val: any, token = ",", flag = "g"): string[] | null {
    return applyWithObjectAndArraySupport(val, (input) => {
      if (typeof input !== "string") return input;
      const regex = new RegExp(token, flag);
      return input.split(regex);
    });
  },

  /**
   * Join array into string. Only support array or object (join all object values into string).
   */
  join(val: any, token = ","): string | null {
    if (val == null) return null;
    if (Array.isArray(val)) return val.join(token);
    if (isObject(val)) return Object.values(val).join(token);
    return val;
  },

  /**
   * Like {@link def} but return empty string instead of default
   */
  empty(val: any, mode: "blank" | "empty" | "falsy" | null = "blank", ...values: any[]): any {
    return transforms.def(val, "", mode, ...values);
  },

  /**
   * Return default if input is in values, or input is blank | empty | falsy | null (based on mode)
   */
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

  /**
   * Convert input to string, using toString (basically convert input to string, but without special treatment
   *   for array and object)
   */
  toString(val: any): string | null {
    if (val == null) return null;
    return val.toString();
  },

  /**
   * Convert input to string, for array and object, convert each element/value to string
   */
  str(val: any): any | null {
    if (val == null) return null;
    return applyWithObjectAndArraySupport(val, (input) => input.toString());
  },

  /**
   * Call ```JSON.stringify``` on input. return json string
   */
  json(val: any): any | null {
    if (val == null) return null;
    return JSON.stringify(val);
  },

  /**
   * Return null if value equal to match. For object, remove all key which have value equal to
   * match. For array, remove all item equal to match.
   */
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

  /**
   *  If key not specified, return array contain input. if key is specified, return object which
   *   have 'key' value is input.
   */
  wrap(val: any, keyName?: string): any | any[] {
    if (keyName) {
      return {
        [keyName]: val
      };
    }

    return [val];
  },

  /**
   * Flatten array. Only support array.
   */
  flat(val: any, depth = 1): any | null {
    if (val == null) return null;
    if (Array.isArray(val)) return val.flat(depth);
    return val;
  },

  /**
   * Remove duplicated element in array. Only support array.
   */
  unique(val: any): any | null {
    if (val == null) return null;
    if (Array.isArray(val)) return [...new Set(val)];
    return val;
  },

  /**
   * Convert input to lowercase
   */
  lowercase(val: any): any | null {
    return applyWithObjectAndArraySupport(val, (input) => {
      if (typeof input !== "string") return input;
      return input.toLowerCase();
    });
  },

  /**
   * Convert input to uppercase
   */
  uppercase(val: any): any | null {
    return applyWithObjectAndArraySupport(val, (input) => {
      if (typeof input !== "string") return input;
      return input.toUpperCase();
    });
  },

  /**
   * Convert title (upper case first letter of each word)
   */
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
