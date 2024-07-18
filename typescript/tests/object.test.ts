import { hpf, parseJSXObject } from "../src/index";

test("parse object", () => {
  const obj = {
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content:
          'Test <helicone-prompt-input key="test-1">input 1</helicone-prompt-input>',
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: "...",
              detail: "high",
            },
          },
        ],
      },
      {
        role: "assistance",
        content:
          'Using the content above and given that <helicone-prompt-input key="test-2">input 2</helicone-prompt-input>, what are the images?',
      },
    ],
    max_tokens: 700,
  };

  const { objectWithoutJSXTags, templateWithInputs } = parseJSXObject(obj, {
    ignoreFields: ["max_tokens", "model"],
  });

  expect(templateWithInputs.inputs).toEqual({
    "test-1": "input 1",
    "test-2": "input 2",
  });

  expect(objectWithoutJSXTags).toStrictEqual({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: "Test input 1",
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: "...", detail: "high" },
          },
        ],
      },
      {
        role: "assistance",
        content:
          "Using the content above and given that input 2, what are the images?",
      },
    ],
    max_tokens: 700,
  });

  expect(templateWithInputs.template).toStrictEqual({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: 'Test <helicone-prompt-input key="test-1" />',
      },
      "<helicone-auto-prompt-input idx=0 />",
      {
        role: "assistance",
        content:
          'Using the content above and given that <helicone-prompt-input key="test-2" />, what are the images?',
      },
    ],
    max_tokens: 700,
  });

  expect(templateWithInputs.autoInputs).toStrictEqual([
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: {
            url: "...",
            detail: "high",
          },
        },
      ],
    },
  ]);
});

test("parse object chat example", () => {
  const obj = {
    messages: [
      {
        role: "system",
        content: hpf`Hello ${{ world: "variable" }}`,
      },
      {
        role: "user",
        content: hpf`What is the capital of the ${{ place: "moon" }}?`,
      },
      {
        role: "assistant",
        content: `The moon is made of cheese`,
      },
      {
        role: "user",
        content: "Please explain the moon in a different way, as a pirate",
      },
      {
        role: "assistant",
        content: "arrrgh the mooon be made of yee cheese",
      },
      {
        role: "user",
        content:
          "Now pick a random sesame street character and explain the moon as that character would",
      },
    ],
    model: "gpt-3.5-turbo",
  };

  const { objectWithoutJSXTags, templateWithInputs } = parseJSXObject(obj, {
    ignoreFields: ["max_tokens", "model"],
  });

  expect(templateWithInputs.inputs).toEqual({
    place: "moon",
    world: "variable",
  });

  expect(templateWithInputs.template).toStrictEqual({
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
  });

  expect(templateWithInputs.autoInputs).toStrictEqual([
    {
      role: "assistant",
      content: "The moon is made of cheese",
    },
    {
      role: "user",
      content: "Please explain the moon in a different way, as a pirate",
    },
    {
      role: "assistant",
      content: "arrrgh the mooon be made of yee cheese",
    },
    {
      role: "user",
      content:
        "Now pick a random sesame street character and explain the moon as that character would",
    },
  ]);
});
