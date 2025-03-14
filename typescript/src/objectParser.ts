// ... existing code ...

/**
 * Parses a string containing custom JSX-like tags and extracts information to produce two outputs:
 * 1. A version of the string with all JSX tags removed, leaving only the text content.
 * 2. An object representing a template with self-closing JSX tags and a separate mapping of keys to their
 *    corresponding text content.
 *
 * The function specifically targets `<helicone-prompt-input>` tags, which include a `key` attribute and enclosed text content.
 * These tags are transformed or removed based on the desired output structure. The process involves regular expressions
 * to match and manipulate the input string to produce the outputs.
 *
 * Parameters:
 * - input: A string containing the text and JSX-like tags to be parsed.
 *
 * Returns:
 * An object with two properties:
 * 1. stringWithoutJSXTags: A string where all `<helicone-prompt-input>` tags are removed, and only their text content remains.
 * 2. templateWithInputs: An object containing:
 *    - template: A version of the input string where `<helicone-prompt-input>` tags are replaced with self-closing versions,
 *      preserving the `key` attributes but removing the text content.
 *    - inputs: An object mapping the `key` attributes to their corresponding text content, effectively extracting
 *      the data from the original tags.
 *
 * Example Usage:
 * ```ts
 * const input = `
 * The scene is <helicone-prompt-input key="scene" >Harry Potter</helicone-prompt-input>.
 * <helicone-prompt-input key="name" >justin</helicone-prompt-input>  test`;
 *
 * const expectedOutput = parseJSXString(input);
 * console.log(expectedOutput);
 *```
 * The function is useful for preprocessing strings with embedded custom JSX-like tags, extracting useful data,
 * and preparing templates for further processing or rendering. It demonstrates a practical application of regular
 * expressions for text manipulation in TypeScript, specifically tailored to a custom JSX-like syntax.
 */

export interface TemplateWithInputs {
  template: object;
  inputs: { [key: string]: string };
  autoInputs: any[];
}

export interface ParseJSXObjectOptions {
  ignoreFields?: string[];
}
export function parseJSXObject(
  obj: any,
  options?: ParseJSXObjectOptions
): {
  objectWithoutJSXTags: any;
  templateWithInputs: TemplateWithInputs;
} {
  const inputs: { [key: string]: string } = {};
  const autoInputs: any[] = [];
  let autoPromptIndex = 0;

  function traverseAndTransform(
    obj: any,
    depth: number = 0,
    notInput: boolean = false
  ): any {
    if (typeof obj === "string") {
      if (obj.includes("<helicone-prompt-static>")) {
        // First, process static tags
        const stringWithoutStaticTags = obj.replace(
          /<helicone-prompt-static>(.*?)<\/helicone-prompt-static>/g,
          "$1"
        );

        // Then, check if there are also input tags and process them
        if (stringWithoutStaticTags.includes("<helicone-prompt-input")) {
          // Process input tags
          const stringWithoutJSXTags = stringWithoutStaticTags.replace(
            /<helicone-prompt-input\s*key="[^"]*"\s*>([\s\S]*?)<\/helicone-prompt-input>/g,
            "$1"
          );

          // Create template with self-closing input tags
          const templateWithSelfClosingTags = obj.replace(
            /<helicone-prompt-input\s*key="([^"]*)"\s*>([\s\S]*?)<\/helicone-prompt-input>/g,
            (_, key, value) => {
              inputs[key] = value.trim();
              return `<helicone-prompt-input key="${key}" />`;
            }
          );

          return { stringWithoutJSXTags, templateWithSelfClosingTags };
        }

        // If no input tags, just return the processed static tags
        return {
          stringWithoutJSXTags: stringWithoutStaticTags,
          templateWithSelfClosingTags: obj,
        };
      }

      const stringWithoutJSXTags = obj.replace(
        /<helicone-prompt-input\s*key="[^"]*"\s*>([\s\S]*?)<\/helicone-prompt-input>/g,
        "$1"
      );

      const templateWithSelfClosingTags = obj.replace(
        /<helicone-prompt-input\s*key="([^"]*)"\s*>([\s\S]*?)<\/helicone-prompt-input>/g,
        (_, key, value) => {
          inputs[key] = value.trim();
          return `<helicone-prompt-input key="${key}" />`;
        }
      );

      return { stringWithoutJSXTags, templateWithSelfClosingTags };
    } else if (Array.isArray(obj)) {
      return obj.map((o) => traverseAndTransform(o, depth + 1));
    } else if (typeof obj === "object" && obj !== null) {
      const text = JSON.stringify(obj);
      if (
        !text.includes("helicone-prompt-input") &&
        !text.includes("helicone-prompt-static") &&
        !notInput
      ) {
        autoInputs.push(obj);
        return {
          stringWithoutJSXTags: JSON.parse(JSON.stringify(obj)),
          templateWithSelfClosingTags: `<helicone-auto-prompt-input idx=${autoPromptIndex++} />`,
        };
      }
      const result: { [key: string]: any } = {};
      for (const key of Object.keys(obj)) {
        result[key] = traverseAndTransform(
          obj[key],
          depth + 1,
          options?.ignoreFields?.includes(key)
        );
      }
      return result;
    }
    return obj;
  }

  const transformed = traverseAndTransform(obj);

  function reconstructObject(obj: any): any {
    if (typeof obj === "object" && obj !== null) {
      if (
        "stringWithoutJSXTags" in obj &&
        "templateWithSelfClosingTags" in obj
      ) {
        return obj.stringWithoutJSXTags;
      }
      if (Array.isArray(obj)) {
        return obj.map(reconstructObject);
      }
      const result: { [key: string]: any } = {};
      for (const key of Object.keys(obj)) {
        result[key] = reconstructObject(obj[key]);
      }
      return result;
    }
    return obj;
  }

  function reconstructTemplate(obj: any): any {
    if (typeof obj === "object" && obj !== null) {
      if (
        "stringWithoutJSXTags" in obj &&
        "templateWithSelfClosingTags" in obj
      ) {
        return obj.templateWithSelfClosingTags;
      }
      if (Array.isArray(obj)) {
        return obj.map(reconstructTemplate);
      }
      const result: { [key: string]: any } = {};
      for (const key of Object.keys(obj)) {
        result[key] = reconstructTemplate(obj[key]);
      }
      return result;
    }
    return obj;
  }

  return {
    objectWithoutJSXTags: reconstructObject(transformed),
    templateWithInputs: {
      template: reconstructTemplate(transformed),
      inputs,
      autoInputs,
    },
  };
}
