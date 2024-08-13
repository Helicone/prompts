import { hpstatic, parseJSXObject } from "../src/index";

describe("hpstatic", () => {
  test("should wrap simple string in helicone-prompt-static tags", () => {
    const result = hpstatic`This is a static prompt`;
    expect(result).toBe(
      "<helicone-prompt-static>This is a static prompt</helicone-prompt-static>"
    );
  });

  test("should handle template literals with variables", () => {
    const variable = "world";
    const result = hpstatic`Hello ${variable}!`;
    expect(result).toBe(
      "<helicone-prompt-static>Hello world!</helicone-prompt-static>"
    );
  });

  test("should handle multi-line strings", () => {
    const result = hpstatic`
      This is a
      multi-line
      static prompt
    `;
    expect(result).toBe(
      "<helicone-prompt-static>\n      This is a\n      multi-line\n      static prompt\n    </helicone-prompt-static>"
    );
  });

  test("should handle empty string", () => {
    const result = hpstatic``;
    expect(result).toBe("<helicone-prompt-static></helicone-prompt-static>");
  });

  test("should handle string with special characters", () => {
    const result = hpstatic`<script>alert("XSS")</script>`;
    expect(result).toBe(
      '<helicone-prompt-static><script>alert("XSS")</script></helicone-prompt-static>'
    );
  });
});

test("parse object with static prompt", () => {
  const obj = {
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content:
          "<helicone-prompt-static>This is a static prompt</helicone-prompt-static>",
      },
      {
        role: "user",
        content:
          'Test <helicone-prompt-input key="test-1">input 1</helicone-prompt-input>',
      },
    ],
    max_tokens: 700,
  };

  const { objectWithoutJSXTags, templateWithInputs } = parseJSXObject(obj, {
    ignoreFields: ["max_tokens", "model"],
  });

  expect(templateWithInputs.inputs).toEqual({
    "test-1": "input 1",
  });

  expect(objectWithoutJSXTags).toStrictEqual({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: "This is a static prompt",
      },
      {
        role: "user",
        content: "Test input 1",
      },
    ],
    max_tokens: 700,
  });

  expect(templateWithInputs.template).toStrictEqual({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content:
          "<helicone-prompt-static>This is a static prompt</helicone-prompt-static>",
      },
      {
        role: "user",
        content: 'Test <helicone-prompt-input key="test-1" />',
      },
    ],
    max_tokens: 700,
  });

  expect(templateWithInputs.autoInputs).toStrictEqual([]);
});

test("parse object with static prompt", () => {
  const obj = {
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content:
          "<helicone-prompt-static>This is a static prompt</helicone-prompt-static>",
      },
      {
        role: "user",
        content: "Test input 1",
      },
    ],
    max_tokens: 700,
  };

  const { objectWithoutJSXTags, templateWithInputs } = parseJSXObject(obj, {
    ignoreFields: ["max_tokens", "model"],
  });

  expect(objectWithoutJSXTags).toStrictEqual({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: "This is a static prompt",
      },
      {
        role: "user",
        content: "Test input 1",
      },
    ],
    max_tokens: 700,
  });

  expect(templateWithInputs.template).toStrictEqual({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content:
          "<helicone-prompt-static>This is a static prompt</helicone-prompt-static>",
      },
      "<helicone-auto-prompt-input idx=0 />",
    ],
    max_tokens: 700,
  });
  expect(templateWithInputs.autoInputs).toStrictEqual([
    {
      role: "user",
      content: "Test input 1",
    },
  ]);
});

test("parse object with static prompt", () => {
  const obj = {
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "<helicone-prompt-static>test</helicone-prompt-static>",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "cool",
          },
        ],
      },

      {
        role: "user",
        content: [
          {
            type: "text",
            text: "cool",
          },
        ],
      },
    ],
    max_tokens: 100,
    temperature: 1,
    model: "gpt-3.5-turbo",
  };

  const { objectWithoutJSXTags, templateWithInputs } = parseJSXObject(obj, {
    ignoreFields: ["max_tokens", "model"],
  });

  expect(objectWithoutJSXTags).toStrictEqual({
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "test",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "cool",
          },
        ],
      },

      {
        role: "user",
        content: [
          {
            type: "text",
            text: "cool",
          },
        ],
      },
    ],
    max_tokens: 100,
    temperature: 1,
    model: "gpt-3.5-turbo",
  });
  expect(templateWithInputs.template).toStrictEqual({
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "<helicone-prompt-static>test</helicone-prompt-static>",
          },
        ],
      },
      "<helicone-auto-prompt-input idx=0 />",
      "<helicone-auto-prompt-input idx=1 />",
    ],
    max_tokens: 100,
    temperature: 1,
    model: "gpt-3.5-turbo",
  });
  expect(templateWithInputs.inputs).toStrictEqual({});
  expect(templateWithInputs.autoInputs.length).toStrictEqual(2);
});
