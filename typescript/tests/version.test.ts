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
        content: `Hello <hpf-prompt-input key="world" />`,
      },
      {
        role: "user",
        content: `What is the capital of the <hpf-prompt-input key="place" />?`,
      },
      "<hpf-auto-prompt-input idx=0 />",
      "<hpf-auto-prompt-input idx=1 />",
      "<hpf-auto-prompt-input idx=2 />",
      "<hpf-auto-prompt-input idx=3 />",
    ],
    model: "gpt-3.5-turbo",
  };

  const newTemplate = {
    messages: [
      {
        role: "system",
        content: `Hello <hpf-prompt-input key="world" />`,
      },
      {
        role: "user",
        content: `What is the capital of the <hpf-prompt-input key="place" />?`,
      },
      "<hpf-auto-prompt-input idx=0 />",
      "<hpf-auto-prompt-input idx=1 />",
      "<hpf-auto-prompt-input idx=2 />",
      "<hpf-auto-prompt-input idx=3 />",
      "<hpf-auto-prompt-input idx=4 />",
    ],
    model: "gpt-3.5-turbo",
  };
  const result = shouldBumpVersion({
    old: template,
    new: newTemplate,
  });
  expect(result.shouldBump).toBe(true);
});

test("Should not bump version with less index", () => {
  const template = {
    messages: [
      {
        role: "system",
        content: `Hello <hpf-prompt-input key="world" />`,
      },
      {
        role: "user",
        content: `What is the capital of the <hpf-prompt-input key="place" />?`,
      },
      "<hpf-auto-prompt-input idx=0 />",
      "<hpf-auto-prompt-input idx=1 />",
      "<hpf-auto-prompt-input idx=2 />",
      "<hpf-auto-prompt-input idx=3 />",
    ],
    model: "gpt-3.5-turbo",
  };

  const newTemplate = {
    messages: [
      {
        role: "system",
        content: `Hello <hpf-prompt-input key="world" />`,
      },
      {
        role: "user",
        content: `What is the capital of the <hpf-prompt-input key="place" />?`,
      },
      "<hpf-auto-prompt-input idx=0 />",
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
        content: `Hello <hpf-prompt-input key="world" />`,
      },
      {
        role: "user",
        content: `What is the capital of the <hpf-prompt-input key="place" />?`,
      },
      "<hpf-auto-prompt-input idx=0 />",
      "<hpf-auto-prompt-input idx=1 />",
      "<hpf-auto-prompt-input idx=2 />",
      "<hpf-auto-prompt-input idx=3 />",
    ],
    model: "gpt-3.5-turbo",
  };

  const newTemplate = {
    messages: [
      {
        role: "system",
        content: `Hello <hpf-prompt-input key="world" />`,
      },
      {
        role: "user",
        content: `THIS IS NEW TEXT <hpf-prompt-input key="place" />?`,
      },
      "<hpf-auto-prompt-input idx=0 />",
      "<hpf-auto-prompt-input idx=1 />",
      "<hpf-auto-prompt-input idx=2 />",
      "<hpf-auto-prompt-input idx=3 />",
    ],
    model: "gpt-3.5-turbo",
  };
  const result = shouldBumpVersion({
    old: template,
    new: newTemplate,
  });
  expect(result.shouldBump).toBe(true);
});
