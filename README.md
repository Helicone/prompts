## Helicone Prompt Formatter (HPF)

Helicone Prompt Formatter is a library designed to format JSON objects with the intention of using them for LLM applications.

Key features

1. Auto version new prompts and detect changes based on a framework
2. Handle chat-like prompt templates
3. Extract or place variables into prompts

# Why does this exist?

### Problems with existing prompt formatting libraries

1. They don't work with chat-like prompt templates
2. They don't handle variables well
3. They don't handle arrays well

// TODO Write more shit here

## Quick start

```bash
yarn add @helicone/prompt-formatter
# OR
npm install @helicone/prompt-formatter
```

```js
import { hpf } from "@helicone/prompt-formatter";

const promptWithInputs = hpf`
  Hello ${{ world: "variable" }}
`;

// prompt === "Hello <hpf-input key="world">variable</hpf-input>"
```

### Pulling out variables

```js
import { parsePrompt } from "@helicone/prompt-formatter";

const { variables, prompt } = parsePrompt(promptWithInputs);

// variables === { world: "variable" }
// prompt === "Hello <hpf-input key="world" />"
```

### Placing variables into prompts

```js
import { formatPrompt } from "@helicone/prompt-formatter";

const formattedPrompt = formatPrompt(promptWithInputs, { world: "variable" });

// formattedPrompt === "Hello <hpf-input key="world">variable</hpf-input>"
```

# Example with LLM request

### How it works

We use a variant of JSX that is developed by Helicone.

```js
{
  "model": "gpt-4-turbo",
  "messages": [
    {
      "role": "system",
      "content": `Test <helicone-prompt-input key=\"test\">some input</helicone-prompt-input>`
    },
    {
      "role": "user",
      "content": [
        {
          "type": "image_url",
          "image_url": {
            "url": "...",
            "detail": "high"
          }
        }
      ]
    },
    {
      "role": "assistance",
      "content": "Using the content above and given that <helicone-prompt-input key=\"test\">some input</helicone-prompt-input>, what are the images?"
    }
  ],
  "max_tokens": 700
}
```
