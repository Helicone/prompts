from ..prompts import (
    prompt,
    hpf,
    hpfr,
    hpstatic,
    parse_prompt,
    format_prompt,
    PromptResult,
)


def test_prompt():
    result = prompt("Hello {name}, how are you {status}?", name="John", status="today")
    assert isinstance(result, PromptResult)
    assert (
        result.helicone_template
        == 'Hello <helicone-prompt-input key="name" />, how are you <helicone-prompt-input key="status" />?'
    )
    assert result.inputs == {"name": "John", "status": "today"}
    assert result.built_string == "Hello John, how are you today?"


def test_hpf():
    formatter = hpf
    result = formatter(
        "The {type} jumps over the {thing}",
        type="quick brown fox",
        thing="lazy dog",
    )
    expected = 'The <helicone-prompt-input key="type">quick brown fox</helicone-prompt-input> jumps over the <helicone-prompt-input key="thing">lazy dog</helicone-prompt-input>'
    assert result == expected


def test_hpfr():
    def chain(s: str) -> str:
        return s.upper()

    formatter = hpfr(chain)
    result = formatter("hello {name}", name="world")
    expected = 'HELLO <HELICONE-PROMPT-INPUT KEY="NAME">WORLD</HELICONE-PROMPT-INPUT>'
    assert result == expected


def test_hpstatic():
    result = hpstatic("Static {text} here", text="content")
    assert (
        result == "<helicone-prompt-static>Static content here</helicone-prompt-static>"
    )


def test_parse_prompt():
    input_prompt = '<helicone-prompt-input key="name">John</helicone-prompt-input> is <helicone-prompt-input key="status">happy</helicone-prompt-input>'
    result = parse_prompt(input_prompt)

    assert result["variables"] == {"name": "John", "status": "happy"}
    assert (
        result["prompt"]
        == '<helicone-prompt-input key="name" /> is <helicone-prompt-input key="status" />'
    )
    assert result["text"] == "John is happy"


def test_format_prompt():
    template = (
        '<helicone-prompt-input key="name" /> is <helicone-prompt-input key="status" />'
    )
    variables = {"name": "John", "status": "happy"}
    result = format_prompt(template, variables)
    expected = '<helicone-prompt-input key="name">John</helicone-prompt-input> is <helicone-prompt-input key="status">happy</helicone-prompt-input>'
    assert result == expected
