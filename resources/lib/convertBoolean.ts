/**
 * Safely converts anything to boolean
 * @param value The value
 * @param strict Should the conversion be strict
 * @returns The converted value
 */
export const convertBoolean = (value: unknown, strict = true) => {
  switch (typeof value) {
    case "boolean":
      return value;
    case "number":
    case "bigint":
      return value > 0;
    case "object":
      return !(value === null);
    case "string":
      if (!strict) {
        if (value === "false" || value === "0") return false;
        return true;
      }
      return value === "true" || value === "1";
    case "function":
    case "symbol":
      return true;
    case "undefined":
      return false;
  }
};
