const REMOVE_KEY = "helicone-to-remove";

export function autoFillInputs({
  inputs,
  autoInputs,
  template,
}: {
  inputs: Record<string, string>;
  autoInputs: any[];
  template: any;
}): any {
  const inputValues = JSON.parse(JSON.stringify(inputs));

  function traverseAndTransform(obj: any): any {
    if (typeof obj === "string") {
      if (obj.includes("<helicone-auto-prompt-input")) {
        // Replace <helicone-auto-prompt-input> with autoInputs
        let index = 0;
        const stringWithAutoInputs = obj.replace(
          /<helicone-auto-prompt-input\s*idx=(\d+)\s*\/>/g,
          (_, idx) => {
            index = idx;
            return "";
          }
        );
        return autoInputs[index] ?? REMOVE_KEY;
      }

      // Replace <helicone-prompt-input> with actual values
      const stringWithInputs = obj.replace(
        /<helicone-prompt-input\s*key="([^"]*)"\s*\/>/g,
        (_, key) => {
          if (inputValues[key] !== undefined) {
            const value = inputValues[key];
            return value;
          }
          return "";
        }
      );

      return stringWithInputs;
    } else if (Array.isArray(obj)) {
      return obj
        .map((item) => traverseAndTransform(item))
        .filter((item) => item !== REMOVE_KEY);
    } else if (typeof obj === "object" && obj !== null) {
      const result: { [key: string]: any } = {};
      for (const key of Object.keys(obj)) {
        result[key] = traverseAndTransform(obj[key]);
      }
      return result;
    }
    return obj;
  }

  const result = traverseAndTransform(template);

  return result;
}
