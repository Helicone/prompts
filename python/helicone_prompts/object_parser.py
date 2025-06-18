import json
from typing import Any, Dict, List, Optional
import warnings


class TemplateWithInputs:
    """
    A class to represent the final template structure and extracted input fields.

    Attributes:
        template: An object mirroring the original structure with self-closing
                  Helicone tags in place of their text content.
        inputs: A dict mapping the 'key' attributes to their corresponding text content.
        auto_inputs: A list of objects automatically extracted from the input object
                     (when no JSX tags are present and not otherwise ignored).
                     
    Warning: This functionality is deprecated and will no longer receive updates.
    """

    def __init__(self, template: Any, inputs: Dict[str, str], auto_inputs: List[Any]):
        warnings.warn(
            "This functionality is deprecated and will no longer receive updates.",
            DeprecationWarning,
            stacklevel=2
        )
        self.template = template
        self.inputs = inputs
        self.auto_inputs = auto_inputs


class ParseJSXObjectOptions:
    """
    Options for parsing a Python object looking for custom JSX-like Helicone tags.

    Attributes:
        ignore_fields: A list of field names that should not be processed for auto-input extraction.
        
    Warning: This functionality is deprecated and will no longer receive updates.
    """

    def __init__(self, ignore_fields: Optional[List[str]] = None):
        warnings.warn(
            "This functionality is deprecated and will no longer receive updates.",
            DeprecationWarning,
            stacklevel=2
        )
        self.ignore_fields = ignore_fields if ignore_fields is not None else []


def parse_jsx_object(
    obj: Any, options: Optional[ParseJSXObjectOptions] = None
) -> Dict[str, Any]:
    """
    Parses a Python object (mirroring the structure of parseJSXObject in TypeScript) to:
      - Remove or transform <helicone-prompt-input> tags (extracting their text content separately).
      - Identify and transform objects without such tags into auto-input placeholders.

    Args:
        obj: The Python object (string, list, dict, etc.) to parse.
        options: An instance of ParseJSXObjectOptions controlling certain parse behaviors.

    Returns:
        A dictionary with two keys:
            'objectWithoutJSXTags': The original object with all Helicone tags removed or replaced
                                    by their text.
            'templateWithInputs': A TemplateWithInputs object containing the processed template
                                  (with self-closing tags) and extracted inputs.
                                  
    Warning: This functionality is deprecated and will no longer receive updates.
    """
    warnings.warn(
        "This functionality is deprecated and will no longer receive updates.",
        DeprecationWarning,
        stacklevel=2
    )
    if options is None:
        options = ParseJSXObjectOptions()

    inputs: Dict[str, str] = {}
    auto_inputs: List[Any] = []
    auto_prompt_index = 0

    def traverse_and_transform(
        current: Any, depth: int = 0, not_input: bool = False
    ) -> Any:
        """
        Recursively traverse and transform the Python object, replacing or removing
        custom Helicone JSX-like tags. Also collects autoInputs from plain objects
        that don't contain Helicone tags (unless ignored).
        """
        nonlocal auto_prompt_index

        if isinstance(current, str):
            # Handle strings potentially containing Helicone tags.
            if "<helicone-prompt-static>" in current:
                # If found a static tag, remove the wrapping tags for the 'stringWithoutJSXTags'
                # but keep them for 'templateWithSelfClosingTags'.
                return {
                    "stringWithoutJSXTags": current.replace(
                        "<helicone-prompt-static>", ""
                    ).replace("</helicone-prompt-static>", ""),
                    "templateWithSelfClosingTags": current,
                }

            # Remove actual text from <helicone-prompt-input> but store it in 'inputs'
            # also produce the replaced version with self-closing tags.
            import re

            # Remove the tags for the "stringWithoutJSXTags" part
            string_without_jsx_tags = re.sub(
                r"<helicone-prompt-input\s*key=\"[^\"]*\"\s*>([\s\S]*?)</helicone-prompt-input>",
                r"\1",
                current,
            )

            # Convert them for the "templateWithSelfClosingTags" part
            def replace_input_tag(match: re.Match) -> str:
                key = match.group(1)
                value = match.group(2)
                inputs[key] = value.strip()
                return f'<helicone-prompt-input key="{key}" />'

            template_with_self_closing_tags = re.sub(
                r'<helicone-prompt-input\s*key="([^"]*?)"\s*>([\s\S]*?)</helicone-prompt-input>',
                replace_input_tag,
                current,
            )

            return {
                "stringWithoutJSXTags": string_without_jsx_tags,
                "templateWithSelfClosingTags": template_with_self_closing_tags,
            }

        elif isinstance(current, list):
            # Recursively handle lists
            return [traverse_and_transform(item, depth + 1) for item in current]

        elif isinstance(current, dict) and current is not None:
            # Check if dictionary contains any Helicone tags, else treat it as an auto input
            text_representation = json.dumps(current)
            if (
                "helicone-prompt-input" not in text_representation
                and "helicone-prompt-static" not in text_representation
                and not not_input
            ):
                # This dict is turned into an autoInput placeholder
                auto_inputs.append(current)
                placeholder_obj = {
                    "stringWithoutJSXTags": json.loads(json.dumps(current)),
                    "templateWithSelfClosingTags": f"<helicone-auto-prompt-input idx={auto_prompt_index} />",
                }
                auto_prompt_index += 1
                return placeholder_obj

            # Otherwise recurse into the dict's fields
            transformed_dict: Dict[str, Any] = {}
            for key in current:
                skip_input = key in options.ignore_fields
                transformed_dict[key] = traverse_and_transform(
                    current[key], depth + 1, skip_input
                )
            return transformed_dict

        return current

    transformed = traverse_and_transform(obj)

    def reconstruct_object(item: Any) -> Any:
        """
        Rebuild the object structure by picking the 'stringWithoutJSXTags' portion
        of any special placeholders or dictionaries.
        """
        if isinstance(item, dict):
            # If this is one of our special placeholder objects
            if "stringWithoutJSXTags" in item and "templateWithSelfClosingTags" in item:
                return item["stringWithoutJSXTags"]
            # Otherwise recurse
            return {k: reconstruct_object(v) for k, v in item.items()}
        elif isinstance(item, list):
            return [reconstruct_object(i) for i in item]
        return item

    def reconstruct_template(item: Any) -> Any:
        """
        Rebuild the object structure by picking the 'templateWithSelfClosingTags'
        portion of any special placeholders or dictionaries.
        """
        if isinstance(item, dict):
            # If this is one of our special placeholder objects
            if "stringWithoutJSXTags" in item and "templateWithSelfClosingTags" in item:
                return item["templateWithSelfClosingTags"]
            # Otherwise recurse
            return {k: reconstruct_template(v) for k, v in item.items()}
        elif isinstance(item, list):
            return [reconstruct_template(i) for i in item]
        return item

    object_without_jsx = reconstruct_object(transformed)
    template_with_self_closing = reconstruct_template(transformed)

    return {
        "objectWithoutJSXTags": object_without_jsx,
        "templateWithInputs": TemplateWithInputs(
            template_with_self_closing, inputs, auto_inputs
        ),
    }
