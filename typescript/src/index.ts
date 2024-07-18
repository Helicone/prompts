export { parseJSXObject } from "./objectParser";
export { shouldBumpVersion, removeAutoInputs } from "./objectVersionChecking";
export { autoFillInputs } from "./fillInputs";

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
