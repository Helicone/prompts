import re
from typing import Any, Dict, List
import warnings


def remove_auto_inputs(template: Any) -> Dict[str, Any]:
    """
    Returns a dict with:
        - 'template': The template with <helicone-auto-prompt-input ...> removed
        - 'autoInputs': A list capturing each removed auto-input placeholder
        
    Warning: This functionality is deprecated and will no longer receive updates.
    """
    warnings.warn(
        "This functionality is deprecated and will no longer receive updates.",
        DeprecationWarning,
        stacklevel=2
    )
    # If the template is a string
    if isinstance(template, str):
        # Find all auto-input placeholders
        auto_input_pattern = r"<helicone-auto-prompt-input\s*idx=\d+\s*/\s*>"
        auto_inputs = re.findall(auto_input_pattern, template)

        # Remove them from the string
        cleaned_template = re.sub(auto_input_pattern, "", template)

        return {
            "template": cleaned_template,
            "autoInputs": auto_inputs,
        }

    # If the template is a list
    elif isinstance(template, list):
        auto_inputs: List[Any] = []
        new_template_list: List[Any] = []
        for item in template:
            result = remove_auto_inputs(item)
            # Collect the cleaned item if not empty
            if result["template"] != "":
                new_template_list.append(result["template"])
            # Accumulate autoInputs
            auto_inputs.extend(result["autoInputs"])
        return {
            "template": new_template_list,
            "autoInputs": auto_inputs,
        }

    # If the template is a dict
    elif isinstance(template, dict) and template is not None:
        auto_inputs: List[Any] = []
        result_dict: Dict[str, Any] = {}
        for key, val in template.items():
            sub_result = remove_auto_inputs(val)
            if sub_result["template"] != "":
                result_dict[key] = sub_result["template"]
            auto_inputs.extend(sub_result["autoInputs"])
        return {
            "template": result_dict,
            "autoInputs": auto_inputs,
        }

    # Otherwise, return as is
    return {
        "template": template,
        "autoInputs": [],
    }


def deep_compare(a: Any, b: Any) -> bool:
    """
    Deep comparison of two objects.
    
    Warning: This functionality is deprecated and will no longer receive updates.
    """
    warnings.warn(
        "This functionality is deprecated and will no longer receive updates.",
        DeprecationWarning,
        stacklevel=2
    )
    if a == b:
        return True
    if isinstance(a, dict) and isinstance(b, dict):
        if len(a) != len(b):
            return False
        for key in a:
            if key not in b or not deep_compare(a[key], b[key]):
                return False
        return True
    return False


def should_bump_version(versions: Dict[str, Any]) -> Dict[str, bool]:
    """
    Expected versions dict keys: 'old' and 'new'.
    Returns a dict with two booleans: 'shouldBump' and 'shouldUpdateNotBump'.
    
    Warning: This functionality is deprecated and will no longer receive updates.
    """
    warnings.warn(
        "This functionality is deprecated and will no longer receive updates.",
        DeprecationWarning,
        stacklevel=2
    )
    old_removed = remove_auto_inputs(versions["old"])
    old_template, old_auto_inputs = old_removed["template"], old_removed["autoInputs"]

    new_removed = remove_auto_inputs(versions["new"])
    new_template, new_auto_inputs = new_removed["template"], new_removed["autoInputs"]

    # Check if the template changed
    if not deep_compare(old_template, new_template):
        return {"shouldBump": True, "shouldUpdateNotBump": True}

    # Check if more auto inputs have been added
    if len(new_auto_inputs) > len(old_auto_inputs):
        return {"shouldBump": False, "shouldUpdateNotBump": True}

    return {"shouldBump": False, "shouldUpdateNotBump": False}
