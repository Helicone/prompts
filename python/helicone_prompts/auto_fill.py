from typing import Dict, Any, List
import copy
import re

REMOVE_KEY = "helicone-to-remove"


def auto_fill_inputs(
    inputs: Dict[str, str], auto_inputs: List[Any], template: Any
) -> Any:
    """
    Fill a template with input values and auto-generated inputs.

    Args:
        inputs: Dictionary of key-value pairs for manual inputs
        auto_inputs: List of auto-generated inputs
        template: Template to fill with values (can be string, dict, or list)

    Returns:
        Filled template with all inputs replaced
    """
    remaining_input_values = copy.deepcopy(inputs)

    def traverse_and_transform(obj: Any) -> Any:
        if isinstance(obj, str):
            # Handle auto inputs
            auto_input_pattern = r"<helicone-auto-prompt-input\s*idx=(\d+)\s*\/>"
            match = re.search(auto_input_pattern, obj)
            if match and obj.strip() == match.group(0).strip():
                # If the entire string is just the auto input tag, return the value directly
                idx = int(match.group(1))
                return auto_inputs[idx] if idx < len(auto_inputs) else REMOVE_KEY

            def replace_auto_input(match: re.Match) -> str:
                idx = int(match.group(1))
                value = auto_inputs[idx] if idx < len(auto_inputs) else REMOVE_KEY
                return str(value)

            result = re.sub(auto_input_pattern, replace_auto_input, obj)
            if result == REMOVE_KEY:
                return REMOVE_KEY

            # Handle manual inputs
            def replace_input(match: re.Match) -> str:
                key = match.group(1)
                if key in remaining_input_values:
                    value = remaining_input_values[key]
                    del remaining_input_values[key]
                    return value
                return ""

            return re.sub(
                r'<helicone-prompt-input\s*key="([^"]*)"\s*\/>', replace_input, result
            )

        elif isinstance(obj, list):
            return [
                item
                for item in (traverse_and_transform(x) for x in obj)
                if item != REMOVE_KEY
            ]

        elif isinstance(obj, dict):
            return {key: traverse_and_transform(value) for key, value in obj.items()}

        return obj

    return traverse_and_transform(template)
