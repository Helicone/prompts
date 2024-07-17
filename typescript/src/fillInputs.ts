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
  const remainingInputValues = JSON.parse(JSON.stringify(inputs));

  function traverseAndTransform(obj: any): any {
    if (typeof obj === "string") {
      if (obj.includes("<hpf-auto-prompt-input")) {
        // Replace <hpf-auto-prompt-input> with autoInputs
        let index = 0;
        const stringWithAutoInputs = obj.replace(
          /<hpf-auto-prompt-input\s*idx=(\d+)\s*\/>/g,
          (_, idx) => {
            index = idx;
            return "";
          }
        );
        return autoInputs[index] ?? REMOVE_KEY;
      }

      // Replace <hpf-prompt-input> with actual values
      const stringWithInputs = obj.replace(
        /<hpf-prompt-input\s*key="([^"]*)"\s*\/>/g,
        (_, key) => {
          if (remainingInputValues[key] !== undefined) {
            const value = remainingInputValues[key];
            delete remainingInputValues[key];
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
