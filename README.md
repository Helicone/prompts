# Helicone Prompts

Helicone Prompt Formatter is a robust library designed to format JSON objects for Large Language Model (LLM) applications. It offers a streamlined approach to handling prompt templates, variable management, and versioning.

## Key Features

1. Automated versioning of new prompts with change detection based on a structured framework
2. Seamless handling of chat-like prompt templates
3. Efficient extraction and insertion of variables into prompts

## Motivation

Existing prompt formatting libraries often fall short in addressing the following challenges:

1. Limited support for chat-like prompt templates
2. Inadequate variable handling mechanisms
3. Insufficient array management capabilities

HPF aims to bridge these gaps, providing a comprehensive solution for LLM prompt formatting.

## Quick Start

Install the library using your preferred package manager:

```bash
yarn add @helicone/prompts
# OR
npm install @helicone/prompts
```

### Basic Usage

```javascript
import { hpf } from "@helicone/prompts";

const promptWithInputs = hpf`
  Hello ${{ world: "variable" }}
`;

console.log(promptWithInputs);
// Output: 'Hello <hpf-prompt-input key="world" >variable</hpf-prompt-input>'
```

### Variable Extraction

```javascript
import { parsePrompt } from "@helicone/prompt-formatter";

const { variables, prompt, text } = parsePrompt(
  'Hello <hpf-prompt-input key="world">variable</hpf-prompt-input>'
);

console.log(variables); // { world: "variable" }
console.log(prompt);    // 'Hello <hpf-prompt-input key="world" />'
console.log(text);      // "Hello variable"
```

### Variable Insertion

```javascript
import { autoFillInputs } from "@helicone/prompt-formatter";

const result = autoFillInputs({
  inputs: {
    world: "variable",
  },
  template: `Hello <hpf-prompt-input key="world" />`,
  autoInputs: [],
});

console.log(result); // "Hello variable"
```

## LLM Object Handling

HPF utilizes a custom variant of JSX developed by Helicone to manage LLM objects effectively.

### Example

```javascript
const obj = {
  model: "gpt-4-turbo",
  messages: [
    {
      role: "system",
      content: 'Test <hpf-prompt-input key="test-1">input 1</hpf-prompt-input>',
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
      content: 'Using the content above and given that <hpf-prompt-input key="test-2">input 2</hpf-prompt-input>, what are the images?',
    },
  ],
  max_tokens: 700,
};

const { objectWithoutJSXTags, templateWithInputs } = parseJSXObject(obj, {
  ignoreFields: ["max_tokens", "model"],
});

// Results demonstrated in the original example
```

For more detailed information on usage and advanced features, please refer to our comprehensive documentation.
