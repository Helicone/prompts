export function removeAutoInputs(template: any): {
  template: any;
  autoInputs: any[];
} {
  if (typeof template === "string") {
    const autoInputs = template.match(
      /<helicone-auto-prompt-input\s*idx=\d+\s*\/\s*>/g
    );
    return {
      template: template.replace(
        /<helicone-auto-prompt-input\s*idx=\d+\s*\/\s*>/g,
        ""
      ),
      autoInputs: autoInputs || [],
    };
  } else if (Array.isArray(template)) {
    const autoInputs = [];
    const newTemplateArray: any[] = [];
    for (const item of template) {
      const { template: newTemplate, autoInputs: newAutoInputs } =
        removeAutoInputs(item);
      if (newTemplate !== "") {
        newTemplateArray.push(newTemplate);
      }
      autoInputs.push(...newAutoInputs);
    }
    return { template: newTemplateArray, autoInputs };
  } else if (typeof template === "object" && template !== null) {
    const autoInputs = [];
    const result: { [key: string]: any } = {};
    for (const key of Object.keys(template)) {
      const { template: newTemplate, autoInputs: newAutoInputs } =
        removeAutoInputs(template[key]);
      if (newTemplate !== "") {
        result[key] = newTemplate;
      }
      autoInputs.push(...newAutoInputs);
    }
    return { template: result, autoInputs };
  }
  return { template: template, autoInputs: [] };
}

export function shouldBumpVersion(versions: { old: object; new: object }): {
  shouldBump: boolean;
  shouldUpdateNotBump: boolean;
} {
  const { template: oldTemplate, autoInputs: oldAutoInputs } = removeAutoInputs(
    versions.old
  );
  const { template: newTemplate, autoInputs: newAutoInputs } = removeAutoInputs(
    versions.new
  );

  if (JSON.stringify(oldTemplate) !== JSON.stringify(newTemplate)) {
    return { shouldBump: true, shouldUpdateNotBump: true };
  }

  if (newAutoInputs.length > oldAutoInputs.length) {
    return { shouldBump: false, shouldUpdateNotBump: true };
  }
  return { shouldBump: false, shouldUpdateNotBump: false };
}
