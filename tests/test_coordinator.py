"""Tests for the rate-limit repair issue.

Constructing a real DataUpdateCoordinator needs a running hass, so these build
the object without __init__ and drive only the streak logic — which is where
the decisions actually live.

Needs Home Assistant, so they skip unless it is importable.
"""
import pytest

pytest.importorskip("homeassistant.config_entries")

from custom_components.polr_stocks import coordinator as coord_mod  # noqa: E402
from custom_components.polr_stocks.const import (  # noqa: E402
    ISSUE_RATE_LIMITED,
    RATE_LIMIT_ISSUE_THRESHOLD,
)


class FakeIssueRegistry:
    """Stands in for homeassistant.helpers.issue_registry."""

    def __init__(self):
        self.created: list[str] = []
        self.deleted: list[str] = []

    def async_create_issue(self, hass, domain, issue_id, **kwargs):
        self.created.append(issue_id)

    def async_delete_issue(self, hass, domain, issue_id):
        self.deleted.append(issue_id)

    # The real module's IssueSeverity is used at the call site.
    class IssueSeverity:
        WARNING = "warning"


@pytest.fixture
def coordinator(monkeypatch):
    """A coordinator with just the attributes the streak logic touches."""
    c = object.__new__(coord_mod.StocksCoordinator)
    c.hass = object()
    c.symbols = ["GOOGL", "MSFT", "NVDA"]
    c.scan_interval = 60
    c._rate_limited_streak = 0

    registry = FakeIssueRegistry()
    monkeypatch.setattr(coord_mod, "ir", registry)
    c._test_registry = registry
    return c


def test_no_issue_below_the_threshold(coordinator):
    for _ in range(RATE_LIMIT_ISSUE_THRESHOLD - 1):
        coordinator._note_rate_limited()
    assert coordinator._test_registry.created == []


def test_issue_raised_once_the_threshold_is_crossed(coordinator):
    for _ in range(RATE_LIMIT_ISSUE_THRESHOLD):
        coordinator._note_rate_limited()
    assert coordinator._test_registry.created == [ISSUE_RATE_LIMITED]


def test_issue_is_not_re_raised_every_refresh(coordinator):
    """The reason the check is `!=` and not `>=`."""
    for _ in range(RATE_LIMIT_ISSUE_THRESHOLD + 5):
        coordinator._note_rate_limited()
    assert coordinator._test_registry.created == [ISSUE_RATE_LIMITED]


def test_a_clean_refresh_clears_the_issue(coordinator):
    for _ in range(RATE_LIMIT_ISSUE_THRESHOLD):
        coordinator._note_rate_limited()
    coordinator._clear_rate_limited()
    assert coordinator._test_registry.deleted == [ISSUE_RATE_LIMITED]
    assert coordinator.rate_limited_streak == 0


def test_clearing_when_never_limited_does_nothing(coordinator):
    # Avoids deleting a non-existent issue on every single successful refresh.
    coordinator._clear_rate_limited()
    assert coordinator._test_registry.deleted == []


def test_streak_restarts_after_clearing(coordinator):
    for _ in range(RATE_LIMIT_ISSUE_THRESHOLD):
        coordinator._note_rate_limited()
    coordinator._clear_rate_limited()
    coordinator._note_rate_limited()
    assert coordinator.rate_limited_streak == 1
    # Still only the one creation so far; the next crossing raises again.
    assert coordinator._test_registry.created == [ISSUE_RATE_LIMITED]
