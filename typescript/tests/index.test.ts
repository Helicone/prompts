import { expect, test } from "@jest/globals";
import { formatPrompt, hpf, hpfo, parsePrompt } from "../src/index";

test("hpf function", () => {
  const promptWithInputs = hpf`Hello ${{ world: "variable" }}`;
  expect(promptWithInputs).toBe(
    'Hello <helicone-prompt-input key="world" >variable</helicone-prompt-input>'
  );
});

test("parsePrompt function", () => {
  const { variables, prompt, text } = parsePrompt(
    'Hello <helicone-prompt-input key="world">variable</helicone-prompt-input>'
  );
  expect(variables).toEqual({ world: "variable" });
  expect(prompt).toBe('Hello <helicone-prompt-input key="world" />');
  expect(text).toBe("Hello variable");
});

test("parsePrompt function spaces", () => {
  const { variables, prompt, text } = parsePrompt(
    'Hello <helicone-prompt-input key="world" >variable</helicone-prompt-input>'
  );
  expect(variables).toEqual({ world: "variable" });
  expect(prompt).toBe('Hello <helicone-prompt-input key="world" />');
  expect(text).toBe("Hello variable");
});

test("parsePrompt function spaces2", () => {
  const { variables, prompt, text } = parsePrompt(
    'Hello <helicone-prompt-input key="world" >variable</ helicone-prompt-input >'
  );
  expect(variables).toEqual({ world: "variable" });
  expect(prompt).toBe('Hello <helicone-prompt-input key="world" />');
  expect(text).toBe("Hello variable");
});

test("formatPrompt function", () => {
  const formattedPrompt = formatPrompt(
    'Hello <helicone-prompt-input key="world" />',
    {
      world: "variable",
    }
  );
  expect(formattedPrompt).toBe(
    'Hello <helicone-prompt-input key="world">variable</helicone-prompt-input>'
  );
});

test("hpfo function - basic", () => {
  const promptWithInputs = hpfo`Hello ${{ world: "variable" }}`;
  expect(promptWithInputs).toBe(
    'Hello <helicone-prompt-input key="world" >variable</helicone-prompt-input>'
  );
});

test("hpfo function - removes indentation", () => {
  const promptWithInputs = hpfo`
    This is a test with
      different levels of
        indentation and a ${{ var: "value" }}
    at the end.
  `;
  expect(promptWithInputs).toBe(
    'This is a test with\ndifferent levels of\n  indentation and a <helicone-prompt-input key="var" >value</helicone-prompt-input>\nat the end.'
  );
});

test("hpfo function - trims newlines", () => {
  const promptWithInputs = hpfo`

    Hello ${{ name: "world" }}
    How are you?

  `;
  expect(promptWithInputs).toBe(
    'Hello <helicone-prompt-input key="name" >world</helicone-prompt-input>\nHow are you?'
  );
});

test("hpfo function - preserves empty lines between content", () => {
  const promptWithInputs = hpfo`
    First line
    
    ${{ middle: "content" }}
    
    Last line
  `;
  expect(promptWithInputs).toBe(
    'First line\n\n<helicone-prompt-input key="middle" >content</helicone-prompt-input>\n\nLast line'
  );
});
