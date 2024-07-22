import {
  hpf,
  parsePrompt,
  formatPrompt,
  parseJSXObject,
  shouldBumpVersion,
} from "../src/index";

test("Should bump version with new index", () => {
  const template = {
    messages: [
      {
        role: "system",
        content: `Hello <helicone-prompt-input key="world" />`,
      },
      {
        role: "user",
        content: `What is the capital of the <helicone-prompt-input key="place" />?`,
      },
      "<helicone-auto-prompt-input idx=0 />",
      "<helicone-auto-prompt-input idx=1 />",
      "<helicone-auto-prompt-input idx=2 />",
      "<helicone-auto-prompt-input idx=3 />",
      "<helicone-auto-prompt-input idx=4 />",
    ],
    model: "gpt-3.5-turbo",
  };

  const newTemplate = {
    messages: [
      {
        role: "system",
        content: `Hello <helicone-prompt-input key="world" />`,
      },
      {
        role: "user",
        content: `What is the capital of the <helicone-prompt-input key="place" />?`,
      },
      "<helicone-auto-prompt-input idx=0 />",
      "<helicone-auto-prompt-input idx=1 />",
      "<helicone-auto-prompt-input idx=2 />",
      "<helicone-auto-prompt-input idx=3 />",
    ],
    model: "gpt-3.5-turbo",
  };
  const result = shouldBumpVersion({
    old: template,
    new: newTemplate,
  });
  expect(result.shouldBump).toBe(false);

  expect(result.shouldUpdateNotBump).toBe(false);
});

test("Should bump version with new index", () => {
  const template = {
    messages: [
      {
        role: "system",
        content: `Hello <helicone-prompt-input key="world" />`,
      },
      {
        role: "user",
        content: `What is the capital of the <helicone-prompt-input key="place" />?`,
      },
      "<helicone-auto-prompt-input idx=0 />",
      "<helicone-auto-prompt-input idx=1 />",
      "<helicone-auto-prompt-input idx=2 />",
      "<helicone-auto-prompt-input idx=3 />",
    ],
    model: "gpt-3.5-turbo",
  };

  const newTemplate = {
    messages: [
      {
        role: "system",
        content: `Hello <helicone-prompt-input key="world" />`,
      },
      {
        role: "user",
        content: `What is the capital of the <helicone-prompt-input key="place" />?`,
      },
      "<helicone-auto-prompt-input idx=0 />",
      "<helicone-auto-prompt-input idx=1 />",
      "<helicone-auto-prompt-input idx=2 />",
      "<helicone-auto-prompt-input idx=3 />",
      "<helicone-auto-prompt-input idx=4 />",
    ],
    model: "gpt-3.5-turbo",
  };
  const result = shouldBumpVersion({
    old: template,
    new: newTemplate,
  });
  expect(result.shouldBump).toBe(false);

  expect(result.shouldUpdateNotBump).toBe(true);
});

test("Should not bump version with less index", () => {
  const template = {
    messages: [
      {
        role: "system",
        content: `Hello <helicone-prompt-input key="world" />`,
      },
      {
        role: "user",
        content: `What is the capital of the <helicone-prompt-input key="place" />?`,
      },
      "<helicone-auto-prompt-input idx=0 />",
      "<helicone-auto-prompt-input idx=1 />",
      "<helicone-auto-prompt-input idx=2 />",
      "<helicone-auto-prompt-input idx=3 />",
    ],
    model: "gpt-3.5-turbo",
  };

  const newTemplate = {
    messages: [
      {
        role: "system",
        content: `Hello <helicone-prompt-input key="world" />`,
      },
      {
        role: "user",
        content: `What is the capital of the <helicone-prompt-input key="place" />?`,
      },
      "<helicone-auto-prompt-input idx=0 />",
    ],
    model: "gpt-3.5-turbo",
  };
  const result = shouldBumpVersion({
    old: template,
    new: newTemplate,
  });
  expect(result.shouldBump).toBe(false);
});

test("Should bump version with changes to content", () => {
  const template = {
    messages: [
      {
        role: "system",
        content: `Hello <helicone-prompt-input key="world" />`,
      },
      {
        role: "user",
        content: `What is the capital of the <helicone-prompt-input key="place" />?`,
      },
      "<helicone-auto-prompt-input idx=0 />",
      "<helicone-auto-prompt-input idx=1 />",
      "<helicone-auto-prompt-input idx=2 />",
      "<helicone-auto-prompt-input idx=3 />",
    ],
    model: "gpt-3.5-turbo",
  };

  const newTemplate = {
    messages: [
      {
        role: "system",
        content: `Hello <helicone-prompt-input key="world" />`,
      },
      {
        role: "user",
        content: `THIS IS NEW TEXT <helicone-prompt-input key="place" />?`,
      },
      "<helicone-auto-prompt-input idx=0 />",
      "<helicone-auto-prompt-input idx=1 />",
      "<helicone-auto-prompt-input idx=2 />",
      "<helicone-auto-prompt-input idx=3 />",
    ],
    model: "gpt-3.5-turbo",
  };
  const result = shouldBumpVersion({
    old: template,
    new: newTemplate,
  });
  expect(result.shouldBump).toBe(true);

  expect(result.shouldUpdateNotBump).toBe(true);
});
