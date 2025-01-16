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
# JavaScript/TypeScript
yarn add @helicone/prompts
# OR
npm install @helicone/prompts

# Python
pip install helicone_prompts
# OR
poetry add helicone_prompts
```

### Basic Usage

```javascript
// JavaScript/TypeScript
import { hpf } from "@helicone/prompts";

const promptWithInputs = hpf`
  Hello ${{ world: "variable" }}
`;

console.log(promptWithInputs);
// Output: 'Hello <helicone-prompt-input key="world" >variable</helicone-prompt-input>'
```

```python
# Python
from helicone_prompts import hpf

prompt_with_inputs = hpf("Hello {world}", world="variable")

print(prompt_with_inputs)
# Output: 'Hello <helicone-prompt-input key="world">variable</helicone-prompt-input>'
```

### Variable Extraction

```javascript
// JavaScript/TypeScript
import { parsePrompt } from "@helicone/prompt-formatter";

const { variables, prompt, text } = parsePrompt(
  'Hello <helicone-prompt-input key="world">variable</helicone-prompt-input>'
);

console.log(variables); // { world: "variable" }
console.log(prompt); // 'Hello <helicone-prompt-input key="world" />'
console.log(text); // "Hello variable"
```

```python
# Python
from helicone_prompts import parse_prompt

result = parse_prompt('Hello <helicone-prompt-input key="world">variable</helicone-prompt-input>')

print(result["variables"])  # { "world": "variable" }
print(result["prompt"])     # 'Hello <helicone-prompt-input key="world" />'
print(result["text"])       # "Hello variable"
```

### Variable Insertion

```javascript
// JavaScript/TypeScript
import { autoFillInputs } from "@helicone/prompt-formatter";

const result = autoFillInputs({
  inputs: {
    world: "variable",
  },
  template: `Hello <helicone-prompt-input key="world" />`,
  autoInputs: [],
});

console.log(result); // "Hello variable"
```

```python
# Python
from helicone_prompts import auto_fill_inputs

result = auto_fill_inputs(
    inputs={"world": "variable"},
    template='Hello <helicone-prompt-input key="world" />',
    auto_inputs=[]
)

print(result)  # "Hello variable"
```

## LLM Object Handling

HPF utilizes a custom variant of JSX developed by Helicone to manage LLM objects effectively.

### Example

```javascript
// JavaScript/TypeScript
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
```

```python
# Python
from helicone_prompts import parse_jsx_object, ParseJSXObjectOptions

obj = {
    "model": "gpt-4-turbo",
    "messages": [
        {
            "role": "system",
            "content": 'Test <helicone-prompt-input key="test-1">input 1</helicone-prompt-input>',
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "...",
                        "detail": "high",
                    },
                },
            ],
        },
        {
            "role": "assistance",
            "content": 'Using the content above and given that <helicone-prompt-input key="test-2">input 2</helicone-prompt-input>, what are the images?',
        },
    ],
    "max_tokens": 700,
}

result = parse_jsx_object(obj, ParseJSXObjectOptions(ignore_fields=["max_tokens", "model"]))
object_without_jsx_tags = result["objectWithoutJSXTags"]
template_with_inputs = result["templateWithInputs"]
```

For more detailed information on usage and advanced features, please refer to our comprehensive documentation.
