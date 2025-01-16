from helicone_prompts.object_version_checking import (
    remove_auto_inputs,
    should_bump_version,
)


def test_remove_auto_inputs():
    removed_auto_inputs = remove_auto_inputs(
        {
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
    )

    # Check that template no longer contains the auto-input placeholders
    expected_template = {
        "messages": [
            {
                "role": "system",
                "content": 'Hello <helicone-prompt-input key="world" />',
            },
            {
                "role": "user",
                "content": 'What is the capital of the <helicone-prompt-input key="place" />?',
            },
        ],
        "model": "gpt-3.5-turbo",
    }
    assert removed_auto_inputs["template"] == expected_template

    # Check that exactly 4 auto-input placeholders were captured
    assert len(removed_auto_inputs["autoInputs"]) == 4


def test_should_bump_version_when_template_changed():
    old_versions = {"old": {"foo": "bar"}, "new": {"foo": "baz"}}
    result = should_bump_version(old_versions)
    assert result["shouldBump"] is True
    assert result["shouldUpdateNotBump"] is True


def test_should_bump_version_when_auto_inputs_increase():
    old_versions = {
        "old": {"messages": []},
        "new": {"messages": ["<helicone-auto-prompt-input idx=0 />"]},
    }
    result = should_bump_version(old_versions)
    assert result["shouldBump"] is False
    assert result["shouldUpdateNotBump"] is True


def test_should_bump_version_no_change():
    versions = {"old": {"same": "info"}, "new": {"same": "info"}}
    result = should_bump_version(versions)
    assert result["shouldBump"] is False
    assert result["shouldUpdateNotBump"] is False
