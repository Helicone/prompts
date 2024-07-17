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
  });

  expect(removedAutoInputs.template).toStrictEqual({
    messages: [
      {
        role: "system",
        content: `Hello <hpf-prompt-input key="world" />`,
      },
      {
        role: "user",
        content: `What is the capital of the <hpf-prompt-input key="place" />?`,
      },
    ],
    model: "gpt-3.5-turbo",
  });
  expect(removedAutoInputs.autoInputs.length).toStrictEqual(4);
});
