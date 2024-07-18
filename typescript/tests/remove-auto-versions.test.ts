import {
  hpf,
  parsePrompt,
  formatPrompt,
  parseJSXObject,
  shouldBumpVersion,
  removeAutoInputs,
} from "../src/index";

test("Remove auto inputs", () => {
  const removedAutoInputs = removeAutoInputs({
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

  expect(removedAutoInputs.template).toStrictEqual({
    messages: [
      {
        role: "system",
        content: `Hello <helicone-prompt-input key="world" />`,
      },
      {
        role: "user",
        content: `What is the capital of the <helicone-prompt-input key="place" />?`,
      },
    ],
    model: "gpt-3.5-turbo",
  });
  expect(removedAutoInputs.autoInputs.length).toStrictEqual(4);
});
