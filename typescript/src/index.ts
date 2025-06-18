console.warn(
  "\x1b[33m⚠️  Warning: @helicone/prompts package is deprecated and will no longer receive updates.\x1b[0m"
);

export { autoFillInputs } from "./fillInputs";
export { parseJSXObject } from "./objectParser";
export { removeAutoInputs, shouldBumpVersion } from "./objectVersionChecking";

const hpromptTag = "helicone-prompt-input";

export function prompt(
  strings: TemplateStringsArray,
  ...values: any[]
): {
  heliconeTemplate: string;
  inputs: Record<string, any>;
  builtString: string;
} {
  const heliconeTemplate = strings.reduce((acc, string, i) => {
    const val = values[i];
    if (val != null) {
      const key = Object.keys(val)[0];
      return acc + string + `<${hpromptTag} key="${key}" />`;
    } else {
      return acc + string;
    }
  }, "");

  const inputs = strings.reduce((acc, string, i) => {
    const val = values[i];
    if (val != null) {
      const value = Object.values(val)[0];
      return { ...acc, [Object.keys(val)[0]]: value };
    } else {
      return acc;
    }
  }, {});

  const builtString = strings.reduce((acc, string, i) => {
    const val = values[i];
    if (val != null) {
      const value = Object.values(val)[0];
      return acc + string + value;
    } else {
      return acc + string;
    }
  }, "");
  return { heliconeTemplate, inputs, builtString };
}

interface HPromptConfig {
  chain?: (strings: TemplateStringsArray, ...values: unknown[]) => string;
  format: "raw" | "template";
}

/**
 * Generates a prompt with annotated variables.
 * @param chain - Any other chian you want to use for template literal function for postprocessing, though any similar function may be provided. (ex. dedent, sql)
 * @param format - The format of the prompt. If 'raw', the prompt will be returned as a string with the variables replaced. If 'template', the prompt will be returned as a string with the variables replaced with helicone-prompt-input tags.
 */

type StringFormatter = (
  strings: TemplateStringsArray,
  ...values: any[]
) => string;

export const hpfc =
  ({ format, chain }: HPromptConfig) =>
  (strings: TemplateStringsArray, ...values: any[]): string => {
    const newValues = values.map((v) => {
      if (typeof v === "object") {
        if (format === "raw") {
          return Object.values(v)[0];
        } else {
          return `<${hpromptTag} key="${Object.keys(v)[0]}" >${
            Object.values(v)[0] as string
          }</${hpromptTag}>`;
        }
      } else {
        return v;
      }
    });
    if (chain) {
      return chain(strings, ...newValues);
    } else {
      return strings.reduce((acc, string, i) => {
        return acc + string + (newValues[i] || "");
      }, "");
    }
  };

/**
 * Helicone Prompt Formatter
 */
export const hpf = hpfc({ format: "template" });

/**
 * Helicone Prompt Formatter Recursive
 */
export const hpfr = (chain: StringFormatter) =>
  hpfc({ format: "template", chain });

/**
 * Helicone Prompt Static Formatter
 * Wraps the entire text in <helicone-prompt-static> tags
 */
export const hpstatic = (
  strings: TemplateStringsArray,
  ...values: any[]
): string => {
  const content = strings.reduce((acc, str, i) => {
    return acc + str + (values[i] || "");
  }, "");
  return `<helicone-prompt-static>${content}</helicone-prompt-static>`;
};

export const parsePrompt = (prompt: string) => {
  // Remove JSX tags and keep content
  const stringWithoutJSXTags = prompt.replace(
    /<helicone-prompt-input\s*key="[^"]*"\s*>([\s\S]*?)<\/\s*helicone-prompt-input\s*>/g,
    "$1"
  );

  const inputs: { [key: string]: string } = {};
  // Replace JSX tags with self-closing tags and extract inputs
  const templateWithSelfClosingTags = prompt.replace(
    /<helicone-prompt-input\s*key="([^"]*)"\s*>([\s\S]*?)<\/\s*helicone-prompt-input\s*>/g,
    (_, key, value) => {
      inputs[key] = value.trim();
      return `<helicone-prompt-input key="${key}" />`;
    }
  );

  // const regex = /<helicone-prompt-input\s*key="(\w+)"\s*\/>/g;
  // const variables: { [key: string]: string } = {};
  // let match;

  // while ((match = regex.exec(prompt)) !== null) {
  //   variables[match[1]] = "";
  // }

  return {
    variables: inputs,
    prompt: templateWithSelfClosingTags,
    text: stringWithoutJSXTags,
  };
};

/**
 * Formats a prompt template by replacing placeholder tags with their corresponding values.
 * @param prompt - The prompt template containing helicone-prompt-input placeholder tags
 * @param variables - An object mapping variable keys to their values
 * @returns The formatted prompt with all placeholders replaced with their values
 */
export const formatPrompt = (
  prompt: string,
  variables: Record<string, any>
) => {
  return prompt.replace(
    /<helicone-prompt-input key="(\w+)" \/>/g,
    (match, key) => {
      return `<${hpromptTag} key="${key}">${
        variables[key] || ""
      }</${hpromptTag}>`;
    }
  );
};

/**
 * Removes indentation and trims leading/trailing empty lines from a string.
 * The indentation level is determined by:
 * 1. For multi-line strings: Uses the indentation of the second non-empty line
 * 2. For single-line strings: Uses the indentation of that line
 * Lines with less indentation than the determined amount are left-trimmed
 *
 * @param str - The string to process
 * @returns The processed string with consistent indentation and no leading/trailing empty lines
 */
function dedentHpfo(str: string): string {
  const lines = str.split(/\r?\n/);
  // Remove leading empty lines
  while (lines.length && lines[0].trim() === "") {
    lines.shift();
  }
  // Remove trailing empty lines
  while (lines.length && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  let dedentAmount = 0;
  if (lines.length >= 2) {
    const secondLineMatch = lines[1].match(/^(\s*)/);
    dedentAmount = secondLineMatch ? secondLineMatch[1].length : 0;
  } else if (lines.length === 1) {
    const onlyLineMatch = lines[0].match(/^(\s*)/);
    dedentAmount = onlyLineMatch ? onlyLineMatch[1].length : 0;
  }

  const outdentedLines = lines.map((line) => {
    const currentIndentMatch = line.match(/^(\s*)/);
    const currentIndent = currentIndentMatch ? currentIndentMatch[1].length : 0;
    if (currentIndent >= dedentAmount) {
      return line.slice(dedentAmount);
    } else {
      return line.trimStart();
    }
  });
  return outdentedLines.join("\n");
}

/**
 * A string formatter that processes template literals to normalize their indentation
 * and remove leading/trailing empty lines. Used internally by hpfo.
 *
 * @param strings - The template literal string parts
 * @param values - The interpolated values
 * @returns The processed string with normalized indentation
 */
const outdentFormatter: StringFormatter = (
  strings: TemplateStringsArray,
  ...values: any[]
): string => {
  const constructed = strings.reduce(
    (acc, str, i) => acc + str + (values[i] || ""),
    ""
  );
  return dedentHpfo(constructed);
};

/**
 * Helicone Prompt Formatter with Outdent
 * A template literal tag that combines helicone prompt formatting with automatic indentation normalization.
 * It removes common leading spaces and trims leading/trailing empty lines while preserving the relative
 * indentation of the content. This is particularly useful for multi-line prompts where you want to
 * maintain code formatting in your source files without affecting the final prompt output.
 *
 * @example
 * const prompt = hpfo`
 *   This is a multi-line prompt
 *     with different levels of
 *       indentation and a ${{ var: "value" }}
 *   that will be normalized.
 * `;
 */
export const hpfo = hpfc({ format: "template", chain: outdentFormatter });
