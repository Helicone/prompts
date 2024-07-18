import { hpf, parsePrompt, formatPrompt } from "../src/index";

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
