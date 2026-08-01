"""Tests for the bundled card's Lovelace resource registration.

Unlike quote.py, frontend.py genuinely needs Home Assistant, so these skip
unless HA is importable. They run inside the ha-dev container:

    docker cp tests ha-dev:/tmp/ && docker exec ha-dev python -m pytest /tmp/tests

or anywhere HA is installed.
"""
import types

import pytest

pytest.importorskip("homeassistant.components.http")

from custom_components.polr_stocks import frontend  # noqa: E402

CARD_URL = frontend.CARD_URL
VERSIONED = frontend.VERSIONED_CARD_URL


class FakeResources:
    """Stands in for Lovelace's ResourceStorageCollection."""

    def __init__(self, items, loaded=True):
        self._items = list(items)
        self.loaded = loaded
        self.created: list[dict] = []
        self.updated: list[tuple] = []
        self.deleted: list[str] = []

    def async_items(self):
        return list(self._items)

    async def async_create_item(self, data):
        self.created.append(data)

    async def async_update_item(self, item_id, data):
        self.updated.append((item_id, data))

    async def async_delete_item(self, item_id):
        self.deleted.append(item_id)


def fake_hass(resources, mode="storage"):
    lovelace = types.SimpleNamespace(resource_mode=mode, resources=resources)
    return types.SimpleNamespace(data={"lovelace": lovelace})


@pytest.mark.asyncio
async def test_registers_when_absent():
    res = FakeResources([])
    await frontend._async_register_card(fake_hass(res), res)
    assert res.created == [{"res_type": "module", "url": VERSIONED}]


@pytest.mark.asyncio
async def test_no_op_when_already_current():
    res = FakeResources([{"id": "1", "url": VERSIONED}])
    await frontend._async_register_card(fake_hass(res), res)
    assert not res.created and not res.updated


@pytest.mark.asyncio
async def test_updates_stale_version_in_place():
    """Keeps the resource id, so dashboards don't lose the reference."""
    res = FakeResources([{"id": "7", "url": f"{CARD_URL}?v=0.0.1"}])
    await frontend._async_register_card(fake_hass(res), res)
    assert res.updated == [("7", {"res_type": "module", "url": VERSIONED})]
    assert not res.created


@pytest.mark.asyncio
async def test_ignores_unrelated_resources():
    res = FakeResources([{"id": "9", "url": "/hacsfiles/mushroom/mushroom.js"}])
    await frontend._async_register_card(fake_hass(res), res)
    assert res.created and not res.updated


@pytest.mark.asyncio
async def test_matches_an_unversioned_url():
    """A hand-added resource must be adopted, not duplicated."""
    res = FakeResources([{"id": "3", "url": CARD_URL}])
    await frontend._async_register_card(fake_hass(res), res)
    assert res.updated and not res.created


@pytest.mark.asyncio
async def test_unregister_removes_only_its_own():
    res = FakeResources(
        [{"id": "1", "url": VERSIONED}, {"id": "2", "url": "/hacsfiles/other/other.js"}]
    )
    await frontend.async_unregister(fake_hass(res))
    assert res.deleted == ["1"]


@pytest.mark.asyncio
async def test_yaml_mode_leaves_resources_alone():
    res = FakeResources([{"id": "1", "url": VERSIONED}])
    await frontend.async_unregister(fake_hass(res, mode="yaml"))
    assert res.deleted == []


def test_resource_mode_falls_back_to_mode():
    """Pre-2026.2 installs expose `mode` rather than `resource_mode`."""
    lovelace = types.SimpleNamespace(mode="storage", resources=FakeResources([]))
    hass = types.SimpleNamespace(data={"lovelace": lovelace})
    assert frontend._resource_mode(hass) == "storage"


def test_resource_mode_handles_missing_lovelace():
    hass = types.SimpleNamespace(data={})
    assert frontend._resource_mode(hass) is None
