import {
  hpf,
  parsePrompt,
  formatPrompt,
  parseJSXObject,
  shouldBumpVersion,
  autoFillInputs,
} from "../src/index";

test("Should place variables in the correct place", () => {
  const inputs = {
    place: "moon",
    world: "variable",
  };

  const autoInputs = [
    {
      role: "assistant",
      content: "The moon is made of cheese",
    },
    {
      role: "user",
      content: "Please explain the moon in a different way, as a pirate",
    },
  ];
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
    ],
    model: "gpt-3.5-turbo",
  };

  const result = autoFillInputs({ inputs, autoInputs, template });

  expect(result).toStrictEqual({
    messages: [
      { role: "system", content: "Hello variable" },
      { role: "user", content: "What is the capital of the moon?" },
      {
        role: "assistant",
        content: "The moon is made of cheese",
      },
      {
        role: "user",
        content: "Please explain the moon in a different way, as a pirate",
      },
    ],
    model: "gpt-3.5-turbo",
  });
});

test("Should place variables in the correct place with less auto inputs", () => {
  const inputs = {
    place: "moon",
    world: "variable",
  };

  const autoInputs = [
    {
      role: "assistant",
      content: "The moon is made of cheese",
    },
  ];
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
    ],
    model: "gpt-3.5-turbo",
  };

  const result = autoFillInputs({ inputs, autoInputs, template });

  expect(result).toStrictEqual({
    messages: [
      { role: "system", content: "Hello variable" },
      { role: "user", content: "What is the capital of the moon?" },
      {
        role: "assistant",
        content: "The moon is made of cheese",
      },
    ],
    model: "gpt-3.5-turbo",
  });
});

test("Simple text place", () => {
  const result = autoFillInputs({
    inputs: {
      world: "variable",
    },
    template: `Hello <hpf-prompt-input key="world" />`,
    autoInputs: [],
  });

  expect(result).toBe("Hello variable");
});
