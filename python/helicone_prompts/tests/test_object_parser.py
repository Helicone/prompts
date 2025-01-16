from helicone_prompts.object_parser import parse_jsx_object, ParseJSXObjectOptions
from helicone_prompts.prompts import hpf


def test_parse_object():
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

    result = parse_jsx_object(obj, ParseJSXObjectOptions(["max_tokens", "model"]))
    object_without_jsx_tags = result["objectWithoutJSXTags"]
    template_with_inputs = result["templateWithInputs"]

    assert template_with_inputs.inputs == {
        "test-1": "input 1",
        "test-2": "input 2",
    }

    assert object_without_jsx_tags == {
        "model": "gpt-4-turbo",
        "messages": [
            {
                "role": "system",
                "content": "Test input 1",
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": "...", "detail": "high"},
                    },
                ],
            },
            {
                "role": "assistance",
                "content": "Using the content above and given that input 2, what are the images?",
            },
        ],
        "max_tokens": 700,
    }

    assert template_with_inputs.template == {
        "model": "gpt-4-turbo",
        "messages": [
            {
                "role": "system",
                "content": 'Test <helicone-prompt-input key="test-1" />',
            },
            "<helicone-auto-prompt-input idx=0 />",
            {
                "role": "assistance",
                "content": 'Using the content above and given that <helicone-prompt-input key="test-2" />, what are the images?',
            },
        ],
        "max_tokens": 700,
    }

    assert template_with_inputs.auto_inputs == [
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
    ]


def test_parse_object_chat_example():
    obj = {
        "messages": [
            {
                "role": "system",
                "content": hpf("Hello {world}", world="variable"),
            },
            {
                "role": "user",
                "content": hpf("What is the capital of the {place}?", place="moon"),
            },
            {
                "role": "assistant",
                "content": "The moon is made of cheese",
            },
            {
                "role": "user",
                "content": "Please explain the moon in a different way, as a pirate",
            },
            {
                "role": "assistant",
                "content": "arrrgh the mooon be made of yee cheese",
            },
            {
                "role": "user",
                "content": "Now pick a random sesame street character and explain the moon as that character would",
            },
        ],
        "model": "gpt-3.5-turbo",
    }

    result = parse_jsx_object(obj, ParseJSXObjectOptions(["max_tokens", "model"]))
    template_with_inputs = result["templateWithInputs"]

    assert template_with_inputs.inputs == {
        "place": "moon",
        "world": "variable",
    }

    assert template_with_inputs.template == {
        "messages": [
            {
                "role": "system",
                "content": 'Hello <helicone-prompt-input key="world" />',
            },
            {
                "role": "user",
                "content": 'What is the capital of the <helicone-prompt-input key="place" />?',
            },
            "<helicone-auto-prompt-input idx=0 />",
            "<helicone-auto-prompt-input idx=1 />",
            "<helicone-auto-prompt-input idx=2 />",
            "<helicone-auto-prompt-input idx=3 />",
        ],
        "model": "gpt-3.5-turbo",
    }

    assert template_with_inputs.auto_inputs == [
        {
            "role": "assistant",
            "content": "The moon is made of cheese",
        },
        {
            "role": "user",
            "content": "Please explain the moon in a different way, as a pirate",
        },
        {
            "role": "assistant",
            "content": "arrrgh the mooon be made of yee cheese",
        },
        {
            "role": "user",
            "content": "Now pick a random sesame street character and explain the moon as that character would",
        },
    ]
