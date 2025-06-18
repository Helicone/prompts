from typing import Dict, Any, Callable, Optional
from dataclasses import dataclass
import re
import warnings

HPROMPT_TAG = "helicone-prompt-input"


@dataclass
class PromptResult:
    helicone_template: str
    inputs: Dict[str, Any]
    built_string: str


def prompt(template: str, **values: Any) -> PromptResult:
    """
    Python equivalent of the TypeScript prompt function.
    Uses kwargs instead of template literals for variable injection.
    
    Warning: This functionality is deprecated and will no longer receive updates.
    """
    warnings.warn(
        "This functionality is deprecated and will no longer receive updates.",
        DeprecationWarning,
        stacklevel=2
    )
    helicone_template = template
    inputs = {}
    built_string = template

    for key, value in values.items():
        tag = f'<{HPROMPT_TAG} key="{key}" />'
        helicone_template = helicone_template.replace(f"{{{key}}}", tag)
        inputs[key] = value
        built_string = built_string.replace(f"{{{key}}}", str(value))

    return PromptResult(
        helicone_template=helicone_template, inputs=inputs, built_string=built_string
    )


def hpfc(
    format: str = "template", chain: Optional[Callable[[str], str]] = None
) -> Callable[..., str]:
    """
    Helicone Prompt Format Configuration
    
    Warning: This functionality is deprecated and will no longer receive updates.
    """
    warnings.warn(
        "This functionality is deprecated and will no longer receive updates.",
        DeprecationWarning,
        stacklevel=2
    )

    def formatter(template: str, **values: Any) -> str:
        result = template
        for key, value in values.items():
            if format == "raw":
                replacement = str(value)
            else:
                replacement = f'<{HPROMPT_TAG} key="{key}">{str(value)}</{HPROMPT_TAG}>'
            result = result.replace(f"{{{key}}}", replacement)

        if chain:
            result = chain(result)
        return result

    return formatter


# Pre-configured formatters
hpf = hpfc(format="template")


def hpfr(chain: Callable[[str], str]) -> Callable[..., str]:
    """
    Helicone Prompt Formatter Recursive
    
    Warning: This functionality is deprecated and will no longer receive updates.
    """
    warnings.warn(
        "This functionality is deprecated and will no longer receive updates.",
        DeprecationWarning,
        stacklevel=2
    )
    return hpfc(format="template", chain=chain)


def hpstatic(template: str, **values: Any) -> str:
    """
    Helicone Prompt Static Formatter
    
    Warning: This functionality is deprecated and will no longer receive updates.
    """
    warnings.warn(
        "This functionality is deprecated and will no longer receive updates.",
        DeprecationWarning,
        stacklevel=2
    )
    result = template
    for key, value in values.items():
        result = result.replace(f"{{{key}}}", str(value))
    return f"<helicone-prompt-static>{result}</helicone-prompt-static>"


def parse_prompt(prompt: str) -> Dict[str, Any]:
    """
    Parse a prompt string containing Helicone tags
    
    Warning: This functionality is deprecated and will no longer receive updates.
    """
    warnings.warn(
        "This functionality is deprecated and will no longer receive updates.",
        DeprecationWarning,
        stacklevel=2
    )
    # Remove JSX tags and keep content
    string_without_jsx = re.sub(
        f'<{HPROMPT_TAG}\\s*key="[^"]*"\\s*>([\\s\\S]*?)<\\/\\s*{HPROMPT_TAG}\\s*>',
        r"\1",
        prompt,
    )

    inputs: Dict[str, str] = {}
    # Replace JSX tags with self-closing tags and extract inputs
    template_with_self_closing = re.sub(
        f'<{HPROMPT_TAG}\\s*key="([^"]*)"\\s*>([\\s\\S]*?)<\\/\\s*{HPROMPT_TAG}\\s*>',
        lambda m: (
            inputs.update({m.group(1): m.group(2).strip()})
            or f'<{HPROMPT_TAG} key="{m.group(1)}" />'
        ),
        prompt,
    )

    return {
        "variables": inputs,
        "prompt": template_with_self_closing,
        "text": string_without_jsx,
    }


def format_prompt(prompt: str, variables: Dict[str, Any]) -> str:
    """
    Format a prompt string with provided variables
    
    Warning: This functionality is deprecated and will no longer receive updates.
    """
    warnings.warn(
        "This functionality is deprecated and will no longer receive updates.",
        DeprecationWarning,
        stacklevel=2
    )
    return re.sub(
        f'<{HPROMPT_TAG} key="(\\w+)" />',
        lambda m: f'<{HPROMPT_TAG} key="{m.group(1)}">{str(variables.get(m.group(1), ""))}</{HPROMPT_TAG}>',
        prompt,
    )
