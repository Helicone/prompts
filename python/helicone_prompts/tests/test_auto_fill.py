from helicone_prompts.auto_fill import auto_fill_inputs


def test_basic_input_replacement():
    template = 'Hello <helicone-prompt-input key="world" />'
    inputs = {"world": "variable"}
    result = auto_fill_inputs(inputs, [], template)
    assert result == "Hello variable"


def test_auto_input_replacement():
    template = "First <helicone-auto-prompt-input idx=0 /> Second <helicone-auto-prompt-input idx=1 />"
    auto_inputs = ["one", "two"]
    result = auto_fill_inputs({}, auto_inputs, template)
    assert result == "First one Second two"


def test_nested_object():
    template = {
        "messages": [
            {
                "role": "system",
                "content": 'Hello <helicone-prompt-input key="world" />',
            },
            {
                "role": "user",
                "content": 'What is <helicone-prompt-input key="question" />?',
            },
        ]
    }
    inputs = {"world": "Earth", "question": "the meaning of life"}
    expected = {
        "messages": [
            {"role": "system", "content": "Hello Earth"},
            {"role": "user", "content": "What is the meaning of life?"},
        ]
    }
    result = auto_fill_inputs(inputs, [], template)
    assert result == expected


def test_mixed_inputs():
    template = {
        "messages": [
            {
                "role": "system",
                "content": 'Hello <helicone-prompt-input key="world" />',
            },
            "<helicone-auto-prompt-input idx=0 />",
            {
                "role": "user",
                "content": 'What is <helicone-prompt-input key="question" />?',
            },
        ]
    }
    inputs = {"world": "Earth", "question": "the weather"}
    auto_inputs = [{"role": "assistant", "content": "How can I help?"}]
    expected = {
        "messages": [
            {"role": "system", "content": "Hello Earth"},
            {"role": "assistant", "content": "How can I help?"},
            {"role": "user", "content": "What is the weather?"},
        ]
    }
    result = auto_fill_inputs(inputs, auto_inputs, template)
    assert result == expected
