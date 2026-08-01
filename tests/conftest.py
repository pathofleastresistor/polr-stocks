"""Load quote.py without importing the package.

custom_components/polr_stocks/__init__.py imports Home Assistant, which would
drag a full HA install into the test run. quote.py deliberately has no HA
imports, so it is loaded straight from its path and registered under a name the
tests can import from.
"""
import importlib.util
import sys
from pathlib import Path

_QUOTE = Path(__file__).resolve().parents[1] / "custom_components" / "polr_stocks" / "quote.py"

_spec = importlib.util.spec_from_file_location("polr_stocks_quote", _QUOTE)
_module = importlib.util.module_from_spec(_spec)
# Registered before execution: @dataclass resolves annotations via
# sys.modules[cls.__module__], which fails if the module isn't there yet.
sys.modules["polr_stocks_quote"] = _module
_spec.loader.exec_module(_module)
